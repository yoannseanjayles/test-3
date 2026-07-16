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
      n: count(),
    })
    .from(schema.events)
    .where(sql`${schema.events.name} = 'ad.impression' and ${schema.events.createdAt} >= ${since}`)
    .groupBy(sql`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`);

  const estimatedRevenue = ((impressions / 1000) * ecpmCents) / 100;

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Revenus</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        30 derniers jours — régie directe v1 (house ads). eCPM estimé réglable dans{" "}
        <Link href="/admin/parametres" className="underline hover:text-brand">Paramètres</Link>.
      </p>

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
            <h2 className="text-lg font-bold">Impressions par emplacement</h2>
            <ul className="mt-3 divide-y divide-white/5 rounded-(--radius-l) bg-surface-raised">
              {byPlacement.map((row) => (
                <li key={row.placement} className="flex items-center justify-between px-5 py-3 text-sm">
                  <code className="text-xs text-secondary">{row.placement}</code>
                  <span className="font-medium">{row.n.toLocaleString("fr-FR")}</span>
                </li>
              ))}
              {byPlacement.length === 0 && (
                <li className="px-5 py-6 text-sm text-secondary">Aucune impression sur la période.</li>
              )}
            </ul>
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
