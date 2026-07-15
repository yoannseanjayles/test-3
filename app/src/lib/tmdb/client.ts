import "server-only";

/**
 * Client TMDB bas niveau (D5) — server-only : la clé ne transite jamais côté client.
 * Auth : jeton v4 (TMDB_ACCESS_TOKEN, Bearer) prioritaire, sinon clé v3 (TMDB_API_KEY).
 * Sans identifiant configuré, les requêtes échouent proprement (le front bascule
 * sur ses états de repli — jamais d'erreur 500 visible).
 */

const BASE_URL = "https://api.themoviedb.org/3";
const LANGUAGE = "fr-FR";

export function isTmdbConfigured(): boolean {
  return Boolean(process.env.TMDB_ACCESS_TOKEN || process.env.TMDB_API_KEY);
}

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export async function tmdbFetch(
  path: string,
  params: Record<string, string | number | undefined> = {},
  /** Durée de fraîcheur du cache Next (s). Défaut 1 h — équivalent ISR (H67). */
  revalidate = 3600,
): Promise<unknown> {
  if (!isTmdbConfigured()) {
    throw new TmdbError("TMDB non configuré (TMDB_ACCESS_TOKEN ou TMDB_API_KEY manquant)");
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("language", LANGUAGE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const token = process.env.TMDB_ACCESS_TOKEN;
  const headers: HeadersInit = { accept: "application/json" };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  } else {
    url.searchParams.set("api_key", process.env.TMDB_API_KEY as string);
  }

  const response = await fetch(url, { headers, next: { revalidate } });
  if (!response.ok) {
    throw new TmdbError(`TMDB ${path} → HTTP ${response.status}`, response.status);
  }
  return response.json();
}
