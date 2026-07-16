"use client";

/** Rouvre le bandeau de consentement (page /cookies — D6/TCF). */
export function ManageConsentButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("cineplus:reopen-consent"))}
      className="mt-2 inline-flex h-11 items-center rounded-full bg-surface-raised px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
    >
      Gérer mes préférences
    </button>
  );
}
