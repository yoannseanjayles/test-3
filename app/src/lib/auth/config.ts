import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Auth.js v5 (6.0 §3) — credentials (e-mail + mot de passe argon2), sessions JWT.
 * Inactif tant que `DATABASE_URL` + `AUTH_SECRET` ne sont pas configurés :
 * `authorize` refuse tout, les pages gardent leur état d'annonce (H77).
 * Magic link (Resend, H83) et OAuth s'ajouteront sans changer ce module.
 */

export function isAuthConfigured(): boolean {
  return isDbConfigured() && Boolean(process.env.AUTH_SECRET);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Placeholder inerte : sans AUTH_SECRET, isAuthConfigured() bloque toute connexion.
  secret: process.env.AUTH_SECRET ?? "placeholder-inactif-sans-auth-secret",
  // Vercel le définit automatiquement ; nécessaire derrière tout autre proxy.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!isAuthConfigured()) return null;
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const [user] = await db().select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
        if (!user?.passwordHash) return null;
        const valid = await verify(user.passwordHash, password).catch(() => false);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.displayName ?? undefined, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: "user" | "admin" }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.uid ?? "");
        (session.user as { role?: string }).role = String(token.role ?? "user");
      }
      return session;
    },
  },
});
