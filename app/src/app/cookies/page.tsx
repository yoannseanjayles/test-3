import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Les cookies et stockages utilisés par Ciné+, catégorie par catégorie, et la gestion de vos préférences.",
};

const ROWS = [
  {
    name: "cineplus.library.v1",
    type: "localStorage",
    category: "Essentiel",
    purpose: "Votre liste (favoris, en cours, historique) et vos positions de reprise",
    duration: "Jusqu'à effacement par vos soins",
  },
  {
    name: "cineplus.preroll.*",
    type: "sessionStorage",
    category: "Essentiel",
    purpose: "Plafonner la publicité vidéo (au plus 1 pré-roll par titre et par session)",
    duration: "Fin de session de navigation",
  },
  {
    name: "Consentement (CMP)",
    type: "cookie",
    category: "Essentiel",
    purpose: "Mémoriser vos choix de consentement — déposé uniquement à l'activation de la publicité",
    duration: "6 mois",
  },
  {
    name: "Mesure d'audience",
    type: "cookie",
    category: "Analytics (sous consentement)",
    purpose: "Statistiques d'usage anonymisées — aucun déploiement sans votre accord",
    duration: "13 mois max",
  },
  {
    name: "Publicité",
    type: "cookie",
    category: "Publicité (sous consentement)",
    purpose: "Capping et mesure des campagnes — aucun déploiement sans votre accord",
    duration: "Selon partenaire (affiché dans le CMP)",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies et stockages"
      updatedAt="15 juillet 2026"
      intro="Aujourd'hui, Ciné+ ne dépose aucun cookie tiers : tout ce qui est stocké l'est sur votre appareil, pour votre confort."
      sections={[
        {
          id: "inventaire",
          title: "Inventaire",
          plain: "Deux stockages locaux essentiels aujourd'hui ; les cookies analytics et publicité n'arriveront qu'avec votre consentement.",
          body: (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-secondary">
                    <th className="py-2 pr-4">Nom</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Catégorie</th>
                    <th className="py-2 pr-4">Finalité</th>
                    <th className="py-2">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.name} className="border-b border-white/5 align-top">
                      <td className="py-3 pr-4 font-mono text-xs text-primary">{row.name}</td>
                      <td className="py-3 pr-4">{row.type}</td>
                      <td className="py-3 pr-4">{row.category}</td>
                      <td className="py-3 pr-4">{row.purpose}</td>
                      <td className="py-3">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: "preferences",
          title: "Gérer mes préférences",
          plain: "Le module de consentement (CMP) s'affichera dès l'activation de la publicité ou de l'analytics — ce bouton le rouvrira à tout moment.",
          body: (
            <>
              <p>
                La publicité et la mesure d&apos;audience étant actuellement désactivées, aucun
                consentement n&apos;est requis aujourd&apos;hui. Dès leur activation, un module de gestion
                du consentement (conforme TCF) s&apos;affichera à la première visite, et le bouton
                ci-dessous permettra de modifier vos choix à tout moment.
              </p>
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="S'activera avec la publicité / l'analytics"
                className="mt-2 inline-flex h-11 items-center rounded-full bg-surface-raised px-5 text-sm text-primary opacity-45"
              >
                Gérer mes préférences — bientôt actif
              </button>
            </>
          ),
        },
      ]}
    />
  );
}
