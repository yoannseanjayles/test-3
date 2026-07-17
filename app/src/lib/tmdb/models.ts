import type {
  TmdbMovieDetails,
  TmdbMovieListItem,
  TmdbTvDetails,
  TmdbTvListItem,
} from "./schemas";

/**
 * Modèles canoniques (D26) : le reste de l'application ne voit jamais les formes
 * TMDB brutes — uniquement `Title` / `TitleDetails`, stables si la source change.
 */

export type TitleKind = "film" | "serie";

export interface Title {
  id: number;
  kind: TitleKind;
  title: string;
  year: number | null;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  voteAverage: number;
  href: string;
}

export interface WatchOffer {
  kind: "abonnement" | "location" | "achat";
  name: string;
  logoUrl: string | null;
}

export interface SeasonInfo {
  id: number;
  number: number;
  name: string;
  episodeCount: number;
  year: number | null;
  overview: string;
  posterUrl: string | null;
}

export interface TitleDetails extends Title {
  tagline: string;
  genres: { id: number; name: string }[];
  voteCount: number;
  /** Films : durée en minutes ; séries : null. */
  runtimeMinutes: number | null;
  /** Séries uniquement. */
  seasonCount: number | null;
  episodeCount: number | null;
  cast: { id: number; name: string; character: string; photoUrl: string | null }[];
  /** Clé YouTube de la bande-annonce officielle si disponible (D5 §trailers). */
  trailerYoutubeKey: string | null;
  similar: Title[];
  /** Où regarder (TMDB watch/providers, données JustWatch — attribution D5 §3.3). */
  watchLink: string | null;
  watchOffers: WatchOffer[];
  /** Séries : saisons spoiler-safe (D16) — épisodes à la demande plus tard. */
  seasons: SeasonInfo[];
}

/** Genres TMDB (D19 grilles) — slugs FR stables alignés sur les assets B5. */
export const GENRES: { slug: string; id: number; label: string }[] = [
  { slug: "action", id: 28, label: "Action" },
  { slug: "aventure", id: 12, label: "Aventure" },
  { slug: "animation", id: 16, label: "Animation" },
  { slug: "comedie", id: 35, label: "Comédie" },
  { slug: "crime", id: 80, label: "Crime" },
  { slug: "documentaire", id: 99, label: "Documentaire" },
  { slug: "drame", id: 18, label: "Drame" },
  { slug: "famille", id: 10751, label: "Famille" },
  { slug: "fantastique", id: 14, label: "Fantastique" },
  { slug: "guerre", id: 10752, label: "Guerre" },
  { slug: "histoire", id: 36, label: "Histoire" },
  { slug: "horreur", id: 27, label: "Horreur" },
  { slug: "musique", id: 10402, label: "Musique" },
  { slug: "mystere", id: 9648, label: "Mystère" },
  { slug: "romance", id: 10749, label: "Romance" },
  { slug: "science-fiction", id: 878, label: "Science-fiction" },
  { slug: "thriller", id: 53, label: "Thriller" },
  { slug: "western", id: 37, label: "Western" },
];

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const posterUrl = (path: string | null, size = "w342") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;
export const backdropUrl = (path: string | null, size = "w1280") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;
export const profileUrl = (path: string | null, size = "w185") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

/** Slug FR stable `titre-ID` (D10) : l'ID fait foi, le libellé n'est que cosmétique. */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "titre"
  );
}

export function titleHref(kind: TitleKind, id: number, title: string): string {
  return `/${kind}/${slugify(title)}-${id}`;
}

/** Extrait l'ID d'un slug `titre-123` ; null si le segment est invalide. */
export function parseSlugId(slug: string): number | null {
  const match = /-(\d+)$/.exec(slug) ?? /^(\d+)$/.exec(slug);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const yearOf = (date: string): number | null => {
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : null;
};

export function movieToTitle(m: TmdbMovieListItem): Title {
  return {
    id: m.id,
    kind: "film",
    title: m.title,
    year: yearOf(m.release_date),
    overview: m.overview,
    posterUrl: posterUrl(m.poster_path),
    backdropUrl: backdropUrl(m.backdrop_path),
    voteAverage: m.vote_average,
    href: titleHref("film", m.id, m.title),
  };
}

export function tvToTitle(t: TmdbTvListItem): Title {
  return {
    id: t.id,
    kind: "serie",
    title: t.name,
    year: yearOf(t.first_air_date),
    overview: t.overview,
    posterUrl: posterUrl(t.poster_path),
    backdropUrl: backdropUrl(t.backdrop_path),
    voteAverage: t.vote_average,
    href: titleHref("serie", t.id, t.name),
  };
}

function pickTrailer(videos: { key: string; site: string; type: string; official: boolean }[]): string | null {
  const candidates = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  return (candidates.find((v) => v.official) ?? candidates[0])?.key ?? null;
}

function watchInfo(d: TmdbMovieDetails | TmdbTvDetails): { watchLink: string | null; watchOffers: WatchOffer[] } {
  const fr = d["watch/providers"]?.results?.FR;
  if (!fr) return { watchLink: null, watchOffers: [] };
  const offers: WatchOffer[] = [];
  const push = (kind: WatchOffer["kind"], list?: { provider_name: string; logo_path: string | null }[]) => {
    for (const p of list ?? []) {
      if (!offers.some((o) => o.name === p.provider_name)) {
        offers.push({ kind, name: p.provider_name, logoUrl: p.logo_path ? `${IMAGE_BASE}/w92${p.logo_path}` : null });
      }
    }
  };
  push("abonnement", fr.flatrate);
  push("location", fr.rent);
  push("achat", fr.buy);
  return { watchLink: fr.link ?? null, watchOffers: offers.slice(0, 10) };
}

function detailsCommon(d: TmdbMovieDetails | TmdbTvDetails) {
  return {
    ...watchInfo(d),
    tagline: d.tagline,
    genres: d.genres,
    voteCount: d.vote_count,
    cast: (d.credits?.cast ?? []).slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photoUrl: profileUrl(c.profile_path),
    })),
    trailerYoutubeKey: pickTrailer(d.videos?.results ?? []),
  };
}

export function movieToDetails(d: TmdbMovieDetails): TitleDetails {
  return {
    ...movieToTitle(d),
    ...detailsCommon(d),
    runtimeMinutes: d.runtime,
    seasonCount: null,
    episodeCount: null,
    seasons: [],
    similar: (d.similar?.results ?? []).slice(0, 12).map(movieToTitle),
  };
}

export function tvToDetails(d: TmdbTvDetails): TitleDetails {
  return {
    ...tvToTitle(d),
    ...detailsCommon(d),
    runtimeMinutes: null,
    seasonCount: d.number_of_seasons,
    episodeCount: d.number_of_episodes,
    seasons: d.seasons
      .filter((se) => se.season_number > 0)
      .map((se) => ({
        id: se.id,
        number: se.season_number,
        name: se.name,
        episodeCount: se.episode_count,
        year: se.air_date ? Number(se.air_date.slice(0, 4)) || null : null,
        overview: se.overview,
        posterUrl: posterUrl(se.poster_path, "w185"),
      })),
    similar: (d.similar?.results ?? []).slice(0, 12).map(tvToTitle),
  };
}
