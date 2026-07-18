import type {
  TmdbMovieDetails,
  TmdbMovieListItem,
  TmdbPerson,
  TmdbPersonCredit,
  TmdbSeasonEpisodes,
  TmdbTvDetails,
  TmdbTvListItem,
} from "./schemas";

/**
 * Modèles canoniques (D26) : le reste de l'application ne voit jamais les formes
 * TMDB brutes — uniquement `Title` / `TitleDetails`, stables si la source change.
 */

export type TitleKind = "film" | "serie";

export interface Title {
  id: number;
  kind: TitleKind;
  title: string;
  year: number | null;
  /** Date de sortie / première diffusion (ISO `AAAA-MM-JJ`) — null si inconnue. */
  releaseDate: string | null;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  voteAverage: number;
  voteCount: number;
  href: string;
}

export interface WatchOffer {
  kind: "abonnement" | "location" | "achat";
  name: string;
  logoUrl: string | null;
}

export interface SeasonInfo {
  id: number;
  number: number;
  name: string;
  episodeCount: number;
  year: number | null;
  overview: string;
  posterUrl: string | null;
}

export interface CrewPerson {
  id: number;
  name: string;
}

export interface TitleDetails extends Title {
  tagline: string;
  genres: { id: number; name: string }[];
  /** Films : durée en minutes ; séries : null. */
  runtimeMinutes: number | null;
  /** Séries uniquement. */
  seasonCount: number | null;
  episodeCount: number | null;
  cast: { id: number; name: string; character: string; photoUrl: string | null }[];
  /** Films : réalisateur·s ; séries : vide (voir `creators`). */
  directors: CrewPerson[];
  /** Films : scénaristes (Screenplay/Writer/Story), dédupliqués. */
  writers: CrewPerson[];
  /** Séries : créateur·s (`created_by`). */
  creators: CrewPerson[];
  /** Pays de production (libellés localisés fr-FR). */
  countries: string[];
  /** Titre original — null s'il est identique au titre affiché. */
  originalTitle: string | null;
  /** Statut traduit (« Sorti », « En cours de diffusion »…) — null si inconnu. */
  status: string | null;
  /** Classification d'âge France (« 12+ », « Tous publics »…) — null si absente. */
  certification: string | null;
  /** Films : budget/recettes en dollars (0 = non renseigné par TMDB). */
  budget: number;
  revenue: number;
  /** Séries : dernière diffusion et prochain épisode (ISO) — null sinon. */
  lastAirDate: string | null;
  nextEpisodeAirDate: string | null;
  /** Clé YouTube de la bande-annonce officielle si disponible (D5 §trailers). */
  trailerYoutubeKey: string | null;
  similar: Title[];
  /** Recommandations TMDB (meilleur signal que `similar`) — repli sur `similar` si vide. */
  recommendations: Title[];
  /** Où regarder (TMDB watch/providers, données JustWatch — attribution D5 §3.3). */
  watchLink: string | null;
  watchOffers: WatchOffer[];
  /** Séries : saisons spoiler-safe (D16) — épisodes à la demande plus tard. */
  seasons: SeasonInfo[];
}

export interface EpisodeInfo {
  id: number;
  number: number;
  name: string;
  airDate: string | null;
  runtimeMinutes: number | null;
}

export interface PersonCreditTitle extends Title {
  /** Rôle (casting) ou poste (équipe technique) — peut être vide. */
  role: string;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  photoUrl: string | null;
  /** Métier principal traduit (« Interprétation », « Réalisation »…). */
  department: string;
  href: string;
  /** Œuvres marquantes (top popularité, dédupliquées). */
  knownFor: Title[];
  /** Filmographie interprète, triée de la plus récente à la plus ancienne. */
  actingCredits: PersonCreditTitle[];
  /** Filmographie technique (réalisation, scénario…), triée pareillement. */
  crewCredits: PersonCreditTitle[];
}

