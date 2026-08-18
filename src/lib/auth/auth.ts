import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

// Diagnóstico inicial: verifica se as variáveis essenciais existem no Vercel
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ ERRO CRÍTICO: A variável NEXTAUTH_SECRET não foi encontrada ou está vazia no Vercel.");
}
if (!process.env.DATABASE_URL) {
  console.error("❌ ERRO CRÍTICO: A variável DATABASE_URL não foi encontrada ou está vazia no Vercel.");
}

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
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redireciona erros para o login em vez de quebrar a API
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
            return null;
          }

          const isValid = await compare(credentials.password as string, user.password);

          if (!isValid) {
            return null;
          }

          if (!user.active) {
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

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roles[0]?.role.name || "Funcionário",
            permissions: permissions.map((p) => `${p.module}:${p.action}`),
          };
        } catch (error) {
          console.error("❌ Erro ao conectar no banco de dados ou autenticar:", error);
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
