"use client";

import Link from "next/link";
import { logoutAction } from "@/lib/auth/actions";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { useSessionLite } from "./useSessionLite";

/**
 * Zone compte du header — rendu par défaut : lien Connexion (identique au
 * HTML statique) ; bascule après hydratation si une session existe.
 */
export function HeaderAuth({ enabled }: { enabled: boolean }) {
  const { user } = useSessionLite(enabled);

  if (!user) {
    return (
      <Link
        href="/connexion"
        className="inline-flex h-9 items-center rounded-full bg-surface-raised px-4 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
      >
        Connexion
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <NotificationsBell />
      {user.role === "admin" && (
        <Link
          href="/admin"
          className="inline-flex h-9 items-center rounded-full bg-violet/20 px-4 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-violet/35"
        >
          Back-office
        </Link>
      )}
      <Link
        href="/parametres"
        className="inline-flex h-9 max-w-28 items-center truncate rounded-full bg-surface-raised px-4 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive md:max-w-36"
        title="Mon compte"
      >
        {user.name || user.email || "Mon compte"}
      </Link>
      <form action={logoutAction} className="hidden md:block">
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full px-3 text-sm text-secondary transition-colors duration-(--duration-fast) hover:bg-surface-raised hover:text-primary"
          aria-label="Se déconnecter"
        >
          Se déconnecter
        </button>
      </form>
    </span>
  );
}
