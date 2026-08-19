import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';
import { compare } from 'bcryptjs';
import { Adapter } from 'next-auth/adapters';

// ============================================================
// DECLARAÇÃO DE TIPOS
// ============================================================

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

// ============================================================
// VERIFICAÇÃO DO SECRET
// ============================================================

// 🔥 USAR SECRET DO .env OU FALLBACK (TEMPORÁRIO)
const SECRET = process.env.NEXTAUTH_SECRET || 'd4f5g6h7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2';

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('[auth] ⚠️ NEXTAUTH_SECRET não encontrado no .env, usando fallback!');
}

// ============================================================
// CONFIGURAÇÃO DO NEXT-AUTH
// ============================================================

export const authConfig: NextAuthConfig = {
  secret: SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 horas
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
        // 🔥 LOG DE AUTENTICAÇÃO
        console.log('[auth] Tentando login com:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('[auth] ❌ Credenciais faltando');
          return null;
        }

        try {
          // 🔥 BUSCAR USUÁRIO NO BANCO
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

          if (!user) {
            console.log('[auth] ❌ Usuário não encontrado:', credentials.email);
            return null;
          }

          if (!user.password) {
            console.log('[auth] ❌ Usuário sem senha:', credentials.email);
            return null;
          }

          // 🔥 VERIFICAR SENHA
          const isValid = await compare(credentials.password as string, user.password);
          console.log('[auth] Senha válida?', isValid);

          if (!isValid) {
            return null;
          }

          if (!user.active) {
            console.log('[auth] ❌ Usuário inativo:', credentials.email);
            return null;
          }

          // 🔥 ATUALIZAR ÚLTIMO LOGIN
          await prisma.user.update({
            where: { id: user.id },
            data: {
              lastLoginAt: new Date(),
            },
          });

          // 🔥 EXTRAIR PERMISSÕES
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

          console.log('[auth] ✅ Usuário autenticado:', userData.email);
          return userData;

        } catch (error) {
          console.error('[auth] ❌ Erro no authorize:', error);
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
  debug: true, // 🔥 ATIVAR LOGS DE DEBUG
};

// ============================================================
// EXPORTAÇÕES
// ============================================================

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// ============================================================
// FUNÇÃO AUXILIAR PARA OBTER SESSÃO NO SERVIDOR
// ============================================================

export async function getServerSession() {
  const { auth } = await import('@/lib/auth/auth');
  return auth();
}
