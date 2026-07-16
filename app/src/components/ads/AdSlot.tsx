import { isAdPlacementEnabled, type AdPlacement } from "@/lib/ads/flags";
import { decideAd } from "@/lib/ads/decision";
import { AdLabel } from "./AdLabel";
import { AdCreative } from "./AdCreative";

/**
 * Emplacement display (Advertising DS — D25 §4).
 * Règles D6/D14 : pub OFF ou non servie → null (absent du DOM, jamais de cadre vide) ;
 * pub ON → conteneur à hauteur RÉSERVÉE (zéro CLS publicitaire).
 * Créa décidée côté serveur (house ads v1, 6.2 P-1), mesurée côté client
 * (impression MRC ≥ 50 % / 1 s + clic — beacons anonymes H101).
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

  const ad = decideAd(placement);

  return (
    <div
      className={`relative mx-auto my-10 w-full max-w-4xl overflow-hidden rounded-(--radius-m) border border-subtle bg-surface-raised ${RESERVED[placement]}`}
      data-ad-placement={placement}
    >
      <AdLabel />
      <AdCreative ad={ad} placement={placement} />
    </div>
  );
}
