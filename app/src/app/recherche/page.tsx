import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { isTmdbConfigured, searchTitles } from "@/lib/tmdb/queries";

/**
 * Recherche (D19) — formulaire GET server-rendered (fonctionne sans JS),
 * recherche instantanée/suggestions au Lot 3 (TanStack Query).
 */

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez un film ou une série par titre.",
  robots: { index: false },
};

function first(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = first(params.q).slice(0, 100);
  const pageRaw = Number(first(params.page) || "1");
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 && pageRaw <= 500 ? pageRaw : 1;

  const results = query && isTmdbConfigured() ? await searchTitles(query, page) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Recherche</h1>

      <form action="/recherche" method="get" role="search" className="mt-6 flex max-w-xl gap-3">
        <label htmlFor="q" className="sr-only">
          Titre de film ou de série
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Un titre de film ou de série…"
          autoFocus={!query}
          className="h-12 w-full rounded-full border border-white/10 bg-surface-raised px-5 text-primary placeholder:text-primary/40 focus:border-brand focus:outline-none"
        />
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
        <>
          <div className="mt-4">
            <TitleGrid titles={results.titles} />
          </div>
          <Pagination basePath="/recherche" page={results.page} totalPages={results.totalPages} extraParams={{ q: query }} />
        </>
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

      {!results && query && (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="La recherche arrive"
          description="La recherche sera disponible dès que la source catalogue sera connectée. Revenez très vite !"
          actionHref="/"
          actionLabel="Retour à l'accueil"
        />
      )}
    </div>
  );
}
