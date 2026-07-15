import type { Metadata } from "next";
import { MaListeClient } from "./MaListeClient";

export const metadata: Metadata = {
  title: "Ma liste",
  description: "Vos favoris, vos visionnages en cours et votre historique.",
  robots: { index: false },
};

/** Ma liste — page privée (noindex), état rendu côté client depuis le store local. */
export default function MaListePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">Ma liste</h1>
      <p className="mt-1 text-sm text-secondary">
        Conservée sur cet appareil pour l&apos;instant — elle vous suivra partout dès l&apos;arrivée des comptes.
      </p>
      <div className="mt-8">
        <MaListeClient />
      </div>
    </div>
  );
}
