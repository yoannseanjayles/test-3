import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { isUgcUploadEnabled } from "@/lib/ads/flags";
import { isAuthConfigured } from "@/lib/auth/config";
import { UploadForm } from "@/components/studio/UploadForm";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Studio",
  description: "Publiez vos vidéos sur Ciné+ : dépôt, licence, modération et statistiques.",
  robots: { index: false },
};

/**
 * Studio UGC (D19 Studio) — gouverné par l'interrupteur `ugc.upload.enabled`
 * (D11, défaut OFF au lancement ; ne concerne que les rôles non-admin).
 * OFF : état d'attente honnête + règles de publication déjà affichées.
 * ON : tableau de bord + parcours de dépôt (ingestion réelle avec le back-end 6.1 — H78).
 */

const RULES = [
  {
    title: "Vos droits, déclarés",
    text: "Vous ne publiez que des vidéos dont vous détenez les droits (création originale ou licence). La déclaration de droits et de licence est obligatoire à chaque dépôt.",
  },
  {
    title: "Modération avant publication",
    text: "Aucune vidéo n'est visible publiquement sans vérification par notre équipe. Vous êtes notifié de la décision, motif à l'appui en cas de refus.",
  },
  {
    title: "Des quotas raisonnables",
    text: "Un plafond de dépôts par utilisateur protège la qualité du catalogue et la file de modération.",
  },
  {
    title: "Retrait à tout moment",
    text: "Vous restez propriétaire : retirer une de vos vidéos la dépublie immédiatement. Les ayants droit disposent d'une procédure de signalement prioritaire.",
  },
];

export default async function StudioPage() {
  const open = await isUgcUploadEnabled();
  const authEnabled = isAuthConfigured();
  const [quota, maxMb, slaHours] = await Promise.all([
    getSetting("ugc.quota.videos_per_user"),
    getSetting("ugc.upload.max_mb"),
    getSetting("moderation.sla_hours"),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Studio</h1>
      <p className="mt-1 max-w-2xl text-sm text-secondary">
        L&apos;espace des créateurs : publiez vos vidéos, suivez leur modération et leur audience.
      </p>

      {/* Aide contextuelle chiffrée (audit compte-5) — valeurs par défaut, modifiables en back-office */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 rounded-(--radius-m) bg-surface-raised px-5 py-3 text-sm text-secondary">
        <span>
          Quota : <strong className="text-primary">{quota}</strong> vidéo{quota > 1 ? "s" : ""} / créateur
        </span>
        <span>
          Taille max : <strong className="text-primary">{(maxMb / 1024).toFixed(maxMb % 1024 === 0 ? 0 : 1)} Go</strong>
        </span>
        <span>
          Délai de modération visé : <strong className="text-primary">{slaHours} h</strong>
        </span>
      </div>

      {open ? (
        <section aria-label="Déposer une vidéo" className="mt-8 rounded-(--radius-l) bg-surface-raised p-6">
          <h2 className="text-xl font-bold">Déposer une vidéo</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            Fichier → détails → licence → déclaration de droits. Votre vidéo est encodée en
            plusieurs qualités puis vérifiée par notre équipe avant d&apos;être visible (D11).
          </p>
          <UploadForm authEnabled={authEnabled} />
        </section>
      ) : (
        <EmptyState
          illustration="/media/interface/empty-studio.jpg"
          title="Le Studio ouvre bientôt"
          description="La publication de vidéos par la communauté n'est pas encore ouverte. Préparez vos créations : les règles du jeu sont déjà publiées ci-dessous."
          actionHref="/gratuit"
          actionLabel="Voir le catalogue gratuit"
        />
      )}

      <section aria-label="Règles de publication" className="mt-10">
        <h2 className="text-xl font-bold">Les règles du jeu</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {RULES.map((rule) => (
            <li key={rule.title} className="rounded-(--radius-l) bg-surface-raised p-5">
              <h3 className="font-bold">{rule.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">{rule.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-secondary">
          Le détail figure dans les <Link href="/cgu" className="underline hover:text-brand">CGU</Link> (section
          « Contenus publiés par les utilisateurs »).
        </p>
      </section>
    </div>
  );
}
