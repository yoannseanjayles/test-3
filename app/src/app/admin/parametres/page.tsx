import type { Metadata } from "next";
import { setSettingAction } from "@/lib/admin/actions";
import { getSetting, SETTINGS_REGISTRY, type NumberSettingSpec, type SettingKey } from "@/lib/settings";
import { db, schema, isDbConfigured } from "@/lib/db";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

/**
 * Paramètres (7.1 Lot 1) — écran généré depuis le registre typé `lib/settings` :
 * aucune clé libre, chaque valeur est bornée par sa spec. Effet ≤ 30 s.
 * Les interrupteurs ON/OFF restent dans « Publicité & flags ».
 * Badge « Modifié » + date + rétablissement du défaut (audit admin-8).
 */
export default async function AdminParametresPage() {
  const keys = Object.keys(SETTINGS_REGISTRY) as SettingKey[];
  const rows = isDbConfigured() ? await db().select().from(schema.appSettings) : [];
  const rowByKey = new Map(rows.map((r) => [r.key, r]));

  const entries = await Promise.all(
    keys.map(async (key) => ({
      key,
      spec: SETTINGS_REGISTRY[key] as NumberSettingSpec,
      value: await getSetting(key),
      updatedAt: rowByKey.get(key)?.updatedAt ?? null,
    })),
  );

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Paramètres</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        Valeurs numériques du service — effet en moins de 30 secondes, sans redéploiement.
        Chaque paramètre est borné ; les interrupteurs ON/OFF vivent dans « Publicité &amp; flags ».
      </p>

      <ul className="mt-6 space-y-3">
        {entries.map(({ key, spec, value, updatedAt }) => {
          const modified = value !== spec.default;
          return (
            <li key={key} className="rounded-(--radius-l) bg-surface-raised p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0 max-w-lg">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {spec.label}
                    <code className="rounded bg-surface-overlay px-1.5 py-0.5 text-xs text-secondary">{key}</code>
                    {modified && (
                      <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs font-medium text-brand">Modifié</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-secondary">{spec.description}</p>
                  {modified && updatedAt && (
                    <p className="mt-1 text-xs text-secondary">
                      Dernière modification le {updatedAt.toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <form action={setSettingAction} className="flex items-end gap-2">
                    <input type="hidden" name="key" value={key} />
                    <div>
                      <label htmlFor={`setting-${key}`} className="mb-1 block text-xs text-secondary">
                        {spec.min}–{spec.max}
                        {spec.unit ? ` ${spec.unit}` : ""} · défaut {spec.default}
                      </label>
                      <input
                        id={`setting-${key}`}
                        name="value"
                        type="number"
                        defaultValue={value}
                        min={spec.min}
                        max={spec.max}
                        required
                        className="h-10 w-32 rounded-(--radius-m) border border-white/10 bg-surface-overlay px-3 text-sm text-primary focus:border-brand focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover"
                    >
                      Enregistrer
                    </button>
                  </form>
                  {modified && (
                    <form action={setSettingAction}>
                      <input type="hidden" name="key" value={key} />
                      <input type="hidden" name="value" value={spec.default} />
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center rounded-full bg-surface-overlay px-4 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                      >
                        Rétablir le défaut
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
