import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db, isDbConfigured, schema } from "@/lib/db";

/** Export RGPD (portabilité) — toutes les données rattachées au compte, en JSON. */

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ error: "non configuré" }, { status: 503 });
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "non connecté" }, { status: 401 });

  const client = db();
  const [user] = await client.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  const lists = await client.select().from(schema.listEntries).where(eq(schema.listEntries.userId, userId));
  const videos = await client.select().from(schema.videos).where(eq(schema.videos.ownerId, userId));
  const notifs = await client.select().from(schema.notifications).where(eq(schema.notifications.userId, userId));

  return new NextResponse(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        account: user && {
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          emailOptOut: user.emailOptOut,
          createdAt: user.createdAt,
        },
        lists,
        videos: videos.map(({ rightsDeclaration, ...v }) => ({ ...v, rightsDeclaration })),
        notifications: notifs,
      },
      null,
      2,
    ),
    {
      headers: {
        "content-type": "application/json",
        "content-disposition": 'attachment; filename="cineplus-mes-donnees.json"',
      },
    },
  );
}
