import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/drizzle";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { user } from "@/lib/schema";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = await db.select().from(user).where(eq(user.email, credentials.email));
        const userObj = result[0];
        if (!userObj || userObj.isDeleted) return null;
        const isValid = await bcrypt.compare(credentials.password, userObj.passwordHash);
        if (!isValid) return null;
        return {
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          role: null,
          departmentId: userObj.departmentId,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Adaugă câmpuri custom în session
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.departmentId = token.departmentId;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.departmentId = user.departmentId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
