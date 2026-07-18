import { NextResponse } from "next/server";
import { searchTitles } from "@/lib/tmdb/queries";

/**
 * Suggestions de recherche instantanée (audit A7) — endpoint léger consommé par
 * InstantSearch (debounce client). Ne remplace pas le formulaire GET /recherche,
 * qui reste la voie principale sans JavaScript.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  }

  const result = await searchTitles(q, 1);
  const suggestions = result.titles.slice(0, 6).map((t) => ({
    title: t.title,
    year: t.year,
    href: t.href,
    posterUrl: t.posterUrl,
    kind: t.kind,
  }));

  return NextResponse.json({ suggestions }, { headers: { "Cache-Control": "public, s-maxage=300" } });
}
