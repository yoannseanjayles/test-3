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
  vote_count: z.number().optional().default(0),
});

export const tmdbTvListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  first_air_date: z.string().optional().default(""),
  poster_path: z.string().nullable().optional().default(null),
  backdrop_path: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  vote_average: z.number().optional().default(0),
  vote_count: z.number().optional().default(0),
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

const crewMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  job: z.string().optional().default(""),
});

const videoSchema = z.object({
  key: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().optional().default(false),
});

const providerSchema = z.object({
  provider_name: z.string(),
  logo_path: z.string().nullable().optional().default(null),
});

const watchProvidersSchema = z.object({
  results: z
    .record(z.string(), z.object({
      link: z.string().optional(),
      flatrate: z.array(providerSchema).optional(),
      rent: z.array(providerSchema).optional(),
      buy: z.array(providerSchema).optional(),
    }))
    .optional()
    .default({}),
});

const seasonSchema = z.object({
  id: z.number(),
  season_number: z.number(),
  name: z.string(),
  episode_count: z.number().optional().default(0),
  air_date: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  poster_path: z.string().nullable().optional().default(null),
});

const detailsCommon = {
  backdrop_path: z.string().nullable().optional().default(null),
  poster_path: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  vote_average: z.number().optional().default(0),
  vote_count: z.number().optional().default(0),
  genres: z.array(genreSchema).optional().default([]),
  tagline: z.string().optional().default(""),
  status: z.string().optional().default(""),
  production_countries: z
    .array(z.object({ iso_3166_1: z.string(), name: z.string() }))
    .optional()
    .default([]),
  credits: z
    .object({
      cast: z.array(castMemberSchema).optional().default([]),
      crew: z.array(crewMemberSchema).optional().default([]),
    })
    .optional(),
  videos: z
    .object({ results: z.array(videoSchema).optional().default([]) })
    .optional(),
  "watch/providers": watchProvidersSchema.optional(),
};

export const tmdbMovieDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().optional().default(""),
  release_date: z.string().optional().default(""),
  runtime: z.number().nullable().optional().default(null),
  budget: z.number().optional().default(0),
  revenue: z.number().optional().default(0),
  ...detailsCommon,
  // Certification + date de sortie France (release_dates FR, type 3 = salles).
  release_dates: z
    .object({
      results: z
        .array(
          z.object({
            iso_3166_1: z.string(),
            release_dates: z
              .array(
                z.object({
                  certification: z.string().optional().default(""),
                  release_date: z.string().optional().default(""),
                  type: z.number().optional().default(0),
                }),
              )
              .optional()
              .default([]),
          }),
        )
        .optional()
        .default([]),
    })
    .optional(),
  similar: paginatedSchema(tmdbMovieListItemSchema).optional(),
  recommendations: paginatedSchema(tmdbMovieListItemSchema).optional(),
});

export const tmdbTvDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  original_name: z.string().optional().default(""),
  first_air_date: z.string().optional().default(""),
  last_air_date: z.string().nullable().optional().default(null),
  next_episode_to_air: z
    .object({ air_date: z.string().nullable().optional().default(null) })
    .nullable()
    .optional()
    .default(null),
  created_by: z.array(z.object({ id: z.number(), name: z.string() })).optional().default([]),
  number_of_seasons: z.number().optional().default(0),
  number_of_episodes: z.number().optional().default(0),
  seasons: z.array(seasonSchema).optional().default([]),
  ...detailsCommon,
  content_ratings: z
    .object({
      results: z.array(z.object({ iso_3166_1: z.string(), rating: z.string() })).optional().default([]),
    })
    .optional(),
  similar: paginatedSchema(tmdbTvListItemSchema).optional(),
  recommendations: paginatedSchema(tmdbTvListItemSchema).optional(),
});

/** Saison détaillée — épisodes spoiler-safe (D16) : on ne parse volontairement NI résumé NI image d'épisode. */
export const tmdbSeasonEpisodesSchema = z.object({
  episodes: z
    .array(
      z.object({
        id: z.number(),
        episode_number: z.number(),
        name: z.string().optional().default(""),
        air_date: z.string().nullable().optional().default(null),
        runtime: z.number().nullable().optional().default(null),
      }),
    )
    .optional()
    .default([]),
});

const personCreditSchema = z.object({
  id: z.number(),
  media_type: z.string(),
  title: z.string().optional(),
  name: z.string().optional(),
  release_date: z.string().optional().default(""),
  first_air_date: z.string().optional().default(""),
  poster_path: z.string().nullable().optional().default(null),
  overview: z.string().optional().default(""),
  vote_average: z.number().optional().default(0),
  vote_count: z.number().optional().default(0),
  popularity: z.number().optional().default(0),
  character: z.string().optional().default(""),
  job: z.string().optional().default(""),
});

/** Crédits filmographie dont on écarte silencieusement les éléments malformés. */
const lenientPersonCredits = z
  .array(z.unknown())
  .optional()
  .default([])
  .transform((items) =>
    items.flatMap((raw) => {
      const parsed = personCreditSchema.safeParse(raw);
      return parsed.success ? [parsed.data] : [];
    }),
  );

export const tmdbPersonSchema = z.object({
  id: z.number(),
  name: z.string(),
  biography: z.string().optional().default(""),
  birthday: z.string().nullable().optional().default(null),
  deathday: z.string().nullable().optional().default(null),
  place_of_birth: z.string().nullable().optional().default(null),
  profile_path: z.string().nullable().optional().default(null),
  known_for_department: z.string().optional().default(""),
  combined_credits: z
    .object({ cast: lenientPersonCredits, crew: lenientPersonCredits })
    .optional(),
});

export type TmdbMovieListItem = z.infer<typeof tmdbMovieListItemSchema>;
export type TmdbTvListItem = z.infer<typeof tmdbTvListItemSchema>;
export type TmdbMovieDetails = z.infer<typeof tmdbMovieDetailsSchema>;
export type TmdbTvDetails = z.infer<typeof tmdbTvDetailsSchema>;
export type TmdbSeasonEpisodes = z.infer<typeof tmdbSeasonEpisodesSchema>;
export type TmdbPerson = z.infer<typeof tmdbPersonSchema>;
export type TmdbPersonCredit = z.infer<typeof personCreditSchema>;
