import path from "node:path";
import { NextResponse } from "next/server";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { db, isDbConfigured } from "@/lib/db";

/**
 * Applique les migrations Drizzle en attente contre le `DATABASE_URL` que le
 * runtime Vercel résout réellement (élimine tout écart avec une base ciblée
 * depuis un contexte différent, ex. secret GitHub Actions vs intégration
 * Vercel-Neon). Authentifié par AUTH_SECRET. Idempotent (no-op si déjà à jour).
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !isDbConfigured()) {
    return NextResponse.json({ error: "non configuré" }, { status: 503 });
  }
  const provided = request.headers.get("authorization");
  if (provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  try {
    await migrate(db(), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? { name: error.name, message: error.message } : error },
      { status: 500 },
    );
  }
}
