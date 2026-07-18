import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb, breadcrumbJsonLd, type Crumb } from "@/components/ui/Breadcrumb";
import { Rail } from "@/components/ui/Rail";
import { TitleCard } from "@/components/ui/TitleCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { WatchlistButton } from "@/components/library/WatchlistButton";
import { ButtonLink } from "@/components/ui/Button";
import { SeasonEpisodes } from "@/components/title/SeasonEpisodes";
import { getFreeVideoByTmdbId } from "@/lib/free-catalog";
import { GENRES, personHref, type CrewPerson, type TitleDetails } from "@/lib/tmdb/models";
import { absoluteUrl } from "@/lib/site";

/**
 * Corps commun des fiches Film (D15) et Série (D16) :
 * fil d'Ariane, hero backdrop + affiche, métadonnées (certification, statut),
 * équipe (réalisation/scénario/création → pages Personne), synopsis,
 * bande-annonce, casting cliquable, section Détails, saisons dépliables
 * (épisodes spoiler-safe) et rail « Vous aimerez aussi ».
 */

const formatRuntime = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;

const DATE_FR = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : DATE_FR.format(time);
};

/** Fraîcheur série (fiches-5) — fonction pure hors du composant (règle react-hooks/purity). */
function isRecentEpisode(lastAirDate: string | null): boolean {
  if (!lastAirDate) return false;
  const lastAirTime = Date.parse(lastAirDate);
  if (Number.isNaN(lastAirTime)) return false;
  const delta = Date.now() - lastAirTime;
  // Seuil 7 jours pour absorber la latence ISR (revalidate 21600) ; borne basse pour ignorer une date future.
  return delta < 7 * 86_400_000 && delta > -86_400_000;
}

/** Budget/recettes TMDB (toujours en dollars US) — affichés seulement si > 0 (fiches-2). */
const MONEY_USD = new Intl.NumberFormat("fr-FR", { notation: "compact", style: "currency", currency: "USD", maximumFractionDigits: 1 });

/** Noms d'équipe séparés par des virgules, chacun lié à sa page Personne (fiches-1). */
function PersonLinks({ persons }: { persons: CrewPerson[] }) {
  return (
    <>
      {persons.map((p, index) => (
        <span key={p.id}>
          {index > 0 && ", "}
          <Link
            href={personHref(p.id, p.name)}
            className="font-medium text-primary underline-offset-2 transition-colors duration-(--duration-fast) hover:text-brand hover:underline"
          >
            {p.name}
          </Link>
        </span>
      ))}
    </>
  );
}

