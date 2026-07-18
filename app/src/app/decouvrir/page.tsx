import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { ButtonLink } from "@/components/ui/Button";
import { Rail } from "@/components/ui/Rail";
import { TitleCard } from "@/components/ui/TitleCard";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { FREE_CATALOG, watchHref } from "@/lib/free-catalog";
import { GENRES } from "@/lib/tmdb/models";
import { discoverMovies, getTrending, isTmdbConfigured } from "@/lib/tmdb/queries";

/**
 * Découvrir (D19 lot 7) — hub d'exploration : que des chemins qualifiés, zéro
 * grille brute. Genres et bandeau Gratuit ▶ sont statiques : la page reste
 * riche même sans clé TMDB (repli D14 §états). Les tendances paginées vivent
 * désormais sur /tendances.
 */

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Découvrir",
  alternates: { canonical: "/decouvrir" },
  description:
    "Genres, tendances, décennies et films gratuits : plusieurs chemins pour trouver quoi regarder.",
};

/** Décennies proposées en exploration (chips → grille discover). */
const DECADES = [1970, 1980, 1990, 2000, 2010, 2020];

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function parsePage(raw: string | string[] | undefined): number {
  const page = Number(first(raw) ?? "1");
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}

function parseDecade(raw: string | string[] | undefined): number | null {
  const decade = Number(first(raw));
  return DECADES.includes(decade) ? decade : null;
}

/** Chip décennie : l'état actif est porté par aria-current + graisse, pas par la couleur seule. */
function DecadeChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-9 items-center rounded-full px-4 text-sm transition-colors duration-(--duration-fast) ${
        active
          ? "bg-brand font-semibold text-on-brand"
          : "bg-surface-raised text-primary hover:bg-surface-interactive"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function DecouvrirPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; decennie?: string | string[] }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const decade = parseDecade(sp.decennie);
  const configured = isTmdbConfigured();

  // Rail d'aperçu en mode hub ; grille discover quand une décennie est choisie.
  const [trending, decadeData] = await Promise.all([
    configured && !decade ? getTrending(1) : Promise.resolve(null),
    configured && decade ? discoverMovies({ decade, page }) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Découvrir</h1>
      <p className="mt-1 text-sm text-secondary">
        Plusieurs chemins pour trouver quoi regarder : par genre, par tendance, par décennie — ou gratuitement.
      </p>

      {/* Aperçu tendances (mode hub uniquement) — la page /tendances détaille jour/semaine */}
      {!decade && trending && trending.titles.length > 0 && (
        <div className="mt-10">
          <Rail
            title="Tendances cette semaine"
            seeAllHref="/tendances"
            explanation="Un aperçu — la page Tendances détaille le jour, la semaine et le Top 10."
          >
            {trending.titles.slice(0, 12).map((t) => (
              <TitleCard
                key={t.href}
                href={t.href}
                title={t.title}
                year={t.year ?? undefined}
                posterUrl={t.posterUrl}
                rating={t.voteAverage}
              />
            ))}
          </Rail>
        </div>
      )}

      {/* Par décennie — chips GET, grille discover quand une décennie est active */}
      <section aria-label="Par décennie" className="mt-12">
        <h2 className="text-xl font-bold md:text-2xl">Par décennie</h2>
        <p className="mt-0.5 text-sm text-secondary">Les films marquants de chaque époque.</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <DecadeChip href="/decouvrir" label="Toutes" active={decade === null} />
          </li>
          {DECADES.map((d) => (
            <li key={d}>
              <DecadeChip href={`/decouvrir?decennie=${d}`} label={`Années ${d}`} active={decade === d} />
            </li>
          ))}
        </ul>

        {decade &&
          (decadeData && decadeData.titles.length > 0 ? (
            <div className="mt-6">
              <h3 className="sr-only">Films des années {decade}</h3>
              <TitleGrid titles={decadeData.titles} />
              <Pagination
                basePath="/decouvrir"
                page={decadeData.page}
                totalPages={decadeData.totalPages}
                extraParams={{ decennie: String(decade) }}
              />
            </div>
          ) : (
            // Repli honnête : jamais d'écran d'erreur, le reste du hub demeure.
            <div className="mt-6 rounded-(--radius-l) bg-surface-raised p-6">
              <p className="text-sm text-secondary">
                Les films des années {decade} s&apos;afficheront dès que la source catalogue sera connectée. En
                attendant, le catalogue gratuit reste ouvert.
              </p>
              <ButtonLink href="/gratuit" variant="secondary" className="mt-4">
                Voir le catalogue gratuit
              </ButtonLink>
            </div>
          ))}
      </section>

      {/* Parcourir par genre — 18 cartes B5, section 100 % statique (rend sans clé TMDB) */}
      <section aria-label="Parcourir par genre" className="mt-12">
        <h2 className="text-xl font-bold md:text-2xl">Parcourir par genre</h2>
        <p className="mt-0.5 text-sm text-secondary">Dix-huit genres, chacun avec sa page dédiée.</p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GENRES.map((genre) => (
            <li key={genre.slug}>
              <Link
                href={`/genre/${genre.slug}`}
                className="group relative block h-24 overflow-hidden rounded-(--radius-m)"
              >
                <Image
                  src={`/media/interface/genre-${genre.slug}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-(--duration-base) motion-safe:group-hover:scale-105"
                />
                <span aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-card)" }} />
                <span className="absolute inset-x-2 bottom-1.5 text-sm font-bold">{genre.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot placement="display.browse" />

      {/* Bandeau Gratuit ▶ — catalogue statique, visionnable sans compte ni clé */}
      <section aria-label="Gratuit ▶" className="mt-12 overflow-hidden rounded-(--radius-l) bg-surface-raised">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Gratuit ▶ — à regarder tout de suite</h2>
            <p className="mt-1 max-w-xl text-sm text-secondary">
              Des classiques du domaine public et des open movies, sans compte ni abonnement.
            </p>
          </div>
          <ButtonLink href="/gratuit" className="shrink-0 self-start md:self-auto">
            Voir le catalogue gratuit
          </ButtonLink>
        </div>
        <ul className="flex gap-4 overflow-x-auto px-6 pb-6 md:px-8">
          {FREE_CATALOG.slice(0, 5).map((video) => (
            <li key={video.slug} className="shrink-0">
              <TitleCard
                href={watchHref(video)}
                title={video.title}
                year={video.year}
                posterUrl={video.artwork}
                isFree
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
