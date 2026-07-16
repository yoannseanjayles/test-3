import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { approveVideoAction, rejectVideoAction } from "@/lib/admin/actions";
import { isR2Configured, presignRead, publicUrl } from "@/lib/storage/r2";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = { title: "Modération" };
export const dynamic = "force-dynamic";

/**
 * File de modération (D11/D36) — a priori : rien n'est public sans passage ici.
 * Aperçu du rendu HLS (lien), approbation en un clic, refus avec motif obligatoire.
 */
export default async function ModerationPage() {
  const slaHours = await getSetting("moderation.sla_hours");
  const queue = await db()
    .select()
    .from(schema.videos)
    .where(eq(schema.videos.status, "pending_review"))
    .orderBy(asc(schema.videos.createdAt))
    .limit(50);

  const withPreview = await Promise.all(
    queue.map(async (video) => {
      let preview: string | null = null;
      if (video.hlsManifestKey) {
        preview = publicUrl(video.hlsManifestKey);
        if (!preview && isR2Configured()) {
          preview = await presignRead(video.hlsManifestKey, 3600).catch(() => null);
        }
      }
      return { video, preview };
    }),
  );

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Modération</h1>
      <p className="mt-1 text-sm text-secondary">
        {queue.length > 0
          ? `${queue.length} vidéo${queue.length > 1 ? "s" : ""} en attente — la plus ancienne d'abord (SLA cible : ${slaHours} h).`
          : "File vide : aucune vidéo en attente. ✅"}
      </p>

      <ul className="mt-6 space-y-5">
        {withPreview.map(({ video, preview }) => (
          <li key={video.id} className="rounded-(--radius-l) bg-surface-raised p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{video.title}</h2>
              <p className="text-xs text-secondary">
                déposée le {video.createdAt.toLocaleDateString("fr-FR")} ·{" "}
                {video.durationSeconds ? `${Math.round(video.durationSeconds / 60)} min · ` : ""}
                {video.licence}
              </p>
            </div>
            {video.overview && <p className="mt-2 text-sm text-secondary">{video.overview}</p>}
            <p className="mt-3 rounded-(--radius-m) bg-surface-overlay px-3 py-2 text-xs leading-relaxed text-secondary">
              <strong className="text-primary">Déclaration de droits :</strong> {video.rightsDeclaration}
            </p>
            {preview && (
              <p className="mt-3 text-sm">
                <a href={preview} target="_blank" rel="noopener" className="text-link underline hover:text-brand">
                  ▶ Vérifier le rendu HLS
                </a>
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <form action={approveVideoAction}>
                <input type="hidden" name="videoId" value={video.id} />
                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover"
                >
                  ✓ Publier
                </button>
              </form>
              <form action={rejectVideoAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="videoId" value={video.id} />
                <div>
                  <label htmlFor={`reason-${video.id}`} className="mb-1 block text-xs text-secondary">
                    Motif du refus (transmis au créateur)
                  </label>
                  <input
                    id={`reason-${video.id}`}
                    name="reason"
                    required
                    minLength={3}
                    className="h-11 w-72 rounded-(--radius-m) border border-white/10 bg-surface-overlay px-3 text-sm text-primary focus:border-brand focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center rounded-full bg-surface-overlay px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  ✕ Refuser
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