/** Genres TMDB (D19 grilles) — slugs FR stables alignés sur les assets B5. */
export const GENRES: { slug: string; id: number; label: string }[] = [
  { slug: "action", id: 28, label: "Action" },
  { slug: "aventure", id: 12, label: "Aventure" },
  { slug: "animation", id: 16, label: "Animation" },
  { slug: "comedie", id: 35, label: "Comédie" },
  { slug: "crime", id: 80, label: "Crime" },
  { slug: "documentaire", id: 99, label: "Documentaire" },
  { slug: "drame", id: 18, label: "Drame" },
  { slug: "famille", id: 10751, label: "Famille" },
  { slug: "fantastique", id: 14, label: "Fantastique" },
  { slug: "guerre", id: 10752, label: "Guerre" },
  { slug: "histoire", id: 36, label: "Histoire" },
  { slug: "horreur", id: 27, label: "Horreur" },
  { slug: "musique", id: 10402, label: "Musique" },
  { slug: "mystere", id: 9648, label: "Mystère" },
  { slug: "romance", id: 10749, label: "Romance" },
  { slug: "science-fiction", id: 878, label: "Science-fiction" },
  { slug: "thriller", id: 53, label: "Thriller" },
  { slug: "western", id: 37, label: "Western" },
];

const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const posterUrl = (path: string | null, size = "w342") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;
export const backdropUrl = (path: string | null, size = "w1280") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;
export const profileUrl = (path: string | null, size = "w185") =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

/** Statuts TMDB → libellés FR (affichés dans la section Détails des fiches). */
const STATUS_FR: Record<string, string> = {
  Released: "Sorti",
  "Post Production": "Post-production",
  "In Production": "En production",
  Planned: "Annoncé",
  Rumored: "Annoncé",
  Canceled: "Annulée",
  "Returning Series": "En cours de diffusion",
  Ended: "Terminée",
  Pilot: "Pilote",
};

/** Métiers TMDB → libellés FR (page Personne). */
const DEPARTMENT_FR: Record<string, string> = {
  Acting: "Interprétation",
  Directing: "Réalisation",
  Writing: "Scénario",
  Production: "Production",
  Camera: "Image",
  Editing: "Montage",
  Sound: "Son",
  Art: "Direction artistique",
  "Visual Effects": "Effets visuels",
  "Costume & Make-Up": "Costumes et maquillage",
  Crew: "Équipe technique",
};

/** Postes techniques TMDB → libellés FR (filmographie technique). */
const JOB_FR: Record<string, string> = {
  Director: "Réalisation",
  Screenplay: "Scénario",
  Writer: "Scénario",
  Story: "Histoire",
  Producer: "Production",
  "Executive Producer": "Production exécutive",
  Novel: "Œuvre originale",
  Characters: "Personnages",
};

/** Certification brute TMDB (FR) → libellé lisible (« 12 » → « 12+ », « TP »/« U » → « Tous publics »). */
function formatCertification(raw: string): string | null {
  const cert = raw.trim();
  if (!cert) return null;
  if (cert === "TP" || cert === "U") return "Tous publics";
  if (/^\d+$/.test(cert)) return `${cert}+`;
  return cert;
}

/** Slug FR stable `titre-ID` (D10) : l'ID fait foi, le libellé n'est que cosmétique. */
export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "titre"
  );
}

export function titleHref(kind: TitleKind, id: number, title: string): string {
  return `/${kind}/${slugify(title)}-${id}`;
}

/** URL de page Personne `/personne/nom-ID` — même convention que les fiches (D10). */
export function personHref(id: number, name: string): string {
  return `/personne/${slugify(name)}-${id}`;
}

