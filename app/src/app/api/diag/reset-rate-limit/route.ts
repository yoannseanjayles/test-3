import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Diagnostic ponctuel (bootstrap) — remet à zéro les compteurs anti-abus
 * auth.register/auth.login, saturés par les nombreux essais de test durant
 * le dépannage de l'inscription. À retirer une fois utilisé.
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

  const deleted = await db()
    .delete(schema.rateLimits)
    .where(inArray(schema.rateLimits.bucket, ["auth.register", "auth.login"]))
    .returning({ bucket: schema.rateLimits.bucket });

  return NextResponse.json({ ok: true, cleared: deleted.length });
}
