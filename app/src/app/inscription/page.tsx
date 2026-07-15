import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Ciné+ gratuit.",
  robots: { index: false },
};

/** Inscription (D19 Auth/Onboarding) — parcours annoncé, activation avec le back-end (6.1). */
export default function InscriptionPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Votre cinéma personnel. Gratuit.</h1>
      <p className="mt-3 leading-relaxed text-secondary">
        L&apos;ouverture des comptes est imminente. Au programme : reprise de lecture
        cross-device, liste synchronisée, historique et recommandations expliquées.
      </p>
      <div className="mt-6 rounded-(--radius-l) bg-surface-raised p-5 text-sm leading-relaxed text-secondary">
        Bonne nouvelle : vous pouvez <strong className="text-primary">déjà utiliser Ma liste</strong> sans
        compte — elle est conservée sur cet appareil et sera rattachée à votre profil à l&apos;ouverture.
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink size="lg" href="/decouvrir">Commencer à explorer</ButtonLink>
        <ButtonLink size="lg" variant="secondary" href="/gratuit">Voir le catalogue gratuit</ButtonLink>
      </div>
      <p className="mt-8 text-sm text-secondary">
        Déjà inscrit ? <Link href="/connexion" className="text-link hover:text-brand">Connexion</Link>.
      </p>
    </div>
  );
}
