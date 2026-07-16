"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db, isDbConfigured, schema } from "@/lib/db";
import { notificationMessage } from "./index";

/** Lecture/acquittement des notifications de l'utilisateur connecté (cloche header). */

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export async function listNotificationsAction(): Promise<{ items: NotificationItem[]; unread: number }> {
  if (!isDbConfigured()) return { items: [], unread: 0 };
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { items: [], unread: 0 };

  const rows = await db()
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(20);

  return {
    items: rows.map((n) => ({
      id: n.id,
      ...notificationMessage(n.type, (n.payload ?? {}) as Record<string, string>),
      read: n.readAt !== null,
      createdAt: n.createdAt.getTime(),
    })),
    unread: rows.filter((n) => n.readAt === null).length,
  };
}

export async function markNotificationsReadAction(): Promise<void> {
  if (!isDbConfigured()) return;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;
  await db()
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(and(eq(schema.notifications.userId, userId), isNull(schema.notifications.readAt)));
}
