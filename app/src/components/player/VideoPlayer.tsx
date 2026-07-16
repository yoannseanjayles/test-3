"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  markCompleted,
  saveResumeProgress,
  useLibrary,
  type LibraryEntry,
} from "@/lib/library/store";

/**
 * Lecteur Ciné+ v1 (D7/D17, Lot 4) : <video> natif + hls.js (import dynamique)
 * pour les manifestes .m3u8 hors Safari. Séquence de lancement D17 :
 * reprise éventuelle → pré-roll conditionnel (pub ON + pas de reprise +
 * capping 1/titre/session) → contenu. Heartbeat → Ma liste « en cours »,
 * fin → historique + écran de fin. H73 : UI Vidstack reportée (React 19
 * non supporté), contrôles natifs + surcouches DS en attendant.
 */

export interface PlayableVideo {
  entry: Omit<LibraryEntry, "addedAt" | "progress" | "positionSeconds">;
  hls?: string;
  mp4?: string;
  attribution: string;
}

type Phase = "intro" | "preroll" | "playing" | "ended" | "error";

const PREROLL_SECONDS = 15;
const PREROLL_SKIP_AFTER = 5;

function prerollAlreadyServed(slugKey: string): boolean {
  try {
    return window.sessionStorage.getItem(`cineplus.preroll.${slugKey}`) === "1";
  } catch {
    return true; // stockage bloqué → on ne sert pas de pub plutôt que d'en servir trop
  }
}

