import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/admin/guard";
import { getSetting } from "@/lib/settings";

/** Export CSV des revenus (audit admin-6) — 30 derniers jours, par jour et par emplacement. */
export async function GET() {
  await requireAdmin();

  const ecpmCents = await getSetting("ads.ecpm_cents");
  const since = sql`now() - interval '30 days'`;
  const client = db();

  const rows = await client
    .select({
      day: sql<string>`to_char(${schema.events.createdAt}, 'YYYY-MM-DD')`,
      placement: sql<string>`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`,
      impressions: sql<number>`count(*) filter (where ${schema.events.name} = 'ad.impression')::int`,
      clicks: sql<number>`count(*) filter (where ${schema.events.name} = 'ad.click')::int`,
    })
    .from(schema.events)
    .where(sql`${schema.events.name} in ('ad.impression', 'ad.click') and ${schema.events.createdAt} >= ${since}`)
    .groupBy(sql`to_char(${schema.events.createdAt}, 'YYYY-MM-DD')`, sql`coalesce(${schema.events.props} ->> 'placement', 'inconnu')`)
    .orderBy(sql`to_char(${schema.events.createdAt}, 'YYYY-MM-DD') desc`);

  const escapeCsv = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

  const lines = ["jour,emplacement,impressions,clics,ecpm_cents,revenu_estime_eur"];
  for (const row of rows) {
    const revenue = ((row.impressions / 1000) * ecpmCents) / 100;
    lines.push(
      [row.day, escapeCsv(row.placement), row.impressions, row.clicks, ecpmCents, revenue.toFixed(2)].join(","),
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cineplus-revenus-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
