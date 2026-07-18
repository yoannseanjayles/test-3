import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { setFlagAction } from "@/lib/admin/actions";
import { isAdsEnabled, isAdPlacementEnabled, isUgcUploadEnabled, type AdPlacement } from "@/lib/ads/flags";

export const metadata: Metadata = { title: "Publicité & flags" };
export const dynamic = "force-dynamic";

/**
 * Pilotage des interrupteurs (D6/D11, D36) — effet immédiat (≤ 30 s de cache),
 * sans redéploiement. L'env `*_ENABLED=false` reste le kill switch d'urgence
 * prioritaire sur tout ce qui est réglé ici (audit admin-4 : affiché explicitement).
 */

interface FlagRow {
  key: string;
  label: string;
  description: string;
  envKey: string;
  effective: boolean;
}

export default async function AdminPublicitePage() {
  const rows = await db().select().from(schema.appConfig);
  const dbValues = new Map(rows.map((r) => [r.key, r.value]));

  const placements: { placement: AdPlacement; label: string; description: string }[] = [
    { placement: "display.home", label: "Display — Accueil", description: "Bannière de l'accueil (suit le global si non défini)." },
    { placement: "display.browse", label: "Display — Grilles", description: "Bannière des pages catalogue." },
    { placement: "display.fiche", label: "Display — Fiches", description: "Bannière des fiches film/série." },
    {
      placement: "native.rail",
      label: "Natif — Rails",
      description: "Cartes sponsorisées dans les rails — emplacement préparatoire, aucun rendu actif aujourd'hui (palier P-2 du 6.2).",
    },
    {
      placement: "video.preroll",
      label: "Pré-roll vidéo",
      description: "Publicité avant lecture (exigence D6) : 15 s, passable après 5 s, 1/titre/session, jamais à la reprise.",
    },
  ];

  const [adsEnabled, ugcEnabled, placementStates] = await Promise.all([
    isAdsEnabled(),
    isUgcUploadEnabled(),
    Promise.all(placements.map((p) => isAdPlacementEnabled(p.placement))),
  ]);

  const rowsToRender: FlagRow[] = [
    { key: "ads.enabled", label: "Publicité (interrupteur global)", description: "Kill switch D6 — OFF : aucune pub nulle part, quels que soient les emplacements.", envKey: "ADS_ENABLED", effective: adsEnabled },
    ...placements.map((p, i) => ({
      key: `ads.${p.placement}`,
      label: p.label,
      description: p.description,
      envKey: `ADS_${p.placement.toUpperCase().replace(".", "_")}_ENABLED`,
      effective: placementStates[i],
    })),
    { key: "ugc.upload.enabled", label: "Dépôt de vidéos (communauté)", description: "Interrupteur D11 — ne concerne pas les admins, qui peuvent toujours déposer.", envKey: "UGC_UPLOAD_ENABLED", effective: ugcEnabled },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Publicité & flags</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        Effet immédiat (≤ 30 s), sans redéploiement (D6). Une variable d&apos;environnement
        <code className="mx-1 rounded bg-surface-raised px-1.5 py-0.5 text-xs">*_ENABLED=false</code>
        reste prioritaire (kill switch d&apos;urgence) — la valeur ci-dessous est toujours l&apos;état
        <strong className="text-primary"> effectif</strong>, celui qui s&apos;applique réellement.
      </p>

      <ul className="mt-6 space-y-3">
        {rowsToRender.map((flag) => {
          // process.env n'est lisible que côté serveur — cette page est déjà force-dynamic.
          const envOverride = process.env[flag.envKey] === "false";
          const dbValue = dbValues.get(flag.key);

          return (
            <li key={flag.key} className="flex flex-wrap items-center gap-4 rounded-(--radius-l) bg-surface-raised p-5">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {flag.label}{" "}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${flag.effective ? "bg-brand text-on-brand" : "bg-surface-overlay text-secondary"}`}>
                    {flag.effective ? "ON" : "OFF"}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">{flag.description}</p>
                {envOverride && (
                  <p className="mt-1.5 text-xs font-medium text-brand">
                    Désactivé par la variable d&apos;environnement {flag.envKey}=false (prioritaire — les boutons ci-dessous n&apos;ont aucun effet tant qu&apos;elle est active).
                  </p>
                )}
                {!envOverride && dbValue === undefined && (
                  <p className="mt-1.5 text-xs text-secondary">Aucune valeur en base — hérite du défaut / de l&apos;interrupteur global.</p>
                )}
              </div>
              <div className="flex gap-2">
                <form action={setFlagAction}>
                  <input type="hidden" name="key" value={flag.key} />
                  <input type="hidden" name="value" value="true" />
                  <button
                    type="submit"
                    disabled={envOverride}
                    className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover disabled:opacity-40"
                  >
                    Activer
                  </button>
                </form>
                <form action={setFlagAction}>
                  <input type="hidden" name="key" value={flag.key} />
                  <input type="hidden" name="value" value="false" />
                  <button
                    type="submit"
                    disabled={envOverride}
                    className="inline-flex h-10 items-center rounded-full bg-surface-overlay px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive disabled:opacity-40"
                  >
                    Désactiver
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