function rememberPreroll(slugKey: string) {
  try {
    window.sessionStorage.setItem(`cineplus.preroll.${slugKey}`, "1");
  } catch {
    /* sans stockage, tant pis pour le capping de cette session */
  }
}

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export function VideoPlayer({
  video,
  prerollEnabled,
  suggestions,
}: {
  video: PlayableVideo;
  prerollEnabled: boolean;
  suggestions: { href: string; title: string }[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const lastBeatRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [prerollLeft, setPrerollLeft] = useState(PREROLL_SECONDS);

  const slugKey = `${video.entry.kind}-${video.entry.id}`;

  // Position de reprise, dérivée du store (jamais de pré-roll à la reprise — D17).
  // Rendu serveur : store vide → « Regarder » ; le vrai état arrive à l'hydratation.
  const library = useLibrary();
  const known = library.resume.find((e) => e.kind === video.entry.kind && e.id === video.entry.id);
  const resumeAt =
    known?.positionSeconds && known.positionSeconds > 30 && (known.progress ?? 0) < 0.95
      ? known.positionSeconds
      : null;

  // Branche la source sur l'élément vidéo (hls.js si nécessaire).
  const attachSource = useCallback(async (el: HTMLVideoElement) => {
    const { hls, mp4 } = video;
    if (hls && el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = hls;
      return;
    }
    if (hls) {
      try {
        const { default: Hls } = await import("hls.js");
        if (Hls.isSupported()) {
          const instance = new Hls({ maxBufferLength: 30 });
          instance.loadSource(hls);
          instance.attachMedia(el);
          instance.on(Hls.Events.ERROR, (_evt, data) => {
            if (!data.fatal) return;
            instance.destroy();
            hlsRef.current = null;
            if (mp4) el.src = mp4; // repli progressif
            else setPhase("error");
          });
          hlsRef.current = instance;
          return;
        }
      } catch {
        /* hls.js indisponible → repli MP4 ci-dessous */
      }
    }
    if (mp4) {
      el.src = mp4;
      return;
    }
    setPhase("error");
  }, [video]);

  useEffect(() => () => hlsRef.current?.destroy(), []);

  // Mesure d'audience anonyme (H101) : une vue par chargement, au lancement effectif.
  const viewSent = useRef(false);
  const trackView = useCallback(() => {
    if (viewSent.current) return;
    viewSent.current = true;
    fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "video.view", props: { title: video.entry.title, kind: video.entry.kind, id: video.entry.id } }),
      keepalive: true,
    }).catch(() => {});
  }, [video.entry.title, video.entry.kind, video.entry.id]);

  const startContent = useCallback(
    async (fromSeconds: number | null) => {
      trackView();
      setPhase("playing");
      const el = videoRef.current;
      if (!el) return;
      if (!el.src && !hlsRef.current) await attachSource(el);
      if (fromSeconds) {
        el.currentTime = fromSeconds;
      }
      el.play().catch(() => {
        /* lecture bloquée par le navigateur : l'utilisateur relancera via les contrôles */
      });
    },
    [attachSource, trackView],
  );

  const launch = useCallback(
    (fromSeconds: number | null) => {
      const wantPreroll = prerollEnabled && fromSeconds === null && !prerollAlreadyServed(slugKey);
      if (wantPreroll) {
        rememberPreroll(slugKey);
        setPrerollLeft(PREROLL_SECONDS);
        setPhase("preroll");
      } else {
        void startContent(fromSeconds);
      }
    },
    [prerollEnabled, slugKey, startContent],
  );

  // Compte à rebours du pré-roll (placeholder maison — VAST réel en 6.2).
  useEffect(() => {
    if (phase !== "preroll") return;
    const t = setTimeout(() => {
      if (prerollLeft <= 1) void startContent(null);
      else setPrerollLeft(prerollLeft - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, prerollLeft, startContent]);

  // Heartbeat (10 s) + fin de lecture.
  const onTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || phase !== "playing" || !el.duration) return;
    const now = el.currentTime;
    if (Math.abs(now - lastBeatRef.current) < 10) return;
    lastBeatRef.current = now;
    saveResumeProgress(video.entry, Math.min(now / el.duration, 1), Math.floor(now));
  };

  const onEnded = () => {
    markCompleted(video.entry);
    setPhase("ended");
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-(--radius-l) bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls={phase === "playing"}
        playsInline
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={() => phase === "playing" && setPhase("error")}
        aria-label={video.entry.title}
      />

      {/* Écran d'intro : lancer / reprendre (D17) */}
      {phase === "intro" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 text-center">
          <h2 className="max-w-md text-xl font-bold md:text-2xl">{video.entry.title}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => launch(resumeAt)}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-base font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover hover:shadow-(--glow-accent)"
            >
              ▶ {resumeAt ? `Reprendre à ${formatTime(resumeAt)}` : "Regarder"}
            </button>
            {resumeAt !== null && (
              <button
                type="button"
                onClick={() => launch(null)}
                className="inline-flex h-12 items-center rounded-full bg-surface-raised px-6 text-base text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
              >
                Recommencer
              </button>
            )}
          </div>
          <p className="text-xs text-white/60">{video.attribution}</p>
        </div>
      )}

      {/* Pré-roll placeholder (D6/D17) — la seule pub de la page, skippable après 5 s */}
      {phase === "preroll" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-base p-6 text-center">
          <span className="rounded-(--radius-s) bg-surface-overlay px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Publicité
          </span>
          <p className="text-lg font-bold">Votre publicité ici</p>
          <p className="max-w-sm text-sm text-secondary">
            Emplacement pré-roll (habillage VAST en 6.2). Votre contenu démarre dans {prerollLeft} s.
          </p>
          {PREROLL_SECONDS - prerollLeft >= PREROLL_SKIP_AFTER ? (
            <button
              type="button"
              onClick={() => void startContent(null)}
              className="mt-2 inline-flex h-10 items-center rounded-full bg-surface-raised px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
            >
              Passer la publicité →
            </button>
          ) : (
            <p className="mt-2 text-xs text-white/50">
              Passer dans {PREROLL_SKIP_AFTER - (PREROLL_SECONDS - prerollLeft)} s…
            </p>
          )}
        </div>
      )}

      {/* Écran de fin : recos post-visionnage (D17) */}
      {phase === "ended" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85 p-6 text-center">
          <p className="text-lg font-bold md:text-xl">Et maintenant ?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => launch(null)}
              className="inline-flex h-11 items-center rounded-full bg-surface-raised px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
            >
              ↻ Revoir
            </button>
            {suggestions.slice(0, 2).map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-on-brand transition-all duration-(--duration-fast) hover:bg-brand-hover"
              >
                ▶ {s.title}
              </Link>
            ))}
          </div>
          <Link href="/gratuit" className="text-sm text-link hover:text-brand">
            Tout le catalogue gratuit
          </Link>
        </div>
      )}

      {/* État d'erreur lecteur (asset B4 dédié) */}
      {phase === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-6 text-center">
          <Image src="/media/interface/error-player.jpg" alt="" width={140} height={140} className="rounded-(--radius-l)" />
          <p className="font-bold">La lecture a rencontré un problème</p>
          <p className="max-w-sm text-sm text-secondary">
            La source vidéo ne répond pas pour le moment. Réessayez, ou choisissez un autre titre du catalogue gratuit.
          </p>
          <button
            type="button"
            onClick={() => {
              const el = videoRef.current;
              if (el) {
                el.removeAttribute("src");
                el.load();
              }
              hlsRef.current?.destroy();
              hlsRef.current = null;
              setPhase("intro");
            }}
            className="mt-1 inline-flex h-10 items-center rounded-full bg-surface-raised px-5 text-sm text-primary transition-colors duration-(--duration-fast) hover:bg-surface-interactive"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}
