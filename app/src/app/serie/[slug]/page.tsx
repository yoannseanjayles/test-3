import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleDetailPage, titleJsonLd } from "@/components/title/TitleDetailPage";
import { parseSlugId, titleHref, type TitleDetails } from "@/lib/tmdb/models";
import { getSeriesDetails, isTmdbConfigured } from "@/lib/tmdb/queries";

/** Fiche Série (D16) — épisodes spoiler-safe dépliables par saison (H27 : pas de pages épisode). */

export const revalidate = 21600;
export async function generateStaticParams() {
  return [];
}

async function load(slug: string) {
  const id = parseSlugId(slug);
  if (!id || !isTmdbConfigured()) return null;
  return getSeriesDetails(id);
}

/** Meta description spec D16 : « {Titre} ({année}), série de {créateur} avec {acteurs}. … » (fiches-1). */
function metaDescription(details: TitleDetails): string | undefined {
  const creator = details.creators[0]?.name;
  const actors = details.cast.slice(0, 2).map((c) => c.name);
  const intro =
    `${details.title}${details.year ? ` (${details.year})` : ""}, série` +
    `${creator ? ` de ${creator}` : ""}` +
    `${actors.length > 0 ? ` avec ${actors.join(", ")}` : ""}. `;
  const note = details.voteCount > 0 ? `Note ${details.voteAverage.toFixed(1).replace(".", ",")}/10. ` : "";
  const text = `${intro}${note}${details.overview}`.trim();
  return text ? text.slice(0, 160) : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) return { title: "Série introuvable" };
  return {
    // Title ciblant l'intention de recherche (spec D15 §1 appliquée aux séries, fiches-8).
    title: `${details.title}${details.year ? ` (${details.year})` : ""} — où regarder, casting, saisons`,
    description: metaDescription(details),
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
