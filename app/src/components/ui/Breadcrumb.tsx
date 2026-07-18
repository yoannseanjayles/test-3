import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

/**
 * Fil d'Ariane (D15 §12, audit transversal) : « Accueil » implicite en tête,
 * dernier élément = page courante (sans lien, aria-current).
 * `breadcrumbJsonLd` produit le BreadcrumbList schema.org correspondant.
 */

export interface Crumb {
  label: string;
  /** Absent pour le dernier élément (page courante). */
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-sm text-secondary">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li>
          <Link href="/" className="transition-colors hover:text-primary">
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <span aria-hidden>›</span>
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-primary">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: Crumb[]) {
  const all: Crumb[] = [{ label: "Accueil", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}
