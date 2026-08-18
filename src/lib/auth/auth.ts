import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

console.log("========================================");
console.log("🚀 [AUTH] ARQUIVO CARREGADO NO SERVIDOR!");
console.log("🚀 [AUTH] NEXTAUTH_SECRET do env:", process.env.NEXTAUTH_SECRET ? "EXISTE" : "NÃO EXISTE");
console.log("========================================");

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

// FORÇAR O SECRET PARA ELIMINAR QUALQUER DÚVIDA SOBRE VARIÁVEL DE AMBIENTE
const HARDCODED_SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: HARDCODED_SECRET,
  trustHost: true,
  debug: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("========================================");
        console.log("🚀 [AUTHORIZE] FUNÇÃO CHAMADA!");
        console.log("🚀 [AUTHORIZE] Dados recebidos:", JSON.stringify(credentials));
        console.log("========================================");
        
        try {
          const email = String(credentials?.email || "").toLowerCase().trim();
          const password = String(credentials?.password || "").trim();

          if (email === "admin@vigorre.com" && password === "admin123") {
            console.log("✅ [AUTHORIZE] Login MOCK bem-sucedido!");
            return {
              id: "mock-admin-123",
              name: "Administrador",
              email: "admin@vigorre.com",
              role: "ADM Master",
              permissions: ["admin:all"],
            };
          }
          
          console.log("❌ [AUTHORIZE] Credenciais inválidas.");
          return null;
        } catch (error) {
          console.error("💥 [AUTHORIZE] ERRO CRÍTICO CAPTURADO:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🚀 [JWT CALLBACK] Chamado. Usuário presente?", !!user);
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🚀 [SESSION CALLBACK] Chamado. Token presente?", !!token);
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
});
