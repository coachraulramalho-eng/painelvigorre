import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

// Chave de emergência blindada
const FALLBACK_SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";
const finalSecret = process.env.NEXTAUTH_SECRET || FALLBACK_SECRET;

// LOG GIGANTE PARA PROVAR QUE O CÓDIGO FOI ATUALIZADO NO VERCEL
console.log("========================================");
console.log("🚀 AUTH.TS CARREGADO NO SERVIDOR!");
console.log("🚀 NEXTAUTH_SECRET DO VERCEL:", process.env.NEXTAUTH_SECRET ? "✅ PRESENTE" : "❌ AUSENTE (USANDO FALLBACK)");
console.log("🚀 TAMANHO DA CHAVE FINAL:", finalSecret.length, "caracteres");
console.log("========================================");

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
  secret: finalSecret,
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

          // Atualiza login em segundo plano (não trava se falhar)
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }).catch((err) => console.error("Erro lastLoginAt:", err));

          const userRoles = await prisma.userRole.findMany({
            where: { userId: user.id },
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
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
          console.error("💥 ERRO FATAL NO AUTH:", error);
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
