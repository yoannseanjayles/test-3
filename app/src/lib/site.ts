/**
 * URL canonique du site — source unique (audit transversal) : sitemap, robots,
 * metadataBase et tous les JSON-LD doivent passer par ici pour rester cohérents.
 */

/** URL de base : APP_BASE_URL (explicite) > URL de production Vercel (déploiements/previews) > repli codé en dur. */
export function siteBaseUrl(): string {
  const base =
    process.env.APP_BASE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
    "https://cineplus-eight.vercel.app";
  return base.replace(/\/$/, "");
}

/** Transforme un chemin relatif (`/film/x-1`) en URL absolue pour JSON-LD/OG. */
export function absoluteUrl(path: string): string {
  return `${siteBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
