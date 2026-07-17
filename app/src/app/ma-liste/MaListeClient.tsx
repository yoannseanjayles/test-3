"use client";

import { useMemo, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleCard } from "@/components/ui/TitleCard";
import {
  markCompleted,
  removeFromList,
  useLibrary,
  type LibraryEntry,
  type LibraryKind,
  type LibraryList,
} from "@/lib/library/store";

/**
 * Ma liste (D19) — 3 onglets : Favoris / En cours / Historique.
 * Tri/filtres et statistiques (audit compte-1/2/6/8) : purement client,
 * calculés depuis les données déjà en mémoire — aucun appel réseau.
 */

const TABS: { value: LibraryList; label: string; empty: { illustration: string; title: string; description: string; actionHref: string; actionLabel: string } }[] = [
  {
    value: "favorites",
    label: "Favoris",
    empty: {
      illustration: "/media/interface/empty-favorites.jpg",
      title: "Aucun favori pour l'instant",
      description: "Ajoutez un titre depuis sa fiche avec le bouton « Ma liste » — il vous attendra ici.",
      actionHref: "/decouvrir",
      actionLabel: "Explorer les tendances",
    },
  },
  {
    value: "resume",
    label: "En cours",
    empty: {
      illustration: "/media/interface/empty-resume.jpg",
      title: "Rien en cours de lecture",
      description: "Les titres que vous commencerez apparaîtront ici pour reprendre exactement où vous en étiez.",
      actionHref: "/gratuit",
      actionLabel: "Regarder un classique",
    },
  },
  {
    value: "history",
    label: "Historique",
    empty: {
      illustration: "/media/interface/empty-history.jpg",
      title: "Votre historique est vide",
      description: "Chaque visionnage terminé sera consigné ici — pratique pour retrouver un titre vu il y a longtemps.",
      actionHref: "/decouvrir",
      actionLabel: "Trouver quoi regarder",
    },
  },
];

const FAVORITES_FILTERS: { value: "tout" | LibraryKind; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "film", label: "Films" },
  { value: "serie", label: "Séries" },
  { value: "video", label: "Gratuit ▶" },
];

type SortMode = "recent" | "az" | "annee";

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")}`;
  return `${minutes} min`;
};

const formatDay = (timestamp: number) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(timestamp));

