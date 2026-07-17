import Link from "next/link";
import { GENRES } from "@/lib/tmdb/models";

const CATALOGUE_LINKS = [
  { href: "/films", label: "Films" },
  { href: "/series", label: "Séries" },
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/tendances", label: "Tendances" },
  { href: "/nouveautes", label: "Nouveautés" },
  { href: "/gratuit", label: "Gratuit ▶" },
] as const;

const POPULAR_GENRES = GENRES.slice(0, 6);

const ABOUT_LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/studio", label: "Studio créateurs" },
] as const;

const LEGAL_LINKS = [
  { href: "/cgu", label: "CGU" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
  { href: "/mentions-legales", label: "Mentions légales" },
] as const;

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-primary">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="text-sm text-secondary transition-colors duration-(--duration-fast) hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-subtle">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <nav aria-label="Liens de bas de page" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <FooterColumn title="Catalogue" links={CATALOGUE_LINKS} />
          <FooterColumn title="Genres populaires" links={POPULAR_GENRES.map((g) => ({ href: `/genre/${g.slug}`, label: g.label }))} />
          <FooterColumn title="À propos" links={ABOUT_LINKS} />
          <FooterColumn title="Légal" links={LEGAL_LINKS} />
        </nav>

        {/* Attributions obligatoires — D5 §3.3 */}
        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-secondary">
          Ce produit utilise l&apos;API TMDB sans être approuvé ni certifié par TMDB. Les
          données de disponibilité en streaming sont fournies par JustWatch. Les contenus du
          catalogue gratuit proviennent du domaine public, de licences ouvertes ou de leurs
          créateurs — la source et la licence sont indiquées sur chaque fiche.
        </p>
        <p className="mt-4 text-xs text-secondary">© 2026 Ciné+</p>
      </div>
    </footer>
  );
}
