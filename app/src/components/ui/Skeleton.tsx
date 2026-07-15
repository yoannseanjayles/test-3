/** Placeholder de chargement — shimmer subtil, ratio réservé par le parent (CLS 0, D1). */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-(--radius-m) bg-surface-raised ${className}`}
    />
  );
}

/** Rangée de cartes squelettes pour les rails (état chargement — D14 §7). */
export function SkeletonRail({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-36 shrink-0 md:w-44">
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
