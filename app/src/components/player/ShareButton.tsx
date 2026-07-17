"use client";

import { useState } from "react";

/**
 * Partage (lecture-7) : Web Share API si disponible, sinon copie du lien
 * dans le presse-papiers avec confirmation visuelle — jamais d'échec silencieux.
 */
export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* partage annulé ou indisponible : repli sur la copie ci-dessous */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* presse-papiers bloqué : rien à faire de plus côté client */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex h-10 items-center gap-1.5 rounded-full bg-surface-raised px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
    >
      {copied ? "Lien copié ✓" : "↗ Partager"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Lien copié dans le presse-papiers" : ""}
      </span>
    </button>
  );
}
