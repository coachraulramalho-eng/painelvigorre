import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 1. Extensão de tipos para o TypeScript não reclamar
declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    permissions?: string[];
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      permissions?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: string[];
  }
}

// 2. RADAR: Prova que o arquivo está rodando no servidor
console.log("========================================");
console.log("🚀 AUTH.TS CARREGADO NO SERVIDOR VERCEL");
console.log("========================================");

// 3. CHAVE HARDCODED: Ignora 100% qualquer problema de variável de ambiente do Vercel
const HARDCODED_SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: HARDCODED_SECRET,
  trustHost: true, // Permite URLs de preview e produção do Vercel
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login", // Força erros a irem para o login, não para /api/auth/error
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("🚀 [AUTHORIZE] Função de login chamada!");
        console.log("🚀 [AUTHORIZE] Dados recebidos:", credentials);

        try {
          // Limpeza segura dos dados para evitar erros de tipo
          const email = String(credentials?.email || "").toLowerCase().trim();
          const password = String(credentials?.password || "").trim();

          console.log("🚀 [AUTHORIZE] Email processado:", email);

          // MOCK: Aceita apenas este usuário para provar que o sistema funciona
          if (email === "admin@vigorre.com" && password === "admin123") {
            console.log("✅ [AUTHORIZE] Login MOCK bem-sucedido! Gerando sessão...");
            return {
              id: "mock-admin-123",
              name: "Administrador",
              email: "admin@vigorre.com",
              role: "ADM Master",
              permissions: ["admin:all"],
            };
          }

          console.log("❌ [AUTHORIZE] Credenciais incorretas.");
          return null;
        } catch (error) {
          console.error("💥 [AUTHORIZE] ERRO FATAL CAPTURADO:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🚀 [JWT] Usuário autenticado, injetando dados no token...");
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
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
