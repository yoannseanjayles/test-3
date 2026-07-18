import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FREE_CATALOG, getFreeOfTheWeek, watchHref, type FreeVideo } from "@/lib/free-catalog";
import { getPublishedVideos } from "@/lib/videos/published";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gratuit ▶",
  description:
    "Des films du domaine public et des open movies à regarder gratuitement, légalement, sans compte : classiques cultes et courts-métrages Blender.",
};

function FreeCard({ video }: { video: FreeVideo }) {
  return (
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
          {video.director && ` · ${video.director}`}
        </p>
      </div>
    </Link>
  );
}

/**
 * Gratuit ▶ (D19) — catalogue visionnable immédiatement (D5/H8) :
 * domaine public + licences ouvertes, chaque carte mène au lecteur.
 * La section UGC apparaîtra ici après le Studio (Lot 5) et la modération (7.1).
 */
export default async function GratuitPage() {
  const community = await getPublishedVideos(12);
  const heroVideo = getFreeOfTheWeek();
  const openMovies = FREE_CATALOG.filter((v) => v.collection === "open-movie");
  const publicDomain = FREE_CATALOG.filter((v) => v.collection === "domaine-public");
  const uncategorized = FREE_CATALOG.filter((v) => !v.collection);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: FREE_CATALOG.map((video, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(watchHref(video)),
      name: video.title,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      <h1 className="text-3xl font-bold md:text-4xl">Gratuit ▶</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        Des classiques du domaine public et des open movies, à regarder immédiatement,
        légalement, sans compte. Chaque œuvre affiche sa licence et son attribution.
      </p>

      {/* Film gratuit de la semaine (lecture-4) — rotation déterministe sur le catalogue */}
      <section aria-label="Film gratuit de la semaine" className="mt-8">
        <Link
          href={watchHref(heroVideo)}
          className="group relative block aspect-[21/9] max-h-[360px] min-h-[200px] w-full overflow-hidden rounded-(--radius-l) bg-surface-raised"
        >
          <Image
            src={heroVideo.artwork}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-(--duration-base) motion-safe:group-hover:scale-[1.02]"
          />
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <p className="text-sm font-medium text-brand">Le film gratuit de la semaine</p>
            <h2 className="mt-1 text-2xl font-bold md:text-3xl">
              {heroVideo.title} <span className="font-normal text-secondary">({heroVideo.year})</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-secondary">{heroVideo.overview}</p>
            <ButtonLink size="lg" href={watchHref(heroVideo)} className="mt-4 inline-flex">
              ▶ Regarder maintenant
            </ButtonLink>
          </div>
        </Link>
      </section>

      {openMovies.length > 0 && (
        <section aria-label="Open movies" className="mt-10">
          <h2 className="text-xl font-bold">Open movies</h2>
          <p className="mt-1 text-sm text-secondary">
            Des courts-métrages produits en logiciels libres et diffusés sous licence Creative Commons.
          </p>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {openMovies.map((video) => (
              <li key={video.id}>
                <FreeCard video={video} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {publicDomain.length > 0 && (
        <section aria-label="Domaine public" className="mt-10">
          <h2 className="text-xl font-bold">Classiques du domaine public</h2>
          <p className="mt-1 text-sm text-secondary">
            Des films tombés dans le domaine public, faute de renouvellement de copyright — des œuvres
            entières du patrimoine cinématographique librement diffusables.
          </p>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publicDomain.map((video) => (
              <li key={video.id}>
                <FreeCard video={video} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {uncategorized.length > 0 && (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uncategorized.map((video) => (
            <li key={video.id}>
              <FreeCard video={video} />
            </li>
          ))}
        </ul>
      )}

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
