import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "vigorre2026SecretKeyAuth9x8w7v6u5t4s3r2q1p0",
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
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
