"use client";

import { useEffect, useRef } from "react";
import { useSessionLite } from "@/components/auth/useSessionLite";
import { syncLibraryAction } from "@/lib/library/actions";
import { replaceLibrary, useLibrary } from "@/lib/library/store";

/**
 * Synchro Ma liste (H70/H87) — monté globalement (layout) : dès qu'une session
 * existe, pousse l'état local, récupère l'état consolidé du serveur et le
 * réinjecte dans le store. Une synchro par chargement de page (garde-fou ref),
 * re-déclenchée quand la bibliothèque locale change (debounce 5 s).
 */
export function LibrarySync({ enabled }: { enabled: boolean }) {
  const { user } = useSessionLite(enabled);
  const library = useLibrary();
  const syncing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushed = useRef<string>("");

  useEffect(() => {
    if (!user?.id) return;
    const payload = JSON.stringify(library);
    if (payload === lastPushed.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (syncing.current) return;
      syncing.current = true;
      try {
        const result = await syncLibraryAction(library);
        if ("state" in result) {
          lastPushed.current = JSON.stringify(result.state);
          replaceLibrary(result.state);
        }
      } catch {
        // Hors ligne ou serveur indisponible : l'état local reste la référence.
      } finally {
        syncing.current = false;
      }
    }, lastPushed.current ? 5000 : 250);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user?.id, library]);

  return null;
}
