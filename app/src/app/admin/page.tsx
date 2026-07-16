import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isR2Configured } from "@/lib/storage/r2";
import { isTmdbConfigured } from "@/lib/tmdb/client";

export const dynamic = "force-dynamic";

/** Tableau de bord (D36) — l'état du service et ce qui attend une action, en un écran. */
export default async function AdminDashboardPage() {
  const client = db();
  const countWhere = async (table: "videos" | "messages", status: string) => {
    if (table === "videos") {
      const [r] = await client
        .select({ n: count() })
        .from(schema.videos)
        .where(eq(schema.videos.status, status as (typeof schema.videos.$inferSelect)["status"]));
      return r?.n ?? 0;
    }
    const [r] = await client
      .select({ n: count() })
      .from(schema.contactMessages)
      .where(eq(schema.contactMessages.status, status));
    return r?.n ?? 0;
  };

  const [pendingReview, processing, published, newMessages, users] = await Promise.all([
    countWhere("videos", "pending_review"),
    countWhere("videos", "processing"),
    countWhere("videos", "published"),
    countWhere("messages", "new"),
    client.select({ n: count() }).from(schema.users).then(([r]) => r?.n ?? 0),
  ]);

  const tiles = [
    { label: "Vidéos en modération", value: pendingReview, href: "/admin/moderation", urgent: pendingReview > 0 },
    { label: "Encodages en cours", value: processing, href: "/admin/videos", urgent: false },
    { label: "Vidéos publiées", value: published, href: "/admin/videos", urgent: false },
    { label: "Messages non traités", value: newMessages, href: "/admin/messages", urgent: newMessages > 0 },
    { label: "Utilisateurs", value: users, href: "/admin/utilisateurs", urgent: false },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Tableau de bord</h1>

      <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className={`block rounded-(--radius-l) p-5 transition-colors duration-(--duration-fast) ${
                tile.urgent ? "bg-brand/15 hover:bg-brand/25" : "bg-surface-raised hover:bg-surface-interactive"
              }`}
            >
              <p className="text-3xl font-bold">{tile.value}</p>
              <p className="mt-1 text-sm text-secondary">{tile.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-label="État des services" className="mt-10">
        <h2 className="text-lg font-bold">Services</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span aria-hidden>🗄️</span> Base de données : <strong className="text-primary">connectée</strong>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden>🎬</span> Catalogue TMDB :{" "}
            <strong className="text-primary">{isTmdbConfigured() ? "configuré" : "non configuré"}</strong>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden>📦</span> Stockage vidéo R2 :{" "}
            <strong className="text-primary">{isR2Configured() ? "configuré" : "non configuré"}</strong>
          </li>
        </ul>
        <p className="mt-3 text-xs text-secondary">
          Détail machine : <Link href="/api/health" className="underline hover:text-brand">/api/health</Link>
        </p>
      </section>
    </>
  );
}
