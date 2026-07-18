import type { Metadata } from "next";
import Link from "next/link";
import { isUgcUploadEnabled } from "@/lib/ads/flags";
import { isAuthConfigured } from "@/lib/auth/config";
import { FaqList } from "@/components/support/FaqList";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur Ciné+ : visionnage, catalogue gratuit, publicité, compte et données personnelles.",
};

/**
 * FAQ (D19 Support §1) — réponse directe en 1re phrase (format extractible),
 * accordéons natifs <details> (accessibles, zéro JS), JSON-LD FAQPage.
 * Le groupe « Publier une vidéo » n'apparaît que si l'upload UGC est ouvert (D11).
 */

interface QA {
  q: string;
  a: string;
}

function buildGroups(authEnabled: boolean): { title: string; items: QA[] }[] {
  return [
  {
    title: "Visionnage",
    items: [
      {
        q: "Comment reprendre un film là où je m'étais arrêté ?",
        a: authEnabled
          ? "Rouvrez simplement la page de lecture : un bouton « Reprendre à » vous ramène à la seconde près. Connecté, la reprise fonctionne sur tous vos écrans ; sans compte, elle reste propre à cet appareil. Votre progression se retrouve dans Ma liste, onglet « En cours »."
          : "Rouvrez simplement la page de lecture : un bouton « Reprendre à » vous ramène à la seconde près. Votre progression est enregistrée automatiquement pendant la lecture et se retrouve dans Ma liste, onglet « En cours ».",
      },
      {
        q: "La vidéo ne se lance pas, que faire ?",
        a: "Utilisez le bouton « Réessayer » de l'écran d'erreur, puis vérifiez votre connexion. Si le problème persiste sur un titre précis, signalez-le via le formulaire de contact (motif « Bug ») — les sources du catalogue gratuit sont hébergées par des tiers et peuvent être momentanément indisponibles.",
      },
      {
        q: "Y aura-t-il des sous-titres et plusieurs qualités ?",
        a: "Oui, c'est prévu avec notre pipeline vidéo : plusieurs qualités adaptatives (HLS) et sous-titres multilingues arriveront avec l'infrastructure d'hébergement vidéo en cours de construction.",
      },
    ],
  },
  {
    title: "Catalogue gratuit",
    items: [
      {
        q: "D'où viennent les films gratuits ?",
        a: "Du domaine public et de licences ouvertes : classiques dont les droits ont expiré (Internet Archive) et open movies de la fondation Blender (Creative Commons). La licence et l'attribution sont affichées sur chaque page de lecture.",
      },
      {
        q: "Est-ce vraiment légal et gratuit ?",
        a: "Oui : chaque œuvre proposée est librement diffusable (domaine public ou licence Creative Commons), sans compte ni paiement. Nous n'hébergeons aucun contenu piraté.",
      },
    ],
  },
  {
    title: "Compte",
    items: authEnabled
      ? [
          {
            q: "Comment créer un compte ?",
            a: "Rendez-vous sur la page Inscription : e-mail et mot de passe suffisent. Votre liste locale actuelle est automatiquement rattachée à votre nouveau compte.",
          },
          {
            q: "Ma liste est-elle synchronisée entre mes appareils ?",
            a: "Oui, dès que vous êtes connecté : favoris, historique et reprise de lecture sont synchronisés sur tous vos écrans.",
          },
          {
            q: "Comment changer mon mot de passe ou désactiver les e-mails ?",
            a: "Tout se passe dans Paramètres (accessible depuis le menu compte) : changement de mot de passe, notifications par e-mail, export et suppression de vos données.",
          },
        ]
      : [
          {
            q: "Comment créer un compte ?",
            a: "L'ouverture des comptes est imminente : elle arrive avec notre back-end. En attendant, Ma liste fonctionne déjà sur votre appareil et sera rattachée à votre profil à l'ouverture.",
          },
          {
            q: "Ma liste est-elle synchronisée entre mes appareils ?",
            a: "Pas encore : elle est conservée sur l'appareil en cours. La synchronisation multi-écrans fait partie des comptes, qui arrivent prochainement.",
          },
        ],
  },
  {
    title: "Publicité",
    items: [
      {
        q: "Pourquoi de la publicité sur Ciné+ ?",
        a: "La publicité — actuellement désactivée — financera le service gratuit. Elle restera plafonnée : au plus une publicité avant un film, jamais pendant, et toujours soumise à votre consentement.",
      },
      {
        q: "Comment gérer mon consentement publicitaire ?",
        a: "Via le bouton « Gérer mes préférences » de la page Cookies, qui rouvrira le module de consentement dès l'activation de la publicité.",
      },
    ],
  },
  {
    title: "Données personnelles",
    items: [
      {
        q: "Quelles données collectez-vous ?",
        a: "Le strict nécessaire au service : votre liste et votre progression de lecture (aujourd'hui stockées uniquement sur votre appareil), puis les données de compte à leur ouverture. Le détail figure dans la politique de confidentialité.",
      },
      {
        q: "Comment exporter ou supprimer mes données ?",
        a: authEnabled
          ? "Depuis Paramètres : un bouton exporte toutes vos données en JSON, un autre supprime définitivement votre compte. Sans compte, vos données restent locales — Paramètres propose aussi leur export et leur effacement sur cet appareil."
          : "Aujourd'hui, tout est local : Paramètres permet d'exporter ou d'effacer les données de cet appareil. Avec les comptes, l'export et la suppression du compte seront disponibles de la même manière.",
      },
    ],
  },
  ];
}

const UGC_GROUP: { title: string; items: QA[] } = {
  title: "Publier une vidéo",
  items: [
    {
      q: "Qui peut publier une vidéo sur Ciné+ ?",
      a: "Tout utilisateur disposant des droits sur sa vidéo, lorsque la publication est ouverte. Une déclaration de droits et de licence est obligatoire à l'envoi, et chaque vidéo est vérifiée par notre équipe avant d'être visible (modération a priori).",
    },
    {
      q: "Pourquoi ma vidéo n'est-elle pas encore visible ?",
      a: "Parce qu'elle est en file de modération : aucune vidéo de la communauté n'est publiée sans approbation. Vous serez notifié dès la décision.",
    },
  ],
};

export default async function FaqPage() {
  const ugcOpen = await isUgcUploadEnabled();
  const authEnabled = isAuthConfigured();
  const baseGroups = buildGroups(authEnabled);
  const groups = ugcOpen ? [...baseGroups, UGC_GROUP] : baseGroups;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold md:text-4xl">Questions fréquentes</h1>
      <p className="mt-2 text-sm text-secondary">
        La réponse à votre question se trouve probablement ici — sinon, le contact est en bas de page.
      </p>

      <FaqList groups={groups} />

      <div className="mt-12 rounded-(--radius-l) bg-surface-raised p-6 text-center">
        <p className="font-bold">Vous n&apos;avez pas trouvé ?</p>
        <p className="mt-1 text-sm text-secondary">Notre équipe répond sous 72 h.</p>
        <Link
          href="/contact"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent)"
        >
          Nous contacter
        </Link>
      </div>
    </div>
  );
}
