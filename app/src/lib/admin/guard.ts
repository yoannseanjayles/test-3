import "server-only";

import { redirect } from "next/navigation";
import { auth, isAuthConfigured } from "@/lib/auth/config";

/**
 * Garde du back-office (D36) — rôle admin obligatoire (D11).
 * Non connecté → /connexion ; connecté non-admin → 404 (l'existence de
 * l'espace admin n'est pas révélée).
 */

export interface AdminUser {
  id: string;
  email: string | null;
  name: string | null;
}

export async function requireAdmin(): Promise<AdminUser> {
  if (!isAuthConfigured()) redirect("/connexion");
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  if ((session.user as { role?: string }).role !== "admin") {
    const { notFound } = await import("next/navigation");
    notFound();
  }
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
  };
}