export function TitleDetailPage({ details, freeWatchHref }: { details: TitleDetails; freeWatchHref?: string }) {
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
    recommendations,
    directors,
    writers,
    creators,
    countries,
    originalTitle,
    status,
    certification,
    budget,
    revenue,
    releaseDate,
    lastAirDate,
    nextEpisodeAirDate,
    kind,
  } = details;

  // Fil d'Ariane (transversal-1) : Accueil › Films|Séries › {genre si mappé} › {titre}.
  const mainGenre = kind === "film" ? GENRES.find((g) => g.id === genres[0]?.id) : undefined;
  const crumbs: Crumb[] = [
    kind === "film" ? { label: "Films", href: "/films" } : { label: "Séries", href: "/series" },
    ...(mainGenre ? [{ label: mainGenre.label, href: `/genre/${mainGenre.slug}` }] : []),
    { label: title },
  ];

  // Fraîcheur série (fiches-5).
  const hasNewEpisode = kind === "serie" && isRecentEpisode(lastAirDate);
  const nextEpisodeDate = kind === "serie" ? formatDate(nextEpisodeAirDate) : null;

  // Période de diffusion (fiches-5) : « depuis 2019 » en cours, « 2019 – 2024 » sinon.
  const lastAirYear = lastAirDate ? Number(lastAirDate.slice(0, 4)) || null : null;
  const yearLabel =
    year === null
      ? null
      : kind === "serie" && status === "En cours de diffusion"
        ? `depuis ${year}`
        : kind === "serie" && lastAirYear !== null && lastAirYear > year
          ? `${year} – ${lastAirYear}`
          : String(year);

  // Section Détails (fiches-2) : uniquement les champs réellement renseignés.
  const releaseDateLabel = formatDate(releaseDate);
  const lastAirLabel = kind === "serie" ? formatDate(lastAirDate) : null;
  const detailRows: { label: string; value: React.ReactNode }[] = [];
  if (releaseDateLabel) {
    detailRows.push({ label: kind === "film" ? "Date de sortie" : "Première diffusion", value: releaseDateLabel });
  }
  if (lastAirLabel && lastAirLabel !== releaseDateLabel) {
    detailRows.push({ label: "Dernière diffusion", value: lastAirLabel });
  }
  if (directors.length > 0) detailRows.push({ label: "Réalisation", value: <PersonLinks persons={directors} /> });
  if (writers.length > 0) detailRows.push({ label: "Scénario", value: <PersonLinks persons={writers} /> });
  if (creators.length > 0) detailRows.push({ label: "Création", value: <PersonLinks persons={creators} /> });
  if (originalTitle) detailRows.push({ label: "Titre original", value: originalTitle });
  if (countries.length > 0) {
    detailRows.push({ label: "Pays de production", value: countries.join(", ") });
  }
  if (status) detailRows.push({ label: "Statut", value: status });
  if (budget > 0) detailRows.push({ label: "Budget", value: MONEY_USD.format(budget) });
  if (revenue > 0) detailRows.push({ label: "Recettes", value: MONEY_USD.format(revenue) });

  // « Vous aimerez aussi » (fiches-4) : recommendations TMDB, repli sur similar.
  const suggestions = recommendations.length > 0 ? recommendations : similar;

  return (
    <>
      {/* Fil d'Ariane + BreadcrumbList (transversal-1) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs)) }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Hero backdrop */}
      <section aria-label={title} className="relative mt-4">
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
            {/* Équipe en tête (fiches-1) : réalisateur·s du film ou créateur·s de la série. */}
            {kind === "film" && directors.length > 0 && (
              <p className="mt-2 text-sm text-secondary">
                De <PersonLinks persons={directors.slice(0, 3)} />
              </p>
            )}
            {kind === "serie" && creators.length > 0 && (
              <p className="mt-2 text-sm text-secondary">
                Créée par <PersonLinks persons={creators.slice(0, 3)} />
              </p>
            )}
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-secondary">
              {yearLabel && <li>{yearLabel}</li>}
              {runtimeMinutes !== null && runtimeMinutes > 0 && <li>{formatRuntime(runtimeMinutes)}</li>}
              {seasonCount !== null && seasonCount > 0 && (
                <li>
                  {seasonCount} saison{seasonCount > 1 ? "s" : ""} · {episodeCount} épisode{(episodeCount ?? 0) > 1 ? "s" : ""}
                </li>
              )}
              {/* Classification d'âge France (fiches-3) — omise si TMDB ne la renseigne pas. */}
              {certification && (
                <li aria-label={`Classification d'âge : ${certification}`}>
                  <Badge>{certification}</Badge>
                </li>
              )}
              {/* Statut de diffusion série (fiches-2/fiches-5). */}
              {kind === "serie" && status && (
                <li>
                  <Badge tone={status === "En cours de diffusion" ? "new" : "neutral"}>{status}</Badge>
                </li>
              )}
              {hasNewEpisode && (
                <li>
                  <Badge tone="new">Nouvel épisode</Badge>
                </li>
              )}
              {voteCount > 0 && (
                <li aria-label={`Note moyenne ${voteAverage.toFixed(1)} sur 10, ${voteCount} votes`}>
                  ★ {voteAverage.toFixed(1)} <span className="text-secondary">({voteCount.toLocaleString("fr-FR")})</span>
                </li>
              )}
            </ul>
            {genres.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {genres.map((g) => {
                  // Genre cliquable (fiches-8) si l'ID TMDB correspond à une page /genre — sinon badge simple.
                  const known = GENRES.find((entry) => entry.id === g.id);
                  return (
                    <li key={g.id}>
                      {known ? (
                        <Link
                          href={`/genre/${known.slug}`}
                          aria-label={`Explorer le genre ${known.label}`}
                          className="inline-flex rounded-(--radius-s) transition-opacity duration-(--duration-fast) hover:opacity-80"
                        >
                          <Badge>{g.name}</Badge>
                        </Link>
                      ) : (
                        <Badge>{g.name}</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {/* CTA (D15) : Regarder si le titre est dans le catalogue gratuit + Ma liste */}
            <div className="mt-5 flex flex-wrap gap-3">
              {freeWatchHref && (
                <ButtonLink size="lg" href={freeWatchHref}>
                  ▶ Regarder gratuitement
                </ButtonLink>
              )}
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
            {/* Prochain épisode annoncé (fiches-5). */}
            {nextEpisodeDate && nextEpisodeAirDate && (
              <p className="mt-3 text-sm text-secondary">
                Prochain épisode le <time dateTime={nextEpisodeAirDate}>{nextEpisodeDate}</time>
              </p>
            )}
          </div>
        </div>

        {/* Où regarder (D15/D5 §3.3 — données JustWatch via TMDB, lève H68) */}
        <section aria-label="Où regarder" className="mt-8 max-w-3xl">
          <h2 className="text-xl font-bold">Où regarder</h2>
          {freeWatchHref ? (
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Ce titre est disponible <strong className="text-primary">gratuitement sur Ciné+</strong> —
              lancez la lecture avec le bouton ci-dessus.
            </p>
          ) : details.watchOffers.length > 0 ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-3">
                {details.watchOffers.map((offer) => (
                  <li key={offer.name} className="flex items-center gap-2 rounded-(--radius-m) bg-surface-raised px-3 py-2">
                    {offer.logoUrl && (
                      <Image src={offer.logoUrl} alt="" width={24} height={24} className="rounded" />
                    )}
                    <span className="text-sm">{offer.name}</span>
                    <span className="text-xs text-secondary">({offer.kind})</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-secondary">
                Disponibilités France fournies par JustWatch
                {details.watchLink && (
                  <>
                    {" · "}
                    <a href={details.watchLink} rel="noopener" target="_blank" className="underline hover:text-brand">
                      détail des offres
                    </a>
                  </>
                )}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Aucune plateforme française référencée pour ce titre actuellement — revenez plus tard,
              les disponibilités évoluent chaque semaine.
            </p>
          )}
        </section>

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

        {/* Casting — chaque membre mène à sa page Personne (fiches-1). */}
        {cast.length > 0 && (
          <section aria-label="Casting" className="mt-10">
            <h2 className="text-xl font-bold">Casting</h2>
            <ul className="mt-3 flex gap-4 overflow-x-auto pb-2">
              {cast.map((member) => (
                <li key={member.id} className="w-24 shrink-0 text-center">
                  <Link href={personHref(member.id, member.name)} className="group/person block">
                    <div className="relative mx-auto aspect-square w-20 overflow-hidden rounded-full bg-surface-raised">
                      {member.photoUrl ? (
                        <Image src={member.photoUrl} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <span aria-hidden className="flex h-full items-center justify-center text-xl font-bold text-primary/30">
                          {member.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs font-medium text-primary transition-colors duration-(--duration-fast) group-hover/person:text-brand">
                      {member.name}
                    </p>
                  </Link>
                  {member.character && <p className="truncate text-xs text-secondary">{member.character}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Détails (fiches-2) : date de sortie, équipe, pays, titre original, statut, budget. */}
        {detailRows.length > 0 && (
          <section aria-label="Détails" className="mt-10 max-w-3xl">
            <h2 className="text-xl font-bold">Détails</h2>
            <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {detailRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-secondary">{row.label}</dt>
                  <dd className="mt-0.5 text-sm text-primary">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Saisons (D16 — spoiler-safe : jamais de résumé d'épisode) */}
        {details.seasons.length > 0 && (
          <section aria-label="Saisons" className="mt-10">
            <h2 className="text-xl font-bold">Saisons</h2>
            <ul className="mt-3 space-y-2">
              {details.seasons.map((season) => (
                <li key={season.id} className="rounded-(--radius-m) bg-surface-raised p-3">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded bg-surface-overlay">
                      {season.posterUrl && (
                        <Image src={season.posterUrl} alt="" fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">
                        {season.name}{" "}
                        {season.year && <span className="text-sm font-normal text-secondary">({season.year})</span>}
                      </p>
                      <p className="text-sm text-secondary">
                        {season.episodeCount} épisode{season.episodeCount > 1 ? "s" : ""}
                      </p>
                      {/* Explorateur d'épisodes (fiches-6) : dépliage à la demande, spoiler-safe. */}
                      <SeasonEpisodes serieId={details.id} seasonNumber={season.number} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Emplacement pub fiche — absent du DOM si pub OFF (D6/D15) */}
        <AdSlot placement="display.fiche" />

        {/* Vous aimerez aussi (fiches-4) : recommandations TMDB, repli similar, badge Gratuit ▶. */}
        {suggestions.length > 0 && (
          <Rail
            title="Vous aimerez aussi"
            explanation={
              recommendations.length > 0
                ? "D'après les visionnages des membres TMDB."
                : "Titres proches par thèmes et genres."
            }
          >
            {suggestions.map((t) => (
              <TitleCard
                key={`${t.kind}-${t.id}`}
                href={t.href}
                title={t.title}
                year={t.year ?? undefined}
                posterUrl={t.posterUrl}
                rating={t.voteAverage}
                isFree={t.kind === "film" && Boolean(getFreeVideoByTmdbId(t.id))}
              />
            ))}
          </Rail>
        )}

        <div className="pb-16" />
      </div>
    </>
  );
}

/** JSON-LD Movie / TVSeries (D15/D16, enrichi fiches-8 : director, duration, saisons, certification). */
export function titleJsonLd(details: TitleDetails, canonicalPath: string) {
  const isFilm = details.kind === "film";
  return {
    "@context": "https://schema.org",
    "@type": isFilm ? "Movie" : "TVSeries",
    name: details.title,
    description: details.overview || undefined,
    image: details.posterUrl ?? undefined,
    datePublished: details.releaseDate ?? (details.year ? String(details.year) : undefined),
    genre: details.genres.map((g) => g.name),
    url: absoluteUrl(canonicalPath),
    duration:
      isFilm && details.runtimeMinutes !== null && details.runtimeMinutes > 0
        ? `PT${Math.floor(details.runtimeMinutes / 60)}H${details.runtimeMinutes % 60}M`
        : undefined,
    contentRating: details.certification ?? undefined,
    director: isFilm && details.directors.length > 0
      ? details.directors.map((d) => ({ "@type": "Person", name: d.name }))
      : undefined,
    creator: !isFilm && details.creators.length > 0
      ? details.creators.map((c) => ({ "@type": "Person", name: c.name }))
      : undefined,
    numberOfSeasons: !isFilm && details.seasonCount ? details.seasonCount : undefined,
    numberOfEpisodes: !isFilm && details.episodeCount ? details.episodeCount : undefined,
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
