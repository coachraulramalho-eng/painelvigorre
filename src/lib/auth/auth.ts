import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 1. Extensão de tipos para o NextAuth reconhecer 'role' e 'permissions'
declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
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

// Chave fixa e direta no código
const SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: SECRET,
  trustHost: true, // Permite que o Vercel use URLs de preview e produção
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
        const email = (credentials?.email as string)?.toLowerCase() || "";
        const password = credentials?.password as string;

        console.log("🚀 [AUTH] Tentativa de login:", email);
        
        if (email === "admin@vigorre.com" && password === "admin123") {
          console.log("✅ [AUTH] Login bem-sucedido! Criando sessão...");
          return {
            id: "mock-admin-123",
            name: "Administrador",
            email: "admin@vigorre.com",
            role: "ADM Master",
            permissions: ["admin:all"],
          };
        }
        
        console.log("❌ [AUTH] Login falhou (credenciais incorretas).");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Asserção segura para contornar a rigidez do TS no NextAuth v5 (User | AdapterUser)
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
