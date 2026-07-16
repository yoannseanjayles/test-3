import { NextResponse } from "next/server";
import { isAdsEnabled } from "@/lib/ads/flags";

/** État public minimal des interrupteurs (CMP) — aucune donnée sensible. */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ads: await isAdsEnabled() });
}