/** Extrait l'ID d'un slug `titre-123` ; null si le segment est invalide. */
export function parseSlugId(slug: string): number | null {
  const match = /-(\d+)$/.exec(slug) ?? /^(\d+)$/.exec(slug);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const yearOf = (date: string): number | null => {
  const year = Number(date.slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : null;
};

export function movieToTitle(m: TmdbMovieListItem): Title {
  return {
    id: m.id,
    kind: "film",
    title: m.title,
    year: yearOf(m.release_date),
    releaseDate: m.release_date || null,
    overview: m.overview,
    posterUrl: posterUrl(m.poster_path),
    backdropUrl: backdropUrl(m.backdrop_path),
    voteAverage: m.vote_average,
    voteCount: m.vote_count,
    href: titleHref("film", m.id, m.title),
  };
}

export function tvToTitle(t: TmdbTvListItem): Title {
  return {
    id: t.id,
    kind: "serie",
    title: t.name,
    year: yearOf(t.first_air_date),
    releaseDate: t.first_air_date || null,
    overview: t.overview,
    posterUrl: posterUrl(t.poster_path),
    backdropUrl: backdropUrl(t.backdrop_path),
    voteAverage: t.vote_average,
    voteCount: t.vote_count,
    href: titleHref("serie", t.id, t.name),
  };
}

function pickTrailer(videos: { key: string; site: string; type: string; official: boolean }[]): string | null {
  const candidates = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  return (candidates.find((v) => v.official) ?? candidates[0])?.key ?? null;
}

function watchInfo(d: TmdbMovieDetails | TmdbTvDetails): { watchLink: string | null; watchOffers: WatchOffer[] } {
  const fr = d["watch/providers"]?.results?.FR;
  if (!fr) return { watchLink: null, watchOffers: [] };
  const offers: WatchOffer[] = [];
  const push = (kind: WatchOffer["kind"], list?: { provider_name: string; logo_path: string | null }[]) => {
    for (const p of list ?? []) {
      if (!offers.some((o) => o.name === p.provider_name)) {
        offers.push({ kind, name: p.provider_name, logoUrl: p.logo_path ? `${IMAGE_BASE}/w92${p.logo_path}` : null });
      }
    }
  };
  push("abonnement", fr.flatrate);
  push("location", fr.rent);
  push("achat", fr.buy);
  return { watchLink: fr.link ?? null, watchOffers: offers.slice(0, 10) };
}

/** Dédoublonne une liste de personnes par id en conservant l'ordre. */
function uniquePersons(list: { id: number; name: string }[]): CrewPerson[] {
  const seen = new Set<number>();
  return list.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).map((p) => ({ id: p.id, name: p.name }));
}

function detailsCommon(d: TmdbMovieDetails | TmdbTvDetails) {
  const crew = d.credits?.crew ?? [];
  return {
    ...watchInfo(d),
    tagline: d.tagline,
    genres: d.genres,
    countries: d.production_countries.map((c) => c.name),
    status: STATUS_FR[d.status] ?? null,
    cast: (d.credits?.cast ?? []).slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      photoUrl: profileUrl(c.profile_path),
    })),
    directors: uniquePersons(crew.filter((m) => m.job === "Director")),
    writers: uniquePersons(crew.filter((m) => ["Screenplay", "Writer", "Story"].includes(m.job))).slice(0, 4),
    trailerYoutubeKey: pickTrailer(d.videos?.results ?? []),
  };
}

export function movieToDetails(d: TmdbMovieDetails): TitleDetails {
  // Entrées France de release_dates : certification + date de sortie salles (type 3).
  const frReleases = d.release_dates?.results.find((r) => r.iso_3166_1 === "FR")?.release_dates ?? [];
  const frCert = frReleases.map((r) => r.certification).find((c) => c.trim() !== "") ?? "";
  const frTheatrical = frReleases.find((r) => r.type === 3)?.release_date ?? frReleases[0]?.release_date ?? "";
  const base = movieToTitle(d);
  return {
    ...base,
    ...detailsCommon(d),
    releaseDate: frTheatrical ? frTheatrical.slice(0, 10) : base.releaseDate,
    originalTitle: d.original_title && d.original_title !== d.title ? d.original_title : null,
    certification: formatCertification(frCert),
    budget: d.budget,
    revenue: d.revenue,
    creators: [],
    lastAirDate: null,
    nextEpisodeAirDate: null,
    runtimeMinutes: d.runtime,
    seasonCount: null,
    episodeCount: null,
    seasons: [],
    similar: (d.similar?.results ?? []).slice(0, 12).map(movieToTitle),
    recommendations: (d.recommendations?.results ?? []).slice(0, 12).map(movieToTitle),
  };
}

