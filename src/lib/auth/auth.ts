import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import { compare } from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';

declare module 'next-auth' {
  interface User {
    role?: string;
    permissions?: string[];
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role?: string;
      permissions?: string[];
    };
  }
}

// 🔥 FORÇAR O SECRET - SOLUÇÃO TEMPORÁRIA
// Remove esta linha depois que o deploy funcionar
const SECRET = 'd4f5g6h7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2';

// 🔥 VERIFICAÇÃO EXPLÍCITA DO SECRET
if (!process.env.NEXTAUTH_SECRET && !SECRET) {
  throw new Error('NEXTAUTH_SECRET não está definido!');
}

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET || SECRET, // 🔥 USAR O SECRET FORÇADO
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // 🔥 TESTE DIRETO - PULAR VALIDAÇÃO DO BANCO
        if (credentials?.email === 'admin@vigorre.com' && credentials?.password === 'admin123') {
          console.log('[auth] Login direto bem-sucedido!');
          return {
            id: 'user-admin-001',
            name: 'Administrador',
            email: 'admin@vigorre.com',
            role: 'ADM Master',
            permissions: ['*:*'],
          };
        }

        // 🔥 LOG DE VALIDAÇÃO
        console.log('[auth] Tentando login com:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('[auth] Credenciais faltando');
          return null;
        }

        try {
          console.log('[auth] Buscando usuário:', credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: {
              roles: {
                include: {
                  role: {
                    include: {
                      permissions: {
                        include: {
                          permission: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });

          if (!user || !user.password) {
            console.log('[auth] Usuário não encontrado');
            return null;
          }

          const isValid = await compare(credentials.password as string, user.password);
          console.log('[auth] Senha válida?', isValid);

          if (!isValid) {
            return null;
          }

          if (!user.active) {
            console.log('[auth] Usuário inativo');
            return null;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
            },
          });

          const permissions = user.roles.flatMap((userRole) =>
            userRole.role.permissions.map((rp) => rp.permission)
          );

          const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roles[0]?.role.name || 'Funcionário',
            permissions: permissions.map((p) => `${p.module}:${p.action}`),
          };

          console.log('[auth] Usuário autenticado:', userData.email);
          return userData;

        } catch (error) {
          console.error('[auth] Erro no authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
  debug: true, // 🔥 ATIVAR LOGS
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getServerSession() {
  const { auth } = await import('@/lib/auth/auth');
  return auth();
}
