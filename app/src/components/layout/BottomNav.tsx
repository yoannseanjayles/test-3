import Link from "next/link";

/** Bottom tab bar mobile — 5 items (D10 §1). Masquée à partir de md. */
const TABS = [
  { href: "/", label: "Accueil", icon: "M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" },
  { href: "/decouvrir", label: "Découvrir", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z" },
  { href: "/gratuit", label: "Gratuit", icon: "M5 4.5v15l14-7.5-14-7.5Z" },
  { href: "/recherche", label: "Recherche", icon: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-3.5-3.5" },
  { href: "/ma-liste", label: "Ma liste", icon: "M12 21s-7.5-4.8-9.5-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.5 12c-2 4.2-9.5 9-9.5 9Z" },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-100 border-t border-subtle bg-surface-base/95 backdrop-blur-md md:hidden"
    >
      <ul className="flex h-16 items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ href, label, icon }) => (
          <li key={href} className="flex flex-1">
            <Link
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] text-secondary transition-colors duration-(--duration-fast) hover:text-primary"
            >
              <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
