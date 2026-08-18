import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultSession } from "next-auth";

// Extensão de tipos correta para NextAuth
declare module "next-auth" {
  interface User {
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

// Chave fixa para contornar o bug do painel do Vercel
const SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: SECRET,
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
        // MODO MOCK: Permite login sem depender do banco de dados (que está incompleto)
        if (credentials?.email === "admin@vigorre.com" && credentials?.password === "admin123") {
          return {
            id: "mock-admin-123",
            name: "Administrador Mock",
            email: "admin@vigorre.com",
            role: "ADM Master", // Exatamente o que o dashboard espera
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
