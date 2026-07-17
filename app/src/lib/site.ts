/**
 * URL canonique du site — source unique (audit transversal) : sitemap, robots,
 * metadataBase et tous les JSON-LD doivent passer par ici pour rester cohérents.
 */

export function siteBaseUrl(): string {
  return (process.env.APP_BASE_URL ?? "https://cineplus-eight.vercel.app").replace(/\/$/, "");
}

/** Transforme un chemin relatif (`/film/x-1`) en URL absolue pour JSON-LD/OG. */
export function absoluteUrl(path: string): string {
  return `${siteBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
