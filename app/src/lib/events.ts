import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Socle d'événements produit (7.0 §3) — un seul pipeline pour les revenus
 * (`ad.*`, Phase 7) et les analytics (Phase 9). Écriture serveur uniquement,
 * best-effort (jamais bloquant), session anonyme = hash rotatif quotidien
 * IP+UA (aucun cookie, aucun identifiant stable — H101).
 */

export async function anonymousSession(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const ua = h.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${ua}|${day}|cineplus`).digest("hex").slice(0, 16);
}

export async function track(
  name: string,
  props: Record<string, string | number | boolean> = {},
  userId?: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await db()
      .insert(schema.events)
      .values({ name, sessionAnon: await anonymousSession(), userId: userId ?? null, props });
  } catch (error) {
    console.error(`[events] ${name} non enregistré :`, error);
  }
}
