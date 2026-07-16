import { NextResponse } from "next/server";
import { z } from "zod";
import { track } from "@/lib/events";
import { clientIp, limit } from "@/lib/rate-limit";
import { isDbConfigured } from "@/lib/db";

/**
 * Beacon d'événements client (7.1 Lot 2) — liste blanche stricte :
 * seuls les événements de mesure anonyme sont acceptés (H101).
 * Rate-limité par IP ; réponse toujours 204 (un beacon n'échoue pas côté UX).
 */

export const dynamic = "force-dynamic";

const beaconSchema = z.object({
  name: z.enum(["ad.impression", "ad.click", "video.view"]),
  props: z
    .record(z.string().max(60), z.union([z.string().max(200), z.number(), z.boolean()]))
    .default({}),
});

export async function POST(request: Request) {
  if (!isDbConfigured()) return new NextResponse(null, { status: 204 });
  if (!(await limit("events.beacon", await clientIp(), 120, 60))) {
    return new NextResponse(null, { status: 204 });
  }
  const parsed = beaconSchema.safeParse(await request.json().catch(() => null));
  if (parsed.success) {
    await track(parsed.data.name, parsed.data.props);
  }
  return new NextResponse(null, { status: 204 });
}
