"use client";

import { useEffect, useState } from "react";

/**
 * Lecture légère de la session côté client (6.1 Lot 2) — via l'endpoint
 * Auth.js `/api/auth/session`, pour garder les pages statiques (pas de
 * lecture de cookies au rendu serveur). SWR/TanStack inutiles à cette échelle.
 */

export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export function useSessionLite(enabled = true): { user: SessionUser | null; loaded: boolean } {
  const [state, setState] = useState<{ user: SessionUser | null; loaded: boolean }>({
    user: null,
    loaded: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setState({ user: data?.user ?? null, loaded: true });
      })
      .catch(() => {
        if (!cancelled) setState({ user: null, loaded: true });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
