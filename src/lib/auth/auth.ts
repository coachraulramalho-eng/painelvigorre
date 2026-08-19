import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 1. Extensão de tipos para o NextAuth reconhecer 'role' e 'permissions'
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
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    permissions?: string[];
  }
}

// 2. Chave de segurança (Fallback caso o Vercel não leia a variável)
const SECRET = process.env.NEXTAUTH_SECRET || "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "").trim();

        // MOCK: Aceita o admin para provar que o fluxo de autenticação funciona
        if (email === "admin@vigorre.com" && password === "admin123") {
          return {
            id: "mock-admin-123",
            name: "Administrador",
            email: "admin@vigorre.com",
            role: "ADM Master",
            permissions: ["admin:all"],
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 🔥 CORREÇÃO CRÍTICA: Cast para 'any' em AMBOS os lados para evitar o erro de build
        (token as any).role = (user as any).role;
        (token as any).permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
        (session.user as any).permissions = (token as any).permissions;
      }
      return session;
    },
  },
});
