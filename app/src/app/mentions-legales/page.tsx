import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeurs et contacts du service Ciné+.",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="15 juillet 2026"
      sections={[
        {
          id: "editeur",
          title: "Éditeur",
          body: (
            <p>
              Le service Ciné+ est édité dans le cadre d&apos;un projet en cours de constitution.
              Les informations d&apos;identification de l&apos;éditeur (dénomination, siège, directeur de
              publication) seront complétées avant l&apos;ouverture publique du service. Contact :
              via la page Contact du site.
            </p>
          ),
        },
        {
          id: "hebergement",
          title: "Hébergement",
          body: (
            <>
              <p>
                <strong>Application</strong> : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
                États-Unis — vercel.com.
              </p>
              <p>
                <strong>Vidéos du catalogue gratuit</strong> : les œuvres sont diffusées depuis leurs
                sources d&apos;origine (Internet Archive — archive.org ; fondation Blender). L&apos;infrastructure
                vidéo propre au service (encodage et diffusion) sera documentée ici à sa mise en service.
              </p>
            </>
          ),
        },
        {
          id: "signalement",
          title: "Signalement et retrait",
          body: (
            <p>
              Tout contenu estimé illicite ou contrefaisant peut être signalé via la page Contact
              (motifs « Signaler un contenu » ou « Ayants droit / demande de retrait »). Les demandes
              d&apos;ayants droit font l&apos;objet d&apos;une procédure de retrait prioritaire.
            </p>
          ),
        },
      ]}
    />
  );
}
