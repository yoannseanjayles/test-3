import { NextResponse } from "next/server";
import { getSeasonEpisodes, isTmdbConfigured } from "@/lib/tmdb/queries";

/**
 * Épisodes d'une saison, spoiler-safe (D16 §3) — consommé par SeasonEpisodes
 * au dépliage d'une saison sur la fiche série. getSeasonEpisodes ne renvoie
 * ni résumé ni image : la garantie « jamais de spoiler » tient par construction.
 * Réponse cacheable 6 h, alignée sur l'ISR des fiches (revalidate 21600).
 */

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const serie = Number(params.get("serie"));
  const saison = Number(params.get("saison"));

  if (!Number.isSafeInteger(serie) || serie <= 0 || !Number.isSafeInteger(saison) || saison <= 0) {
    return NextResponse.json({ error: "Paramètres « serie » et « saison » invalides." }, { status: 400 });
  }

  // Sans clé TMDB comme en cas d'échec amont : liste vide, jamais d'erreur —
  // le client affiche son repli « Épisodes indisponibles pour le moment ».
  const episodes = isTmdbConfigured() ? await getSeasonEpisodes(serie, saison) : [];

  return NextResponse.json(
    { episodes },
    { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } },
  );
}
