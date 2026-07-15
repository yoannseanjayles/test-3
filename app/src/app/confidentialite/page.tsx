import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Quelles données Ciné+ collecte, pourquoi, combien de temps — et vos droits.",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      updatedAt="15 juillet 2026"
      intro="Le principe : collecter le strict nécessaire au service, vous le dire clairement, et vous laisser le contrôle."
      sections={[
        {
          id: "donnees",
          title: "Données collectées et finalités",
          plain: "Aujourd'hui, vos listes et votre progression restent sur votre appareil. Avec les comptes, elles seront synchronisées sur nos serveurs.",
          body: (
            <>
              <p>
                <strong>Sans compte (état actuel)</strong> : votre liste (favoris, en cours, historique)
                et votre progression de lecture sont stockées <strong>uniquement dans votre
                navigateur</strong> (localStorage). Elles ne transitent pas par nos serveurs.
              </p>
              <p>
                <strong>Avec un compte (à l&apos;ouverture)</strong> : adresse e-mail (authentification),
                listes et progression (synchronisation multi-écrans), préférences (personnalisation).
                Base légale : exécution du service demandé.
              </p>
              <p>
                <strong>Mesure d&apos;audience et publicité</strong> : uniquement après consentement via le
                module de gestion des préférences (voir Cookies). Sans consentement, le service fonctionne
                intégralement.
              </p>
            </>
          ),
        },
        {
          id: "durees",
          title: "Durées de conservation",
          plain: "Les données de compte vivent tant que le compte existe ; le reste est court.",
          body: (
            <p>
              Données de compte : conservées jusqu&apos;à suppression du compte, puis effacées sous 30
              jours (sauvegardes purgées sous 90 jours). Messages au support : 24 mois. Journaux
              techniques : 12 mois maximum. Données locales du navigateur : sous votre seul contrôle.
            </p>
          ),
        },
        {
          id: "partage",
          title: "Partage et sous-traitants",
          plain: "Vos données ne sont ni vendues ni louées.",
          body: (
            <p>
              Aucune vente ni location de données. Des prestataires techniques (hébergement de
              l&apos;application et des vidéos) traitent des données pour notre compte, sous contrat
              conforme au RGPD. Les requêtes vers les sources de catalogue (TMDB) et de vidéos
              transitent par nos serveurs ou directement selon les cas ; elles ne portent pas vos
              identifiants Ciné+.
            </p>
          ),
        },
        {
          id: "droits",
          title: "Vos droits (RGPD)",
          plain: "Accès, rectification, effacement, portabilité, opposition — un message suffit.",
          body: (
            <p>
              Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de portabilité,
              de limitation et d&apos;opposition. Exercez-les via la page Contact (motif « Données
              personnelles » / « Autre ») ; réponse sous 30 jours. Avec les comptes, des boutons
              d&apos;export et de suppression directs seront disponibles dans les paramètres. Vous pouvez
              saisir la CNIL en cas de désaccord persistant.
            </p>
          ),
        },
      ]}
    />
  );
}
