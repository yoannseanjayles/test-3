import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { GENRES } from "@/lib/tmdb/models";
import { discoverMovies, getPopularMovies, isTmdbConfigured, type CatalogSort } from "@/lib/tmdb/queries";

/** Grille Films (D19) — tri + facettes décennie/note ; section genres (audit A8). */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Films",
  alternates: { canonical: "/films" },
  description: "Tous les films populaires du moment : affiches, notes et fiches détaillées.",
};

const SORTS: { value: CatalogSort; label: string }[] = [
  { value: "popularite", label: "Popularité" },
  { value: "note", label: "Mieux notés" },
  { value: "recent", label: "Récents" },
];

const DECADES = [2020, 2010, 2000, 1990, 1980, 1970];
const MIN_RATINGS = [7, 8];

function parsePage(raw: string | string[] | undefined): number {
  const page = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}

function first(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

export default async function FilmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; tri?: string | string[]; decennie?: string | string[]; note?: string | string[] }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const sort = SORTS.some((s) => s.value === first(params.tri)) ? (first(params.tri) as CatalogSort) : "popularite";
  const decadeRaw = Number(first(params.decennie));
  const decade = DECADES.includes(decadeRaw) ? decadeRaw : undefined;
  const ratingRaw = Number(first(params.note));
  const minRating = MIN_RATINGS.includes(ratingRaw) ? ratingRaw : undefined;
  const hasFilters = sort !== "popularite" || decade !== undefined || minRating !== undefined;

  const data = isTmdbConfigured()
    ? hasFilters
      ? await discoverMovies({ sort, decade, minRating, page })
      : await getPopularMovies(page)
    : null;

  const extraParams: Record<string, string> = {};
  if (sort !== "popularite") extraParams.tri = sort;
  if (decade) extraParams.decennie = String(decade);
  if (minRating) extraParams.note = String(minRating);

  const hrefWith = (patch: Record<string, string | undefined>) => {
    const merged = { ...extraParams, ...patch };
    const entries = Object.entries(merged).filter((entry): entry is [string, string] => Boolean(entry[1]));
    const qs = new URLSearchParams(entries).toString();
    return qs ? `/films?${qs}` : "/films";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Films</h1>
      <p className="mt-1 text-sm text-secondary">Les films populaires du moment.</p>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        <FilterChips
          label="Trier par"
          options={SORTS.map((s) => ({ label: s.label, href: hrefWith({ tri: s.value === "popularite" ? undefined : s.value }), active: sort === s.value }))}
        />
        <FilterChips
          label="Décennie"
          options={DECADES.map((d) => ({
            label: `${d}s`,
            href: hrefWith({ decennie: decade === d ? undefined : String(d) }),
            active: decade === d,
          }))}
        />
        <FilterChips
          label="Note minimale"
          options={MIN_RATINGS.map((n) => ({
            label: `★ ${n}+`,
            href: hrefWith({ note: minRating === n ? undefined : String(n) }),
            active: minRating === n,
          }))}
        />
      </div>

      {data && data.titles.length > 0 ? (
        <>
          <div className="mt-8">
            <TitleGrid titles={data.titles} />
          </div>
          <AdSlot placement="display.browse" />
          <Pagination basePath="/films" page={data.page} totalPages={data.totalPages} extraParams={extraParams} />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title={hasFilters ? "Aucun résultat pour ces filtres" : "Le catalogue arrive"}
          description={
            hasFilters
              ? "Essayez une autre décennie ou une note minimale plus basse."
              : "Les films seront affichés dès que la source catalogue sera connectée. Le catalogue Gratuit ▶ reste disponible dès maintenant."
          }
          actionHref="/gratuit"
          actionLabel="Voir le catalogue gratuit"
        />
      )}

      {/* Parcourir par genre (audit A8 — cartes B5) */}
      <section aria-label="Parcourir par genre" className="mt-14">
        <h2 className="text-xl font-bold">Parcourir par genre</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {GENRES.map((genre) => (
            <li key={genre.slug}>
              <Link href={`/genre/${genre.slug}`} className="group relative block aspect-video overflow-hidden rounded-(--radius-m)">
                <Image
                  src={`/media/interface/genre-${genre.slug}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 200px, 45vw"
                  className="object-cover transition-transform duration-(--duration-base) motion-safe:group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-card)" }} />
                <span className="absolute inset-x-2 bottom-1.5 text-sm font-bold">{genre.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
