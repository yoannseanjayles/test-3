import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TitleDetailPage, titleJsonLd } from "@/components/title/TitleDetailPage";
import { parseSlugId, titleHref, type TitleDetails } from "@/lib/tmdb/models";
import { getMovieDetails, isTmdbConfigured } from "@/lib/tmdb/queries";
import { getFreeVideoByTmdbId, watchHref } from "@/lib/free-catalog";

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

/** Meta description spec D15 : « {Titre} ({année}) de {réalisateur} avec {acteurs}. … » (fiches-1). */
function metaDescription(details: TitleDetails): string | undefined {
  const director = details.directors[0]?.name;
  const actors = details.cast.slice(0, 2).map((c) => c.name);
  const intro =
    `${details.title}${details.year ? ` (${details.year})` : ""}` +
    `${director ? ` de ${director}` : ""}` +
    `${actors.length > 0 ? ` avec ${actors.join(", ")}` : ""}. `;
  const note = details.voteCount > 0 ? `Note ${details.voteAverage.toFixed(1).replace(".", ",")}/10. ` : "";
  const text = `${intro}${note}${details.overview}`.trim();
  return text ? text.slice(0, 160) : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const details = await load(slug);
  if (!details) return { title: "Film introuvable" };
  return {
    // Title ciblant l'intention de recherche (spec D15 §1, fiches-8).
    title: `${details.title}${details.year ? ` (${details.year})` : ""} — où regarder, bande-annonce, casting`,
    description: metaDescription(details),
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
      <TitleDetailPage
        details={details}
        freeWatchHref={(() => {
          const free = getFreeVideoByTmdbId(details.id);
          return free ? watchHref(free) : undefined;
        })()}
      />
    </>
  );
}
