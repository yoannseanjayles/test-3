import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Rail } from "@/components/ui/Rail";
import { TitleCard } from "@/components/ui/TitleCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { WatchlistButton } from "@/components/library/WatchlistButton";
import type { TitleDetails } from "@/lib/tmdb/models";

/**
 * Corps commun des fiches Film (D15) et Série (D16) — Lot 2 :
 * hero backdrop + affiche, métadonnées, synopsis, bande-annonce, casting, similaires.
 * Où-regarder (JustWatch), Ma liste et reprise arrivent au Lot 3 (compte requis).
 */

const formatRuntime = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;

export function TitleDetailPage({ details }: { details: TitleDetails }) {
  const {
    title,
    year,
    tagline,
    overview,
    posterUrl,
    backdropUrl,
    genres,
    voteAverage,
    voteCount,
    runtimeMinutes,
    seasonCount,
    episodeCount,
    cast,
    trailerYoutubeKey,
    similar,
    kind,
  } = details;

  return (
    <>
      {/* Hero backdrop */}
      <section aria-label={title} className="relative">
        <div className="relative aspect-[21/9] max-h-[480px] min-h-[240px] w-full overflow-hidden">
          {backdropUrl ? (
            <Image src={backdropUrl} alt="" fill priority sizes="100vw" className="object-cover" />
          ) : (
            <div aria-hidden className="h-full w-full bg-surface-raised" />
          )}
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative z-10 -mt-24 flex flex-col gap-6 md:-mt-32 md:flex-row md:gap-8">
          {/* Affiche */}
          <div
            className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-(--radius-m) bg-surface-raised shadow-lg md:w-56"
            aria-hidden={!posterUrl}
          >
            {posterUrl ? (
              <Image src={posterUrl} alt={`Affiche de ${title}`} fill sizes="(min-width: 768px) 224px, 144px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center font-display text-4xl font-bold text-primary/30">
                {title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* En-tête texte */}
          <div className="min-w-0 pt-2 md:self-end md:pb-2">
            <p className="text-sm font-medium uppercase tracking-wide text-brand">
              {kind === "film" ? "Film" : "Série"}
            </p>
            <h1 className="mt-1 text-3xl font-bold md:text-5xl">{title}</h1>
            {tagline && <p className="mt-2 italic text-secondary">« {tagline} »</p>}
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-secondary">
              {year && <li>{year}</li>}
              {runtimeMinutes !== null && runtimeMinutes > 0 && <li>{formatRuntime(runtimeMinutes)}</li>}
              {seasonCount !== null && seasonCount > 0 && (
                <li>
                  {seasonCount} saison{seasonCount > 1 ? "s" : ""} · {episodeCount} épisode{(episodeCount ?? 0) > 1 ? "s" : ""}
                </li>
              )}
              {voteCount > 0 && (
                <li aria-label={`Note moyenne ${voteAverage.toFixed(1)} sur 10, ${voteCount} votes`}>
                  ★ {voteAverage.toFixed(1)} <span className="text-primary/40">({voteCount.toLocaleString("fr-FR")})</span>
                </li>
              )}
            </ul>
            {genres.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {genres.map((g) => (
                  <li key={g.id}>
                    <Badge>{g.name}</Badge>
                  </li>
                ))}
              </ul>
            )}
            {/* CTA — « Regarder » arrive avec le lecteur (Lot 4) ; Ma liste : optimiste, store local (Lot 3) */}
            <div className="mt-5">
              <WatchlistButton
                title={{
                  id: details.id,
                  kind,
                  title,
                  year,
                  posterUrl,
                  href: details.href,
                }}
              />
            </div>
          </div>
        </div>

        {/* Synopsis */}
        {overview && (
          <section aria-label="Synopsis" className="mt-8 max-w-3xl">
            <h2 className="text-xl font-bold">Synopsis</h2>
            <p className="mt-2 leading-relaxed text-secondary">{overview}</p>
          </section>
        )}

        {/* Bande-annonce (YouTube via IDs TMDB — D5) */}
        {trailerYoutubeKey && (
          <section aria-label="Bande-annonce" className="mt-10">
            <h2 className="text-xl font-bold">Bande-annonce</h2>
            <div className="mt-3 aspect-video max-w-3xl overflow-hidden rounded-(--radius-l) bg-surface-raised">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerYoutubeKey}`}
                title={`Bande-annonce de ${title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="h-full w-full border-0"
              />
            </div>
          </section>
        )}

        {/* Casting */}
        {cast.length > 0 && (
          <section aria-label="Casting" className="mt-10">
            <h2 className="text-xl font-bold">Casting</h2>
            <ul className="mt-3 flex gap-4 overflow-x-auto pb-2">
              {cast.map((member) => (
                <li key={member.id} className="w-24 shrink-0 text-center">
                  <div className="relative mx-auto aspect-square w-20 overflow-hidden rounded-full bg-surface-raised">
                    {member.photoUrl ? (
                      <Image src={member.photoUrl} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <span aria-hidden className="flex h-full items-center justify-center text-xl font-bold text-primary/30">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-primary">{member.name}</p>
                  {member.character && <p className="truncate text-xs text-secondary">{member.character}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Emplacement pub fiche — absent du DOM si pub OFF (D6/D15) */}
        <AdSlot placement="display.fiche" />

        {/* Similaires */}
        {similar.length > 0 && (
          <Rail title={kind === "film" ? "Films similaires" : "Séries similaires"}>
            {similar.map((t) => (
              <TitleCard key={t.id} href={t.href} title={t.title} year={t.year ?? undefined} posterUrl={t.posterUrl} />
            ))}
          </Rail>
        )}

        <div className="pb-16" />
      </div>
    </>
  );
}

/** JSON-LD Movie / TVSeries (D15/D16 — base Lot 2, WatchAction au Lot 4). */
export function titleJsonLd(details: TitleDetails, canonicalPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": details.kind === "film" ? "Movie" : "TVSeries",
    name: details.title,
    description: details.overview || undefined,
    image: details.posterUrl ?? undefined,
    datePublished: details.year ? String(details.year) : undefined,
    genre: details.genres.map((g) => g.name),
    url: canonicalPath,
    aggregateRating:
      details.voteCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(details.voteAverage.toFixed(1)),
            ratingCount: details.voteCount,
            bestRating: 10,
            worstRating: 0,
          }
        : undefined,
    actor: details.cast.slice(0, 5).map((c) => ({ "@type": "Person", name: c.name })),
  };
}
