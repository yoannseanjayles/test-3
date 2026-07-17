"use client";

import Link from "next/link";
import { useSessionLite } from "@/components/auth/useSessionLite";

/** Bandeau conversion (D14 §11) — réservé aux visiteurs anonymes (audit B4). */
export function ConversionBanner({ authEnabled }: { authEnabled: boolean }) {
  const { user } = useSessionLite(authEnabled);
  if (user) return null;

  return (
    <section
      aria-label="Créer un compte"
      className="mt-12 flex flex-col items-start gap-4 rounded-(--radius-l) bg-surface-raised p-6 md:flex-row md:items-center md:justify-between md:p-8"
    >
      <div>
        <h2 className="text-xl font-bold md:text-2xl">Votre cinéma personnel. Gratuit.</h2>
        <p className="mt-1 text-sm text-secondary">
          Reprenez où vous en êtes, sur tous vos écrans — et gardez chaque titre qui vous tente.
        </p>
      </div>
      <Link
        href="/inscription"
        className="inline-flex h-12 shrink-0 items-center rounded-full bg-brand px-6 font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent)"
      >
        Créer un compte
      </Link>
    </section>
  );
}
