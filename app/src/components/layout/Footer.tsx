import Link from "next/link";

const LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/cgu", label: "CGU" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
  { href: "/mentions-legales", label: "Mentions légales" },
] as const;

export function Footer() {
  return (
    <footer className="mt-16 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <nav aria-label="Liens de bas de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition-colors duration-(--duration-fast) hover:text-primary">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Attributions obligatoires — D5 §3.3 */}
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-disabled">
          Ce produit utilise l&apos;API TMDB sans être approuvé ni certifié par TMDB. Les
          données de disponibilité en streaming sont fournies par JustWatch. Les contenus du
          catalogue gratuit proviennent du domaine public, de licences ouvertes ou de leurs
          créateurs — la source et la licence sont indiquées sur chaque fiche.
        </p>
        <p className="mt-4 text-xs text-disabled">© 2026 Ciné+</p>
      </div>
    </footer>
  );
}
