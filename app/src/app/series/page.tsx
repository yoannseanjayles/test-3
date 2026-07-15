import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { getPopularSeries, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Grille Séries (D19) — tri popularité ; facettes genres/année au fil du Lot 2+. */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Séries",
  description: "Toutes les séries populaires du moment : affiches, notes et fiches détaillées.",
};

function parsePage(raw: string | string[] | undefined): number {
  const page = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = parsePage((await searchParams).page);
  const data = isTmdbConfigured() ? await getPopularSeries(page) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Séries</h1>
      <p className="mt-1 text-sm text-secondary">Les séries populaires du moment.</p>

      {data && data.titles.length > 0 ? (
        <>
          <div className="mt-8">
            <TitleGrid titles={data.titles} />
          </div>
          <Pagination basePath="/series" page={data.page} totalPages={data.totalPages} />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="Le catalogue arrive"
          description="Les séries seront affichées dès que la source catalogue sera connectée. Revenez très vite !"
          actionHref="/"
          actionLabel="Retour à l'accueil"
        />
      )}
    </div>
  );
}
