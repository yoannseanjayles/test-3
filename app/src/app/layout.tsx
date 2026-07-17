import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { LibrarySync } from "@/components/library/LibrarySync";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { isAuthConfigured } from "@/lib/auth/config";
import { siteBaseUrl } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl()),
  title: {
    default: "Ciné+ — Films et séries : découvrez, choisissez, regardez",
    template: "%s | Ciné+",
  },
  description:
    "Trouvez le bon film ou la bonne série en moins de deux minutes : catalogue complet, où regarder, bandes-annonces — et des classiques à regarder gratuitement.",
};

/** JSON-LD WebSite + Organization (audit transversal) — SearchAction vers /recherche. */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Ciné+",
      url: siteBaseUrl(),
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteBaseUrl()}/recherche?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "Ciné+",
      url: siteBaseUrl(),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lecture d'env uniquement (pas de cookies) : le layout reste statique.
  const authEnabled = isAuthConfigured();
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
        >
          Aller au contenu
        </a>
        <Header authEnabled={authEnabled} />
        <main id="contenu" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <BottomNav />
        {/* Synchro Ma liste locale ↔ serveur dès qu'une session existe (H70/H87) */}
        <LibrarySync enabled={authEnabled} />
        {/* CMP dormante : ne s'affiche que si la pub est activée et sans choix stocké (6.2 §4) */}
        <ConsentBanner />
      </body>
    </html>
  );
}
