import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { isTmdbConfigured } from "@/lib/tmdb/client";
import { isR2Configured } from "@/lib/storage/r2";

/**
 * Health check (6.0 §7) — état des dépendances, sans jamais divulguer de secret.
 * `database` : "ok" | "unconfigured" | "error" ; `tmdb`/`r2` : configuré ou non.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "ok" | "unconfigured" | "error" = "unconfigured";
  if (isDbConfigured()) {
    try {
      await db().execute(sql`select 1`);
      database = "ok";
    } catch {
      database = "error";
    }
  }

  const body = {
    status: database === "error" ? "degraded" : "ok",
    database,
    tmdb: isTmdbConfigured() ? "configured" : "unconfigured",
    r2: isR2Configured() ? "configured" : "unconfigured",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: database === "error" ? 503 : 200 });
}
