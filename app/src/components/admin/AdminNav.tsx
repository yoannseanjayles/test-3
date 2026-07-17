"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminNavItem {
  href: string;
  label: string;
  badge?: number;
}

/** Navigation back-office (audit admin-7) — lien actif surligné, badges de compteurs. */
export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation back-office" className="mt-3">
      <ul className="flex flex-wrap gap-1 md:flex-col">
        {items.map(({ href, label, badge }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-(--duration-fast) ${
                  active ? "bg-surface-raised font-medium text-primary" : "text-secondary hover:bg-surface-raised hover:text-primary"
                }`}
              >
                {label}
                {Boolean(badge) && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-xs font-medium text-on-brand">{badge}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
