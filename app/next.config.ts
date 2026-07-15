import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Affiches/backdrops/portraits TMDB (D5) — seul hôte d'images distant autorisé.
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }],
  },
};

export default nextConfig;
