import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Les conditions d'utilisation du service Ciné+.",
};

export default function CguPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      updatedAt="15 juillet 2026"
      intro="Ces conditions encadrent l'utilisation de Ciné+. En utilisant le service, vous les acceptez."
      sections={[
        {
          id: "service",
          title: "Le service",
          plain: "Ciné+ vous aide à découvrir films et séries, et à regarder gratuitement des œuvres librement diffusables.",
          body: (
            <>
              <p>
                Ciné+ est un service de découverte, de référencement et de visionnage de films et séries.
                Le visionnage porte exclusivement sur des œuvres du domaine public, sous licence ouverte,
                ou déposées par des créateurs disposant des droits nécessaires.
              </p>
              <p>
                Le service est fourni « en l&apos;état », sans engagement de disponibilité permanente :
                certaines sources (catalogue, vidéos) dépendent de services tiers.
              </p>
            </>
          ),
        },
        {
          id: "gratuite",
          title: "Gratuité et publicité",
          plain: "Le service est gratuit. S'il affiche un jour de la publicité, elle restera plafonnée et soumise à votre consentement.",
          body: (
            <p>
              L&apos;accès à Ciné+ est gratuit. Le service peut être financé par de la publicité
              plafonnée (au plus une annonce avant une vidéo, jamais pendant), activable uniquement dans
              le respect de votre consentement (voir la page Cookies). L&apos;absence de consentement
              publicitaire ne restreint pas l&apos;accès au service.
            </p>
          ),
        },
        {
          id: "compte",
          title: "Compte utilisateur",
          plain: "Le compte est facultatif pour découvrir et regarder ; il sert à synchroniser vos listes et votre progression.",
          body: (
            <p>
              La création de compte (à son ouverture) requiert une adresse e-mail valide. Vous êtes
              responsable de la confidentialité de vos identifiants. Nous pouvons suspendre un compte en
              cas de violation des présentes conditions, après notification motivée sauf urgence.
            </p>
          ),
        },
        {
          id: "ugc",
          title: "Contenus publiés par les utilisateurs",
          plain: "Vous ne pouvez publier que des vidéos dont vous détenez les droits ; tout est vérifié avant publication et un contenu illicite est retiré.",
          body: (
            <>
              <p>
                Lorsque la publication est ouverte, chaque dépôt exige une <strong>déclaration de droits
                et de licence</strong>. Aucune vidéo n&apos;est rendue publique sans modération préalable.
                Des quotas par utilisateur s&apos;appliquent.
              </p>
              <p>
                Sont notamment interdits : les contenus contrefaisants, haineux, violents, trompeurs ou
                contraires à la loi. Les violations entraînent le retrait du contenu et, en cas de
                récidive, la suspension du compte. Les ayants droit disposent d&apos;une{" "}
                <strong>procédure de signalement et de retrait</strong> via la page Contact, traitée en
                priorité.
              </p>
            </>
          ),
        },
        {
          id: "pi",
          title: "Propriété intellectuelle",
          plain: "Les œuvres restent à leurs auteurs ; les métadonnées viennent de TMDB ; l'interface Ciné+ nous appartient.",
          body: (
            <p>
              Les œuvres diffusées demeurent la propriété de leurs titulaires respectifs (domaine public
              excepté). Les métadonnées et visuels proviennent de TMDB (service non affilié). Les vidéos
              de créateurs restent leur propriété : leur dépôt concède à Ciné+ une licence non exclusive
              de diffusion sur le service, révocable par retrait de la vidéo. L&apos;interface, la marque
              et les éléments graphiques de Ciné+ sont protégés.
            </p>
          ),
        },
        {
          id: "responsabilite",
          title: "Responsabilité et droit applicable",
          plain: "Nous corrigeons de bonne foi, mais ne garantissons pas l'absence totale d'erreurs ; le droit français s'applique.",
          body: (
            <p>
              Ciné+ ne saurait être tenu responsable des interruptions imputables aux hébergeurs tiers ni
              de l&apos;exactitude absolue des métadonnées fournies par des sources externes. Les présentes
              conditions sont soumises au droit français ; tout litige relève des juridictions
              compétentes françaises, après recherche préalable d&apos;une solution amiable.
            </p>
          ),
        },
      ]}
    />
  );
}
