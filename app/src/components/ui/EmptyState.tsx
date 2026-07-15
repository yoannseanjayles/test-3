import Image from "next/image";
import Link from "next/link";

/**
 * État vide (D13 §5 / D25 §3) : illustration B3 + message + UNE action.
 * Ton : invitation, jamais culpabilisant (D25 §5).
 */
export function EmptyState({
  illustration,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  /** Chemin public d'une illustration B3/B4 (ex. /media/interface/empty-favorites.jpg). */
  illustration: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
      <Image src={illustration} alt="" width={200} height={200} className="rounded-(--radius-l)" />
      <h2 className="mt-6 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-secondary">{description}</p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent)"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
