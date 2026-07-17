"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

interface Suggestion {
  title: string;
  year: number | null;
  href: string;
  posterUrl: string | null;
  kind: "film" | "serie";
}

/**
 * Recherche instantanée (audit A7) — surcouche client du champ existant :
 * le formulaire GET reste fonctionnel sans JavaScript, ceci n'ajoute que
 * des suggestions au fil de la frappe.
 */
export function InstantSearch({ defaultValue }: { defaultValue: string }) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/recherche?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : { suggestions: [] }))
        .then((data: { suggestions: Suggestion[] }) => {
          setSuggestions(data.suggestions ?? []);
          setOpen((data.suggestions?.length ?? 0) > 0);
        })
        .catch(() => {
          /* requête annulée ou API indisponible : le formulaire GET reste utilisable */
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative max-w-xl">
      <input
        id="q"
        name="q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder="Un titre de film ou de série…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className="h-12 w-full rounded-full border border-white/10 bg-surface-raised px-5 text-primary placeholder:text-secondary focus:border-brand focus:outline-none"
      />
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Suggestions de recherche"
          className="absolute inset-x-0 top-14 z-20 max-h-96 overflow-y-auto rounded-(--radius-m) border border-white/10 bg-surface-raised shadow-lg"
        >
          {suggestions.map((s) => (
            <li key={s.href} role="option" aria-selected={false}>
              <Link
                href={s.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-interactive"
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-surface-overlay">
                  {s.posterUrl && <Image src={s.posterUrl} alt="" fill sizes="40px" className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary">{s.title}</p>
                  <p className="text-xs text-secondary">
                    {s.kind === "film" ? "Film" : "Série"}
                    {s.year ? ` · ${s.year}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <span aria-live="polite" className="sr-only">
        {loading ? "Recherche en cours…" : ""}
      </span>
    </div>
  );
}
