"use server";

import { and, count, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { isUgcUploadEnabled } from "@/lib/ads/flags";
import { db, isDbConfigured, schema } from "@/lib/db";
import { slugify } from "@/lib/tmdb/models";
import { isR2Configured, presignSourceUpload } from "@/lib/storage/r2";

/**
 * Parcours de dépôt Studio (D8/D11, 6.1 Lot 3) :
 * 1. `createUploadAction` — garde-fous (session, switch UGC sauf admin D11,
 *    quota H91, déclaration de droits obligatoire) → ligne `videos` en
 *    `uploading` + URL présignée PUT (le fichier va directement dans R2) ;
 * 2. le navigateur téléverse ;
 * 3. `finalizeUploadAction` — passe en `processing` et déclenche l'encodage
 *    (repository_dispatch GitHub Actions, H82) ;
 * 4. le job encode (ffmpeg→HLS) puis appelle `/api/ingest/complete` →
 *    `pending_review` — la modération (7.1) publiera.
 */

const MAX_VIDEOS_PER_USER = 5; // quota v1 (D11/H91)
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 Go

export interface CreateUploadResult {
  error?: string;
  videoId?: string;
  uploadUrl?: string;
}

const createSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court.").max(200),
  overview: z.string().trim().max(2000).optional().default(""),
  licence: z.enum(["CC BY 4.0", "CC BY-SA 4.0", "CC0 / Domaine public", "Tous droits réservés (diffusion Ciné+)"]),
  rightsDeclaration: z
    .string()
    .trim()
    .min(20, "La déclaration de droits est obligatoire (20 caractères minimum)."),
  fileName: z.string().max(300),
  fileType: z.string().regex(/^video\//, "Le fichier doit être une vidéo."),
  fileSize: z.number().int().positive().max(MAX_UPLOAD_BYTES, "2 Go maximum."),
});

async function canUpload(): Promise<{ userId: string; isAdmin: boolean } | { error: string }> {
  if (!isDbConfigured() || !isR2Configured()) {
    return { error: "Le dépôt n'est pas encore activé (stockage en cours de raccordement)." };
  }
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "Connectez-vous pour déposer une vidéo." };
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  // L'interrupteur UGC ne s'applique qu'aux rôles non-admin (D11).
  if (!isAdmin && !(await isUgcUploadEnabled())) {
    return { error: "La publication par la communauté n'est pas encore ouverte." };
  }
  return { userId, isAdmin };
}

export async function createUploadAction(input: unknown): Promise<CreateUploadResult> {
  const gate = await canUpload();
  if ("error" in gate) return { error: gate.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const data = parsed.data;

  const client = db();

  if (!gate.isAdmin) {
    const [row] = await client
      .select({ n: count() })
      .from(schema.videos)
      .where(and(eq(schema.videos.ownerId, gate.userId)));
    if ((row?.n ?? 0) >= MAX_VIDEOS_PER_USER) {
      return { error: `Quota atteint (${MAX_VIDEOS_PER_USER} vidéos par compte pour l'instant).` };
    }
  }

  const base = slugify(data.title);
  const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`;
  const [video] = await client
    .insert(schema.videos)
    .values({
      ownerId: gate.userId,
      slug,
      title: data.title,
      overview: data.overview,
      licence: data.licence,
      rightsDeclaration: data.rightsDeclaration,
      status: "uploading",
    })
    .returning({ id: schema.videos.id });

  const sourceKey = `sources/${video.id}/original`;
  await client.update(schema.videos).set({ sourceKey }).where(eq(schema.videos.id, video.id));

  const uploadUrl = await presignSourceUpload(sourceKey, data.fileType);
  return { videoId: video.id, uploadUrl };
}

export interface FinalizeResult {
  error?: string;
  dispatched?: boolean;
}

/** Déclenche l'encodage via repository_dispatch (H82) après l'upload navigateur. */
export async function finalizeUploadAction(videoId: string): Promise<FinalizeResult> {
  const gate = await canUpload();
  if ("error" in gate) return { error: gate.error };
  if (!z.uuid().safeParse(videoId).success) return { error: "Identifiant invalide." };

  const client = db();
  const [video] = await client.select().from(schema.videos).where(eq(schema.videos.id, videoId)).limit(1);
  if (!video || (video.ownerId !== gate.userId && !gate.isAdmin)) return { error: "Vidéo introuvable." };
  if (video.status !== "uploading") return { error: "Cette vidéo n'attend pas de fichier." };

  await client.update(schema.videos).set({ status: "processing" }).where(eq(schema.videos.id, videoId));

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_ENCODE_REPO; // ex. yoannseanjayles/test-3
  const appUrl = process.env.APP_BASE_URL;
  if (!token || !repo || !appUrl) {
    // Pipeline non raccordé : la vidéo reste en processing, relançable depuis le back-office (7.1).
    console.warn("[ingest] dispatch encodage non configuré — vidéo en attente", videoId);
    return { dispatched: false };
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      event_type: "encode-video",
      client_payload: {
        video_id: videoId,
        source_key: video.sourceKey,
        callback_url: `${appUrl.replace(/\/$/, "")}/api/ingest/complete`,
      },
    }),
  });
  if (!response.ok) {
    console.error("[ingest] dispatch GitHub refusé :", response.status, await response.text());
    return { dispatched: false };
  }
  return { dispatched: true };
}

export interface MyVideo {
  id: string;
  slug: string;
  title: string;
  status: string;
  createdAt: number;
}

export async function listMyVideosAction(): Promise<MyVideo[]> {
  if (!isDbConfigured()) return [];
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];
  const rows = await db()
    .select()
    .from(schema.videos)
    .where(eq(schema.videos.ownerId, userId))
    .orderBy(desc(schema.videos.createdAt))
    .limit(50);
  return rows.map((v) => ({
    id: v.id,
    slug: v.slug,
    title: v.title,
    status: v.status,
    createdAt: v.createdAt.getTime(),
  }));
}
