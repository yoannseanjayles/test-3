import "server-only";

import { isTmdbConfigured, tmdbFetch } from "./client";
import {
  movieToDetails,
  movieToTitle,
  personToDetails,
  seasonToEpisodes,
  tvToDetails,
  tvToTitle,
  type EpisodeInfo,
  type PersonDetails,
  type Title,
  type TitleDetails,
} from "./models";
import {
  paginatedSchema,
  tmdbMovieDetailsSchema,
  tmdbMovieListItemSchema,
  tmdbPersonSchema,
  tmdbSeasonEpisodesSchema,
  tmdbTvDetailsSchema,
  tmdbTvListItemSchema,
} from "./schemas";

/**
 * Requêtes catalogue (D5) — chaque fonction renvoie des modèles canoniques et
 * échoue en « données vides » (log serveur) plutôt qu'en erreur de rendu :
 * la page affiche alors son état de repli (D14 §états).
 */

export interface TitlePage {
  titles: Title[];
  page: number;
  totalPages: number;
  totalResults: number;
}

const EMPTY_PAGE: TitlePage = { titles: [], page: 1, totalPages: 1, totalResults: 0 };

export { isTmdbConfigured };

const moviePage = paginatedSchema(tmdbMovieListItemSchema);
const tvPage = paginatedSchema(tmdbTvListItemSchema);

