import type { MetadataRoute } from "next";
import { FREE_CATALOG, watchHref } from "@/lib/free-catalog";
import { getPublishedVideos } from "@/lib/videos/published";

/**
 * Sitemap (D1 §6.1, audit C1) — pages stables + catalogue visionnable.
 * Les fiches TMDB (ISR à la demande) entrent par le maillage interne ;
 * un sitemap segmenté par popularité viendra avec le trafic réel.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_BASE_URL ?? "https://cineplus-eight.vercel.app").replace(/\/$/, "");
  const staticPages = ["", "/films", "/series", "/decouvrir", "/gratuit", "/faq", "/a-propos", "/cgu", "/confidentialite", "/cookies", "/mentions-legales"];
  const published = await getPublishedVideos(500).catch(() => []);

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path || "/"}`,
      changeFrequency: (path === "" || path === "/decouvrir" ? "daily" : "weekly") as "daily" | "weekly",
      priority: path === "" ? 1 : 0.7,
    })),
    ...FREE_CATALOG.map((video) => ({
      url: `${base}${watchHref(video)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...published.map((video) => ({
      url: `${base}/regarder/${video.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
