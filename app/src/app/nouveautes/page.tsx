import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { getNowPlayingMovies, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Nouveautés (sitemap D10, audit A5) — sorties cinéma France du moment. */

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Nouveautés",
  alternates: { canonical: "/nouveautes" },
  description: "Les films qui sortent en ce moment au cinéma en France.",
};

export default async function NouveautesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const raw = (await searchParams).page;
  const pageNum = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  const page = Number.isInteger(pageNum) && pageNum >= 1 && pageNum <= 500 ? pageNum : 1;
  const data = isTmdbConfigured() ? await getNowPlayingMovies(page) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Nouveautés</h1>
      <p className="mt-1 text-sm text-secondary">Les sorties cinéma du moment en France.</p>

      {data && data.titles.length > 0 ? (
        <>
          <div className="mt-8">
            <TitleGrid titles={data.titles} />
          </div>
          <AdSlot placement="display.browse" />
          <Pagination basePath="/nouveautes" page={data.page} totalPages={data.totalPages} />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="Les nouveautés arrivent"
          description="Cette page s'animera dès que la source catalogue sera connectée."
          actionHref="/"
          actionLabel="Retour à l'accueil"
        />
      )}
    </div>
  );
}
