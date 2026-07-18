import type { NextConfig } from "next";

// CSP (6.0 §6, audit D1) : scripts propres uniquement ; images TMDB/R2 ;
// vidéos MP4/HLS servies par des hôtes tiers (catalogue gratuit) et R2 → https:.
// 'unsafe-inline' requis par les scripts d'hydratation Next et Tailwind inline.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https:",
  "font-src 'self'",
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    // Affiches/backdrops/portraits TMDB (D5) — seul hôte d'images distant autorisé.
    remotePatterns: [{ protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
