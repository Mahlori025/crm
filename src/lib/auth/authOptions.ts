// src/lib/auth/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { query } from "../db";
import { Role } from "@/types/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const result = await query(
            `SELECT id, email, name, password, role, active 
             FROM users 
             WHERE email = $1`,
            [credentials.email]
          );

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];

          if (!user.active) {
            throw new Error("Account is disabled");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};