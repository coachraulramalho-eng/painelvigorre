import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

console.log("========================================");
console.log("🚀 [AUTH] INICIALIZANDO NEXTAUTH...");
console.log("🚀 [AUTH] NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ DEFINIDA" : "❌ NÃO DEFINIDA");
console.log("🚀 [AUTH] NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "NÃO DEFINIDA (Usando trustHost)");
console.log("========================================");

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "d4f5g6h7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2",
  trustHost: true, // Permite que funcione em qualquer URL (Preview ou Produção)
  debug: true, // Mostra erros detalhados no console do Vercel
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
      async authorize(credentials, req) {
        console.log("========================================");
        console.log("🚀 [AUTHORIZE] FUNÇÃO DE LOGIN CHAMADA!");
        console.log("🚀 [AUTHORIZE] Dados recebidos:", JSON.stringify(credentials));
        console.log("========================================");
        
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
        
        console.log("❌ [AUTHORIZE] Credenciais incorretas. Email:", email);
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("🚀 [JWT CALLBACK] Chamado. Usuário existe?", !!user);
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🚀 [SESSION CALLBACK] Chamado. Token existe?", !!token);
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    // REMOVIDO: error: "/login" (para podermos ver a tela de erro real do NextAuth se algo falhar)
  },
});
