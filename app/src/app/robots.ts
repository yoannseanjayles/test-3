import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/site";

/** Robots (audit C1) — espaces privés exclus, sitemap déclaré. */
export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/ma-liste", "/parametres", "/studio", "/connexion", "/inscription", "/recherche"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
