"use server";

import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth, signOut } from "@/lib/auth/config";
import { db, isDbConfigured, schema } from "@/lib/db";
import { clientIp, limit, RATE_LIMITED_MESSAGE } from "@/lib/rate-limit";

/**
 * Espace compte self-service (audit B2/D3 — C2) : changement de mot de passe,
 * opt-out e-mail (H108), suppression RGPD par l'utilisateur lui-même
 * (la politique de confidentialité promet des « boutons directs »).
 */

export interface AccountFormState {
  ok?: string;
  error?: string;
}

async function currentUser() {
  if (!isDbConfigured()) return null;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const [user] = await db().select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  return user ?? null;
}

export async function changePasswordAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  if (!(await limit("account.password", await clientIp(), 5, 900))) return { error: RATE_LIMITED_MESSAGE };
  const user = await currentUser();
  if (!user) return { error: "Session expirée — reconnectez-vous." };

  const parsed = z
    .object({
      current: z.string().min(1, "Mot de passe actuel requis."),
      next: z.string().min(8, "8 caractères minimum.").max(128),
    })
    .safeParse({ current: formData.get("current"), next: formData.get("next") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const valid = user.passwordHash && (await verify(user.passwordHash, parsed.data.current).catch(() => false));
  if (!valid) return { error: "Mot de passe actuel incorrect." };

  await db()
    .update(schema.users)
    .set({ passwordHash: await hash(parsed.data.next) })
    .where(eq(schema.users.id, user.id));
  return { ok: "Mot de passe mis à jour." };
}

export async function setEmailOptOutAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const user = await currentUser();
  if (!user) return { error: "Session expirée — reconnectez-vous." };
  const optOut = formData.get("optOut") === "true";
  await db().update(schema.users).set({ emailOptOut: optOut }).where(eq(schema.users.id, user.id));
  return { ok: optOut ? "E-mails de notification désactivés." : "E-mails de notification réactivés." };
}

/** Suppression RGPD self-service — confirmation par mot de passe, irréversible. */
export async function deleteMyAccountAction(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  if (!(await limit("account.delete", await clientIp(), 3, 3600))) return { error: RATE_LIMITED_MESSAGE };
  const user = await currentUser();
  if (!user) return { error: "Session expirée — reconnectez-vous." };

  const password = String(formData.get("password") ?? "");
  const valid = user.passwordHash && (await verify(user.passwordHash, password).catch(() => false));
  if (!valid) return { error: "Mot de passe incorrect — suppression annulée." };

  // Cascade FK : listes, notifications ; vidéos publiées anonymisées (owner → null).
  await db().delete(schema.users).where(eq(schema.users.id, user.id));
  await signOut({ redirectTo: "/" });
  return {};
}
