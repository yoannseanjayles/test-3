"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSessionLite } from "@/components/auth/useSessionLite";
import {
  changePasswordAction,
  deleteMyAccountAction,
  setEmailOptOutAction,
  type AccountFormState,
} from "@/lib/account/actions";

const inputClass =
  "h-12 w-full rounded-(--radius-m) border border-white/10 bg-surface-raised px-4 text-primary placeholder:text-secondary focus:border-brand focus:outline-none";

function Status({ state }: { state: AccountFormState }) {
  return (
    <p role="status" aria-live="polite" className="min-h-5 text-sm">
      {state.error ? <span className="text-red-400">{state.error}</span> : <span className="text-brand">{state.ok}</span>}
    </p>
  );
}

export function ParametresClient({ authEnabled }: { authEnabled: boolean }) {
  const { user, loaded } = useSessionLite(authEnabled);
  const [pwdState, pwdAction, pwdPending] = useActionState(changePasswordAction, {});
  const [optState, optAction] = useActionState(setEmailOptOutAction, {});
  const [delState, delAction, delPending] = useActionState(deleteMyAccountAction, {});

  if (!authEnabled || (loaded && !user)) {
    return (
      <div className="mt-6 rounded-(--radius-l) bg-surface-raised p-5 text-sm leading-relaxed text-secondary">
        {authEnabled ? (
          <>
            <Link href="/connexion" className="text-link underline hover:text-brand">Connectez-vous</Link> pour
            gérer votre compte.
          </>
        ) : (
          <>Les comptes ne sont pas encore ouverts — vos réglages arriveront avec eux.</>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      <section aria-label="Mot de passe" className="rounded-(--radius-l) bg-surface-raised p-6">
        <h2 className="text-lg font-bold">Changer de mot de passe</h2>
        <form action={pwdAction} className="mt-4 max-w-sm space-y-4">
          <div>
            <label htmlFor="current" className="mb-1.5 block text-sm font-medium">Mot de passe actuel</label>
            <input id="current" name="current" type="password" required autoComplete="current-password" className={inputClass} />
          </div>
          <div>
            <label htmlFor="next" className="mb-1.5 block text-sm font-medium">
              Nouveau mot de passe <span className="text-secondary">(8 caractères min.)</span>
            </label>
            <input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
          </div>
          <Status state={pwdState} />
          <button
            type="submit"
            disabled={pwdPending}
            className="inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover disabled:opacity-45"
          >
            Mettre à jour
          </button>
        </form>
      </section>

      <section aria-label="Notifications" className="rounded-(--radius-l) bg-surface-raised p-6">
        <h2 className="text-lg font-bold">Notifications par e-mail</h2>
        <p className="mt-1 text-sm text-secondary">
          Les notifications dans l&apos;application (cloche) restent toujours actives.
        </p>
        <div className="mt-4 flex gap-2">
          {[
            { value: "false", label: "E-mails activés" },
            { value: "true", label: "E-mails désactivés" },
          ].map((opt) => (
            <form key={opt.value} action={optAction}>
              <input type="hidden" name="optOut" value={opt.value} />
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-full bg-surface-overlay px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
              >
                {opt.label}
              </button>
            </form>
          ))}
        </div>
        <div className="mt-2"><Status state={optState} /></div>
      </section>

      <section aria-label="Mes données" className="rounded-(--radius-l) bg-surface-raised p-6">
        <h2 className="text-lg font-bold">Mes données (RGPD)</h2>
        <p className="mt-1 text-sm leading-relaxed text-secondary">
          Exportez tout ce que Ciné+ connaît de votre compte (listes, vidéos, notifications) en JSON.
        </p>
        <a
          href="/api/me/export"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-surface-overlay px-6 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
        >
          ⬇ Exporter mes données
        </a>
      </section>

      <section aria-label="Supprimer mon compte" className="rounded-(--radius-l) border border-red-500/25 bg-surface-raised p-6">
        <h2 className="text-lg font-bold text-red-300">Supprimer mon compte</h2>
        <p className="mt-1 text-sm leading-relaxed text-secondary">
          Irréversible : listes et notifications effacées immédiatement. Vos vidéos publiées restent
          en catalogue (licence de diffusion déclarée) mais ne sont plus rattachées à vous.
          Confirmez avec votre mot de passe.
        </p>
        <form action={delAction} className="mt-4 flex max-w-sm flex-col gap-3">
          <label htmlFor="password" className="sr-only">Mot de passe</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Votre mot de passe" className={inputClass} />
          <Status state={delState} />
          <button
            type="submit"
            disabled={delPending}
            className="inline-flex h-11 w-fit items-center rounded-full bg-red-500/20 px-6 text-sm font-medium text-red-300 transition-colors duration-(--duration-fast) hover:bg-red-500/35 disabled:opacity-45"
          >
            Supprimer définitivement mon compte
          </button>
        </form>
      </section>
    </div>
  );
}
