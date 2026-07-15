"use client";

import { toggleFavorite, useLibrary, isInList } from "@/lib/library/store";
import type { TitleKind } from "@/lib/tmdb/models";

export interface WatchlistTitle {
  id: number;
  kind: TitleKind;
  title: string;
  year: number | null;
  posterUrl: string | null;
  href: string;
}

/**
 * Bouton « Ma liste » (fiches, D15 §CTA) — écriture optimiste : le store local
 * répond instantanément, le POST BFF arrivera en 6.1 sans changer ce composant.
 */
export function WatchlistButton({ title }: { title: WatchlistTitle }) {
  const library = useLibrary();
  const active = isInList(library, "favorites", title.kind, title.id);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(title)}
      aria-pressed={active}
      className={`inline-flex h-12 items-center gap-2 rounded-full px-6 text-base font-medium transition-all duration-(--duration-fast) ${
        active
          ? "bg-brand text-on-brand hover:bg-brand-hover"
          : "bg-surface-raised text-primary hover:bg-surface-interactive"
      }`}
    >
      <span aria-hidden>{active ? "✓" : "+"}</span>
      {active ? "Dans ma liste" : "Ma liste"}
    </button>
  );
}
