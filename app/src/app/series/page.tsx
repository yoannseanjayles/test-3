import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { discoverSeries, getPopularSeries, isTmdbConfigured, type CatalogSort } from "@/lib/tmdb/queries";

/** Grille Séries (D19) — tri + facettes décennie/note (mêmes filtres que /films). */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Séries",
  alternates: { canonical: "/series" },
  description: "Toutes les séries populaires du moment : affiches, notes et fiches détaillées.",
};

const SORTS: { value: CatalogSort; label: string }[] = [
  { value: "popularite", label: "Popularité" },
  { value: "note", label: "Mieux notées" },
  { value: "recent", label: "Récentes" },
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

export default async function SeriesPage({
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
      ? await discoverSeries({ sort, decade, minRating, page })
      : await getPopularSeries(page)
    : null;

  const extraParams: Record<string, string> = {};
  if (sort !== "popularite") extraParams.tri = sort;
  if (decade) extraParams.decennie = String(decade);
  if (minRating) extraParams.note = String(minRating);

  const hrefWith = (patch: Record<string, string | undefined>) => {
    const merged = { ...extraParams, ...patch };
    const entries = Object.entries(merged).filter((entry): entry is [string, string] => Boolean(entry[1]));
    const qs = new URLSearchParams(entries).toString();
    return qs ? `/series?${qs}` : "/series";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Séries</h1>
      <p className="mt-1 text-sm text-secondary">Les séries populaires du moment.</p>

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
          <Pagination basePath="/series" page={data.page} totalPages={data.totalPages} extraParams={extraParams} />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title={hasFilters ? "Aucun résultat pour ces filtres" : "Le catalogue arrive"}
          description={
            hasFilters
              ? "Essayez une autre décennie ou une note minimale plus basse."
              : "Les séries seront affichées dès que la source catalogue sera connectée. Le catalogue Gratuit ▶ reste disponible dès maintenant."
          }
          actionHref="/gratuit"
          actionLabel="Voir le catalogue gratuit"
        />
      )}
    </div>
  );
}
