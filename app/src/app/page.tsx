import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Rail } from "@/components/ui/Rail";
import { TitleCard, type TitleCardData } from "@/components/ui/TitleCard";
import { AdSlot } from "@/components/ads/AdSlot";
import { ConversionBanner } from "@/components/home/ConversionBanner";
import { isAuthConfigured } from "@/lib/auth/config";
import {
  getMoviesByGenre,
  getNowPlayingMovies,
  getPopularSeries,
  getTopRatedMovies,
  getTrending,
  isTmdbConfigured,
} from "@/lib/tmdb/queries";
import { GENRES, type Title } from "@/lib/tmdb/models";
import { FREE_CATALOG, watchHref } from "@/lib/free-catalog";

/**
 * Accueil — structure D14 (hero → rails → étagère Gratuit → pub → éditorial).
 * Lot 2 : données réelles TMDB (tendances, nouveautés, séries) avec revalidation.
 * Ce lot : rails « Les mieux notés » et « À l'honneur » (rotation hebdomadaire
 * déterministe), dédoublonnage descendant des rails (D14 §2 — hero exclu) et
 * métadonnées courtes du hero. Sans TMDB configuré (ou API en panne), la page
 * bascule sur les contenus de démonstration du Lot 1 — jamais d'écran d'erreur
 * (D14 §états).
 */

export const revalidate = 1800;

const DEMO_TRENDING: TitleCardData[] = [
  { href: "#", title: "Titre de démonstration", year: 2026, dominantColor: "#2e2837" },
  { href: "#", title: "Exemple de carte", year: 2025, dominantColor: "#3a2d4d", isNew: true },
  { href: "#", title: "Affiche à venir", year: 2024, dominantColor: "#4d3a2d" },
  { href: "#", title: "Donnée TMDB (clé à configurer)", year: 2026, dominantColor: "#2d4d3a" },
  { href: "#", title: "Carte de démo", year: 2023, dominantColor: "#2e2837" },
  { href: "#", title: "Placeholder", year: 2022, dominantColor: "#3a2d4d" },
];

// Étagère Gratuit ▶ (D14) : catalogue visionnable réel — cartes vers le lecteur.
const FREE_RAIL: TitleCardData[] = FREE_CATALOG.map((v) => ({
  href: watchHref(v),
  title: v.title,
  year: v.year,
  posterUrl: v.artwork,
  isFree: true,
}));

// Chips d'intention (B6) — chaque envie mène à une vraie destination.
const INTENT_CHIPS = [
  { label: "Rire", image: "/media/interface/chip-rire.jpg", href: "/genre/comedie" },
  { label: "Frissons", image: "/media/interface/chip-frissons.jpg", href: "/genre/horreur" },
  { label: "Aventure", image: "/media/interface/chip-aventure.jpg", href: "/genre/aventure" },
  { label: "Romance", image: "/media/interface/chip-romance.jpg", href: "/genre/romance" },
  { label: "Larmes", image: "/media/interface/chip-larmes.jpg", href: "/genre/drame" },
  { label: "En famille", image: "/media/interface/chip-famille.jpg", href: "/genre/famille" },
  { label: "Vite vu", image: "/media/interface/chip-rapide.jpg", href: "/gratuit" },
  { label: "Pépites", image: "/media/interface/chip-pepites.jpg", href: "/decouvrir" },
];

function toCard(t: Title): TitleCardData {
  return {
    href: t.href,
    title: t.title,
    year: t.year ?? undefined,
    posterUrl: t.posterUrl,
    // Note ★ sur les cartes (D14) — TitleCard la masque quand elle vaut 0.
    rating: t.voteAverage,
  };
}

/** Numéro de semaine ISO 8601 — fonction pure et déterministe, stable dans la fenêtre ISR. */
function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // lundi = 1 … dimanche = 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // jeudi de la même semaine ISO
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
}

/**
 * Dédoublonnage descendant (D14 §2) : le conteneur le plus haut garde le titre.
 * Chaque rail écarte les titres déjà affichés au-dessus, puis limite à `count` cartes.
 */
