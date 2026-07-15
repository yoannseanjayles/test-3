import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleDetailPage, titleJsonLd } from "@/components/title/TitleDetailPage";
import { parseSlugId, titleHref } from "@/lib/tmdb/models";
import { getMovieDetails, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Fiche Film (D15) — URL FR stable `/film/titre-ID` (D10) : seul l'ID fait foi. */

export const revalidate = 21600;
export async function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  const id = parseSlugId(slug);
  if (!id || !isTmdbConfigured()) return null;
  return getMovieDetails(id);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) return { title: "Film introuvable" };
  return {
    title: `${details.title}${details.year ? ` (${details.year})` : ""}`,
    description: details.overview.slice(0, 160) || undefined,
    alternates: { canonical: details.href },
    openGraph: {
      title: details.title,
      description: details.overview.slice(0, 200) || undefined,
      images: details.posterUrl ? [details.posterUrl] : undefined,
      type: "video.movie",
    },
  };
}

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) notFound();

  const canonical = titleHref("film", details.id, details.title);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(titleJsonLd(details, canonical)) }}
      />
      <TitleDetailPage details={details} />
    </>
  );
}
