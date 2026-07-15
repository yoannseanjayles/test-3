import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleDetailPage, titleJsonLd } from "@/components/title/TitleDetailPage";
import { parseSlugId, titleHref } from "@/lib/tmdb/models";
import { getSeriesDetails, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Fiche Série (D16) — saisons/épisodes spoiler-safe détaillés au Lot 3 (H27 : pas de pages épisode). */

export const revalidate = 21600;
export async function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  const id = parseSlugId(slug);
  if (!id || !isTmdbConfigured()) return null;
  return getSeriesDetails(id);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) return { title: "Série introuvable" };
  return {
    title: `${details.title}${details.year ? ` (${details.year})` : ""}`,
    description: details.overview.slice(0, 160) || undefined,
    alternates: { canonical: details.href },
    openGraph: {
      title: details.title,
      description: details.overview.slice(0, 200) || undefined,
      images: details.posterUrl ? [details.posterUrl] : undefined,
      type: "video.tv_show",
    },
  };
}

export default async function SeriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) notFound();

  const canonical = titleHref("serie", details.id, details.title);

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
