import type { Metadata } from "next";
import Link from "next/link";
import { count, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isAdsEnabled } from "@/lib/ads/flags";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = { title: "Revenus" };
export const dynamic = "force-dynamic";

/**
 * Revenus (7.1 Lot 2, palier P-1 du 6.2 — lève H95) : agrégats des événements
 * `ad.*` sur 30 jours + estimation eCPM (paramètre `ads.ecpm_cents`).
 * État vide honnête tant que la publicité est OFF. Agrégats calculés à la
 * lecture (H102 — matérialisation quand le volume l'exigera).
 */
export default async function AdminRevenusPage() {
  const adsOn = await isAdsEnabled();
  const ecpmCents = await getSetting("ads.ecpm_cents");
  const since = sql`now() - interval '30 days'`;

  const client = db();
  const countEvent = async (name: string) => {
    const [r] = await client
      .select({ n: count() })
      .from(schema.events)
      .where(sql`${schema.events.name} = ${name} and ${schema.events.createdAt} >= ${since}`);
    return r?.n ?? 0;
  };
  const [impressions, clicks, videoViews] = await Promise.all([
    countEvent("ad.impression"),
    countEvent("ad.click"),
    countEvent("video.view"),
  ]);

  const byPlacement = await client
    .select({
      placement: sql<string>`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`,
      impressions: count(),
    })
    .from(schema.events)
    .where(sql`${schema.events.name} = 'ad.impression' and ${schema.events.createdAt} >= ${since}`)
    .groupBy(sql`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`);

  const clicksByPlacement = await client
    .select({
      placement: sql<string>`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`,
      clicks: count(),
    })
    .from(schema.events)
    .where(sql`${schema.events.name} = 'ad.click' and ${schema.events.createdAt} >= ${since}`)
    .groupBy(sql`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`);
  const clicksMap = new Map(clicksByPlacement.map((r) => [r.placement, r.clicks]));

  // Ventilation quotidienne (audit admin-6) — impressions/clics par jour sur 30 jours.
  const byDay = await client
    .select({
      day: sql<string>`to_char(${schema.events.createdAt}, 'YYYY-MM-DD')`,
      impressions: sql<number>`count(*) filter (where ${schema.events.name} = 'ad.impression')::int`,
      clicks: sql<number>`count(*) filter (where ${schema.events.name} = 'ad.click')::int`,
    })
    .from(schema.events)
    .where(sql`${schema.events.name} in ('ad.impression', 'ad.click') and ${schema.events.createdAt} >= ${since}`)
    .groupBy(sql`to_char(${schema.events.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${schema.events.createdAt}, 'YYYY-MM-DD') desc`);

  const estimatedRevenue = ((impressions / 1000) * ecpmCents) / 100;

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Revenus</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        30 derniers jours — régie directe v1 (house ads). eCPM estimé réglable dans{" "}
        <Link href="/admin/parametres" className="underline hover:text-brand">Paramètres</Link>.
      </p>
      {(impressions > 0 || clicks > 0) && (
        <a
          href="/admin/revenus/export"
          className="mt-3 inline-flex h-9 items-center rounded-full bg-surface-raised px-4 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
        >
          ⬇ Exporter en CSV
        </a>
      )}

      {!adsOn && impressions === 0 ? (
        <div className="mt-6 max-w-2xl rounded-(--radius-l) bg-surface-raised p-6 text-sm leading-relaxed text-secondary">
          <p className="font-bold text-primary">La publicité n&apos;est pas activée.</p>
          <p className="mt-1">
            Aucune impression à mesurer pour l&apos;instant — activez-la depuis{" "}
            <Link href="/admin/publicite" className="underline hover:text-brand">Publicité &amp; flags</Link>{" "}
            (rappel : la licence commerciale TMDB — risque R1 — doit être levée avant une
            activation en production publique, H99).
          </p>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Impressions (MRC)", value: impressions.toLocaleString("fr-FR") },
              { label: "Clics", value: clicks.toLocaleString("fr-FR") },
              {
                label: "CTR",
                value: impressions > 0 ? `${((clicks / impressions) * 100).toFixed(1)} %` : "—",
              },
              {
                label: "Revenu estimé",
                value: `${estimatedRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
              },
            ].map((tile) => (
              <li key={tile.label} className="rounded-(--radius-l) bg-surface-raised p-5">
                <p className="text-2xl font-bold">{tile.value}</p>
                <p className="mt-1 text-sm text-secondary">{tile.label}</p>
              </li>
            ))}
          </ul>

          <section aria-label="Par emplacement" className="mt-8">
            <h2 className="text-lg font-bold">Par emplacement</h2>
            <ul className="mt-3 divide-y divide-white/5 rounded-(--radius-l) bg-surface-raised">
              {byPlacement.map((row) => {
                const rowClicks = clicksMap.get(row.placement) ?? 0;
                const ctr = row.impressions > 0 ? ((rowClicks / row.impressions) * 100).toFixed(1) : null;
                return (
                  <li key={row.placement} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                    <code className="text-xs text-secondary">{row.placement}</code>
                    <span className="text-secondary">
                      {row.impressions.toLocaleString("fr-FR")} impr. · {rowClicks.toLocaleString("fr-FR")} clics
                      {ctr && ` · CTR ${ctr} %`}
                    </span>
                  </li>
                );
              })}
              {byPlacement.length === 0 && (
                <li className="px-5 py-6 text-sm text-secondary">Aucune impression sur la période.</li>
              )}
            </ul>
          </section>

          <section aria-label="Ventilation quotidienne" className="mt-8">
            <h2 className="text-lg font-bold">Ventilation quotidienne</h2>
            <div className="mt-3 overflow-x-auto rounded-(--radius-l) bg-surface-raised">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-secondary">
                    <th className="px-5 py-2">Jour</th>
                    <th className="px-5 py-2">Impressions</th>
                    <th className="px-5 py-2">Clics</th>
                    <th className="px-5 py-2">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {byDay.map((row) => (
                    <tr key={row.day} className="border-b border-white/5">
                      <td className="px-5 py-2.5">{row.day}</td>
                      <td className="px-5 py-2.5">{row.impressions.toLocaleString("fr-FR")}</td>
                      <td className="px-5 py-2.5">{row.clicks.toLocaleString("fr-FR")}</td>
                      <td className="px-5 py-2.5">{row.impressions > 0 ? `${((row.clicks / row.impressions) * 100).toFixed(1)} %` : "—"}</td>
                    </tr>
                  ))}
                  {byDay.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-sm text-secondary">Aucune donnée sur la période.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-8 text-xs text-secondary">
        Audience (repère) : {videoViews.toLocaleString("fr-FR")} lancements de lecture sur 30 jours.
        Les campagnes directes (table dédiée, rotation pondérée) arrivent au palier P-2 du 6.2.
      </p>
    </>
  );
}