async function fetchMoviePage(path: string, params: Record<string, string | number | undefined> = {}, revalidate?: number): Promise<TitlePage> {
  try {
    const data = moviePage.parse(await tmdbFetch(path, params, revalidate));
    return {
      titles: data.results.map(movieToTitle),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error(`[tmdb] ${path} indisponible :`, error);
    return EMPTY_PAGE;
  }
}

async function fetchTvPage(path: string, params: Record<string, string | number | undefined> = {}, revalidate?: number): Promise<TitlePage> {
  try {
    const data = tvPage.parse(await tmdbFetch(path, params, revalidate));
    return {
      titles: data.results.map(tvToTitle),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error(`[tmdb] ${path} indisponible :`, error);
    return EMPTY_PAGE;
  }
}

/** Tendances films/séries — fenêtre jour ou semaine, tout ou par type (page /tendances D19 §2). */
export async function getTrending(
  page = 1,
  window: "day" | "week" = "week",
  media: "all" | "movie" | "tv" = "all",
): Promise<TitlePage> {
  const path = `/trending/${media}/${window}`;
  try {
    const data = paginatedSchema(tmdbMovieListItemSchema.or(tmdbTvListItemSchema)).parse(
      await tmdbFetch(path, { page }, window === "day" ? 3600 : 1800),
    );
    return {
      titles: data.results.map((item) => ("title" in item ? movieToTitle(item) : tvToTitle(item))),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error(`[tmdb] ${path} indisponible :`, error);
    return EMPTY_PAGE;
  }
}

export const getPopularMovies = (page = 1) => fetchMoviePage("/movie/popular", { page });
export const getTopRatedMovies = (page = 1) => fetchMoviePage("/movie/top_rated", { page });
export const getNowPlayingMovies = (page = 1) => fetchMoviePage("/movie/now_playing", { page, region: "FR" }, 1800);
/** Sorties à venir en France (page /nouveautes, onglet Prochainement). */
export const getUpcomingMovies = (page = 1) => fetchMoviePage("/movie/upcoming", { page, region: "FR" }, 21600);
export const getPopularSeries = (page = 1) => fetchTvPage("/tv/popular", { page });
export const getTopRatedSeries = (page = 1) => fetchTvPage("/tv/top_rated", { page });

export async function getMovieDetails(id: number): Promise<TitleDetails | null> {
  try {
    const data = tmdbMovieDetailsSchema.parse(
      await tmdbFetch(
        `/movie/${id}`,
        { append_to_response: "credits,videos,similar,recommendations,watch/providers,release_dates" },
        21600,
      ),
    );
    return movieToDetails(data);
  } catch (error) {
    console.error(`[tmdb] /movie/${id} indisponible :`, error);
    return null;
  }
}

export async function getSeriesDetails(id: number): Promise<TitleDetails | null> {
  try {
    const data = tmdbTvDetailsSchema.parse(
      await tmdbFetch(
        `/tv/${id}`,
        { append_to_response: "credits,videos,similar,recommendations,watch/providers,content_ratings" },
        21600,
      ),
    );
    return tvToDetails(data);
  } catch (error) {
    console.error(`[tmdb] /tv/${id} indisponible :`, error);
    return null;
  }
}

/** Épisodes d'une saison, spoiler-safe (D16) — liste vide en cas d'indisponibilité. */
export async function getSeasonEpisodes(seriesId: number, seasonNumber: number): Promise<EpisodeInfo[]> {
  try {
    const data = tmdbSeasonEpisodesSchema.parse(
      await tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`, {}, 21600),
    );
    return seasonToEpisodes(data);
  } catch (error) {
    console.error(`[tmdb] /tv/${seriesId}/season/${seasonNumber} indisponible :`, error);
    return [];
  }
}

/** Fiche Personne + filmographie combinée (page /personne, audit A5). */
export async function getPersonDetails(id: number): Promise<PersonDetails | null> {
  try {
    const data = tmdbPersonSchema.parse(
      await tmdbFetch(`/person/${id}`, { append_to_response: "combined_credits" }, 21600),
    );
    return personToDetails(data);
  } catch (error) {
    console.error(`[tmdb] /person/${id} indisponible :`, error);
    return null;
  }
}

/** Tri des grilles catalogue (D19 facettes) — libellés stables utilisés dans les URLs `?tri=`. */
export type CatalogSort = "popularite" | "note" | "recent";

export interface DiscoverOptions {
  genreId?: number;
  /** Décennie de sortie (ex. 1990 → 1990-1999). */
  decade?: number;
  /** Note moyenne minimale (0-10). */
  minRating?: number;
  sort?: CatalogSort;
  page?: number;
}

function discoverParams(
  { genreId, decade, minRating, sort = "popularite", page = 1 }: DiscoverOptions,
  dateField: "primary_release_date" | "first_air_date",
): Record<string, string | number | undefined> {
  const sortBy = { popularite: "popularity.desc", note: "vote_average.desc", recent: `${dateField}.desc` }[sort];
  // Garde-fous qualité : une note moyenne n'a de sens qu'avec assez de votes,
  // et « récent » sans borne haute remonterait des sorties non advenues.
  const today = new Date().toISOString().slice(0, 10);
  return {
    page,
    sort_by: sortBy,
    with_genres: genreId,
    "vote_count.gte": sort === "note" ? 300 : sort === "recent" ? 50 : undefined,
    "vote_average.gte": minRating,
    [`${dateField}.gte`]: decade ? `${decade}-01-01` : undefined,
    [`${dateField}.lte`]: decade ? `${decade + 9}-12-31` : sort === "recent" ? today : undefined,
  };
}

/** Grille films paramétrable (genre, décennie, note min, tri) — D19 facettes. */
export const discoverMovies = (options: DiscoverOptions = {}) =>
  fetchMoviePage("/discover/movie", discoverParams(options, "primary_release_date"));

/** Grille séries paramétrable — mêmes facettes que les films. */
export const discoverSeries = (options: DiscoverOptions = {}) =>
  fetchTvPage("/discover/tv", discoverParams(options, "first_air_date"));

/** Grille par genre (D19 facettes) — discover trié par popularité. */
export const getMoviesByGenre = (genreId: number, page = 1) => discoverMovies({ genreId, page });
export const getSeriesByGenre = (genreId: number, page = 1) => discoverSeries({ genreId, page });

/** Recherche multi (films + séries uniquement — les personnes ont leur propre page). */

export async function searchTitles(query: string, page = 1): Promise<TitlePage> {
  const q = query.trim();
  if (!q) return EMPTY_PAGE;
  try {
    const raw = (await tmdbFetch("/search/multi", { query: q, page, include_adult: "false" }, 300)) as {
      page: number;
      total_pages: number;
      total_results: number;
      results?: unknown[];
    };
    const titles = (raw.results ?? []).flatMap((item) => {
      const media = (item as { media_type?: string }).media_type;
      if (media === "movie") {
        const parsed = tmdbMovieListItemSchema.safeParse(item);
        return parsed.success ? [movieToTitle(parsed.data)] : [];
      }
      if (media === "tv") {
        const parsed = tmdbTvListItemSchema.safeParse(item);
        return parsed.success ? [tvToTitle(parsed.data)] : [];
      }
      return [];
    });
    return {
      titles,
      page: raw.page,
      totalPages: Math.min(raw.total_pages, 500),
      totalResults: raw.total_results,
    };
  } catch (error) {
    console.error("[tmdb] /search/multi indisponible :", error);
    return EMPTY_PAGE;
  }
}
