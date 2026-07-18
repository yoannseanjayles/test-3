import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { InstantSearch } from "@/components/search/InstantSearch";
import { isTmdbConfigured, searchTitles } from "@/lib/tmdb/queries";
import { GENRES } from "@/lib/tmdb/models";

/**
 * Recherche (D19) — formulaire GET server-rendered (fonctionne sans JS),
 * surcouche de suggestions instantanées (audit A7) via InstantSearch.
 */

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez un film ou une série par titre.",
  robots: { index: false },
};

function first(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

const POPULAR_GENRES = GENRES.slice(0, 6);

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; type?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = first(params.q).slice(0, 100);
  const pageRaw = Number(first(params.page) || "1");
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 && pageRaw <= 500 ? pageRaw : 1;
  const type = first(params.type) === "film" || first(params.type) === "serie" ? first(params.type) : "tout";

  const results = query && isTmdbConfigured() ? await searchTitles(query, page) : null;
  const filteredTitles = results ? results.titles.filter((t) => type === "tout" || t.kind === type) : [];
  const filmCount = results ? results.titles.filter((t) => t.kind === "film").length : 0;
  const serieCount = results ? results.titles.filter((t) => t.kind === "serie").length : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Recherche</h1>

      <form action="/recherche" method="get" role="search" className="mt-6 flex max-w-xl gap-3">
        <label htmlFor="q" className="sr-only">
          Titre de film ou de série
        </label>
        <InstantSearch defaultValue={query} />
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center rounded-full bg-brand px-6 font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent)"
        >
          Rechercher
        </button>
      </form>

      {results && (
        <p className="mt-6 text-sm text-secondary" role="status">
          {results.totalResults > 0
            ? `${results.totalResults.toLocaleString("fr-FR")} résultat${results.totalResults > 1 ? "s" : ""} pour « ${query} »`
            : null}
        </p>
      )}

      {results && results.titles.length > 0 && (
        <div className="mt-4">
          <FilterChips
            label="Type"
            options={[
              { label: `Tout (${results.titles.length})`, href: `/recherche?q=${encodeURIComponent(query)}`, active: type === "tout" },
              { label: `Films (${filmCount})`, href: `/recherche?q=${encodeURIComponent(query)}&type=film`, active: type === "film" },
              { label: `Séries (${serieCount})`, href: `/recherche?q=${encodeURIComponent(query)}&type=serie`, active: type === "serie" },
            ]}
          />
        </div>
      )}

      {results && filteredTitles.length > 0 && (
        <>
          <div className="mt-4">
            <TitleGrid titles={filteredTitles} />
          </div>
          <Pagination
            basePath="/recherche"
            page={results.page}
            totalPages={results.totalPages}
            extraParams={type === "tout" ? { q: query } : { q: query, type }}
          />
        </>
      )}

      {results && results.titles.length > 0 && filteredTitles.length === 0 && (
        <p className="mt-8 text-sm text-secondary">Aucun résultat de ce type pour « {query} ».</p>
      )}

      {results && results.titles.length === 0 && (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title={`Aucun résultat pour « ${query} »`}
          description="Vérifiez l'orthographe ou essayez un titre plus court — la recherche porte sur les titres de films et de séries."
          actionHref="/decouvrir"
          actionLabel="Explorer les tendances"
        />
      )}

      {results && results.titles.length === 0 && (
        <div className="mt-8 max-w-2xl">
          <p className="text-sm font-medium text-primary">Quelques pistes en attendant :</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {POPULAR_GENRES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/genre/${g.slug}`}
                  className="inline-flex h-9 items-center rounded-full bg-surface-raised px-4 text-sm text-secondary transition-colors hover:bg-surface-interactive hover:text-primary"
                >
                  {g.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/gratuit"
                className="inline-flex h-9 items-center rounded-full bg-surface-raised px-4 text-sm text-secondary transition-colors hover:bg-surface-interactive hover:text-primary"
              >
                Gratuit ▶
              </Link>
            </li>
          </ul>
        </div>
      )}

      {!results && query && (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="La recherche arrive"
          description="La recherche sera disponible dès que la source catalogue sera connectée. Le catalogue Gratuit ▶ reste disponible dès maintenant."
          actionHref="/gratuit"
          actionLabel="Voir le catalogue gratuit"
        />
      )}
    </div>
  );
}
