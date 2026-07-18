import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChips } from "@/components/ui/FilterChips";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { GENRES } from "@/lib/tmdb/models";
import { getMoviesByGenre, getSeriesByGenre, isTmdbConfigured } from "@/lib/tmdb/queries";
import { absoluteUrl } from "@/lib/site";

/** Pages genres (D19 facettes, audit A8) — les 18 cartes B5 servent enfin. */

export const revalidate = 3600;

/** Genres dont l'id TMDB films coïncide avec l'id TMDB séries — seuls ceux-ci ont un onglet Séries. */
const TV_COMPATIBLE_SLUGS = new Set([
  "animation",
  "comedie",
  "crime",
  "documentaire",
  "drame",
  "famille",
  "mystere",
  "western",
]);

const INTRO_FR: Record<string, string> = {
  action: "Cascades, poursuites et affrontements — le genre qui privilégie le spectacle et l'adrénaline.",
  aventure: "Voyages, quêtes et mondes à explorer, portés par des héros en mouvement.",
  animation: "Des œuvres dessinées ou en images de synthèse, pour tous les âges ou plus adultes.",
  comedie: "Pensée pour faire rire, du burlesque à la comédie plus fine.",
  crime: "Enquêtes, gangsters et système judiciaire au cœur du récit.",
  documentaire: "Le réel raconté, entre reportage et point de vue d'auteur.",
  drame: "Des histoires humaines fortes, souvent portées par leurs personnages.",
  famille: "À regarder tous ensemble, sans mauvaise surprise.",
  fantastique: "Quand l'irrationnel et le surnaturel s'invitent dans le réel.",
  guerre: "Conflits armés et leurs conséquences, filmés ou racontés.",
  histoire: "Des récits ancrés dans des faits ou des époques passées.",
  horreur: "Pensé pour effrayer — tension, peur et parfois gore.",
  musique: "La musique comme sujet ou comme moteur du récit.",
  mystere: "Énigmes et secrets à percer, souvent jusqu'au dernier acte.",
  romance: "L'amour et ses complications au centre de l'histoire.",
  "science-fiction": "Futurs, technologies et univers spéculatifs.",
  thriller: "Tension et suspense, jusqu'à la dernière minute.",
  western: "Grands espaces et Far West, codes classiques ou revisités.",
};

export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) return { title: "Genre introuvable" };
  return {
    title: `Films ${genre.label}`,
    alternates: { canonical: absoluteUrl(`/genre/${genre.slug}`) },
    description: `Les meilleurs films ${genre.label.toLowerCase()} du moment, triés par popularité.`,
  };
}

function first(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; type?: string | string[] }>;
}) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) notFound();

  const sp = await searchParams;
  const tvCompatible = TV_COMPATIBLE_SLUGS.has(slug);
  const type = tvCompatible && first(sp.type) === "serie" ? "serie" : "film";

  const raw = sp.page;
  const pageNum = Number(Array.isArray(raw) ? raw[0] : (raw ?? "1"));
  const page = Number.isInteger(pageNum) && pageNum >= 1 && pageNum <= 500 ? pageNum : 1;
  const data = isTmdbConfigured()
    ? type === "serie"
      ? await getSeriesByGenre(genre.id, page)
      : await getMoviesByGenre(genre.id, page)
    : null;

  const itemListJsonLd = data
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: data.titles.map((t, index) => ({
          "@type": "ListItem",
          position: (page - 1) * data.titles.length + index + 1,
          url: absoluteUrl(t.href),
          name: t.title,
        })),
      }
    : null;

  return (
    <>
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
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
        {INTRO_FR[slug] && <p className="max-w-2xl text-sm text-secondary">{INTRO_FR[slug]}</p>}

        {tvCompatible && (
          <div className="mt-5">
            <FilterChips
              label="Type"
              options={[
                { label: "Films", href: `/genre/${slug}`, active: type === "film" },
                { label: "Séries", href: `/genre/${slug}?type=serie`, active: type === "serie" },
              ]}
            />
          </div>
        )}

        {data && data.titles.length > 0 ? (
          <>
            <div className="mt-6">
              <TitleGrid titles={data.titles} />
            </div>
            <AdSlot placement="display.browse" />
            <Pagination
              basePath={`/genre/${genre.slug}`}
              page={data.page}
              totalPages={data.totalPages}
              extraParams={type === "serie" ? { type: "serie" } : {}}
            />
          </>
        ) : (
          <EmptyState
            illustration="/media/interface/empty-search.jpg"
            title="Le catalogue arrive"
            description="Ce genre s'animera dès que la source catalogue sera connectée. Le catalogue Gratuit ▶ reste disponible dès maintenant."
            actionHref="/gratuit"
            actionLabel="Voir le catalogue gratuit"
          />
        )}
      </div>
    </>
  );
}
