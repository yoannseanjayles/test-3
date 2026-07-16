import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { setUserRoleAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Utilisateurs" };
export const dynamic = "force-dynamic";

/** Gestion des utilisateurs et rôles (D36) — on ne se rétrograde jamais soi-même. */
export default async function AdminUtilisateursPage() {
  const me = await requireAdmin();
  const users = await db().select().from(schema.users).orderBy(desc(schema.users.createdAt)).limit(200);

  return (
    <>
      <h1 className="text-2xl font-bold md:text-3xl">Utilisateurs ({users.length})</h1>

      <ul className="mt-6 divide-y divide-white/5 rounded-(--radius-l) bg-surface-raised">
        {users.map((user) => (
          <li key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{user.displayName || user.email}</p>
              <p className="text-xs text-secondary">
                {user.email} · inscrit le {user.createdAt.toLocaleDateString("fr-FR")}
              </p>
            </div>
            <Badge tone={user.role === "admin" ? "new" : "neutral"}>{user.role}</Badge>
            {user.id !== me.id && (
              <form action={setUserRoleAction}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="role" value={user.role === "admin" ? "user" : "admin"} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center rounded-full bg-surface-overlay px-4 text-xs text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
                >
                  {user.role === "admin" ? "Rétrograder" : "Promouvoir admin"}
                </button>
              </form>
            )}
          </li>
        ))}
        {users.length === 0 && (
          <li className="px-5 py-8 text-sm text-secondary">Aucun utilisateur pour l&apos;instant.</li>
        )}
      </ul>
    </>
  );
}
