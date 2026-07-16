import "server-only";

import { and, eq, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Rate limiting en base (7.0 §2, lève H88) — fenêtre fixe, sans Redis.
 * `limit()` renvoie true si l'appel est autorisé. Sans base : toujours
 * autorisé (les mutations concernées exigent de toute façon la base).
 * Nettoyage paresseux : les fenêtres expirées sont purgées à l'écriture.
 */

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "inconnue").split(",")[0].trim();
}

export async function limit(
  bucket: string,
  subject: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!isDbConfigured()) return true;
  const client = db();
  const windowStartMin = new Date(Date.now() - windowSeconds * 1000);

  try {
    // Purge paresseuse de la fenêtre expirée pour ce couple (et réinitialisation).
    await client
      .delete(schema.rateLimits)
      .where(
        and(
          eq(schema.rateLimits.bucket, bucket),
          eq(schema.rateLimits.subject, subject),
          lt(schema.rateLimits.windowStart, windowStartMin),
        ),
      );

    const [row] = await client
      .insert(schema.rateLimits)
      .values({ bucket, subject, count: 1 })
      .onConflictDoUpdate({
        target: [schema.rateLimits.bucket, schema.rateLimits.subject],
        set: { count: sql`${schema.rateLimits.count} + 1` },
      })
      .returning({ count: schema.rateLimits.count });

    return (row?.count ?? 1) <= max;
  } catch (error) {
    // L'anti-abus ne doit jamais casser le service : en cas d'erreur, on laisse passer.
    console.error(`[rate-limit] ${bucket} indisponible :`, error);
    return true;
  }
}

export const RATE_LIMITED_MESSAGE = "Trop de tentatives — réessayez dans quelques minutes.";
