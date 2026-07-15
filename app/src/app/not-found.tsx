import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Page introuvable" };

/** 404 globale — illustration B4 dédiée, une seule action (D13 §5). */
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
    </div>
  );
}
