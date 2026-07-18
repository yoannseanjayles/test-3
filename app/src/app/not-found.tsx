import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Page introuvable" };

/** 404 globale — illustration B4 dédiée, une action principale + portes de sortie (D13 §5, audit transversal-8). */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <EmptyState
        illustration="/media/interface/error-404.jpg"
        title="Cette page n'existe pas (ou plus)"
        description="Le titre a peut-être changé d'adresse, ou le lien était erroné. Le catalogue, lui, est bien là."
        actionHref="/"
        actionLabel="Retour à l'accueil"
      />
      <p className="mt-6 text-center text-sm text-secondary">
        Ou essayez{" "}
        <Link href="/recherche" className="underline hover:text-brand">
          la recherche
        </Link>{" "}
        · <Link href="/gratuit" className="underline hover:text-brand">catalogue Gratuit ▶</Link>
      </p>
    </div>
  );
}
