import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleCard } from "@/components/ui/TitleCard";
import { Pagination, TitleGrid } from "@/components/ui/TitleGrid";
import { getTrending, isTmdbConfigured } from "@/lib/tmdb/queries";

/**
 * /tendances (D19 §2, sitemap D10) — vraie page Tendances : fenêtre
 * Aujourd'hui/Cette semaine, onglets Tout · Films · Séries et Top 10 numéroté
 * en signature visuelle. Filtres = liens GET (aucun JS requis) ; les valeurs
 * par défaut (semaine, tout) n'apparaissent pas dans l'URL → canonical stable.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Tendances",
  alternates: { canonical: "/tendances" },
  description:
    "Les films et séries les plus regardés aujourd'hui et cette semaine, avec le Top 10 du moment.",
};

type Periode = "jour" | "semaine";
type TypeFiltre = "tout" | "films" | "series";

const PERIODES: { value: Periode; label: string }[] = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
];

const TYPES: { value: TypeFiltre; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "films", label: "Films" },
  { value: "series", label: "Séries" },
];

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function parsePage(raw: string | string[] | undefined): number {
  const page = Number(first(raw) ?? "1");
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}

/** URL de filtre — omet les valeurs par défaut et repart en page 1. */
function filterHref(periode: Periode, type: TypeFiltre): string {
  const params = new URLSearchParams();
  if (periode !== "semaine") params.set("periode", periode);
  if (type !== "tout") params.set("type", type);
  const qs = params.toString();
  return qs ? `/tendances?${qs}` : "/tendances";
}

/** Pill de filtre : l'état actif est porté par aria-current + graisse, pas par la couleur seule. */
function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-9 items-center rounded-full px-4 text-sm transition-colors duration-(--duration-fast) ${
        active
          ? "bg-brand font-semibold text-on-brand"
          : "bg-surface-raised text-primary hover:bg-surface-interactive"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function TendancesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; periode?: string | string[]; type?: string | string[] }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const periode: Periode = first(sp.periode) === "jour" ? "jour" : "semaine";
  const rawType = first(sp.type);
  const type: TypeFiltre = rawType === "films" ? "films" : rawType === "series" ? "series" : "tout";

  const data = isTmdbConfigured()
    ? await getTrending(
        page,
        periode === "jour" ? "day" : "week",
        type === "films" ? "movie" : type === "series" ? "tv" : "all",
      )
    : null;

  // Paramètres à conserver dans la pagination (hors défauts).
  const extraParams: Record<string, string> = {};
  if (periode !== "semaine") extraParams.periode = periode;
  if (type !== "tout") extraParams.type = type;

  // Top 10 numéroté sur la page 1 uniquement ; la grille reprend la suite.
  const topTen = page === 1 ? (data?.titles.slice(0, 10) ?? []) : [];
  const gridTitles = page === 1 ? (data?.titles.slice(10) ?? []) : (data?.titles ?? []);
  const periodeLabel = periode === "jour" ? "aujourd'hui" : "cette semaine";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Tendances</h1>
      <p className="mt-1 text-sm text-secondary">
        Ce que tout le monde regarde {periodeLabel}
        {type === "films" ? ", côté films" : type === "series" ? ", côté séries" : ""}.
      </p>

      {/* Filtres par lien GET — état complet dans l'URL, partageable */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <nav aria-label="Période" className="flex gap-2">
          {PERIODES.map((p) => (
            <FilterPill key={p.value} href={filterHref(p.value, type)} label={p.label} active={p.value === periode} />
          ))}
        </nav>
        <nav aria-label="Type de contenu" className="flex gap-2">
          {TYPES.map((t) => (
            <FilterPill key={t.value} href={filterHref(periode, t.value)} label={t.label} active={t.value === type} />
          ))}
        </nav>
      </div>

      {data && data.titles.length > 0 ? (
        <>
          {topTen.length > 0 && (
            <section aria-label={`Top 10 ${periodeLabel}`} className="mt-8">
              <h2 className="text-xl font-bold md:text-2xl">Top 10 {periodeLabel}</h2>
              <ol className="-mx-4 mt-3 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
                {topTen.map((t, index) => (
                  <li key={`${t.kind}-${t.id}`} className="snap-start">
                    <TitleCard
                      href={t.href}
                      title={t.title}
                      year={t.year ?? undefined}
                      posterUrl={t.posterUrl}
                      rating={t.voteAverage}
                      rank={index + 1}
                    />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {gridTitles.length > 0 && (
            <section aria-label="Suite du classement" className="mt-10">
              {topTen.length > 0 && <h2 className="mb-3 text-xl font-bold md:text-2xl">La suite du classement</h2>}
              <TitleGrid titles={gridTitles} />
            </section>
          )}

          <AdSlot placement="display.browse" />
          <Pagination basePath="/tendances" page={data.page} totalPages={data.totalPages} extraParams={extraParams} />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="Les tendances arrivent"
          description="Cette page s'animera dès que la source catalogue sera connectée. En attendant, des classiques sont à regarder gratuitement."
          actionHref="/gratuit"
          actionLabel="Voir le catalogue gratuit"
        />
      )}
    </div>
  );
}
