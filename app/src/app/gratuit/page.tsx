import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Gratuit ▶",
  description: "Des films classiques à regarder gratuitement et légalement, sans compte.",
};

/**
 * Gratuit ▶ (D19) — catalogue visionnable (Internet Archive, D5/H8).
 * Le branchement du catalogue et le lecteur arrivent avec le Lot 4 (H69) :
 * page d'attente honnête plutôt qu'un 404 depuis la navigation principale.
 */
export default function GratuitPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Gratuit ▶</h1>
      <p className="mt-1 text-sm text-secondary">
        Des classiques du domaine public à regarder immédiatement, légalement, sans compte.
      </p>
      <EmptyState
        illustration="/media/interface/empty-resume.jpg"
        title="La salle ouvre bientôt"
        description="Le catalogue gratuit (films du domaine public et œuvres ouvertes) arrive avec le lecteur vidéo. En attendant, explorez les fiches et préparez votre liste."
        actionHref="/decouvrir"
        actionLabel="Explorer les tendances"
      />
    </div>
  );
}
