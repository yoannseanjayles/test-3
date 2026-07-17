import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { setContactStatusAction } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/Badge";
import { FilterChips } from "@/components/ui/FilterChips";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

const TAKEDOWN = "Ayants droit / demande de retrait";
const STATUS_LABELS: Record<string, string> = { new: "Nouveau", in_progress: "En cours", closed: "Traité" };
const STATUSES = Object.keys(STATUS_LABELS);

function first(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

/** Messages de contact (D36) — onglets par statut (audit admin-5), takedown en tête de file (priorité D11). */
export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string | string[] }>;
}) {
  const statut = STATUSES.includes(first((await searchParams).statut)) ? first((await searchParams).statut) : "";

  const client = db();
  const [rows, counts] = await Promise.all([
    client.select().from(schema.contactMessages).orderBy(desc(schema.contactMessages.createdAt)).limit(200),
    client.select({ status: schema.contactMessages.status, n: sql<number>`count(*)::int` }).from(schema.contactMessages).groupBy(schema.contactMessages.status),
  ]);
  const countByStatus = new Map(counts.map((c) => [c.status, c.n]));
  const total = counts.reduce((sum, c) => sum + c.n, 0);
  const filtered = statut ? rows.filter((r) => r.status === statut) : rows;

  // Priorité takedown (D11), puis les nouveaux, puis le reste par date.
  const sorted = [...filtered].sort((a, b) => {
    const at = a.motif === TAKEDOWN && a.status !== "closed" ? 0 : 1;
    const bt = b.motif === TAKEDOWN && b.status !== "closed" ? 0 : 1;
    if (at !== bt) return at - bt;
    return 0;
  });

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Messages ({sorted.length}{statut ? ` / ${total}` : ""})</h1>
      <p className="mt-1 text-sm text-secondary">Les demandes d&apos;ayants droit non traitées sont en tête (D11).</p>

      <div className="mt-4">
        <FilterChips
          label="Statut"
          options={[
            { label: `Tous (${total})`, href: "/admin/messages", active: statut === "" },
            ...STATUSES.map((s) => ({
              label: `${STATUS_LABELS[s]} (${countByStatus.get(s) ?? 0})`,
              href: `/admin/messages?statut=${s}`,
              active: statut === s,
            })),
          ]}
        />
      </div>

      <ul className="mt-6 space-y-4">
        {sorted.map((message) => {
          const takedown = message.takedown as { url?: string; role?: string } | null;
          return (
            <li
              key={message.id}
              className={`rounded-(--radius-l) p-5 ${message.motif === TAKEDOWN && message.status !== "closed" ? "bg-brand/10" : "bg-surface-raised"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={message.status === "new" ? "new" : "neutral"}>{STATUS_LABELS[message.status] ?? message.status}</Badge>
                <span className="font-medium">{message.motif}</span>
                <span className="text-xs text-secondary">
                  · {message.email} · {message.createdAt.toLocaleString("fr-FR")}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-secondary">{message.message}</p>
              {takedown && (
                <p className="mt-2 rounded-(--radius-m) bg-surface-overlay px-3 py-2 text-xs text-secondary">
                  <strong className="text-primary">Takedown</strong> — contenu :{" "}
                  {takedown.url || "non précisé"} · qualité : {takedown.role || "non précisée"}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.motif} — Ciné+`)}`}
                  className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  ✉ Répondre par e-mail
                </a>
                {(["in_progress", "closed"] as const).map((next) => (
                  <form key={next} action={setContactStatusAction}>
                    <input type="hidden" name="messageId" value={message.id} />
                    <input type="hidden" name="status" value={next} />
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                    >
                      {next === "in_progress" ? "Prendre en charge" : "Marquer traité"}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li className="rounded-(--radius-l) bg-surface-raised px-5 py-8 text-sm text-secondary">
            {statut ? "Aucun message avec ce statut." : "Aucun message pour l'instant."}
          </li>
        )}
      </ul>
    </>
  );
}
