import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

// Chave de emergência caso o Vercel insista em não ler a variável
const FALLBACK_SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

declare module "next-auth" {
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || FALLBACK_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. Busca o usuário de forma simples primeiro (evita erros de relacionamento no Prisma)
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password || !user.active) {
            return null;
          }

          const isValid = await compare(credentials.password as string, user.password);
          if (!isValid) {
            return null;
          }

          // 2. Atualiza o último login em segundo plano (se falhar, não interrompe o login)
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }).catch((err) => console.error("Erro ao atualizar lastLoginAt:", err));

          // 3. Busca as permissões em uma consulta separada e mais segura
          const userRoles = await prisma.userRole.findMany({
            where: { userId: user.id },
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
          });

          const permissions = userRoles.flatMap((userRole: any) =>
            userRole.role.permissions.map((rp: any) => rp.permission)
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: userRoles[0]?.role.name || "Funcionário",
            permissions: permissions.map((p: any) => `${p.module}:${p.action}`),
          };
        } catch (error) {
          // Isso é CRUCIAL: captura o erro, imprime no log do Vercel, mas retorna null em vez de quebrar o servidor com HTML
          console.error("💥 ERRO FATAL NO AUTH (Prisma ou Senha):", error);
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
});
