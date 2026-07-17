import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { ButtonLink } from "@/components/ui/Button";
import { isAuthConfigured } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Ciné+ gratuit.",
  robots: { index: false },
};

function safeNext(raw: string | undefined): string | undefined {
  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/api")) return raw;
  return undefined;
}

/** Inscription (D19 Auth) — formulaire réel si l'auth est configurée, annonce sinon (H77). */
export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const active = isAuthConfigured();
  const nextParam = (await searchParams).next;
  const next = safeNext(Array.isArray(nextParam) ? nextParam[0] : nextParam);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Votre cinéma personnel. Gratuit.</h1>

      {active ? (
        <>
          <p className="mt-3 leading-relaxed text-secondary">
            Liste synchronisée, reprise de lecture multi-écrans, historique — et votre liste
            locale actuelle sera automatiquement rattachée à votre compte.
          </p>
          <AuthForm mode="register" next={next} />
          <p className="mt-8 text-sm text-secondary">
            Déjà inscrit ?{" "}
            <Link href={next ? `/connexion?next=${encodeURIComponent(next)}` : "/connexion"} className="text-link underline hover:text-brand">
              Connexion
            </Link>
          </p>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
