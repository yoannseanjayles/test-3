import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Rail } from "@/components/ui/Rail";
import { TitleCard, type TitleCardData } from "@/components/ui/TitleCard";
import { AdSlot } from "@/components/ads/AdSlot";

/**
 * Accueil — structure D14 (hero → rails → étagère Gratuit → pub → éditorial).
 * Lot 1 (socle) : contenus de démonstration statiques. Le branchement TMDB/BFF
 * (données réelles, rails personnalisés, ISR) est l'objet du Lot 2.
 */

const DEMO_TRENDING: TitleCardData[] = [
  { href: "#", title: "Titre de démonstration", year: 2026, dominantColor: "#2e2837" },
  { href: "#", title: "Exemple de carte", year: 2025, dominantColor: "#3a2d4d", isNew: true },
  { href: "#", title: "Affiche à venir", year: 2024, dominantColor: "#4d3a2d" },
  { href: "#", title: "Donnée TMDB (Lot 2)", year: 2026, dominantColor: "#2d4d3a" },
  { href: "#", title: "Carte de démo", year: 2023, dominantColor: "#2e2837" },
  { href: "#", title: "Placeholder", year: 2022, dominantColor: "#3a2d4d" },
];

const DEMO_FREE: TitleCardData[] = [
  { href: "#", title: "Classique du domaine public", year: 1948, dominantColor: "#241f2b", isFree: true },
  { href: "#", title: "Film noir", year: 1946, dominantColor: "#1c1822", isFree: true },
  { href: "#", title: "Open movie", year: 2019, dominantColor: "#2d4d3a", isFree: true },
  { href: "#", title: "Sérial classique", year: 1941, dominantColor: "#4d3a2d", isFree: true },
  { href: "#", title: "Comédie muette", year: 1927, dominantColor: "#3a2d4d", isFree: true },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — 1 titre unique, double CTA (D14 §2) */}
      <section aria-label="À la une" className="relative">
        <div className="relative aspect-[21/9] min-h-[320px] w-full overflow-hidden md:max-h-[560px]">
          <Image
            src="/media/interface/genre-science-fiction.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--scrim-hero)" }} />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 md:px-6 md:pb-12">
          <p className="text-sm font-medium text-brand">À la une cette semaine</p>
          <h1 className="mt-1 max-w-xl text-3xl font-bold md:text-5xl">
            Découvrez. Choisissez. Regardez.
          </h1>
          <p className="mt-2 max-w-lg text-sm text-secondary md:text-base">
            Le hero éditorial accueillera le titre mis en avant (curation admin, fallback
            tendances) dès le branchement du catalogue au Lot 2.
          </p>
          <div className="mt-5 flex gap-3">
            <Button size="lg">▶ Regarder</Button>
            <Button size="lg" variant="secondary">+ Ma liste</Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Rail title="Tendances cette semaine" seeAllHref="/tendances">
          {DEMO_TRENDING.map((t) => (
            <TitleCard key={t.title} {...t} />
          ))}
        </Rail>

        <Rail title="Gratuit ▶" seeAllHref="/gratuit" explanation="Des classiques à regarder immédiatement, légalement.">
          {DEMO_FREE.map((t) => (
            <TitleCard key={t.title} {...t} />
          ))}
        </Rail>

        {/* Emplacement pub — absent du DOM tant que ADS_ENABLED n'est pas true (D6/D14) */}
        <AdSlot placement="display.home" />

        {/* Bandeau conversion (anonyme) — D14 §11 */}
        <section
          aria-label="Créer un compte"
          className="mt-12 flex flex-col items-start gap-4 rounded-(--radius-l) bg-surface-raised p-6 md:flex-row md:items-center md:justify-between md:p-8"
        >
          <div>
            <h2 className="text-xl font-bold md:text-2xl">Votre cinéma personnel. Gratuit.</h2>
            <p className="mt-1 text-sm text-secondary">
              Reprenez où vous en êtes, sur tous vos écrans — et gardez chaque titre qui vous tente.
            </p>
          </div>
          <Link
            href="/inscription"
            className="inline-flex h-12 shrink-0 items-center rounded-full bg-brand px-6 font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent)"
          >
            Créer un compte
          </Link>
        </section>
      </div>
    </>
  );
}
