/**
 * Catalogue Gratuit ▶ (D5/H8) — domaine public & licences ouvertes, éditorialisé.
 * Lot 4 : lecture progressive (MP4) ou HLS directement depuis les sources
 * (Internet Archive, open movies Blender). Le pipeline ffmpeg→HLS→R2 (D7)
 * arrive en 6.1 et remplacera `sources` par nos URLs signées (H76).
 * H75 : URLs sources à re-vérifier régulièrement (hôtes tiers) — le lecteur
 * affiche un état d'erreur dédié si une source devient indisponible.
 */

export interface FreeVideo {
  /** ID numérique stable du catalogue local (clé des listes Ma liste). */
  id: number;
  slug: string;
  title: string;
  year: number;
  overview: string;
  durationMinutes: number;
  licence: string;
  licenceUrl?: string;
  /** Attribution requise par certaines licences ouvertes (CC BY). */
  attribution: string;
  sources: {
    hls?: string;
    mp4?: string;
  };
  /** ID TMDB pour le pont fiche ↔ lecteur (audit A1) — absent si incertain. */
  tmdbId?: number;
  /** Illustration d'ambiance (B5) en attendant les affiches dédiées. */
  artwork: string;
  genre: string;
}

export const FREE_CATALOG: FreeVideo[] = [
  {
    id: 1,
    slug: "big-buck-bunny",
    tmdbId: 10378,
    title: "Big Buck Bunny",
    year: 2008,
    overview:
      "Un lapin débonnaire décide de rendre la monnaie de leur pièce à trois rongeurs farceurs. Court-métrage culte de la fondation Blender, entièrement réalisé avec des logiciels libres.",
    durationMinutes: 10,
    licence: "CC BY 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by/3.0/",
    attribution: "© Blender Foundation | peach.blender.org",
    sources: {
      hls: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    artwork: "/media/interface/genre-animation.jpg",
    genre: "Animation",
  },
  {
    id: 2,
    slug: "elephants-dream",
    tmdbId: 9761,
    title: "Elephants Dream",
    year: 2006,
    overview:
      "Dans une machine infinie et onirique, Proog guide le jeune Emo — mais chacun voit un monde différent. Le tout premier open movie de l'histoire.",
    durationMinutes: 11,
    licence: "CC BY 2.5",
    licenceUrl: "https://creativecommons.org/licenses/by/2.5/",
    attribution: "© Blender Foundation | orange.blender.org",
    sources: {
      mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    artwork: "/media/interface/genre-science-fiction.jpg",
    genre: "Science-fiction",
  },
  {
    id: 3,
    slug: "sintel",
    tmdbId: 45745,
    title: "Sintel",
    year: 2010,
    overview:
      "Une jeune guerrière traverse montagnes et déserts à la recherche du dragon qu'elle a recueilli, puis perdu. Un conte épique et poignant de la fondation Blender.",
    durationMinutes: 15,
    licence: "CC BY 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by/3.0/",
    attribution: "© Blender Foundation | durian.blender.org",
    sources: {
      mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    },
    artwork: "/media/interface/genre-fantastique.jpg",
    genre: "Fantastique",
  },
  {
    id: 4,
    slug: "tears-of-steel",
    tmdbId: 133701,
    title: "Tears of Steel",
    year: 2012,
    overview:
      "Dans un Amsterdam futuriste, une poignée de scientifiques tente de sauver le monde des robots — en rejouant le souvenir qui a tout déclenché.",
    durationMinutes: 12,
    licence: "CC BY 3.0",
    licenceUrl: "https://creativecommons.org/licenses/by/3.0/",
    attribution: "© Blender Foundation | mango.blender.org",
    sources: {
      mp4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    },
    artwork: "/media/interface/genre-action.jpg",
    genre: "Science-fiction",
  },
  {
    id: 5,
    slug: "night-of-the-living-dead",
    tmdbId: 10331,
    title: "Night of the Living Dead",
    year: 1968,
    overview:
      "Sept inconnus se barricadent dans une ferme de Pennsylvanie assiégée par les morts-vivants. Le film fondateur du cinéma de zombies, tombé dans le domaine public.",
    durationMinutes: 96,
    licence: "Domaine public",
    attribution: "George A. Romero — Internet Archive",
    sources: {
      mp4: "https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4",
    },
    artwork: "/media/interface/genre-horreur.jpg",
    genre: "Horreur",
  },
  {
    id: 6,
    slug: "his-girl-friday",
    tmdbId: 3085,
    title: "His Girl Friday",
    year: 1940,
    overview:
      "Un rédacteur en chef machiavélique multiplie les stratagèmes pour retenir son ex-femme, meilleure journaliste de la ville, à la veille de son remariage. Un sommet de la screwball comedy.",
    durationMinutes: 92,
    licence: "Domaine public",
    attribution: "Howard Hawks — Internet Archive",
    sources: {
      mp4: "https://archive.org/download/his_girl_friday/his_girl_friday_512kb.mp4",
    },
    artwork: "/media/interface/genre-comedie.jpg",
    genre: "Comédie",
  },
  {
    id: 7,
    slug: "plan-9-from-outer-space",
    title: "Plan 9 from Outer Space",
    year: 1957,
    overview:
      "Des extraterrestres ressuscitent les morts pour empêcher l'humanité de détruire l'univers. Le « meilleur pire film de tous les temps », devenu culte.",
    durationMinutes: 79,
    licence: "Domaine public",
    attribution: "Ed Wood — Internet Archive",
    sources: {
      mp4: "https://archive.org/download/Plan_9_from_Outer_Space_1959/Plan_9_from_Outer_Space_1959_512kb.mp4",
    },
    artwork: "/media/interface/genre-science-fiction.jpg",
    genre: "Science-fiction",
  },
];

export function getFreeVideoBySlug(slug: string): FreeVideo | undefined {
  return FREE_CATALOG.find((v) => v.slug === slug);
}

export const watchHref = (video: FreeVideo) => `/regarder/${video.slug}`;

/** Pont fiche TMDB → catalogue gratuit (audit A1). */
export function getFreeVideoByTmdbId(tmdbId: number): FreeVideo | undefined {
  return FREE_CATALOG.find((v) => v.tmdbId === tmdbId);
}
