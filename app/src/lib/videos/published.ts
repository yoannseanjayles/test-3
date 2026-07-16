import "server-only";

import { desc, eq } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";
import { publicUrl } from "@/lib/storage/r2";

/**
 * Vidéos publiées (statut `published` après modération D11) — servies dans
 * /gratuit et /regarder à côté du catalogue éditorial. Diffusion HLS via
 * l'URL publique du bucket (H90) ; URLs signées par session avec le Worker D7.
 */

export interface PublishedVideo {
  id: number; // hash numérique stable pour Ma liste (LibraryEntry.id)
  uuid: string;
  slug: string;
  title: string;
  year: number | null;
  overview: string;
  durationMinutes: number | null;
  licence: string;
  attribution: string;
  hlsUrl: string | null;
}

/** Ma liste attend un id numérique : dérivé stable du uuid (32 bits). */
function numericId(uuid: string): number {
  let h = 0;
  for (const c of uuid) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) || 1;
}

function toPublished(v: typeof schema.videos.$inferSelect): PublishedVideo {
  return {
    id: numericId(v.id),
    uuid: v.id,
    slug: v.slug,
    title: v.title,
    year: v.year ?? (v.publishedAt ? v.publishedAt.getFullYear() : null),
    overview: v.overview,
    durationMinutes: v.durationSeconds ? Math.round(v.durationSeconds / 60) : null,
    licence: v.licence,
    attribution: v.attribution || "Créateur Ciné+",
    hlsUrl: v.hlsManifestKey ? publicUrl(v.hlsManifestKey) : null,
  };
}

export async function getPublishedVideos(limit = 24): Promise<PublishedVideo[]> {
  if (!isDbConfigured()) return [];
  try {
    const rows = await db()
      .select()
      .from(schema.videos)
      .where(eq(schema.videos.status, "published"))
      .orderBy(desc(schema.videos.publishedAt))
      .limit(limit);
    return rows.map(toPublished).filter((v) => v.hlsUrl);
  } catch (error) {
    console.error("[videos] lecture des vidéos publiées impossible :", error);
    return [];
  }
}

export async function getPublishedVideoBySlug(slug: string): Promise<PublishedVideo | null> {
  if (!isDbConfigured()) return null;
  try {
    const [row] = await db().select().from(schema.videos).where(eq(schema.videos.slug, slug)).limit(1);
    if (!row || row.status !== "published") return null;
    const video = toPublished(row);
    return video.hlsUrl ? video : null;
  } catch (error) {
    console.error("[videos] lecture vidéo publiée impossible :", error);
    return null;
  }
}
