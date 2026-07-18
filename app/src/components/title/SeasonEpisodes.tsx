"use client";

import { useState } from "react";
import type { EpisodeInfo } from "@/lib/tmdb/models";

/**
 * Explorateur d'épisodes d'une saison (D16 §3, spoiler-safe) : bouton dépliable
 * qui charge GET /api/tmdb/season au premier dépliage. Affiche uniquement
 * numéro · titre · date fr-FR · durée — jamais de résumé ni d'image (ligne D16).
 * Repli honnête : message discret si l'API échoue ou renvoie une liste vide.
 */

const DATE_FR = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function formatAirDate(iso: string | null): string | null {
  if (!iso) return null;
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : DATE_FR.format(time);
}

export function SeasonEpisodes({ serieId, seasonNumber }: { serieId: number; seasonNumber: number }) {
  const [open, setOpen] = useState(false);
  const [episodes, setEpisodes] = useState<EpisodeInfo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const panelId = `saison-${serieId}-${seasonNumber}-episodes`;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    // Fetch au premier dépliage seulement ; nouvel essai si l'appel précédent a échoué.
    if (!next || episodes !== null || loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/tmdb/season?serie=${serieId}&saison=${seasonNumber}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { episodes?: EpisodeInfo[] };
      setEpisodes(Array.isArray(data.episodes) ? data.episodes : []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Comparaison en ISO (AAAA-MM-JJ) : l'ordre lexicographique suit l'ordre chronologique.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className="rounded text-sm font-medium text-link transition-colors duration-(--duration-fast) hover:text-brand"
      >
        {open ? "Masquer les épisodes" : "Voir les épisodes"}
      </button>
      <div id={panelId} hidden={!open}>
        {loading && (
          <p role="status" className="mt-2 text-sm text-secondary">
            Chargement des épisodes…
          </p>
        )}
        {!loading && (failed || (episodes !== null && episodes.length === 0)) && (
          <p className="mt-2 text-sm text-secondary">Épisodes indisponibles pour le moment.</p>
        )}
        {episodes !== null && episodes.length > 0 && (
          <ol aria-label={`Épisodes de la saison ${seasonNumber}`} className="mt-2 space-y-1.5">
            {episodes.map((ep) => {
              const date = formatAirDate(ep.airDate);
              const upcoming = ep.airDate !== null && ep.airDate > today;
              return (
                <li key={ep.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="w-9 shrink-0 tabular-nums text-secondary">
                    E{String(ep.number).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 font-medium text-primary">{ep.name || `Épisode ${ep.number}`}</span>
                  {(date || ep.runtimeMinutes || upcoming) && (
                    <span className="text-xs text-secondary">
                      {date}
                      {date && ep.runtimeMinutes ? " · " : ""}
                      {ep.runtimeMinutes ? `${ep.runtimeMinutes} min` : ""}
                      {upcoming ? `${date || ep.runtimeMinutes ? " · " : ""}à venir` : ""}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
