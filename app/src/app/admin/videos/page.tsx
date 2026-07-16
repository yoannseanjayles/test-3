import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { removeVideoAction, retryEncodingAction } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Vidéos" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  uploading: "Envoi à reprendre",
  processing: "Encodage",
  pending_review: "En modération",
  published: "Publiée",
  rejected: "Refusée",
  removed: "Retirée",
};

/** Catalogue vidéo complet (D36) : retrait/takedown (D11) et relance d'encodage. */
export default async function AdminVideosPage() {
  const videos = await db().select().from(schema.videos).orderBy(desc(schema.videos.createdAt)).limit(200);

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Vidéos ({videos.length})</h1>

      <ul className="mt-6 divide-y divide-white/5 rounded-(--radius-l) bg-surface-raised">
        {videos.map((video) => (
          <li key={video.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {video.status === "published" ? (
                  <Link href={`/regarder/${video.slug}`} className="hover:text-brand">
                    {video.title}
                  </Link>
                ) : (
                  video.title
                )}
              </p>
              <p className="text-xs text-secondary">
                {video.createdAt.toLocaleDateString("fr-FR")} · {video.licence}
              </p>
            </div>
            <Badge>{STATUS_LABELS[video.status] ?? video.status}</Badge>

            {(video.status === "uploading" || video.status === "processing") && video.sourceKey && (
              <form action={retryEncodingAction}>
                <input type="hidden" name="videoId" value={video.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  ↻ Relancer l&apos;encodage
                </button>
              </form>
            )}

            {video.status === "published" && (
              <form action={removeVideoAction} className="flex items-center gap-2">
                <input type="hidden" name="videoId" value={video.id} />
                <label htmlFor={`remove-${video.id}`} className="sr-only">
                  Motif du retrait
                </label>
                <input
                  id={`remove-${video.id}`}
                  name="reason"
                  required
                  minLength={3}
                  placeholder="Motif (takedown…)"
                  className="h-9 w-44 rounded-(--radius-m) border border-white/10 bg-surface-overlay px-3 text-xs text-primary placeholder:text-secondary focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  Retirer
                </button>
              </form>
            )}
          </li>
        ))}
        {videos.length === 0 && <li className="px-5 py-8 text-sm text-secondary">Aucune vidéo pour l&apos;instant.</li>}
      </ul>
    </>
  );
}
