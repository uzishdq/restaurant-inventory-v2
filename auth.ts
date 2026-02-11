import NextAuth from "next-auth";

import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./lib/validation/auth-validation";
import { isUser } from "./lib/server/data-server/user";
import { ROUTES } from "./lib/constant";
import "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET!,
  pages: {
    signIn: ROUTES.PUBLIC.LOGIN,
    signOut: ROUTES.PUBLIC.LOGIN,
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  jwt: {
    maxAge: 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama, simpan role ke token
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Inject role ke session
      if (token && typeof token.role === "string") {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: {
          label: "username",
          type: "text",
        },
        password: { label: "password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await isUser(parsed.data);

        if (!user) return null;

        return {
          id: user.idUser,
          name: user.name,
          email: user.username,
          role: user.role,
        };
      },
    }),
  ],
});

// Extend types (letakkan di file terpisah misal types/next-auth.d.ts)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: string;
  }
}
