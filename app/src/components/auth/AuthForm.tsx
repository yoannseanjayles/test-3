"use client";

import { useActionState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/lib/auth/actions";

/**
 * Formulaire connexion/inscription (D19 Auth) — server actions, fonctionne
 * sans JS (POST natif) ; erreurs annoncées en aria-live. Honeypot `website`.
 */

const inputClass =
  "h-12 w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 text-primary placeholder:text-secondary focus:border-brand focus:outline-none";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    mode === "login" ? loginAction : registerAction,
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {mode === "register" && (
        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium">
            Nom affiché <span className="text-secondary">(facultatif)</span>
          </label>
          <input id="displayName" name="displayName" maxLength={60} autoComplete="nickname" className={inputClass} />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Adresse e-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Mot de passe {mode === "register" && <span className="text-secondary">(8 caractères min.)</span>}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className={inputClass}
        />
      </div>
      {/* Honeypot anti-bot (D13) — invisible pour les humains */}
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
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-7 font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent) disabled:pointer-events-none disabled:opacity-45"
      >
        {pending ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
    </form>
  );
}
