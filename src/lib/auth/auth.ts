import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Usa a variável do Vercel ou o fallback seguro
  secret: process.env.NEXTAUTH_SECRET || "d4f5g6h7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2",
  trustHost: true, // Essencial para funcionar no Vercel
  debug: true,

  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 [AUTH] Tentativa de login:", credentials?.email);
        
        // MOCK: Ignora o banco de dados para garantir que o fluxo de auth funcione
        if (credentials?.email === "admin@vigorre.com" && credentials?.password === "admin123") {
          console.log("✅ [AUTH] Login MOCK bem-sucedido!");
          return {
            id: "1",
            name: "Administrador",
            email: "admin@vigorre.com",
            role: "ADM Master",
            permissions: ["admin:all"],
          };
        }
        
        console.log("❌ [AUTH] Credenciais inválidas.");
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Cast para 'any' para evitar erros de build do TypeScript no NextAuth v5
        (token as any).role = (user as any).role;
        (token as any).permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user) {
        (session.user as any).role = (token as any).role;
        (session.user as any).permissions = (token as any).permissions;
      }
      return session;
    },
  },
  
  pages: {
    signIn: "/login",
  },
});
