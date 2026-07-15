import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { getTrending, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Découvrir — tendances de la semaine, films et séries mêlés (D19 Découverte/Tendances). */

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Découvrir",
  description: "Les films et séries qui font l'actualité cette semaine.",
};

function parsePage(raw: string | string[] | undefined): number {
  const page = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}

export default async function DecouvrirPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const page = parsePage((await searchParams).page);
  const data = isTmdbConfigured() ? await getTrending(page) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Découvrir</h1>
      <p className="mt-1 text-sm text-secondary">Les tendances de la semaine, films et séries confondus.</p>

      {data && data.titles.length > 0 ? (
        <>
          <div className="mt-8">
            <TitleGrid titles={data.titles} />
          </div>
          <Pagination basePath="/decouvrir" page={data.page} totalPages={data.totalPages} />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="Les tendances arrivent"
          description="Cette page s'animera dès que la source catalogue sera connectée. Revenez très vite !"
          actionHref="/"
          actionLabel="Retour à l'accueil"
        />
      )}
    </div>
  );
}
