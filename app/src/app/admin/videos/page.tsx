import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { removeVideoAction, retryEncodingAction } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/Badge";
import { FilterChips } from "@/components/ui/FilterChips";

export const metadata: Metadata = { title: "Vidéos" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  uploading: "Envoi à reprendre",
  processing: "Encodage",
  pending_review: "En modération",
  published: "Publiée",
  rejected: "Refusée",
  removed: "Retirée",
};

const STATUSES = Object.keys(STATUS_LABELS);

function first(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

/** Catalogue vidéo complet (D36) : filtre statut + recherche (audit admin-3), retrait/takedown, relance d'encodage. */
export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const statut = STATUSES.includes(first(params.statut)) ? first(params.statut) : "";
  const q = first(params.q).trim().slice(0, 100);

  const client = db();
  const conditions = [
    statut ? eq(schema.videos.status, statut as (typeof schema.videos.$inferSelect)["status"]) : undefined,
    q ? ilike(schema.videos.title, `%${q}%`) : undefined,
  ].filter(Boolean);

  const [videos, counts] = await Promise.all([
    client
      .select()
      .from(schema.videos)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.videos.createdAt))
      .limit(200),
    client.select({ status: schema.videos.status, n: sql<number>`count(*)::int` }).from(schema.videos).groupBy(schema.videos.status),
  ]);
  const countByStatus = new Map<string, number>(counts.map((c) => [c.status, c.n]));
  const total = counts.reduce((sum, c) => sum + c.n, 0);

  const hrefWith = (patch: { statut?: string; q?: string }) => {
    const merged = { statut, q, ...patch };
    const entries = Object.entries(merged).filter((e): e is [string, string] => Boolean(e[1]));
    const qs = new URLSearchParams(entries).toString();
    return qs ? `/admin/videos?${qs}` : "/admin/videos";
  };

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Vidéos ({videos.length}{statut || q ? ` / ${total}` : ""})</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <FilterChips
          label="Statut"
          options={[
            { label: `Tous (${total})`, href: hrefWith({ statut: "" }), active: statut === "" },
            ...STATUSES.map((s) => ({
              label: `${STATUS_LABELS[s]} (${countByStatus.get(s) ?? 0})`,
              href: hrefWith({ statut: s }),
              active: statut === s,
            })),
          ]}
        />
        <form action="/admin/videos" method="get" className="flex items-center gap-2">
          {statut && <input type="hidden" name="statut" value={statut} />}
          <label htmlFor="q" className="sr-only">Rechercher par titre</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Rechercher un titre…"
            className="h-9 rounded-full border border-white/10 bg-surface-raised px-4 text-sm text-primary placeholder:text-secondary focus:border-brand focus:outline-none"
          />
        </form>
      </div>

      <ul className="mt-6 divide-y divide-white/5 rounded-(--radius-l) bg-surface-raised">
        {videos.map((video) => (
          <li key={video.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {video.status === "published" ? (
                  <Link href={`/regarder/${video.slug}`} className="hover:text-brand">
                    {video.title}
                  </Link>
                ) : (
                  video.title
                )}
              </p>
              <p className="text-xs text-secondary">
                {video.createdAt.toLocaleDateString("fr-FR")} · {video.licence}
              </p>
            </div>
            <Badge>{STATUS_LABELS[video.status] ?? video.status}</Badge>

            {(video.status === "uploading" || video.status === "processing") && video.sourceKey && (
              <form action={retryEncodingAction}>
                <input type="hidden" name="videoId" value={video.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  ↻ Relancer l&apos;encodage
                </button>
              </form>
            )}

            {video.status === "published" && (
              <form action={removeVideoAction} className="flex items-center gap-2">
                <input type="hidden" name="videoId" value={video.id} />
                <label htmlFor={`remove-${video.id}`} className="sr-only">
                  Motif du retrait
                </label>
                <input
                  id={`remove-${video.id}`}
                  name="reason"
                  required
                  minLength={3}
                  placeholder="Motif (takedown…)"
                  className="h-9 w-44 rounded-(--radius-m) border border-white/10 bg-surface-overlay px-3 text-xs text-primary placeholder:text-secondary focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  Retirer
                </button>
              </form>
            )}
          </li>
        ))}
        {videos.length === 0 && (
          <li className="px-5 py-8 text-sm text-secondary">
            {statut || q ? "Aucune vidéo ne correspond à ce filtre." : "Aucune vidéo pour l'instant."}
          </li>
        )}
      </ul>
    </>
  );
}
