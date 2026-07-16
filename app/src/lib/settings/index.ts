import "server-only";

import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Registre de paramètres typés (7.0 §1) — seules les clés déclarées ici
 * existent : chaque entrée porte défaut, bornes et description (l'écran
 * back-office « Paramètres » est généré depuis ce registre). Les flags
 * booléens D6/D11 restent dans `app_config` (API `flags.ts` inchangée).
 * Sans base : chaque lecture renvoie le défaut.
 */

export interface NumberSettingSpec {
  default: number;
  min: number;
  max: number;
  unit?: string;
  label: string;
  description: string;
}

export const SETTINGS_REGISTRY = {
  "ugc.quota.videos_per_user": {
    default: 5,
    min: 0,
    max: 1000,
    label: "Quota de vidéos par créateur",
    description: "Nombre maximal de vidéos par compte non-admin (D11). 0 = dépôt fermé même switch ON.",
  },
  "ugc.upload.max_mb": {
    default: 2048,
    min: 10,
    max: 10240,
    unit: "Mo",
    label: "Taille maximale d'un fichier vidéo",
    description: "Plafond du fichier source à l'upload (attention au quota de stockage R2 — H81).",
  },
  "ads.preroll.session_cap": {
    default: 1,
    min: 0,
    max: 10,
    label: "Plafond de pré-rolls par titre et par session",
    description: "Capping D17 (consommé par la décision publicitaire, Lot 2). 0 = pré-roll désactivé.",
  },
  "ads.ecpm_cents": {
    default: 200,
    min: 0,
    max: 100000,
    unit: "¢/1000 imp.",
    label: "eCPM estimé (centimes)",
    description: "Revenu estimé pour 1000 impressions (régie directe v1) — alimente l'écran Revenus.",
  },
  "moderation.sla_hours": {
    default: 72,
    min: 1,
    max: 720,
    unit: "h",
    label: "SLA de modération",
    description: "Délai cible de traitement d'une vidéo ou d'un takedown (affiché dans la file).",
  },
} as const satisfies Record<string, NumberSettingSpec>;

export type SettingKey = keyof typeof SETTINGS_REGISTRY;

const CACHE_TTL_MS = 30_000;
let cache: { values: Map<string, number>; expiresAt: number } | null = null;

async function readSettings(): Promise<Map<string, number>> {
  if (!isDbConfigured()) return new Map();
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.values;
  try {
    const rows = await db().select().from(schema.appSettings);
    const values = new Map<string, number>();
    for (const row of rows) {
      if (typeof row.value === "number" && row.key in SETTINGS_REGISTRY) values.set(row.key, row.value);
    }
    cache = { values, expiresAt: now + CACHE_TTL_MS };
    return values;
  } catch (error) {
    console.error("[settings] lecture app_settings impossible — défauts appliqués :", error);
    return cache?.values ?? new Map();
  }
}

export function invalidateSettingsCache(): void {
  cache = null;
}

/** Valeur effective d'un paramètre : base si présente et dans les bornes, défaut sinon. */
export async function getSetting(key: SettingKey): Promise<number> {
  const spec = SETTINGS_REGISTRY[key];
  const stored = (await readSettings()).get(key);
  if (stored === undefined || stored < spec.min || stored > spec.max) return spec.default;
  return stored;
}
