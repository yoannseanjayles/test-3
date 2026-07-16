"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSessionLite } from "@/components/auth/useSessionLite";
import {
  createUploadAction,
  finalizeUploadAction,
  listMyVideosAction,
  type MyVideo,
} from "@/lib/studio/actions";

/**
 * Dépôt Studio (D8/D11, Lot 3) : formulaire → URL présignée → PUT direct
 * navigateur → R2 (progression affichée) → déclenchement de l'encodage.
 * La vidéo part ensuite en modération (a priori — D11) : statut visible
 * dans « Mes vidéos ». Les garde-fous sont ré-appliqués côté serveur.
 */

const LICENCES = [
  "CC BY 4.0",
  "CC BY-SA 4.0",
  "CC0 / Domaine public",
  "Tous droits réservés (diffusion Ciné+)",
] as const;

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  uploading: "Envoi à reprendre",
  processing: "Encodage en cours",
  pending_review: "En modération",
  published: "Publiée ✅",
  rejected: "Refusée",
  removed: "Retirée",
};

const inputClass =
  "w-full rounded-(--radius-m) border border-white/10 bg-surface-overlay px-4 py-3 text-primary placeholder:text-secondary focus:border-brand focus:outline-none";

type Phase = "idle" | "uploading" | "done" | "error";

export function UploadForm({ authEnabled }: { authEnabled: boolean }) {
  const { user, loaded } = useSessionLite(authEnabled);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>("");
  const [mine, setMine] = useState<MyVideo[]>([]);

  useEffect(() => {
    if (user?.id) listMyVideosAction().then(setMine).catch(() => {});
  }, [user?.id, phase]);

  if (!authEnabled || (loaded && !user)) {
    return (
      <div className="mt-4 rounded-(--radius-l) bg-surface-raised p-5 text-sm leading-relaxed text-secondary">
        {authEnabled ? (
          <>
            <Link href="/connexion" className="text-link underline hover:text-brand">Connectez-vous</Link> pour
            déposer une vidéo.
          </>
        ) : (
          <>Le dépôt s&apos;activera avec l&apos;ouverture des comptes (raccordement en cours).</>
        )}
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file") as File | null;
    if (!file || file.size === 0) {
      setMessage("Choisissez un fichier vidéo.");
      setPhase("error");
      return;
    }

    setPhase("uploading");
    setProgress(0);
    setMessage("");

    const created = await createUploadAction({
      title: String(data.get("title") ?? ""),
      overview: String(data.get("overview") ?? ""),
      licence: String(data.get("licence") ?? ""),
      rightsDeclaration: String(data.get("rightsDeclaration") ?? ""),
      fileName: file.name,
      fileType: file.type || "video/mp4",
      fileSize: file.size,
    });
    if (created.error || !created.uploadUrl || !created.videoId) {
      setMessage(created.error ?? "Création impossible.");
      setPhase("error");
      return;
    }

    // PUT direct navigateur → R2, avec progression (XHR : fetch ne l'expose pas).
    const uploaded = await new Promise<boolean>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", created.uploadUrl as string);
      xhr.setRequestHeader("content-type", file.type || "video/mp4");
      xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
      xhr.onerror = () => resolve(false);
      xhr.send(file);
    });
    if (!uploaded) {
      setMessage("L'envoi du fichier a échoué — vérifiez votre connexion et réessayez.");
      setPhase("error");
      return;
    }

    const finalized = await finalizeUploadAction(created.videoId);
    if (finalized.error) {
      setMessage(finalized.error);
      setPhase("error");
      return;
    }
    setMessage(
      finalized.dispatched
        ? "Vidéo reçue ! Encodage lancé — elle partira ensuite en modération."
        : "Vidéo reçue ! L'encodage sera lancé prochainement, puis elle partira en modération.",
    );
    setPhase("done");
    form.reset();
  }

  return (
    <>
      {phase === "done" ? (
        <div role="status" className="mt-4 rounded-(--radius-l) bg-surface-overlay p-5">
          <p className="font-bold">Dépôt terminé ✅</p>
          <p className="mt-1 text-sm leading-relaxed text-secondary">{message}</p>
          <button
            type="button"
            onClick={() => setPhase("idle")}
            className="mt-3 inline-flex h-10 items-center rounded-full bg-surface-raised px-5 text-sm text-primary hover:bg-surface-interactive"
          >
            Déposer une autre vidéo
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-5">
          <div>
            <label htmlFor="file" className="mb-1.5 block text-sm font-medium">
              Fichier vidéo <span className="text-secondary">(2 Go max)</span>
            </label>
            <input id="file" name="file" type="file" accept="video/*" required className={`${inputClass} file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-on-brand`} />
          </div>
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">Titre</label>
            <input id="title" name="title" required minLength={2} maxLength={200} className={inputClass} />
          </div>
          <div>
            <label htmlFor="overview" className="mb-1.5 block text-sm font-medium">
              Synopsis <span className="text-secondary">(facultatif)</span>
            </label>
            <textarea id="overview" name="overview" rows={3} maxLength={2000} className={inputClass} />
          </div>
          <div>
            <label htmlFor="licence" className="mb-1.5 block text-sm font-medium">Licence de diffusion</label>
            <select id="licence" name="licence" className={inputClass}>
              {LICENCES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rightsDeclaration" className="mb-1.5 block text-sm font-medium">
              Déclaration de droits <span className="text-red-400">*</span>
            </label>
            <textarea
              id="rightsDeclaration"
              name="rightsDeclaration"
              rows={3}
              required
              minLength={20}
              placeholder="J'atteste être titulaire des droits sur cette vidéo (ou disposer d'une licence m'autorisant à la diffuser) et j'en autorise la diffusion sur Ciné+."
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-secondary">
              Obligatoire (D11) — toute vidéo est vérifiée par notre équipe avant publication.
            </p>
          </div>

          {phase === "uploading" && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
                <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1.5 text-sm text-secondary" role="status">Envoi… {progress}%</p>
            </div>
          )}
          <p role="alert" aria-live="polite" className="min-h-5 text-sm text-red-400">
            {phase === "error" ? message : ""}
          </p>

          <button
            type="submit"
            disabled={phase === "uploading"}
            className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent) disabled:pointer-events-none disabled:opacity-45"
          >
            {phase === "uploading" ? "Envoi en cours…" : "Déposer la vidéo"}
          </button>
        </form>
      )}

      {mine.length > 0 && (
        <section aria-label="Mes vidéos" className="mt-10">
          <h3 className="text-lg font-bold">Mes vidéos</h3>
          <ul className="mt-3 divide-y divide-white/5 rounded-(--radius-l) bg-surface-overlay">
            {mine.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="truncate text-sm">{v.title}</span>
                <span className="shrink-0 rounded-full bg-surface-raised px-3 py-1 text-xs text-secondary">
                  {STATUS_LABELS[v.status] ?? v.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
