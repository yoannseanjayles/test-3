# Spécification de page — Fiche Série (`/serie/{slug}-{id}`) + Saison (`…/saison-{n}`)

> **Étape** : 2.1 (page 3/14, ordre validé D13)
> **Statut** : ✅ Validé HITL le 2026-07-15 (décision D16)
> **S'appuie sur** : D15 (gabarit Fiche Film — seules les **différences** sont spécifiées ici), D7 (progression), D10 (URLs saison)

---

## 1. Objectif

Même rôle SEO/décision que la fiche film (D15), plus un rôle propre aux séries : **accompagner un visionnage au long cours** — savoir où l'on en est, reprendre le bon épisode, suivre la fraîcheur (« Nouvel épisode »).

**KPI additionnels** : taux de clic « Reprendre SxEy » ; profondeur de navigation dans les saisons.

## 2. Différences avec le gabarit Fiche Film (D15)

### Reprises telles quelles
Sections 1 (hero), 2 (note/badges), 4 (Où regarder), 5 (synopsis), 6 (casting — casting « série » + par saison), 7 (pub), 8 (médias), 9 (détails), 11 (similaires), 12 (fil d'Ariane) ; SEO/perf/a11y/états identiques sauf précisions ci-dessous.

### Modifications

| Section | Adaptation série |
|---|---|
| **Métadonnées hero** | années (2019-2024 ou « depuis 2023 »), nombre de saisons/épisodes, statut (**En cours · Terminée · Annulée** — badge), réseau/plateforme d'origine |
| **Badges fraîcheur** | « Nouvel épisode » (< 7 j) · « Nouvelle saison » · « Finale » (D1) |
| **Barre de CTA** | Le CTA primaire devient **contextuel à la progression** : jamais vu → « ▶ Regarder S1E1 » (si visionnable) ; en cours → « **Reprendre S2E4** » + barre de progression série ; à jour → « Prochain épisode le {date} » (désactivé, informatif) |
| **NOUVELLE section 5bis — Saisons & épisodes** | Voir §3 — placée immédiatement après le synopsis (c'est la 2e intention de visite) |
| **Détails** | + première/dernière diffusion, réseau, type (mini-série…) |

## 3. Section Saisons & épisodes (cœur du gabarit)

- **Sélecteur de saisons** : onglets horizontaux scrollables (S1 · S2 · … · Spéciaux en dernier), saison courante présélectionnée (= saison de la progression, sinon S1) ;
- **Liste d'épisodes** (de la saison sélectionnée) : `EpisodeRow` = vignette 16:9 + numéro/titre + durée + date + synopsis 2 lignes (dépliable) + **état** : ✓ vu · barre de progression · à venir (date) ; clic → lecture (`/regarder/{slug}-{id}/s{n}e{m}`) si visionnable, sinon dépliage du synopsis ;
- Chargement : la saison courante est servie avec la page ; les autres saisons à la demande (cache) ;
- **Spoiler-safe** : vignette et synopsis des épisodes **non vus** de la saison en cours floutés/masqués sur option (`Paramètres > Masquer les spoilers`, défaut ON pour les épisodes < 7 j) ;
- Marquage manuel : « Marquer la saison comme vue » (menu ⋯ de la saison).

## 4. Page Saison (`/serie/{slug}-{id}/saison-{n}`)

Gabarit **allégé** (pas de doublon de la fiche) : hero compact (affiche saison + titre série › Saison n) → synopsis de saison → liste d'épisodes complète (composants §3) → casting spécifique saison → navigation saison précédente/suivante → retour fiche série.
- **SEO** : indexable, JSON-LD `TVSeason` rattaché à la série, canonical propre, breadcrumb `Accueil > Séries > {Série} > Saison {n}` ;
- Les épisodes n'ont **pas de page dédiée** en v1 (pas de `/episode/…`) : l'URL de lecture `/regarder/…/s{n}e{m}` suffit — évite 100 k+ pages thin content (D1 §6.1).

## 5. SEO spécifique

- JSON-LD **`TVSeries`** : numberOfSeasons/Episodes, startDate/endDate, `containsSeason` (résumé), acteurs, aggregateRating, WatchAction si visionnable ;
- `<title>` : « {Titre} (série {année}) — saisons, épisodes, où regarder | {Marque} » ;
- La fraîcheur épisodique est un **atout SEO** : `lastmod` du sitemap mis à jour à chaque nouvel épisode (requêtes « {série} saison {n} épisode {m} date »).

## 6. États additionnels

- **Série suivie, à jour** : CTA informatif « Prochain épisode le {date} » + option « Me le rappeler » (Could-have, H25) ;
- **Saison à venir** (annoncée sans épisodes) : onglet présent, grisé, avec date ;
- **Progression multi-saisons incohérente** (épisodes vus épars) : la reprise cible le **premier épisode non vu** après le dernier vu ;
- **Série sans épisodes datés** (TMDB incomplet) : liste minimale, pas de dates affichées.

## 7. Analytics additionnels

`serie.resume.click` (SxEy) · `serie.season.switch` · `serie.episode.play/expand` · `serie.markseen.season`.

---

## Hypothèses signalées

- **H27** : pas de pages épisode dédiées en v1 (anti-thin-content) — si un besoin SEO émerge (requêtes épisodes très fortes sur certaines séries), un gabarit épisode pourra être ajouté en v2 sans casser les URLs.
- **H28** : le flou spoiler-safe par défaut ne s'applique qu'aux épisodes récents (< 7 j) pour ne pas dégrader la navigation des séries anciennes.