export function tvToDetails(d: TmdbTvDetails): TitleDetails {
  const frRating = d.content_ratings?.results.find((r) => r.iso_3166_1 === "FR")?.rating ?? "";
  return {
    ...tvToTitle(d),
    ...detailsCommon(d),
    originalTitle: d.original_name && d.original_name !== d.name ? d.original_name : null,
    certification: formatCertification(frRating),
    budget: 0,
    revenue: 0,
    creators: uniquePersons(d.created_by),
    lastAirDate: d.last_air_date,
    nextEpisodeAirDate: d.next_episode_to_air?.air_date ?? null,
    runtimeMinutes: null,
    seasonCount: d.number_of_seasons,
    episodeCount: d.number_of_episodes,
    seasons: d.seasons
      .filter((se) => se.season_number > 0)
      .map((se) => ({
        id: se.id,
        number: se.season_number,
        name: se.name,
        episodeCount: se.episode_count,
        year: se.air_date ? Number(se.air_date.slice(0, 4)) || null : null,
        overview: se.overview,
        posterUrl: posterUrl(se.poster_path, "w185"),
      })),
    similar: (d.similar?.results ?? []).slice(0, 12).map(tvToTitle),
    recommendations: (d.recommendations?.results ?? []).slice(0, 12).map(tvToTitle),
  };
}

export function seasonToEpisodes(s: TmdbSeasonEpisodes): EpisodeInfo[] {
  return s.episodes.map((e) => ({
    id: e.id,
    number: e.episode_number,
    name: e.name,
    airDate: e.air_date,
    runtimeMinutes: e.runtime,
  }));
}

/** Crédit filmographie → Title enrichi du rôle ; null si le média n'est ni film ni série. */
function creditToTitle(c: TmdbPersonCredit): PersonCreditTitle | null {
  if (c.media_type !== "movie" && c.media_type !== "tv") return null;
  const isMovie = c.media_type === "movie";
  const name = (isMovie ? c.title : c.name) ?? "";
  if (!name) return null;
  const date = isMovie ? c.release_date : c.first_air_date;
  return {
    id: c.id,
    kind: isMovie ? "film" : "serie",
    title: name,
    year: yearOf(date),
    releaseDate: date || null,
    overview: c.overview,
    posterUrl: posterUrl(c.poster_path),
    backdropUrl: null,
    voteAverage: c.vote_average,
    voteCount: c.vote_count,
    href: titleHref(isMovie ? "film" : "serie", c.id, name),
    role: c.character || (JOB_FR[c.job] ?? c.job),
  };
}

export function personToDetails(p: TmdbPerson): PersonDetails {
  const castRaw = p.combined_credits?.cast ?? [];
  const crewRaw = p.combined_credits?.crew ?? [];

  // Filmographies : dédupliquées par œuvre, triées de la plus récente à la plus ancienne.
  const dedupe = (credits: TmdbPersonCredit[]) => {
    const seen = new Set<string>();
    return credits
      .map(creditToTitle)
      .filter((t): t is PersonCreditTitle => t !== null)
      .filter((t) => (seen.has(`${t.kind}-${t.id}`) ? false : (seen.add(`${t.kind}-${t.id}`), true)))
      .sort((a, b) => (b.releaseDate ?? "9999").localeCompare(a.releaseDate ?? "9999"));
  };

  // Œuvres marquantes : top popularité TMDB, toutes casquettes confondues.
  const knownSeen = new Set<string>();
  const knownFor = [...castRaw, ...crewRaw]
    .sort((a, b) => b.popularity - a.popularity)
    .map(creditToTitle)
    .filter((t): t is PersonCreditTitle => t !== null && t.posterUrl !== null)
    .filter((t) => (knownSeen.has(`${t.kind}-${t.id}`) ? false : (knownSeen.add(`${t.kind}-${t.id}`), true)))
    .slice(0, 12);

  return {
    id: p.id,
    name: p.name,
    biography: p.biography,
    birthday: p.birthday,
    deathday: p.deathday,
    placeOfBirth: p.place_of_birth,
    photoUrl: profileUrl(p.profile_path, "w342"),
    department: DEPARTMENT_FR[p.known_for_department] ?? p.known_for_department,
    href: personHref(p.id, p.name),
    knownFor,
    actingCredits: dedupe(castRaw),
    crewCredits: dedupe(crewRaw),
  };
}
