import Link from "next/link";

export interface FilterOption {
  label: string;
  href: string;
  active: boolean;
}

/** Rangée de chips de filtre en liens GET (D19 facettes) — aucune dépendance JS, ISR préservé. */
export function FilterChips({ label, options }: { label: string; options: FilterOption[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">{label}</span>
      {options.map((opt) => (
        <Link
          key={opt.href}
          href={opt.href}
          aria-current={opt.active ? "page" : undefined}
          className={`inline-flex h-9 items-center rounded-full px-4 text-sm transition-colors duration-(--duration-fast) ${
            opt.active
              ? "bg-brand font-medium text-on-brand"
              : "bg-surface-raised text-secondary hover:bg-surface-interactive hover:text-primary"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
