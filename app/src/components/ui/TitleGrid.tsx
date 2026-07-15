import Link from "next/link";
import { TitleCard } from "./TitleCard";
import type { Title } from "@/lib/tmdb/models";

/** Grille responsive d'affiches (pages catalogue/recherche — D19 grilles). */
export function TitleGrid({ titles }: { titles: Title[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {titles.map((t) => (
        <li key={`${t.kind}-${t.id}`} className="[&>a]:w-full">
          <TitleCard href={t.href} title={t.title} year={t.year ?? undefined} posterUrl={t.posterUrl} />
        </li>
      ))}
    </ul>
  );
}

/** Pagination précédent/suivant par lien (SEO-friendly, pas de JS requis). */
export function Pagination({
  basePath,
  page,
  totalPages,
  extraParams = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(extraParams);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass =
    "inline-flex h-10 items-center rounded-full border border-white/10 px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:border-brand hover:text-brand";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          ← Page précédente
        </Link>
      )}
      <span className="text-sm text-secondary">
        Page {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          Page suivante →
        </Link>
      )}
    </nav>
  );
}
