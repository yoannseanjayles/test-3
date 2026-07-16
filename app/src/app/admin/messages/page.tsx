import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { setContactStatusAction } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

const TAKEDOWN = "Ayants droit / demande de retrait";
const STATUS_LABELS: Record<string, string> = { new: "Nouveau", in_progress: "En cours", closed: "Traité" };

/** Messages de contact (D36) — takedown en tête de file (priorité D11). */
export default async function AdminMessagesPage() {
  const rows = await db()
    .select()
    .from(schema.contactMessages)
    .orderBy(desc(schema.contactMessages.createdAt))
    .limit(200);

  // Priorité takedown (D11), puis les nouveaux, puis le reste par date.
  const sorted = [...rows].sort((a, b) => {
    const at = a.motif === TAKEDOWN && a.status !== "closed" ? 0 : 1;
    const bt = b.motif === TAKEDOWN && b.status !== "closed" ? 0 : 1;
    if (at !== bt) return at - bt;
    return 0;
  });

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Messages ({rows.length})</h1>
      <p className="mt-1 text-sm text-secondary">Les demandes d&apos;ayants droit non traitées sont en tête (D11).</p>

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
              <div className="mt-3 flex gap-2">
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
        {rows.length === 0 && (
          <li className="rounded-(--radius-l) bg-surface-raised px-5 py-8 text-sm text-secondary">
            Aucun message pour l&apos;instant.
          </li>
        )}
      </ul>
    </>
  );
}
