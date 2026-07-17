"use client";

import { useMemo, useState } from "react";

interface QA {
  q: string;
  a: string;
}

/** Filtre au fil de la frappe (audit support-6) — le contenu est déjà rendu, ceci ne fait que le filtrer. */
export function FaqList({ groups }: { groups: { title: string; items: QA[] }[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <>
      <label htmlFor="faq-filter" className="sr-only">
        Filtrer les questions
      </label>
      <input
        id="faq-filter"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filtrer les questions…"
        className="mt-6 h-11 w-full max-w-sm rounded-full border border-white/10 bg-surface-raised px-4 text-sm text-primary placeholder:text-secondary focus:border-brand focus:outline-none"
      />

      {filtered.length === 0 && <p className="mt-8 text-sm text-secondary">Aucune question ne correspond — essayez un autre mot.</p>}

      {filtered.map((group) => (
        <section key={group.title} aria-label={group.title} className="mt-8">
          <h2 className="text-lg font-bold text-brand">{group.title}</h2>
          <div className="mt-3 space-y-2">
            {group.items.map((item) => (
              <details key={item.q} className="group rounded-(--radius-m) bg-surface-raised px-5 py-4 open:pb-5">
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="mr-2 inline-block text-brand transition-transform duration-(--duration-fast) group-open:rotate-90">
                    ›
                  </span>
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
