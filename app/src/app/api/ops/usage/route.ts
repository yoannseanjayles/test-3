import { NextResponse } from "next/server";
import { count, sql } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";
import { notifyAdmins } from "@/lib/notifications";

/**
 * Surveillance des seuils free tier (7.0 §6, H81) — appelée par le job
 * hebdomadaire `quota-watch.yml` (Bearer INGEST_WEBHOOK_SECRET).
 * Alerte les admins (cloche + e-mail) au-delà de 80 % d'un quota.
 */

export const dynamic = "force-dynamic";

const DB_LIMIT_BYTES = 0.5 * 1024 * 1024 * 1024; // Neon free : 0,5 Go

export async function POST(request: Request) {
  const secret = process.env.INGEST_WEBHOOK_SECRET;
  if (!secret || !isDbConfigured()) return NextResponse.json({ error: "non configuré" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const client = db();
  const [{ size }] = (await client.execute(
    sql`select pg_database_size(current_database())::bigint as size`,
  )) as unknown as [{ size: string | number }];
  const dbBytes = Number(size);
  const dbRatio = dbBytes / DB_LIMIT_BYTES;

  const [videos] = await client.select({ n: count() }).from(schema.videos);

  const alerts: string[] = [];
  if (dbRatio >= 0.8) {
    alerts.push(`Base Neon à ${(dbRatio * 100).toFixed(0)} % du quota gratuit (${(dbBytes / 1e6).toFixed(0)} Mo / 500 Mo).`);
  }

  for (const detail of alerts) {
    await notifyAdmins("ops.quota_alert", { detail });
  }

  return NextResponse.json({
    database: { bytes: dbBytes, ratio: Number(dbRatio.toFixed(3)) },
    videos: videos?.n ?? 0,
    alerts,
    checkedAt: new Date().toISOString(),
  });
}
