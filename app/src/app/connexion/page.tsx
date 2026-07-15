import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Ciné+.",
  robots: { index: false },
};

/**
 * Connexion (D19 Auth/Onboarding) — les comptes s'activent avec le back-end (6.1).
 * En attendant, la page explique honnêtement l'état et oriente vers Ma liste locale.
 */
export default function ConnexionPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <p className="mt-3 leading-relaxed text-secondary">
        Les comptes Ciné+ arrivent très bientôt : reprise de lecture sur tous vos écrans,
        liste synchronisée et recommandations personnelles.
      </p>
      <div className="mt-6 rounded-(--radius-l) bg-surface-raised p-5 text-sm leading-relaxed text-secondary">
        En attendant, <strong className="text-primary">Ma liste fonctionne déjà</strong> sur
        cet appareil : ajoutez vos favoris depuis n&apos;importe quelle fiche — ils seront
        rattachés à votre compte dès son ouverture.
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink size="lg" href="/ma-liste">Voir ma liste</ButtonLink>
        <ButtonLink size="lg" variant="secondary" href="/decouvrir">Explorer le catalogue</ButtonLink>
      </div>
      <p className="mt-8 text-sm text-secondary">
        Pas encore de compte ? <Link href="/inscription" className="text-link hover:text-brand">L&apos;inscription ouvre bientôt</Link>.
      </p>
    </div>
  );
}
