"use client";

import { useSyncExternalStore } from "react";
import type { TitleKind } from "@/lib/tmdb/models";

/** Les listes acceptent aussi les vidéos hors TMDB (catalogue gratuit, UGC — sitemap /video). */
export type LibraryKind = TitleKind | "video";

/**
 * Ma liste — favoris / historique / en-cours (D19 Ma liste, Lot 3).
 * Persistance navigateur (localStorage) en attendant le back-end 6.1 (H70) :
 * l'API du store est celle qu'exposera le BFF (mêmes opérations), seul le
 * transport changera — les écritures resteront optimistes.
 */

export type LibraryList = "favorites" | "history" | "resume";

export interface LibraryEntry {
  id: number;
  kind: LibraryKind;
  title: string;
  year: number | null;
  posterUrl: string | null;
  href: string;
  addedAt: number;
  /** Progression 0-1 (liste « en cours » — alimentée par le lecteur). */
  progress?: number;
  /** Position de lecture en secondes, pour la reprise exacte (D7/D17). */
  positionSeconds?: number;
}

export type LibraryState = Record<LibraryList, LibraryEntry[]>;

const STORAGE_KEY = "cineplus.library.v1";
const EMPTY_STATE: LibraryState = { favorites: [], history: [], resume: [] };

let cache: LibraryState | null = null;
const listeners = new Set<() => void>();

function read(): LibraryState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<LibraryState>) : null;
    cache = {
      favorites: Array.isArray(parsed?.favorites) ? parsed.favorites : [],
      history: Array.isArray(parsed?.history) ? parsed.history : [],
      resume: Array.isArray(parsed?.resume) ? parsed.resume : [],
    };
  } catch {
    cache = { ...EMPTY_STATE };
  }
  return cache;
}

function write(next: LibraryState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Stockage plein ou bloqué : l'état en mémoire reste correct pour la session.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Synchronisation entre onglets.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** État complet de la bibliothèque (rendu serveur : vide, puis hydratation). */
export function useLibrary(): LibraryState {
  return useSyncExternalStore(subscribe, read, () => EMPTY_STATE);
}

export function isInList(state: LibraryState, list: LibraryList, kind: LibraryKind, id: number): boolean {
  return state[list].some((e) => e.kind === kind && e.id === id);
}

export function toggleFavorite(entry: Omit<LibraryEntry, "addedAt">): void {
  const state = read();
  const exists = isInList(state, "favorites", entry.kind, entry.id);
  write({
    ...state,
    favorites: exists
      ? state.favorites.filter((e) => !(e.kind === entry.kind && e.id === entry.id))
      : [{ ...entry, addedAt: Date.now() }, ...state.favorites],
  });
}

export function removeFromList(list: LibraryList, kind: LibraryKind, id: number): void {
  const state = read();
  write({ ...state, [list]: state[list].filter((e) => !(e.kind === kind && e.id === id)) });
}

/** Position de reprise connue pour un titre (heartbeat du lecteur). */
export function getResumeEntry(kind: LibraryKind, id: number): LibraryEntry | undefined {
  return read().resume.find((e) => e.kind === kind && e.id === id);
}

/** Heartbeat du lecteur (D17) : met à jour « en cours », dédoublonné en tête de liste. */
export function saveResumeProgress(
  entry: Omit<LibraryEntry, "addedAt" | "progress" | "positionSeconds">,
  progress: number,
  positionSeconds: number,
): void {
  const state = read();
  const rest = state.resume.filter((e) => !(e.kind === entry.kind && e.id === entry.id));
  write({
    ...state,
    resume: [{ ...entry, addedAt: Date.now(), progress, positionSeconds }, ...rest].slice(0, 50),
  });
}

/** Remplace l'état local par l'état consolidé du serveur (synchro Lot 2, H87). */
export function replaceLibrary(next: LibraryState): void {
  write(next);
}

/** Visionnage terminé : sort d'« en cours », entre dans l'historique (D17 écran de fin). */
export function markCompleted(entry: Omit<LibraryEntry, "addedAt" | "progress" | "positionSeconds">): void {
  const state = read();
  write({
    ...state,
    resume: state.resume.filter((e) => !(e.kind === entry.kind && e.id === entry.id)),
    history: [
      { ...entry, addedAt: Date.now() },
      ...state.history.filter((e) => !(e.kind === entry.kind && e.id === entry.id)),
    ].slice(0, 200),
  });
}
