"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { invalidateConfigCache } from "@/lib/ads/flags";
import { invalidateSettingsCache, SETTINGS_REGISTRY, type SettingKey } from "@/lib/settings";
import { notify } from "@/lib/notifications";
import { requireAdmin } from "./guard";

/**
 * Actions du back-office (D36) — toutes revérifient le rôle admin côté serveur
 * et tracent la modération dans `moderation_events` (audit, D11).
 * Formulaires en progressive enhancement (fonctionnent sans JS).
 */

const uuid = z.uuid();

async function logModeration(videoId: string, moderatorId: string, action: string, reason = "") {
  await db().insert(schema.moderationEvents).values({ videoId, moderatorId, action, reason });
}

function refreshCatalog() {
  revalidatePath("/gratuit");
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/videos");
}

/** pending_review → published (D11 : seule voie de publication). */
export async function approveVideoAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const videoId = uuid.parse(formData.get("videoId"));
  const [video] = await db()
    .update(schema.videos)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(schema.videos.id, videoId))
    .returning();
  await logModeration(videoId, admin.id, "approve");
  if (video?.ownerId) await notify(video.ownerId, "video.published", { title: video.title });
  refreshCatalog();
}

/** pending_review → rejected, motif obligatoire (notifié au créateur — e-mail en H83). */
export async function rejectVideoAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const videoId = uuid.parse(formData.get("videoId"));
  const reason = z.string().trim().min(3, "Motif obligatoire").max(1000).parse(formData.get("reason"));
  const [video] = await db()
    .update(schema.videos)
    .set({ status: "rejected" })
    .where(eq(schema.videos.id, videoId))
    .returning();
  await logModeration(videoId, admin.id, "reject", reason);
  if (video?.ownerId) await notify(video.ownerId, "video.rejected", { title: video.title, reason });
  refreshCatalog();
}

/** published → removed (retrait/takedown D11) — motif obligatoire. */
export async function removeVideoAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const videoId = uuid.parse(formData.get("videoId"));
  const reason = z.string().trim().min(3, "Motif obligatoire").max(1000).parse(formData.get("reason"));
  await db().update(schema.videos).set({ status: "removed" }).where(eq(schema.videos.id, videoId));
  await logModeration(videoId, admin.id, "remove", reason);
  refreshCatalog();
}

/** Relance l'encodage d'une vidéo bloquée (uploading après échec, ou processing zombie). */
export async function retryEncodingAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const videoId = uuid.parse(formData.get("videoId"));
  const [video] = await db().select().from(schema.videos).where(eq(schema.videos.id, videoId)).limit(1);
  if (!video?.sourceKey) return;

  await db().update(schema.videos).set({ status: "processing" }).where(eq(schema.videos.id, videoId));
  await logModeration(videoId, admin.id, "retry_encoding");

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const repo = process.env.GITHUB_ENCODE_REPO;
  const appUrl = process.env.APP_BASE_URL;
  if (token && repo && appUrl) {
    await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event_type: "encode-video",
        client_payload: {
          video_id: videoId,
          source_key: video.sourceKey,
          callback_url: `${appUrl.replace(/\/$/, "")}/api/ingest/complete`,
        },
      }),
    }).catch((error) => console.error("[admin] dispatch relance impossible :", error));
  }
  refreshCatalog();
}

/** Pilotage des flags D6/D11 — effet immédiat (cache 30 s max, invalidation locale). */
export async function setFlagAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const key = z
    .enum([
      "ads.enabled",
      "ads.display.home",
      "ads.display.browse",
      "ads.display.fiche",
      "ads.native.rail",
      "ads.video.preroll",
      "ugc.upload.enabled",
    ])
    .parse(formData.get("key"));
  const value = formData.get("value") === "true";
  await db()
    .insert(schema.appConfig)
    .values({ key, value, updatedBy: admin.id })
    .onConflictDoUpdate({ target: schema.appConfig.key, set: { value, updatedBy: admin.id, updatedAt: new Date() } });
  invalidateConfigCache();
  revalidatePath("/admin/publicite");
}

/** Paramètres typés (7.1 Lot 1) — clés du registre uniquement, bornées par leur spec. */
export async function setSettingAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const key = z
    .enum(Object.keys(SETTINGS_REGISTRY) as [SettingKey, ...SettingKey[]])
    .parse(formData.get("key"));
  const spec = SETTINGS_REGISTRY[key];
  const value = z.coerce.number().int().min(spec.min).max(spec.max).parse(formData.get("value"));
  await db()
    .insert(schema.appSettings)
    .values({ key, value, updatedBy: admin.id })
    .onConflictDoUpdate({ target: schema.appSettings.key, set: { value, updatedBy: admin.id, updatedAt: new Date() } });
  invalidateSettingsCache();
  revalidatePath("/admin/parametres");
}

/** Cycle de traitement des messages de contact (new → in_progress → closed). */
export async function setContactStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = uuid.parse(formData.get("messageId"));
  const status = z.enum(["new", "in_progress", "closed"]).parse(formData.get("status"));
  await db().update(schema.contactMessages).set({ status }).where(eq(schema.contactMessages.id, id));
  revalidatePath("/admin/messages");
}

/**
 * Suppression de compte RGPD (7.0 §6) : cascade sur listes/notifications (FK),
 * les vidéos publiées restent (licence de diffusion acquise) mais sont
 * anonymisées (`owner_id` → null via FK set null). Jamais soi-même.
 */
export async function deleteUserAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = uuid.parse(formData.get("userId"));
  if (userId === admin.id) return;
  if (formData.get("confirm") !== "SUPPRIMER") return; // confirmation explicite (audit D3)
  await db().delete(schema.users).where(eq(schema.users.id, userId));
  revalidatePath("/admin/utilisateurs");
}

/** Promotion/rétrogradation d'un utilisateur (jamais soi-même — garde-fou verrouillage). */
export async function setUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = uuid.parse(formData.get("userId"));
  const role = z.enum(["user", "admin"]).parse(formData.get("role"));
  if (userId === admin.id) return; // on ne se rétrograde pas soi-même
  await db().update(schema.users).set({ role }).where(eq(schema.users.id, userId));
  revalidatePath("/admin/utilisateurs");
}
