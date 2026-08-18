import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Chave direta e fixa no código
const SECRET = "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0";

console.log("========================================");
console.log("🚀 MODO MOCK PURO ATIVADO (SEM BANCO DE DADOS)");
console.log("========================================");

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
        console.log("🚀 Tentativa de login com:", credentials?.email);

        // TESTE ABSOLUTO: Ignora o banco de dados completamente.
        // Aceita APENAS este usuário específico para provar que o sistema funciona.
        if (credentials?.email === "admin@vigorre.com" && credentials?.password === "admin123") {
          console.log("✅ LOGIN MOCK SUCESSO!");
          return {
            id: "mock-admin-123",
            name: "Administrador Mock",
            email: "admin@vigorre.com",
            role: "Administrador",
            permissions: ["admin:all"],
          };
        }

        console.log("❌ Login falhou (use admin@vigorre.com / admin123)");
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
