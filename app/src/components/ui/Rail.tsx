import Link from "next/link";

/**
 * Rail horizontal (D25 §3, D1) : region nommée, scroll-snap, « Voir tout » obligatoire (D1 n°4).
 * Le scroll clavier fonctionne nativement (conteneur focusable, cartes tabbables).
 */
export function Rail({
  title,
  seeAllHref,
  explanation,
  children,
}: {
  title: string;
  /** Chaque rail pointe vers une vraie page grille (D1). */
  seeAllHref?: string;
  /** Libellé explicable : « Parce que vous avez ajouté X » (D1 n°4). */
  explanation?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="mt-10 first:mt-0">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          {explanation && <p className="mt-0.5 text-sm text-secondary">{explanation}</p>}
        </div>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="shrink-0 text-sm text-link transition-colors duration-(--duration-fast) hover:text-brand"
          >
            Voir tout
          </Link>
        )}
      </div>
      <div className="-mx-4 overflow-x-auto px-4 md:-mx-6 md:px-6" tabIndex={0} role="group" aria-label={`${title} — défilement horizontal`}>
        <div className="flex snap-x snap-mandatory gap-4 pb-2 *:snap-start">{children}</div>
      </div>
    </section>
  );
}
