import { z } from "zod";

/**
 * Schémas Zod des réponses TMDB (D5, D26 « modèles canoniques ») :
 * on ne valide que les champs consommés — tout le reste est ignoré,
 * et une réponse inattendue est rejetée à la frontière plutôt qu'en plein rendu.
 */

export const tmdbMovieListItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional().default(""),
  poster_path: z.string().nullable().optional().default(null),
  backdrop_path: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  vote_average: z.number().optional().default(0),
});

export const tmdbTvListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  first_air_date: z.string().optional().default(""),
  poster_path: z.string().nullable().optional().default(null),
  backdrop_path: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  vote_average: z.number().optional().default(0),
});

/** Liste paginée dont on écarte silencieusement les éléments malformés. */
export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
    results: z.array(z.unknown()).transform((items) =>
      items.flatMap((raw) => {
        const parsed = item.safeParse(raw);
        return parsed.success ? [parsed.data as z.infer<T>] : [];
      }),
    ),
  });
}

const genreSchema = z.object({ id: z.number(), name: z.string() });

const castMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string().optional().default(""),
  profile_path: z.string().nullable().optional().default(null),
});

const videoSchema = z.object({
  key: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().optional().default(false),
});

const detailsCommon = {
  backdrop_path: z.string().nullable().optional().default(null),
  poster_path: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  vote_average: z.number().optional().default(0),
  vote_count: z.number().optional().default(0),
  genres: z.array(genreSchema).optional().default([]),
  tagline: z.string().optional().default(""),
  credits: z
    .object({ cast: z.array(castMemberSchema).optional().default([]) })
    .optional(),
  videos: z
    .object({ results: z.array(videoSchema).optional().default([]) })
    .optional(),
};

export const tmdbMovieDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional().default(""),
  runtime: z.number().nullable().optional().default(null),
  ...detailsCommon,
  similar: paginatedSchema(tmdbMovieListItemSchema).optional(),
});

export const tmdbTvDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  first_air_date: z.string().optional().default(""),
  number_of_seasons: z.number().optional().default(0),
  number_of_episodes: z.number().optional().default(0),
  ...detailsCommon,
  similar: paginatedSchema(tmdbTvListItemSchema).optional(),
});

export type TmdbMovieListItem = z.infer<typeof tmdbMovieListItemSchema>;
export type TmdbTvListItem = z.infer<typeof tmdbTvListItemSchema>;
export type TmdbMovieDetails = z.infer<typeof tmdbMovieDetailsSchema>;
export type TmdbTvDetails = z.infer<typeof tmdbTvDetailsSchema>;
