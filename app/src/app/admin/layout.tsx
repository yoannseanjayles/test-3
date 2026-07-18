import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin/guard";
import { db, schema } from "@/lib/db";
import { AdminNav, type AdminNavItem } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s | Back-office Ciné+" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Compteurs de badges nav (audit admin-7) — 0 propre si une requête échoue. */
async function navBadges(): Promise<{ moderation: number; messages: number }> {
  try {
    const client = db();
    const [[pending], [newMessages]] = await Promise.all([
      client.select({ n: count() }).from(schema.videos).where(eq(schema.videos.status, "pending_review")),
      client.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.status, "new")),
    ]);
    return { moderation: pending?.n ?? 0, messages: newMessages?.n ?? 0 };
  } catch {
    return { moderation: 0, messages: 0 };
  }
}

/** Espace back-office (D36) — accès rôle admin uniquement (garde serveur). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const badges = await navBadges();

  const NAV: AdminNavItem[] = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/moderation", label: "Modération", badge: badges.moderation },
    { href: "/admin/videos", label: "Vidéos" },
    { href: "/admin/publicite", label: "Publicité & flags" },
    { href: "/admin/parametres", label: "Paramètres" },
    { href: "/admin/revenus", label: "Revenus" },
    { href: "/admin/messages", label: "Messages", badge: badges.messages },
    { href: "/admin/utilisateurs", label: "Utilisateurs" },
    { href: "/admin/ingestion", label: "Ingestion" },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-6">
      <aside className="shrink-0 md:w-56">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Back-office · {admin.name || admin.email}
        </p>
        <AdminNav items={NAV} />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
