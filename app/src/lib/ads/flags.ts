import "server-only";

/**
 * Feature flags publicité & UGC (D6, D8, D11).
 * v1 socle : valeurs par env (défaut OFF — état de lancement, D6).
 * En 6.1/7.1 : lecture depuis la config runtime (base) pilotée par le back-office,
 * avec effet immédiat sans redéploiement.
 */

export type AdPlacement =
  | "display.home"
  | "display.browse"
  | "display.fiche"
  | "native.rail"
  | "video.preroll";

export async function isAdsEnabled(): Promise<boolean> {
  return process.env.ADS_ENABLED === "true";
}

export async function isAdPlacementEnabled(placement: AdPlacement): Promise<boolean> {
  if (!(await isAdsEnabled())) return false;
  const key = `ADS_${placement.toUpperCase().replace(".", "_")}_ENABLED`;
  // Un flag d'emplacement absent = suit l'interrupteur global.
  return process.env[key] !== "false";
}

/** Interrupteur d'upload UGC — ne s'applique qu'aux rôles non-admin (D11/D13). */
export async function isUgcUploadEnabled(): Promise<boolean> {
  return process.env.UGC_UPLOAD_ENABLED === "true";
}
