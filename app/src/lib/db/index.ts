import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Client base (6.0 §2) — driver HTTP Neon (adapté serverless, pas de pool TCP).
 * Sans `DATABASE_URL`, l'application fonctionne intégralement en mode
 * « sans base » (flags via env, listes locales) : mêmes replis que TMDB.
 */

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

let client: NeonHttpDatabase<typeof schema> | null = null;

export function db(): NeonHttpDatabase<typeof schema> {
  if (!isDbConfigured()) {
    throw new Error("Base non configurée (DATABASE_URL manquante)");
  }
  if (!client) {
    client = drizzle(neon(process.env.DATABASE_URL as string), { schema });
  }
  return client;
}

export { schema };
