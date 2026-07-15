import Link from "next/link";

/**
 * Gabarit des pages légales (D19 Support & légal) : sommaire ancré,
 * « Dernière mise à jour », résumé non-juridique en tête de section.
 * H46 : les clauses finales devront être validées par un juriste avant
 * production publique — signalé au Project Overview.
 */

export interface LegalSection {
  id: string;
  title: string;
  /** Résumé en langage clair (le texte juridique reste faisant foi). */
  plain?: string;
  body: React.ReactNode;
}

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-secondary">Dernière mise à jour : {updatedAt}</p>
      {intro && <p className="mt-4 leading-relaxed text-secondary">{intro}</p>}

      <nav aria-label="Sommaire" className="mt-6 rounded-(--radius-l) bg-surface-raised p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Sommaire</p>
        <ol className="mt-2 space-y-1 text-sm">
          {sections.map((s, i) => (
            <li key={s.id}>
              <Link href={`#${s.id}`} className="text-link hover:text-brand">
                {i + 1}. {s.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {sections.map((s, i) => (
        <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-24">
          <h2 id={`${s.id}-h`} className="text-xl font-bold">
            {i + 1}. {s.title}
          </h2>
          {s.plain && (
            <p className="mt-2 rounded-(--radius-m) border-l-2 border-brand bg-surface-raised px-4 py-3 text-sm leading-relaxed text-secondary">
              <strong className="text-primary">En clair :</strong> {s.plain}
            </p>
          )}
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-secondary [&_strong]:text-primary">{s.body}</div>
        </section>
      ))}

      <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-relaxed text-secondary">
        Document de travail : la structure et le contenu sont livrés au titre de la Phase 5 ;
        les clauses définitives seront validées juridiquement avant l&apos;ouverture publique du service.
        Une question ? <Link href="/contact" className="underline hover:text-brand">Contactez-nous</Link>.
      </p>
    </div>
  );
}
