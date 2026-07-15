import { isAdPlacementEnabled, type AdPlacement } from "@/lib/ads/flags";
import { AdLabel } from "./AdLabel";

/**
 * Emplacement display (Advertising DS — D25 §4).
 * Règles D6/D14 : pub OFF ou non servie → null (absent du DOM, jamais de cadre vide) ;
 * pub ON → conteneur à hauteur RÉSERVÉE (zéro CLS publicitaire).
 * Le module de rendu réel (créa/campagne) arrive en 6.2 — ici : gabarit + réservation.
 */
const RESERVED: Record<AdPlacement, string> = {
  "display.home": "min-h-[90px] md:min-h-[250px]",
  "display.browse": "min-h-[90px] md:min-h-[250px]",
  "display.fiche": "min-h-[90px] md:min-h-[250px]",
  "native.rail": "min-h-[240px]",
  "video.preroll": "", // in-player, géré par le lecteur (D20 §7)
};

export async function AdSlot({ placement }: { placement: AdPlacement }) {
  const enabled = await isAdPlacementEnabled(placement);
  if (!enabled) return null;

  return (
    <div
      className={`relative mx-auto my-10 w-full max-w-4xl rounded-(--radius-m) border border-subtle bg-surface-base ${RESERVED[placement]}`}
      data-ad-placement={placement}
    >
      <AdLabel />
      {/* Créa injectée par le pipeline pub (6.2) — house ads d'abord (3.1/D) */}
    </div>
  );
}
