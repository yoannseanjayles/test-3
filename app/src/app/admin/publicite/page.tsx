import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { setFlagAction } from "@/lib/admin/actions";

export const metadata: Metadata = { title: "Publicité & flags" };
export const dynamic = "force-dynamic";

/**
 * Pilotage des interrupteurs (D6/D11, D36) — effet immédiat (≤ 30 s de cache),
 * sans redéploiement. L'env `*_ENABLED=false` reste le kill switch d'urgence
 * prioritaire sur tout ce qui est réglé ici.
 */

const FLAGS: { key: string; label: string; description: string; envDefault: boolean }[] = [
  { key: "ads.enabled", label: "Publicité (interrupteur global)", description: "Kill switch D6 — OFF : aucune pub nulle part, quels que soient les emplacements.", envDefault: false },
  { key: "ads.display.home", label: "Display — Accueil", description: "Bannière de l'accueil (suit le global si non défini).", envDefault: true },
  { key: "ads.display.browse", label: "Display — Grilles", description: "Bannière des pages catalogue.", envDefault: true },
  { key: "ads.display.fiche", label: "Display — Fiches", description: "Bannière des fiches film/série.", envDefault: true },
  { key: "ads.native.rail", label: "Natif — Rails", description: "Cartes sponsorisées dans les rails.", envDefault: true },
  { key: "ads.video.preroll", label: "Pré-roll vidéo", description: "Publicité avant lecture (exigence D6) : 15 s, passable après 5 s, 1/titre/session, jamais à la reprise.", envDefault: true },
  { key: "ugc.upload.enabled", label: "Dépôt de vidéos (communauté)", description: "Interrupteur D11 — ne concerne pas les admins, qui peuvent toujours déposer.", envDefault: false },
];

export default async function AdminPublicitePage() {
  const rows = await db().select().from(schema.appConfig);
  const values = new Map(rows.map((r) => [r.key, r.value]));

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Publicité & flags</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        Effet immédiat (≤ 30 s), sans redéploiement (D6). Une variable d&apos;environnement
        <code className="mx-1 rounded bg-surface-raised px-1.5 py-0.5 text-xs">*_ENABLED=false</code>
        reste prioritaire (kill switch d&apos;urgence).
      </p>

      <ul className="mt-6 space-y-3">
        {FLAGS.map((flag) => {
          const active = values.get(flag.key) ?? (flag.key === "ads.enabled" || flag.key === "ugc.upload.enabled" ? false : null);
          const state = active === null ? "hérite du global" : active ? "ON" : "OFF";
          return (
            <li key={flag.key} className="flex flex-wrap items-center gap-4 rounded-(--radius-l) bg-surface-raised p-5">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {flag.label}{" "}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-brand text-on-brand" : "bg-surface-overlay text-secondary"}`}>
                    {state}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">{flag.description}</p>
              </div>
              <div className="flex gap-2">
                <form action={setFlagAction}>
                  <input type="hidden" name="key" value={flag.key} />
                  <input type="hidden" name="value" value="true" />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover"
                  >
                    Activer
                  </button>
                </form>
                <form action={setFlagAction}>
                  <input type="hidden" name="key" value={flag.key} />
                  <input type="hidden" name="value" value="false" />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-full bg-surface-overlay px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
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
