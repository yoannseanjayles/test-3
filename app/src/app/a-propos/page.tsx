import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Ciné+ aide à trouver le bon film ou la bonne série en moins de deux minutes — et propose des classiques à regarder gratuitement et légalement.",
};

/** À propos (D19 Support §3) — mission, attributions obligatoires TMDB/JustWatch (D5 §3.3). */
export default function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">À propos de Ciné+</h1>

      <p className="mt-6 leading-relaxed text-secondary">
        <strong className="text-primary">Notre mission :</strong> vous faire passer moins de temps à
        chercher et plus de temps à regarder. Ciné+ réunit un catalogue complet de films et de séries,
        vous dit où chaque titre est disponible, et propose une sélection de classiques à regarder
        immédiatement, gratuitement et légalement — le tout rapide, accessible et sans friction.
      </p>

      <section aria-label="Le catalogue gratuit" className="mt-10">
        <h2 className="text-xl font-bold">Le catalogue gratuit, d&apos;où vient-il ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Des œuvres du <strong className="text-primary">domaine public</strong> (les droits ont expiré,
          notamment via Internet Archive) et des <strong className="text-primary">open movies</strong> de
          la fondation Blender diffusés sous licence Creative Commons. Chaque page de lecture affiche la
          licence et l&apos;attribution de l&apos;œuvre. À terme, cette sélection accueillera aussi les
          vidéos de créateurs de la communauté, après modération.
        </p>
      </section>

      <section aria-label="Attributions" className="mt-10 rounded-(--radius-l) bg-surface-raised p-6">
        <h2 className="text-xl font-bold">Nos sources de données</h2>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-secondary">
          <li>
            <strong className="text-primary">TMDB</strong> — les métadonnées et visuels de films et séries
            proviennent de{" "}
            <a href="https://www.themoviedb.org" rel="noopener" target="_blank" className="text-link underline hover:text-brand">
              The Movie Database
            </a>
            . <em>This product uses the TMDB API but is not endorsed or certified by TMDB.</em>
          </li>
          <li>
            <strong className="text-primary">JustWatch</strong> — les disponibilités « Où regarder »
            (plateformes de streaming) sont fournies par JustWatch via TMDB.
          </li>
        </ul>
      </section>

      <section aria-label="Nous contacter" className="mt-10">
        <h2 className="text-xl font-bold">Une question, un projet ?</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Utilisateurs, ayants droit ou annonceurs : la porte est la même —{" "}
          <Link href="/contact" className="text-link underline hover:text-brand">
            le formulaire de contact
          </Link>
          . Les demandes de retrait d&apos;ayants droit sont traitées en priorité.
        </p>
      </section>
    </div>
  );
}
