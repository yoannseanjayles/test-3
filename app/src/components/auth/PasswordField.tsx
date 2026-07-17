"use client";

import { useId, useState } from "react";

const inputClass =
  "h-12 w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 pr-12 text-primary placeholder:text-secondary focus:border-brand focus:outline-none";

/** Estimation locale simple (longueur + variété de caractères) — aucune bibliothèque, aucun calcul serveur. */
function estimateStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const clamped = Math.min(score, 3) as 0 | 1 | 2 | 3;
  const label = ["Trop court", "Faible", "Correct", "Robuste"][clamped];
  return { score: clamped, label };
}

const BAR_COLORS = ["bg-red-500/70", "bg-orange-400/70", "bg-brand"];

export function PasswordField({
  id,
  name,
  label,
  required,
  minLength,
  autoComplete,
  showStrength = false,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  /** Affiche la jauge de robustesse (inscription, changement de mot de passe) — pas à la connexion. */
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const strength = showStrength ? estimateStrength(value) : null;
  const hintId = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={showStrength ? hintId : undefined}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-secondary transition-colors hover:text-primary"
        >
          {visible ? "🙈" : "👁"}
        </button>
      </div>
      {showStrength && value.length > 0 && (
        <div id={hintId} className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className={`h-1 flex-1 rounded-full ${i < strength!.score ? BAR_COLORS[strength!.score - 1] : "bg-surface-overlay"}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-secondary">{strength!.label}</p>
        </div>
      )}
    </div>
  );
}
