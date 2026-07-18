import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDbConfigured, schema } from "@/lib/db";
import { notify } from "@/lib/notifications";

/**
 * Webhook de fin d'encodage (6.1 Lot 3) — appelé par le job GitHub Actions.
 * Authentifié par secret partagé (`INGEST_WEBHOOK_SECRET`, header Bearer).
 * processing → pending_review (modération a priori D11 — jamais de
 * publication directe) ; en cas d'échec ffmpeg : retour à uploading + log.
 */

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  video_id: z.uuid(),
  ok: z.boolean(),
  hls_manifest_key: z.string().max(500).optional(),
  duration_seconds: z.number().int().positive().optional(),
  error: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const secret = process.env.INGEST_WEBHOOK_SECRET;
  if (!secret || !isDbConfigured()) {
    return NextResponse.json({ error: "non configuré" }, { status: 503 });
  }
  const provided = request.headers.get("authorization");
  if (provided !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  const { video_id, ok, hls_manifest_key, duration_seconds, error } = parsed.data;

  const client = db();
  const [video] = await client.select().from(schema.videos).where(eq(schema.videos.id, video_id)).limit(1);
  if (!video) return NextResponse.json({ error: "vidéo inconnue" }, { status: 404 });
  if (video.status !== "processing") {
    return NextResponse.json({ error: `statut inattendu : ${video.status}` }, { status: 409 });
  }

  if (ok && hls_manifest_key) {
    await client
      .update(schema.videos)
      .set({ status: "pending_review", hlsManifestKey: hls_manifest_key, durationSeconds: duration_seconds ?? null })
      .where(eq(schema.videos.id, video_id));
    if (video.ownerId) await notify(video.ownerId, "video.ready_for_review", { title: video.title });
  } else {
    console.error(`[ingest] encodage échoué pour ${video_id} :`, error);
    await client.update(schema.videos).set({ status: "uploading" }).where(eq(schema.videos.id, video_id));
  }

  return NextResponse.json({ done: true });
}
