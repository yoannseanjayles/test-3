import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Diagnostic temporaire (bootstrap) — rejoue exactement le hash argon2 et
 * l'insertion de `registerAction` DANS le runtime Vercel réel (contrairement
 * à un script exécuté hors Next.js), pour révéler l'erreur exacte derrière
 * le message générique du formulaire. Authentifié par AUTH_SECRET (déjà
 * configuré), toujours autonettoyant. À retirer une fois le diagnostic conclu.
 */

export const dynamic = "force-dynamic";

const TEST_EMAIL = "diagnostic-test@cineplus.invalid";

export async function POST(request: Request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !isDbConfigured()) {
    return NextResponse.json({ error: "non configuré" }, { status: 503 });
  }
  const provided = request.headers.get("authorization");
  if (provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const steps: string[] = [];
  try {
    steps.push("1/3 import @node-rs/argon2");
    const { hash } = await import("@node-rs/argon2");

    steps.push("2/3 hash");
    const passwordHash = await hash("mot-de-passe-diagnostic-1234");

    steps.push("3/3 insertion");
    await db().delete(schema.users).where(sql`${schema.users.email} = ${TEST_EMAIL}`);
    const [row] = await db()
      .insert(schema.users)
      .values({ email: TEST_EMAIL, passwordHash, role: "user" })
      .returning({ id: schema.users.id });
    await db().delete(schema.users).where(sql`${schema.users.email} = ${TEST_EMAIL}`);

    return NextResponse.json({ ok: true, steps, insertedId: row?.id });
  } catch (error) {
    await db()
      .delete(schema.users)
      .where(sql`${schema.users.email} = ${TEST_EMAIL}`)
      .catch(() => {});
    return NextResponse.json({ ok: false, steps, error: serializeError(error) }, { status: 500 });
  }
}

/** Sérialise récursivement une erreur ET sa chaîne de `cause` (souvent où se cache la vraie raison Postgres/HTTP). */
function serializeError(error: unknown, depth = 0): unknown {
  if (depth > 5) return "…";
  if (error instanceof Error) {
    const out: Record<string, unknown> = { name: error.name, message: error.message };
    for (const key of Object.getOwnPropertyNames(error)) {
      if (key === "name" || key === "message" || key === "stack") continue;
      out[key] = (error as unknown as Record<string, unknown>)[key];
    }
    if ((error as { cause?: unknown }).cause !== undefined) {
      out.cause = serializeError((error as { cause?: unknown }).cause, depth + 1);
    }
    out.stack = error.stack;
    return out;
  }
  return error;
}
