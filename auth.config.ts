import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma / bcrypt imports) — shared by proxy.ts and auth.ts
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], // filled in auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "MENTOR" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
