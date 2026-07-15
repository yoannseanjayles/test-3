import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/** Navigation globale desktop — 6 entrées (D10 §1). En mobile, la BottomNav prend le relais. */
const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/films", label: "Films" },
  { href: "/series", label: "Séries" },
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/gratuit", label: "Gratuit ▶" },
  { href: "/ma-liste", label: "Ma liste" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-100 border-b border-subtle bg-surface-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:h-16 md:px-6">
        <Link href="/" aria-label="Ciné+ — Accueil" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-md px-3 py-2 text-sm text-secondary transition-colors duration-(--duration-fast) hover:bg-surface-raised hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/recherche"
            aria-label="Rechercher (raccourci : /)"
            className="flex size-10 items-center justify-center rounded-full text-secondary transition-colors duration-(--duration-fast) hover:bg-surface-raised hover:text-primary"
          >
            <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <Link
            href="/connexion"
            className="hidden rounded-full bg-surface-raised px-4 py-2 text-sm font-medium text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive md:block"
          >
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}
