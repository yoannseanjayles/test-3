import "server-only";

import { isTmdbConfigured, tmdbFetch } from "./client";
import {
  movieToDetails,
  movieToTitle,
  tvToDetails,
  tvToTitle,
  type Title,
  type TitleDetails,
} from "./models";
import {
  paginatedSchema,
  tmdbMovieDetailsSchema,
  tmdbMovieListItemSchema,
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

/** Tendances mixtes films+séries de la semaine (accueil, Découvrir). */
export async function getTrending(page = 1): Promise<TitlePage> {
  try {
    const data = paginatedSchema(tmdbMovieListItemSchema.or(tmdbTvListItemSchema)).parse(
      await tmdbFetch("/trending/all/week", { page }, 1800),
    );
    return {
      titles: data.results.map((item) => ("title" in item ? movieToTitle(item) : tvToTitle(item))),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      totalResults: data.total_results,
    };
  } catch (error) {
    console.error("[tmdb] /trending/all/week indisponible :", error);
    return EMPTY_PAGE;
  }
}

export const getPopularMovies = (page = 1) => fetchMoviePage("/movie/popular", { page });
export const getTopRatedMovies = (page = 1) => fetchMoviePage("/movie/top_rated", { page });
export const getNowPlayingMovies = (page = 1) => fetchMoviePage("/movie/now_playing", { page, region: "FR" }, 1800);
export const getPopularSeries = (page = 1) => fetchTvPage("/tv/popular", { page });
export const getTopRatedSeries = (page = 1) => fetchTvPage("/tv/top_rated", { page });

export async function getMovieDetails(id: number): Promise<TitleDetails | null> {
  try {
    const data = tmdbMovieDetailsSchema.parse(
      await tmdbFetch(`/movie/${id}`, { append_to_response: "credits,videos,similar" }, 21600),
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
      await tmdbFetch(`/tv/${id}`, { append_to_response: "credits,videos,similar" }, 21600),
    );
    return tvToDetails(data);
  } catch (error) {
    console.error(`[tmdb] /tv/${id} indisponible :`, error);
    return null;
  }
}

/** Recherche multi (films + séries uniquement — les personnes arrivent avec la page Personne). */
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
