import type { MetadataRoute } from "next";
import { FREE_CATALOG, watchHref } from "@/lib/free-catalog";
import { GENRES } from "@/lib/tmdb/models";
import { getPublishedVideos } from "@/lib/videos/published";
import { siteBaseUrl } from "@/lib/site";

/**
 * Sitemap (D1 §6.1, audit C1) — pages stables + catalogue visionnable.
 * Les fiches TMDB (ISR à la demande) entrent par le maillage interne ;
 * un sitemap segmenté par popularité viendra avec le trafic réel.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl();
  const now = new Date();
  const staticPages = [
    "",
    "/films",
    "/series",
    "/decouvrir",
    "/tendances",
    "/nouveautes",
    ...GENRES.map((g) => `/genre/${g.slug}`),
    "/gratuit",
    "/faq",
    "/a-propos",
    "/contact",
    "/cgu",
    "/confidentialite",
    "/cookies",
    "/mentions-legales",
  ];
  const published = await getPublishedVideos(500).catch(() => []);

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: now,
      changeFrequency: (path === "" || path === "/decouvrir" ? "daily" : "weekly") as "daily" | "weekly",
      priority: path === "" ? 1 : 0.7,
    })),
    ...FREE_CATALOG.map((video) => ({
      url: `${base}${watchHref(video)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...published.map((video) => ({
      url: `${base}/regarder/${video.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
