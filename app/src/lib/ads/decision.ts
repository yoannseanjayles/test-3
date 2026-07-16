import "server-only";

import type { AdPlacement } from "./flags";

/**
 * Décision publicitaire (6.2 §2, palier P-1) — v1 régie directe :
 * house ads (auto-promotion) servies localement, aucune donnée personnelle,
 * aucun script tiers. La table `campaigns` (P-2) et VAST (P-3) remplaceront
 * la sélection sans changer ce contrat.
 */

export interface HouseAd {
  campaignId: string;
  headline: string;
  body: string;
  cta: string;
  href: string;
  /** Illustration locale (B5) — les créas dédiées B7 restent à produire (H100). */
  artwork: string;
}

const HOUSE_ADS: HouseAd[] = [
  {
    campaignId: "house-gratuit",
    headline: "Des classiques à regarder gratuitement",
    body: "Domaine public et open movies, sans compte et sans frais — lancez la lecture en un clic.",
    cta: "Voir le catalogue gratuit",
    href: "/gratuit",
    artwork: "/media/interface/genre-aventure.jpg",
  },
  {
    campaignId: "house-maliste",
    headline: "Votre cinéma personnel, sur tous vos écrans",
    body: "Créez votre liste, reprenez vos lectures où vous les avez laissées.",
    cta: "Découvrir Ma liste",
    href: "/ma-liste",
    artwork: "/media/interface/genre-romance.jpg",
  },
  {
    campaignId: "house-studio",
    headline: "Créateurs, votre écran vous attend",
    body: "Publiez vos films et courts-métrages sur Ciné+ — encodage multi-qualités inclus.",
    cta: "Ouvrir le Studio",
    href: "/studio",
    artwork: "/media/interface/genre-documentaire.jpg",
  },
];

/**
 * Sélection v1 : rotation déterministe par emplacement (stable entre
 * revalidations ISR — la mesure vient du beacon client, pas du rendu).
 */
export function decideAd(placement: AdPlacement): HouseAd {
  const index =
    Math.abs(placement.split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 7)) % HOUSE_ADS.length;
  return HOUSE_ADS[index];
}
