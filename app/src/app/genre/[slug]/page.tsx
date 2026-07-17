import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { GENRES } from "@/lib/tmdb/models";
import { getMoviesByGenre, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Pages genres (D19 facettes, audit A8) — les 18 cartes B5 servent enfin. */

export const revalidate = 3600;

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) return { title: "Genre introuvable" };
  return {
    title: `Films ${genre.label}`,
    alternates: { canonical: `/genre/${genre.slug}` },
    description: `Les meilleurs films ${genre.label.toLowerCase()} du moment, triés par popularité.`,
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) notFound();

  const raw = (await searchParams).page;
  const pageNum = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  const page = Number.isInteger(pageNum) && pageNum >= 1 && pageNum <= 500 ? pageNum : 1;
  const data = isTmdbConfigured() ? await getMoviesByGenre(genre.id, page) : null;

  return (
    <>
      <section aria-label={genre.label} className="relative">
        <div className="relative h-44 w-full overflow-hidden md:h-56">
          <Image src={`/media/interface/genre-${genre.slug}.jpg`} alt="" fill priority sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 md:px-6">
            <h1 className="text-3xl font-bold md:text-4xl">{genre.label}</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {data && data.titles.length > 0 ? (
          <>
            <TitleGrid titles={data.titles} />
            <AdSlot placement="display.browse" />
            <Pagination basePath={`/genre/${genre.slug}`} page={data.page} totalPages={data.totalPages} />
          </>
        ) : (
          <EmptyState
            illustration="/media/interface/empty-search.jpg"
            title="Le catalogue arrive"
            description="Ce genre s'animera dès que la source catalogue sera connectée."
            actionHref="/"
            actionLabel="Retour à l'accueil"
          />
        )}
      </div>
    </>
  );
}
