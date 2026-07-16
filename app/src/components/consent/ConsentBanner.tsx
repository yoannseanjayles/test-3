"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * CMP maison v1 (6.2 §4 — dormante tant que la pub est OFF) :
 * bandeau « Accepter / Refuser » symétriques (règle CNIL) + lien détail.
 * Choix stocké en localStorage 6 mois ; ré-ouvrable depuis /cookies
 * (événement `cineplus:reopen-consent`). Bascule CMP IAB au palier P-3.
 */

const STORAGE_KEY = "cineplus.consent.v1";
const SIX_MONTHS_MS = 182 * 24 * 3600 * 1000;

interface Consent {
  ads: boolean;
  ts: number;
}

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (Date.now() - parsed.ts > SIX_MONTHS_MS) return null; // choix expiré → redemander
    return parsed;
  } catch {
    return null;
  }
}

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      fetch("/api/flags-status")
        .then((r) => (r.ok ? r.json() : { ads: false }))
        .then(({ ads }) => {
          if (!cancelled && ads && !readConsent()) setVisible(true);
        })
        .catch(() => {});
    };
    check();
    const reopen = () => {
      window.localStorage.removeItem(STORAGE_KEY);
      check();
    };
    window.addEventListener("cineplus:reopen-consent", reopen);
    return () => {
      cancelled = true;
      window.removeEventListener("cineplus:reopen-consent", reopen);
    };
  }, []);

  if (!visible) return null;

  const choose = (ads: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ads, ts: Date.now() } satisfies Consent));
    } catch {
      /* stockage bloqué : le bandeau réapparaîtra */
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Consentement publicitaire"
      className="fixed inset-x-0 bottom-0 z-200 border-t border-white/10 bg-surface-overlay/95 p-4 backdrop-blur-md md:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 md:flex-row md:items-center">
        <p className="flex-1 text-sm leading-relaxed text-secondary">
          <strong className="text-primary">Publicité sur Ciné+.</strong> Nous affichons des
          publicités pour financer le service gratuit. Acceptez-vous les cookies publicitaires ?
          Votre refus ne limite en rien l&apos;accès au site.{" "}
          <Link href="/cookies" className="underline hover:text-brand">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose(false)}
            className="inline-flex h-11 items-center rounded-full bg-surface-raised px-5 text-sm font-medium text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
