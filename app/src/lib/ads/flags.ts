import "server-only";

import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Feature flags publicité & UGC (D6, D8, D11) — v2 (6.1 Lot 1) :
 * lus depuis `app_config` (effet immédiat sans redéploiement, exigence D6)
 * avec cache mémoire court ; les variables d'env restent :
 *   - le kill switch d'urgence (env `false` PRIME sur la base),
 *   - la valeur d'amorçage quand la base n'a pas (encore) la clé.
 * Sans DATABASE_URL : comportement identique à la v1 (env uniquement).
 */

export type AdPlacement =
  | "display.home"
  | "display.browse"
  | "display.fiche"
  | "native.rail"
  | "video.preroll";

const CACHE_TTL_MS = 30_000;

let cache: { values: Map<string, boolean>; expiresAt: number } | null = null;

async function readConfig(): Promise<Map<string, boolean>> {
  if (!isDbConfigured()) return new Map();
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.values;
  try {
    const rows = await db().select().from(schema.appConfig);
    cache = { values: new Map(rows.map((r) => [r.key, r.value])), expiresAt: now + CACHE_TTL_MS };
    return cache.values;
  } catch (error) {
    console.error("[config] lecture app_config impossible — repli env :", error);
    return cache?.values ?? new Map();
  }
}

/** Force la relecture au prochain accès (appelé par le back-office à l'écriture, 7.1). */
export function invalidateConfigCache(): void {
  cache = null;
}

async function flag(dbKey: string, envKey: string, envDefault: boolean): Promise<boolean> {
  const env = process.env[envKey];
  // Kill switch d'urgence : un `false` explicite en env l'emporte toujours (D6).
  if (env === "false") return false;
  const config = await readConfig();
  const fromDb = config.get(dbKey);
  if (fromDb !== undefined) return fromDb;
  return env === "true" ? true : envDefault;
}

export async function isAdsEnabled(): Promise<boolean> {
  return flag("ads.enabled", "ADS_ENABLED", false);
}

export async function isAdPlacementEnabled(placement: AdPlacement): Promise<boolean> {
  if (!(await isAdsEnabled())) return false;
  const envKey = `ADS_${placement.toUpperCase().replace(".", "_")}_ENABLED`;
  // Un flag d'emplacement absent (env et base) = suit l'interrupteur global.
  return flag(`ads.${placement}`, envKey, true);
}

/** Interrupteur d'upload UGC — ne s'applique qu'aux rôles non-admin (D11/D13). */
export async function isUgcUploadEnabled(): Promise<boolean> {
  return flag("ugc.upload.enabled", "UGC_UPLOAD_ENABLED", false);
}
