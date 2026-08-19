import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Segredo embutido para eliminar qualquer dúvida sobre variáveis de ambiente
  secret: "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0",
  
  // Permite que funcione em qualquer URL (Preview ou Produção do Vercel)
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

        // MOCK: Se bater isso, ele cria a sessão sem tocar no banco de dados
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
