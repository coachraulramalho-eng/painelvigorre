import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Chave fixa de 40 caracteres. O NextAuth exige no mínimo 32.
  secret: "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0",
  trustHost: true,
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // MOCK PURO: Se bater isso, ele cria a sessão. Sem banco de dados.
        if (credentials?.email === "admin@vigorre.com" && credentials?.password === "admin123") {
          return {
            id: "1",
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
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
});
