import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";

console.log("🚀 [AUTH] Arquivo auth.ts foi carregado pelo servidor!");

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Força o segredo para evitar erros de variável de ambiente no Vercel
  secret: process.env.NEXTAUTH_SECRET || "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0",
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("🚀 [AUTHORIZE] Função de login chamada!");
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "").trim();

        // MODO MOCK: Se o banco de dados falhar, este login de emergência ainda funciona
        if (email === "admin@vigorre.com" && password === "admin123") {
          console.log("✅ [AUTHORIZE] Login MOCK bem-sucedido (sem tocar no banco)!");
          return {
            id: "mock-admin-123",
            name: "Administrador",
            email: "admin@vigorre.com",
            role: "ADM Master",
            permissions: ["admin:all"],
          };
        }

        console.log("🔍 [AUTHORIZE] Tentando buscar no banco de dados para:", email);
        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              roles: {
                include: {
                  role: {
                    include: {
                      permissions: { include: { permission: true } },
                    },
                  },
                },
              },
            },
          });

          if (!user || !user.password || !user.active) {
            console.log("❌ [AUTHORIZE] Usuário não encontrado ou inativo.");
            return null;
          }

          const isValid = await compare(password, user.password);
          if (!isValid) {
            console.log("❌ [AUTHORIZE] Senha inválida.");
            return null;
          }

          const permissions = user.roles.flatMap((userRole: any) =>
            userRole.role.permissions.map((rp: any) => rp.permission)
          );

          console.log("✅ [AUTHORIZE] Login no banco bem-sucedido!");
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roles[0]?.role.name || "Funcionário",
            permissions: permissions.map((p: any) => `${p.module}:${p.action}`),
          };
        } catch (error) {
          console.error("💥 [AUTHORIZE] ERRO FATAL NO BANCO DE DADOS:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
});
