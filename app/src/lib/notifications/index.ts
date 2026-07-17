import "server-only";

import { eq } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";

/**
 * Notifications créateurs & admins (7.0 §5, lève H94) — in-app d'abord
 * (la cloche fait foi), e-mail Resend en écho si configuré (H83).
 * Best-effort : une notification qui échoue ne casse jamais l'action métier.
 */

export type NotificationType =
  | "video.published"
  | "video.rejected"
  | "video.ready_for_review"
  | "takedown.received"
  | "ops.quota_alert";

const MESSAGES: Record<NotificationType, (payload: Record<string, string>) => { title: string; body: string }> = {
  "video.published": (p) => ({
    title: "Votre vidéo est publiée 🎉",
    body: `« ${p.title} » est maintenant visible dans le catalogue gratuit.`,
  }),
  "video.rejected": (p) => ({
    title: "Votre vidéo n'a pas été retenue",
    body: `« ${p.title} » a été refusée. Motif : ${p.reason || "non précisé"}.`,
  }),
  "video.ready_for_review": (p) => ({
    title: "Encodage terminé",
    body: `« ${p.title} » est encodée et attend la vérification de notre équipe.`,
  }),
  "takedown.received": (p) => ({
    title: "⚠️ Demande d'ayant droit reçue",
    body: `Nouvelle demande de retrait (${p.email}) — à traiter en priorité (SLA D11).`,
  }),
  "ops.quota_alert": (p) => ({
    title: "Seuil free tier approché",
    body: p.detail ?? "Un quota d'infrastructure dépasse 80 % — voir le runbook OPERATIONS.md.",
  }),
};

export async function notify(
  userId: string,
  type: NotificationType,
  payload: Record<string, string> = {},
): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await db().insert(schema.notifications).values({ userId, type, payload });
    await sendEmailEcho(userId, type, payload);
  } catch (error) {
    console.error(`[notifications] ${type} non délivrée :`, error);
  }
}

/** Notifie tous les administrateurs (takedown, alertes d'exploitation). */
export async function notifyAdmins(type: NotificationType, payload: Record<string, string> = {}): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    const admins = await db().select().from(schema.users).where(eq(schema.users.role, "admin"));
    await Promise.all(admins.map((admin) => notify(admin.id, type, payload)));
  } catch (error) {
    console.error(`[notifications] diffusion admin ${type} impossible :`, error);
  }
}

/** Écho e-mail via Resend (H83) — silencieux si RESEND_API_KEY absent. */
async function sendEmailEcho(userId: string, type: NotificationType, payload: Record<string, string>) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return;
  const [user] = await db().select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!user?.email || user.emailOptOut) return; // opt-out H108 — l'in-app fait foi
  const { title, body } = MESSAGES[type](payload);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: user.email,
      subject: `Ciné+ — ${title}`,
      text: `${body}\n\nRetrouvez le détail dans votre Studio : ${process.env.APP_BASE_URL ?? ""}/studio`,
    }),
  }).catch((error) => console.error("[notifications] e-mail Resend non envoyé :", error));
}

export function notificationMessage(type: string, payload: Record<string, string>): { title: string; body: string } {
  const render = MESSAGES[type as NotificationType];
  return render ? render(payload) : { title: type, body: "" };
}
