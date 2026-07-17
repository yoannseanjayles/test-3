import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleCard } from "@/components/ui/TitleCard";
import { Pagination } from "@/components/ui/TitleGrid";
import type { Title } from "@/lib/tmdb/models";
import { getNowPlayingMovies, getUpcomingMovies, isTmdbConfigured } from "@/lib/tmdb/queries";

/**
 * Nouveautés (sitemap D10, spec D19) — deux onglets par lien GET :
 * « À l'affiche » (now_playing FR, rangées datées par semaine de sortie) et
 * « Prochainement » (upcoming FR trié par date, compte à rebours J-x).
 * Tout est calculé côté serveur — aucun JS requis, ISR conservé.
 */

export const revalidate = 1800;

type Onglet = "recent" | "prochainement";

function first(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function parseOnglet(raw: string | string[] | undefined): Onglet {
  return first(raw) === "prochainement" ? "prochainement" : "recent";
}

function parsePage(raw: string | string[] | undefined): number {
  const page = Number(first(raw) ?? "1");
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string | string[] }>;
}): Promise<Metadata> {
  const onglet = parseOnglet((await searchParams).onglet);
  return {
    title: onglet === "prochainement" ? "Prochainement au cinéma" : "Nouveautés",
    // Le canonical reste /nouveautes : l'onglet est une vue de la même page.
    alternates: { canonical: "/nouveautes" },
    description:
      onglet === "prochainement"
        ? "Les films attendus prochainement dans les salles françaises, avec leur date de sortie."
        : "Les films à l'affiche en ce moment au cinéma en France, semaine par semaine.",
  };
}

const DAY_MS = 86_400_000;

/** Date ISO `AAAA-MM-JJ` → timestamp UTC minuit ; null si absente ou invalide. */
function parseIsoDate(iso: string | null): number | null {
  if (!iso) return null;
  const time = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(time) ? null : time;
}

/** Date ISO → « 12 mars » (année ajoutée seulement si différente de l'année en cours). */
function formatDateFr(iso: string): string {
  const time = parseIsoDate(iso);
  if (time === null) return "";
  const date = new Date(time);
  const sameYear = date.getUTCFullYear() === new Date().getUTCFullYear();
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" as const }),
    timeZone: "UTC",
  }).format(date);
}

/** Minuit UTC du jour courant — référence des calculs de semaine et de J-x. */
function todayUtc(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Rangées datées (D19) : regroupe les sorties par semaine, sous-titres calculés côté serveur. */
function groupByWeek(titles: Title[]): { label: string; titles: Title[] }[] {
  const today = todayUtc();
  // Lundi de la semaine courante (getUTCDay : 0 = dimanche).
  const monday = today - ((new Date(today).getUTCDay() + 6) % 7) * DAY_MS;
  const lastMonday = monday - 7 * DAY_MS;
  const buckets = { cette: [] as Title[], derniere: [] as Title[], avant: [] as Title[] };
  for (const t of titles) {
    const time = parseIsoDate(t.releaseDate);
    if (time !== null && time >= monday) buckets.cette.push(t);
    else if (time !== null && time >= lastMonday) buckets.derniere.push(t);
    else buckets.avant.push(t);
  }
  return [
    { label: "Cette semaine", titles: buckets.cette },
    { label: "La semaine dernière", titles: buckets.derniere },
    { label: "Plus tôt à l'affiche", titles: buckets.avant },
  ].filter((group) => group.titles.length > 0);
}

/** Ligne contexte « Sortie le … », avec compte à rebours J-x sous 30 jours (onglet Prochainement). */
function releaseCaption(t: Title, withCountdown: boolean): string | undefined {
  if (!t.releaseDate) return undefined;
  const formatted = formatDateFr(t.releaseDate);
  if (!formatted) return undefined;
  if (withCountdown) {
    const time = parseIsoDate(t.releaseDate);
    if (time !== null) {
      const days = Math.round((time - todayUtc()) / DAY_MS);
      if (days === 0) return "Sortie aujourd'hui";
      if (days > 0 && days <= 30) return `Sortie le ${formatted} · J-${days}`;
    }
  }
  return `Sortie le ${formatted}`;
}

/** Grille locale : mêmes classes que TitleGrid, mais avec la ligne de date sous chaque carte. */
function DatedGrid({ titles, withCountdown }: { titles: Title[]; withCountdown: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {titles.map((t) => (
        <li key={`${t.kind}-${t.id}`} className="[&>a]:w-full">
          <TitleCard
            href={t.href}
            title={t.title}
            year={t.year ?? undefined}
            posterUrl={t.posterUrl}
            caption={releaseCaption(t, withCountdown)}
          />
        </li>
      ))}
    </ul>
  );
}

export default async function NouveautesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; onglet?: string | string[] }>;
}) {
  const sp = await searchParams;
  const onglet = parseOnglet(sp.onglet);
  const page = parsePage(sp.page);
  const data = isTmdbConfigured()
    ? onglet === "prochainement"
      ? await getUpcomingMovies(page)
      : await getNowPlayingMovies(page)
    : null;

  const tabClass = (active: boolean) =>
    `inline-flex h-9 items-center rounded-full px-4 text-sm transition-colors duration-(--duration-fast) ${
      active ? "bg-brand font-semibold text-on-brand" : "bg-surface-raised text-primary hover:bg-surface-interactive"
    }`;

  // Prochainement : tri par date de sortie croissante, titres sans date en fin de liste.
  const upcomingSorted =
    onglet === "prochainement" && data
      ? [...data.titles].sort((a, b) => (a.releaseDate ?? "9999").localeCompare(b.releaseDate ?? "9999"))
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Nouveautés</h1>
      <p className="mt-1 text-sm text-secondary">
        {onglet === "prochainement"
          ? "Les films attendus prochainement dans les salles françaises."
          : "Les sorties cinéma du moment en France, semaine par semaine."}
      </p>

      {/* Onglets par lien GET — l'état actif est porté par aria-current, pas par la couleur seule */}
      <nav aria-label="Sections des nouveautés" className="mt-6 flex gap-2">
        <Link href="/nouveautes" aria-current={onglet === "recent" ? "page" : undefined} className={tabClass(onglet === "recent")}>
          À l&apos;affiche
        </Link>
        <Link
          href="/nouveautes?onglet=prochainement"
          aria-current={onglet === "prochainement" ? "page" : undefined}
          className={tabClass(onglet === "prochainement")}
        >
          Prochainement
        </Link>
      </nav>

      {data && data.titles.length > 0 ? (
        <>
          {onglet === "prochainement" ? (
            <div className="mt-8">
              <DatedGrid titles={upcomingSorted} withCountdown />
            </div>
          ) : (
            groupByWeek(data.titles).map((group) => (
              <section key={group.label} aria-label={group.label} className="mt-8">
                <h2 className="mb-3 text-xl font-bold md:text-2xl">{group.label}</h2>
                <DatedGrid titles={group.titles} withCountdown={false} />
              </section>
            ))
          )}
          <AdSlot placement="display.browse" />
          <Pagination
            basePath="/nouveautes"
            page={data.page}
            totalPages={data.totalPages}
            extraParams={onglet === "prochainement" ? { onglet: "prochainement" } : {}}
          />
        </>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-search.jpg"
          title="Les nouveautés arrivent"
          description="Cette page s'animera dès que la source catalogue sera connectée. En attendant, des classiques sont à regarder gratuitement."
          actionHref="/gratuit"
          actionLabel="Voir le catalogue gratuit"
        />
      )}
    </div>
  );
}
