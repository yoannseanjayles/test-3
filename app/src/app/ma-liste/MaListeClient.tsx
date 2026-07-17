"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { TitleCard } from "@/components/ui/TitleCard";
import { removeFromList, useLibrary, type LibraryEntry, type LibraryList } from "@/lib/library/store";

/**
 * Ma liste (D19) — 3 onglets : Favoris / En cours / Historique.
 * Lot 3 : favoris actifs (bouton fiche) ; en-cours et historique seront
 * alimentés par le lecteur (Lot 4). Persistance locale en attendant 6.1 (H70).
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

function EntryGrid({ list, entries }: { list: LibraryList; entries: LibraryEntry[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {entries.map((entry) => (
        <li key={`${entry.kind}-${entry.id}`} className="relative [&>a]:w-full">
          <TitleCard href={entry.href} title={entry.title} year={entry.year ?? undefined} posterUrl={entry.posterUrl} />
          {list === "resume" && typeof entry.progress === "number" && (
            <div className="mt-1.5">
              <div
                role="progressbar"
                aria-valuenow={Math.round(entry.progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progression : ${Math.round(entry.progress * 100)} %`}
                className="h-1 overflow-hidden rounded-full bg-surface-overlay"
              >
                <div className="h-full bg-brand" style={{ width: `${Math.round(entry.progress * 100)}%` }} />
              </div>
              {typeof entry.positionSeconds === "number" && (
                <p className="mt-1 text-xs text-secondary">
                  Reprendre à {Math.floor(entry.positionSeconds / 60)}:{String(entry.positionSeconds % 60).padStart(2, "0")}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => removeFromList(list, entry.kind, entry.id)}
            aria-label={`Retirer ${entry.title} de la liste`}
            className="absolute right-1.5 top-1.5 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-sm text-white transition-colors duration-(--duration-fast) hover:bg-black/80"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MaListeClient() {
  const library = useLibrary();

  return (
    <Tabs.Root defaultValue="favorites">
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
          {library[value].length > 0 ? <EntryGrid list={value} entries={library[value]} /> : <EmptyState {...empty} />}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
