import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s | Back-office Ciné+" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/moderation", label: "Modération" },
  { href: "/admin/videos", label: "Vidéos" },
  { href: "/admin/publicite", label: "Publicité & flags" },
  { href: "/admin/parametres", label: "Paramètres" },
  { href: "/admin/revenus", label: "Revenus" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
  { href: "/admin/ingestion", label: "Ingestion" },
];

/** Espace back-office (D36) — accès rôle admin uniquement (garde serveur). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-6">
      <aside className="shrink-0 md:w-56">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Back-office · {admin.name || admin.email}
        </p>
        <nav aria-label="Navigation back-office" className="mt-3">
          <ul className="flex flex-wrap gap-1 md:flex-col">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-md px-3 py-2 text-sm text-secondary transition-colors duration-(--duration-fast) hover:bg-surface-raised hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