function takeUnseen(titles: Title[] | undefined, seen: Set<string>, count = 12): Title[] {
  const kept: Title[] = [];
  for (const t of titles ?? []) {
    const key = `${t.kind}-${t.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(t);
    if (kept.length >= count) break;
  }
  return kept;
}

export default async function HomePage() {
  const configured = isTmdbConfigured();
  // Rail « À l'honneur » (D14) : genre en rotation hebdomadaire déterministe — 18 genres, ~18 semaines de variété.
  const spotlightGenre = GENRES[isoWeekNumber(new Date()) % GENRES.length];
  const [trending, nowPlaying, series, topRated, spotlight] = configured
    ? await Promise.all([
        getTrending(),
        getNowPlayingMovies(),
        getPopularSeries(),
        getTopRatedMovies(),
        getMoviesByGenre(spotlightGenre.id),
      ])
    : [null, null, null, null, null];

  // Hero = premier titre tendance avec backdrop (curation admin en 7.1, fallback tendances — D14 §2).
  const hero = trending?.titles.find((t) => t.backdropUrl && t.overview) ?? null;
  const live = Boolean(hero && trending && trending.titles.length > 0);

  // Dédoublonnage descendant (D14 §2) : hero exclu des rails, puis chaque rail dans l'ordre visuel.
  const seen = new Set<string>();
  if (hero) seen.add(`${hero.kind}-${hero.id}`);
  const trendingRail = takeUnseen(trending?.titles, seen);
  const nowPlayingRail = takeUnseen(nowPlaying?.titles, seen);
  const seriesRail = takeUnseen(series?.titles, seen);
  const topRatedRail = takeUnseen(topRated?.titles, seen);
  const spotlightRail = takeUnseen(spotlight?.titles, seen);

  // Métadonnées courtes du hero (D14 §2) : type · année · ★ note — chaque segment omis si absent.
  const heroMeta = hero
    ? [
        hero.kind === "film" ? "Film" : "Série",
        hero.year,
        hero.voteAverage > 0
          ? `★ ${hero.voteAverage.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <>
      {/* Hero — 1 titre unique, double CTA (D14 §2) */}
      <section aria-label="À la une" className="relative">
        <div className="relative aspect-[21/9] min-h-[320px] w-full overflow-hidden md:max-h-[560px]">
          <Image
            src={hero?.backdropUrl ?? "/media/interface/genre-science-fiction.jpg"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 md:px-6 md:pb-12">
          <p className="text-sm font-medium text-brand">À la une cette semaine</p>
          <h1 className="mt-1 max-w-xl text-3xl font-bold md:text-5xl">
            {hero ? hero.title : "Découvrez. Choisissez. Regardez."}
          </h1>
          {heroMeta && <p className="mt-2 text-sm text-secondary">{heroMeta}</p>}
          <p className="mt-2 max-w-lg text-sm text-secondary md:text-base">
            {hero
              ? hero.overview.length > 180
                ? `${hero.overview.slice(0, 180).trimEnd()}…`
                : hero.overview
              : "Trouvez le bon film ou la bonne série en moins de deux minutes — et des classiques à regarder gratuitement."}
          </p>
          <div className="mt-5 flex gap-3">
            {hero ? (
              <>
                <ButtonLink size="lg" href={hero.href}>
                  Voir la fiche
                </ButtonLink>
                <ButtonLink size="lg" variant="secondary" href="/tendances">
                  Explorer les tendances
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink size="lg" href="/gratuit">▶ Regarder</ButtonLink>
                <ButtonLink size="lg" variant="secondary" href="/decouvrir">Découvrir</ButtonLink>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Chips d'intention (D14, assets B6 — audit A8) : « j'ai envie de… » */}
        <section aria-label="Envie de quoi ce soir ?" className="mt-8">
          <h2 className="sr-only">Envie de quoi ce soir ?</h2>
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
            {INTENT_CHIPS.map((chip) => (
              <li key={chip.label} className="snap-start">
                <Link href={chip.href} className="group relative block h-20 w-40 overflow-hidden rounded-(--radius-m)">
                  <Image src={chip.image} alt="" fill sizes="160px" className="object-cover transition-transform duration-(--duration-base) motion-safe:group-hover:scale-105" />
                  <span aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-card)" }} />
                  <span className="absolute inset-x-2 bottom-1.5 text-sm font-bold">{chip.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Rail title="Tendances cette semaine" seeAllHref="/tendances">
          {(live ? trendingRail.map(toCard) : DEMO_TRENDING).map((t) => (
            <TitleCard key={t.href === "#" ? t.title : t.href} {...t} />
          ))}
        </Rail>

        {live && nowPlayingRail.length > 0 && (
          <Rail title="Nouveautés au cinéma" seeAllHref="/nouveautes" explanation="Les sorties du moment en France.">
            {nowPlayingRail.map((t) => (
              <TitleCard key={t.href} {...toCard(t)} isNew />
            ))}
          </Rail>
        )}

        {live && seriesRail.length > 0 && (
          <Rail title="Séries populaires" seeAllHref="/series">
            {seriesRail.map((t) => (
              <TitleCard key={t.href} {...toCard(t)} />
            ))}
          </Rail>
        )}

        {/* Rail « Les mieux notés » (D14 §2 rangée 6) : fonds de catalogue intemporel, tri réel sur /films. */}
        {live && topRatedRail.length > 0 && (
          <Rail
            title="Les mieux notés de tous les temps"
            seeAllHref="/films?tri=note"
            explanation="Les films les mieux notés par la communauté TMDB."
          >
            {topRatedRail.map((t) => (
              <TitleCard key={t.href} {...toCard(t)} />
            ))}
          </Rail>
        )}

        {/* Rail « À l'honneur » (D14) : genre différent chaque semaine, lien croisé vers /genre/*. */}
        {live && spotlightRail.length > 0 && (
          <Rail
            title={`À l'honneur : ${spotlightGenre.label}`}
            seeAllHref={`/genre/${spotlightGenre.slug}`}
            explanation="Une sélection renouvelée chaque semaine."
          >
            {spotlightRail.map((t) => (
              <TitleCard key={t.href} {...toCard(t)} />
            ))}
          </Rail>
        )}

        <Rail title="Gratuit ▶" seeAllHref="/gratuit" explanation="Des classiques à regarder immédiatement, légalement.">
          {FREE_RAIL.map((t) => (
            <TitleCard key={t.href} {...t} />
          ))}
        </Rail>

        {/* Emplacement pub — absent du DOM tant que ADS_ENABLED n'est pas true (D6/D14) */}
        <AdSlot placement="display.home" />

        {/* Bandeau conversion — visiteurs anonymes uniquement (D14 §11, audit B4) */}
        <ConversionBanner authEnabled={isAuthConfigured()} />
      </div>
    </>
  );
}
