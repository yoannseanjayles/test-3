"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { db, isDbConfigured, schema } from "@/lib/db";
import type { LibraryEntry, LibraryState } from "./store";

/**
 * Synchro Ma liste (migration H70, 6.1 Lot 2) — fusion bidirectionnelle :
 * le client pousse son état local, le serveur fusionne (le plus récent gagne
 * par titre/liste) et renvoie l'état consolidé, réinjecté dans le store local.
 * L'UI reste local-first (instantanée) ; le serveur est la vérité durable (H87).
 */

const entrySchema = z.object({
  id: z.number().int(),
  kind: z.enum(["film", "serie", "video"]),
  title: z.string().max(300),
  year: z.number().int().nullable(),
  posterUrl: z.string().max(500).nullable(),
  href: z.string().max(300),
  addedAt: z.number(),
  progress: z.number().min(0).max(1).optional(),
  positionSeconds: z.number().int().min(0).optional(),
});

const stateSchema = z.object({
  favorites: z.array(entrySchema).max(500),
  resume: z.array(entrySchema).max(100),
  history: z.array(entrySchema).max(500),
});

type SyncResult = { state: LibraryState } | { error: string };

export async function syncLibraryAction(localState: unknown): Promise<SyncResult> {
  if (!isDbConfigured()) return { error: "non configuré" };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "non connecté" };

  const parsed = stateSchema.safeParse(localState);
  if (!parsed.success) return { error: "état local invalide" };

  const client = db();

  // Poussée locale → serveur : upsert, l'entrée la plus récente gagne.
  for (const list of ["favorites", "resume", "history"] as const) {
    for (const entry of parsed.data[list]) {
      const snapshot = { title: entry.title, year: entry.year, posterUrl: entry.posterUrl, href: entry.href };
      await client
        .insert(schema.listEntries)
        .values({
          userId,
          list,
          titleKind: entry.kind,
          titleId: entry.id,
          snapshot,
          progress: entry.progress ?? null,
          positionSeconds: entry.positionSeconds ?? null,
          addedAt: new Date(entry.addedAt),
        })
        .onConflictDoUpdate({
          target: [
            schema.listEntries.userId,
            schema.listEntries.list,
            schema.listEntries.titleKind,
            schema.listEntries.titleId,
          ],
          set: {
            snapshot,
            progress: entry.progress ?? null,
            positionSeconds: entry.positionSeconds ?? null,
            addedAt: new Date(entry.addedAt),
          },
        });
    }
  }

  // Serveur → client : état consolidé.
  const rows = await client
    .select()
    .from(schema.listEntries)
    .where(eq(schema.listEntries.userId, userId));

  const state: LibraryState = { favorites: [], resume: [], history: [] };
  for (const row of rows) {
    const snap = row.snapshot as { title: string; year: number | null; posterUrl: string | null; href: string };
    state[row.list].push({
      id: row.titleId,
      kind: row.titleKind,
      title: snap.title,
      year: snap.year,
      posterUrl: snap.posterUrl,
      href: snap.href,
      addedAt: row.addedAt.getTime(),
      progress: row.progress ?? undefined,
      positionSeconds: row.positionSeconds ?? undefined,
    } satisfies LibraryEntry);
  }
  for (const list of ["favorites", "resume", "history"] as const) {
    state[list].sort((a, b) => b.addedAt - a.addedAt);
  }
  return { state };
}

/** Suppression durable d'une entrée (appelée en plus du retrait local). */
export async function removeEntryAction(list: "favorites" | "resume" | "history", kind: "film" | "serie" | "video", id: number): Promise<void> {
  if (!isDbConfigured()) return;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await db()
    .delete(schema.listEntries)
    .where(
      and(
        eq(schema.listEntries.userId, userId),
        eq(schema.listEntries.list, list),
        eq(schema.listEntries.titleKind, kind),
        eq(schema.listEntries.titleId, id),
      ),
    );
}