function ResumeCard({ entry }: { entry: LibraryEntry }) {
  const progress = entry.progress ?? 0;
  const remainingSeconds =
    progress > 0.05 && entry.positionSeconds ? Math.max(0, Math.round(entry.positionSeconds / progress) - entry.positionSeconds) : null;

  return (
    <div className="relative">
      <TitleCard href={entry.href} title={entry.title} year={entry.year ?? undefined} posterUrl={entry.posterUrl} />
      <div className="mt-1.5">
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progression : ${Math.round(progress * 100)} %`}
          className="h-1 overflow-hidden rounded-full bg-surface-overlay"
        >
          <div className="h-full bg-brand" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="mt-1 text-xs text-secondary">
          {remainingSeconds !== null ? `${formatDuration(remainingSeconds)} restantes` : `${Math.round(progress * 100)} % vu`}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => markCompleted(entry)}
            className="rounded-full bg-surface-raised px-2.5 py-1 text-[11px] font-medium text-secondary transition-colors hover:bg-surface-interactive hover:text-primary"
          >
            Marquer vu
          </button>
          <button
            type="button"
            onClick={() => removeFromList("resume", entry.kind, entry.id)}
            className="rounded-full bg-surface-raised px-2.5 py-1 text-[11px] font-medium text-secondary transition-colors hover:bg-surface-interactive hover:text-primary"
          >
            Recommencer
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeFromList("resume", entry.kind, entry.id)}
        aria-label={`Retirer ${entry.title} de la liste`}
        className="absolute right-1.5 top-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition-colors duration-(--duration-fast) hover:bg-black/80"
      >
        ✕
      </button>
    </div>
  );
}

function FavoriteCard({ entry }: { entry: LibraryEntry }) {
  return (
    <div className="relative [&>a]:w-full">
      <TitleCard href={entry.href} title={entry.title} year={entry.year ?? undefined} posterUrl={entry.posterUrl} isFree={entry.kind === "video"} />
      <button
        type="button"
        onClick={() => removeFromList("favorites", entry.kind, entry.id)}
        aria-label={`Retirer ${entry.title} de la liste`}
        className="absolute right-1.5 top-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition-colors duration-(--duration-fast) hover:bg-black/80"
      >
        ✕
      </button>
    </div>
  );
}

function FavoritesTab({ entries }: { entries: LibraryEntry[] }) {
  const [filter, setFilter] = useState<"tout" | LibraryKind>("tout");
  const [sort, setSort] = useState<SortMode>("recent");

  const filtered = useMemo(() => {
    const base = filter === "tout" ? entries : entries.filter((e) => e.kind === filter);
    const sorted = [...base];
    if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    else if (sort === "annee") sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    else sorted.sort((a, b) => b.addedAt - a.addedAt);
    return sorted;
  }, [entries, filter, sort]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FAVORITES_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-current={filter === f.value ? "true" : undefined}
              className={`inline-flex h-9 items-center rounded-full px-4 text-sm transition-colors ${
                filter === f.value ? "bg-brand font-medium text-on-brand" : "bg-surface-raised text-secondary hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-secondary">
          Trier par
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="h-9 rounded-full bg-surface-raised px-3 text-sm text-primary focus:outline-none"
          >
            <option value="recent">Ajout récent</option>
            <option value="az">Titre (A-Z)</option>
            <option value="annee">Année</option>
          </select>
        </label>
      </div>
      {filtered.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((entry) => (
            <li key={`${entry.kind}-${entry.id}`}>
              <FavoriteCard entry={entry} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-secondary">Aucun favori ne correspond à ce filtre.</p>
      )}
    </>
  );
}

function HistoryTab({ entries }: { entries: LibraryEntry[] }) {
  const groups = useMemo(() => {
    const byDay = new Map<string, LibraryEntry[]>();
    for (const entry of entries) {
      const key = formatDay(entry.addedAt);
      byDay.set(key, [...(byDay.get(key) ?? []), entry]);
    }
    return Array.from(byDay.entries());
  }, [entries]);

  const clearAll = () => {
    if (!window.confirm("Effacer tout l'historique de cet appareil ? Cette action est irréversible.")) return;
    entries.forEach((e) => removeFromList("history", e.kind, e.id));
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full bg-surface-raised px-4 py-1.5 text-sm text-secondary transition-colors hover:bg-surface-interactive hover:text-primary"
        >
          Effacer tout l'historique
        </button>
      </div>
      {groups.map(([day, dayEntries]) => (
        <div key={day} className="mt-6">
          <h3 className="text-sm font-medium text-secondary">{day}</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {dayEntries.map((entry) => (
              <li key={`${entry.kind}-${entry.id}`} className="relative [&>a]:w-full">
                <TitleCard href={entry.href} title={entry.title} year={entry.year ?? undefined} posterUrl={entry.posterUrl} />
                <button
                  type="button"
                  onClick={() => removeFromList("history", entry.kind, entry.id)}
                  aria-label={`Retirer ${entry.title} de l'historique`}
                  className="absolute right-1.5 top-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition-colors duration-(--duration-fast) hover:bg-black/80"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function StatsBanner({ library }: { library: ReturnType<typeof useLibrary> }) {
  const total = library.favorites.length + library.history.length + library.resume.length;
  if (total === 0) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-(--radius-m) bg-surface-raised px-5 py-3 text-sm text-secondary">
      <span>
        <strong className="text-primary">{library.favorites.length}</strong> favori{library.favorites.length > 1 ? "s" : ""}
      </span>
      <span>
        <strong className="text-primary">{library.resume.length}</strong> en cours
      </span>
      <span>
        <strong className="text-primary">{library.history.length}</strong> vu{library.history.length > 1 ? "s" : ""}
      </span>
    </div>
  );
}

export function MaListeClient() {
  const library = useLibrary();

  return (
    <Tabs.Root defaultValue="favorites">
      <StatsBanner library={library} />
      <Tabs.List aria-label="Sections de ma liste" className="flex gap-2 border-b border-white/10">
        {TABS.map(({ value, label }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="relative -mb-px border-b-2 border-transparent px-4 py-3 text-sm font-medium text-secondary transition-colors duration-(--duration-fast) hover:text-primary data-[state=active]:border-brand data-[state=active]:text-primary"
          >
            {label}
            {library[value].length > 0 && (
              <span className="ml-1.5 rounded-full bg-surface-raised px-1.5 py-0.5 text-xs text-secondary">
                {library[value].length}
              </span>
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TABS.map(({ value, empty }) => (
        <Tabs.Content key={value} value={value} className="pt-8 focus-visible:outline-none">
          {library[value].length === 0 ? (
            <EmptyState {...empty} />
          ) : value === "favorites" ? (
            <FavoritesTab entries={library.favorites} />
          ) : value === "resume" ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {library.resume.map((entry) => (
                <li key={`${entry.kind}-${entry.id}`}>
                  <ResumeCard entry={entry} />
                </li>
              ))}
            </ul>
          ) : (
            <HistoryTab entries={library.history} />
          )}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
