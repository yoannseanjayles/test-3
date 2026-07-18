import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { ButtonLink } from "@/components/ui/Button";
import { isAuthConfigured } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Ciné+.",
  robots: { index: false },
};

function safeNext(raw: string | undefined): string | undefined {
  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/api")) return raw;
  return undefined;
}

/**
 * Connexion (D19 Auth) — formulaire réel dès que base + AUTH_SECRET sont
 * configurés (6.1 Lot 2) ; état d'annonce honnête sinon (H77).
 */
export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const active = isAuthConfigured();
  const nextParam = (await searchParams).next;
  const next = safeNext(Array.isArray(nextParam) ? nextParam[0] : nextParam);

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Connexion</h1>

      {active ? (
        <>
          <p className="mt-3 leading-relaxed text-secondary">
            Retrouvez votre liste et votre progression sur tous vos écrans.
          </p>
          <AuthForm mode="login" next={next} />
          <p className="mt-8 text-sm text-secondary">
            Pas encore de compte ?{" "}
            <Link href={next ? `/inscription?next=${encodeURIComponent(next)}` : "/inscription"} className="text-link underline hover:text-brand">
              Créer un compte gratuit
            </Link>
          </p>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
