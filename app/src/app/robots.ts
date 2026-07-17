import type { MetadataRoute } from "next";

/** Robots (audit C1) — espaces privés exclus, sitemap déclaré. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.APP_BASE_URL ?? "https://cineplus-eight.vercel.app").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/ma-liste", "/parametres", "/studio", "/connexion", "/inscription", "/recherche"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
