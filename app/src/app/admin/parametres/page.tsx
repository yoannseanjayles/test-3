import type { Metadata } from "next";
import { setSettingAction } from "@/lib/admin/actions";
import { getSetting, SETTINGS_REGISTRY, type NumberSettingSpec, type SettingKey } from "@/lib/settings";

export const metadata: Metadata = { title: "Paramètres" };
export const dynamic = "force-dynamic";

/**
 * Paramètres (7.1 Lot 1) — écran généré depuis le registre typé `lib/settings` :
 * aucune clé libre, chaque valeur est bornée par sa spec. Effet ≤ 30 s.
 * Les interrupteurs ON/OFF restent dans « Publicité & flags ».
 */
export default async function AdminParametresPage() {
  const keys = Object.keys(SETTINGS_REGISTRY) as SettingKey[];
  const entries = await Promise.all(
    keys.map(async (key) => ({
      key,
      spec: SETTINGS_REGISTRY[key] as NumberSettingSpec,
      value: await getSetting(key),
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
        {entries.map(({ key, spec, value }) => (
          <li key={key} className="rounded-(--radius-l) bg-surface-raised p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 max-w-lg">
                <p className="font-medium">
                  {spec.label}{" "}
                  <code className="ml-1 rounded bg-surface-overlay px-1.5 py-0.5 text-xs text-secondary">{key}</code>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-secondary">{spec.description}</p>
              </div>
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
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
