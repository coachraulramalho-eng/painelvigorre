import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

console.log("🚀 [AUTH] Arquivo auth.ts carregado no servidor Vercel!");

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "d4f5g6h7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2",
  trustHost: true,
  debug: true, // Isso vai imprimir o erro exato no console do Vercel!
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  // REMOVIDO: pages: { signIn: "/login", error: "/login" }
  // Vamos deixar o NextAuth mostrar a página de erro real dele para sabermos o que está falhando!
  
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
        console.log("❌ [AUTHORIZE] Credenciais incorretas.");
        return null;
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
