import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { FREE_CATALOG, watchHref } from "@/lib/free-catalog";
import { getPublishedVideos } from "@/lib/videos/published";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gratuit ▶",
  description:
    "Des films du domaine public et des open movies à regarder gratuitement, légalement, sans compte : classiques cultes et courts-métrages Blender.",
};

/**
 * Gratuit ▶ (D19) — catalogue visionnable immédiatement (D5/H8) :
 * domaine public + licences ouvertes, chaque carte mène au lecteur.
 * La section UGC apparaîtra ici après le Studio (Lot 5) et la modération (7.1).
 */
export default async function GratuitPage() {
  const community = await getPublishedVideos(12);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Gratuit ▶</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        Des classiques du domaine public et des open movies, à regarder immédiatement,
        légalement, sans compte. Chaque œuvre affiche sa licence et son attribution.
      </p>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FREE_CATALOG.map((video) => (
          <li key={video.id}>
            <Link
              href={watchHref(video)}
              className="group block overflow-hidden rounded-(--radius-l) bg-surface-raised transition-transform duration-(--duration-base) ease-(--ease-enter) motion-safe:hover:scale-[1.02]"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={video.artwork}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-card)" }} />
                <span className="absolute left-2 top-2 flex gap-1.5">
                  <Badge tone="free">Gratuit ▶</Badge>
                </span>
                <span
                  aria-hidden
                  className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-(--duration-fast) group-hover:bg-brand group-hover:text-on-brand"
                >
                  ▶
                </span>
              </div>
              <div className="p-4">
                <h2 className="font-bold">
                  {video.title} <span className="font-normal text-secondary">({video.year})</span>
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-secondary">{video.overview}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
                  <Badge tone="license">{video.licence}</Badge>
                  {video.durationMinutes} min · {video.genre}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {community.length > 0 && (
        <section aria-label="Créations de la communauté" className="mt-12">
          <h2 className="text-2xl font-bold">Créations de la communauté</h2>
          <p className="mt-1 text-sm text-secondary">
            Des vidéos déposées par les créateurs Ciné+, vérifiées avant publication.
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {community.map((video) => (
              <li key={video.uuid}>
                <Link
                  href={`/regarder/${video.slug}`}
                  className="group block rounded-(--radius-l) bg-surface-raised p-4 transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  <h3 className="font-bold">
                    {video.title}{" "}
                    {video.year && <span className="font-normal text-secondary">({video.year})</span>}
                  </h3>
                  {video.overview && <p className="mt-1 line-clamp-2 text-sm text-secondary">{video.overview}</p>}
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary">
                    <Badge tone="license">{video.licence}</Badge>
                    {video.durationMinutes ? `${video.durationMinutes} min · ` : ""}{video.attribution}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 max-w-2xl text-xs leading-relaxed text-secondary">
        Les œuvres de cette page sont dans le domaine public ou diffusées sous licence ouverte
        (l&apos;attribution est affichée sur chaque page de lecture). Les vidéos de la communauté
        y apparaissent après vérification par notre équipe.
      </p>
    </div>
  );
}
