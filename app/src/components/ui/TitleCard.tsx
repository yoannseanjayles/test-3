import Image from "next/image";
import Link from "next/link";
import { Badge } from "./Badge";

export interface TitleCardData {
  href: string;
  title: string;
  year?: number;
  posterUrl?: string | null;
  /** Couleur dominante extraite (A6) — fond pendant le chargement et fallback sans affiche. */
  dominantColor?: string;
  isFree?: boolean;
  isNew?: boolean;
}

/**
 * Carte titre 2:3 (D25 §3) : 1 lien englobant, blurhash/couleur en placeholder,
 * hover scale léger (annulé par prefers-reduced-motion via les tokens de durée).
 */
export function TitleCard({ href, title, year, posterUrl, dominantColor = "#241f2b", isFree, isNew }: TitleCardData) {
  return (
    <Link
      href={href}
      className="group block w-36 shrink-0 md:w-44"
      aria-label={year ? `${title} (${year})` : title}
    >
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-(--radius-m) transition-transform duration-(--duration-base) ease-(--ease-enter) motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
        style={{ backgroundColor: dominantColor }}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 176px, 144px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full items-center justify-center font-display text-3xl font-bold text-primary/30"
          >
            {title.charAt(0).toUpperCase()}
          </span>
        )}
        {(isFree || isNew) && (
          <span className="absolute left-1.5 top-1.5 flex gap-1">
            {isFree && <Badge tone="free">Gratuit ▶</Badge>}
            {isNew && <Badge tone="new">Nouveau</Badge>}
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-sm text-primary">{title}</p>
      {year && <p className="text-xs text-secondary">{year}</p>}
    </Link>
  );
}
