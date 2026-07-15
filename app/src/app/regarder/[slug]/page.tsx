import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Badge } from "@/components/ui/Badge";
import { FREE_CATALOG, getFreeVideoBySlug, watchHref } from "@/lib/free-catalog";
import { isAdPlacementEnabled } from "@/lib/ads/flags";

/**
 * Watch (D17) — `/regarder/{slug}` : lecteur + fiche allégée, pré-roll = seule
 * pub de la page (décision de non-pollution). Lot 4 : catalogue gratuit ;
 * les titres TMDB visionnables et le mode épisode arrivent avec l'ingestion (6.1).
 */

export function generateStaticParams() {
  return FREE_CATALOG.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const video = getFreeVideoBySlug(slug);
  if (!video) return { title: "Vidéo introuvable" };
  return {
    title: `Regarder ${video.title} (${video.year}) gratuitement`,
    description: video.overview.slice(0, 160),
    alternates: { canonical: watchHref(video) },
    openGraph: { title: `${video.title} — gratuit sur Ciné+`, description: video.overview.slice(0, 200) },
  };
}

export default async function RegarderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = getFreeVideoBySlug(slug);
  if (!video) notFound();

  const prerollEnabled = await isAdPlacementEnabled("video.preroll");
  const suggestions = FREE_CATALOG.filter((v) => v.id !== video.id)
    .slice(0, 3)
    .map((v) => ({ href: watchHref(v), title: v.title }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.overview,
    thumbnailUrl: video.artwork,
    duration: `PT${video.durationMinutes}M`,
    uploadDate: `${video.year}-01-01`,
    potentialAction: { "@type": "WatchAction", target: watchHref(video) },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <VideoPlayer
        video={{
          entry: {
            id: video.id,
            kind: "video",
            title: video.title,
            year: video.year,
            posterUrl: video.artwork,
            href: watchHref(video),
          },
          hls: video.sources.hls,
          mp4: video.sources.mp4,
          attribution: video.attribution,
        }}
        prerollEnabled={prerollEnabled}
        suggestions={suggestions}
      />

      {/* Fiche allégée sous le lecteur (D17/D13) */}
      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">{video.title}</h1>
          <Badge tone="free">Gratuit ▶</Badge>
          <Badge tone="license">{video.licence}</Badge>
        </div>
        <p className="mt-1 text-sm text-secondary">
          {video.year} · {video.durationMinutes} min · {video.genre}
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-secondary">{video.overview}</p>
        <p className="mt-3 text-xs text-primary/50">
          {video.attribution}
          {video.licenceUrl && (
            <>
              {" · "}
              <a href={video.licenceUrl} rel="license noopener" target="_blank" className="underline hover:text-brand">
                {video.licence}
              </a>
            </>
          )}
        </p>
      </div>

      {/* Suggestions (échelle réduite — la découverte reste sur /gratuit) */}
      <section aria-label="À regarder ensuite" className="mt-10">
        <h2 className="text-lg font-bold">À regarder ensuite</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {suggestions.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="inline-flex h-10 items-center rounded-full bg-surface-raised px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
              >
                ▶ {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
