"use client";

import { useActionState, useState } from "react";
import { submitContactAction, type ContactFormState } from "@/lib/support/actions";

const MOTIFS = [
  "Question",
  "Bug",
  "Signaler un contenu",
  "Ayants droit / demande de retrait",
  "Annonceurs",
  "Autre",
] as const;

const TAKEDOWN = "Ayants droit / demande de retrait";

const inputClass =
  "h-12 w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 text-primary placeholder:text-secondary focus:border-brand focus:outline-none";

/** Formulaire de contact actif (Lot 2) — champs takedown affichés selon le motif (D11). */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(submitContactAction, {});
  const [motif, setMotif] = useState<string>(MOTIFS[0]);

  if (state.ok) {
    return (
      <div role="status" className="mt-8 rounded-(--radius-l) bg-surface-raised p-6">
        <p className="font-bold">Message bien reçu ✅</p>
        <p className="mt-1 text-sm leading-relaxed text-secondary">
          Nous revenons vers vous sous 72 h à l&apos;adresse indiquée.
          {motif === TAKEDOWN && " Les demandes d'ayants droit sont traitées en priorité."}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="motif" className="mb-1.5 block text-sm font-medium">
          Motif
        </label>
        <select id="motif" name="motif" value={motif} onChange={(e) => setMotif(e.target.value)} className={inputClass}>
          {MOTIFS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {motif === TAKEDOWN && (
        <div className="space-y-5 rounded-(--radius-l) border-l-2 border-brand bg-surface-raised p-4">
          <p className="text-sm leading-relaxed text-secondary">
            Procédure de retrait prioritaire : merci de préciser le contenu visé et votre qualité.
          </p>
          <div>
            <label htmlFor="takedownUrl" className="mb-1.5 block text-sm font-medium">
              URL du contenu concerné
            </label>
            <input id="takedownUrl" name="takedownUrl" type="url" placeholder="https://…" className={inputClass} />
          </div>
          <div>
            <label htmlFor="takedownRole" className="mb-1.5 block text-sm font-medium">
              Votre qualité (titulaire des droits, mandataire…)
            </label>
            <input id="takedownRole" name="takedownRole" className={inputClass} />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Votre e-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" className={inputClass} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={10}
          placeholder="Décrivez votre demande — pour un bug : la page, l'appareil et ce qui s'est passé."
          className="w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 py-3 text-primary placeholder:text-secondary focus:border-brand focus:outline-none"
        />
      </div>

      {/* Honeypot anti-bot (D13) */}
      <div className="sr-only" aria-hidden>
        <label htmlFor="website">Ne pas remplir</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-400">
        {state.error}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent) disabled:pointer-events-none disabled:opacity-45"
      >
        {pending ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
