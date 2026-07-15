# Spécification de page — Fiche Film (`/film/{slug}-{id}`)

> **Étape** : 2.1 (page 2/14, ordre validé D13)
> **Statut** : ⏳ En attente de validation HITL
> **S'appuie sur** : D1 (hiérarchie de fiche, SEO), D5 (TMDB + watch/providers + YouTube), D6 (pub), D7 (lecture), D12 (flows V1/V3), D14 (composants Accueil réutilisés)

---

## 1. Objectif

La fiche film est le **gabarit d'acquisition SEO n°1** (flow V3 : « où regarder X », « casting de Y ») et le **point de décision** : chaque visite doit se conclure par une action de valeur — ▶ Regarder, bande-annonce, Où regarder (sortie trackée), + Ma liste — ou une poursuite qualifiée (similaires, casting).

**KPI de la page** : taux d'action de valeur ; position/CTR SERP sur les requêtes titre ; taux de rebond sans action.

## 2. Structure (sections, de haut en bas)

| # | Section | Détail |
|---|---|---|
| 1 | **Hero** | Backdrop 16:9 plein cadre (dégradé de lisibilité), affiche 2:3 en desktop, **titre H1 + titre original**, métadonnées : année · durée · genres (liens) · classification d'âge · pays |
| 2 | **Note & badges** | Note agrégée TMDB /10 (visible — condition du JSON-LD `AggregateRating`), nombre de votes, badges : **Gratuit ▶** (si visionnable) · Nouveau |
| 3 | **Barre de CTA** | 1. **▶ Regarder** (si visionnable → /regarder/…, primaire) ou **Reprendre à hh:mm** si progression ; 2. **Bande-annonce** (modale YouTube nocookie + façade) ; 3. **+ Ma liste** (toggle, optimistic) ; 4. **Vu** (marquer vu) ; 5. Partager (Web Share API / copie lien) |
| 4 | **Où regarder** | Module JustWatch-style (D5) : par type d'offre (Abonnement / Location / Achat), logos + nom, pays FR, **attribution JustWatch obligatoire**, filtre « Mes services » si connecté. **Fallback si aucune dispo** : « Indisponible en streaming en France actuellement » + bouton « M'alerter » (connecté) + lien tendances du même genre |
| 5 | **Synopsis** | 3-5 lignes, « Lire plus » au-delà ; tagline en exergue si disponible |
| 6 | **Casting & équipe** | Rail de `PersonCard` (photo, nom, rôle) → /personne/… ; réalisateur/scénariste en tête ; « Voir tout » (dépliant) |
| 7 | `ad.display.fiche` **[pub ON]** | Sous le casting, jamais entre CTA et synopsis (D10 §3) |
| 8 | **Médias** | Galerie backdrops/affiches (lightbox) + vidéos supplémentaires (teasers, extraits — YouTube) |
| 9 | **Détails** | Tableau : titre original, statut, date de sortie FR, budget/recettes (si TMDB), langues, sociétés de production ; **source & licence** si titre visionnable (D5 §3.3) |
| 10 | **Collection** | Si le film appartient à une saga TMDB : rail de la collection (« Dune : la saga ») |
| 11 | **Similaires** | Rail « Vous aimerez aussi » : TMDB `/recommendations`, fallback `/similar` (D1) — excluant le déjà-vu/déjà-listé (connecté) |
| 12 | **Fil d'Ariane** | `Accueil > Films > {Genre principal} > {Titre}` (haut de page, discret) + `BreadcrumbList` |

Mobile : l'affiche disparaît (backdrop seul), CTA en barre sticky bas d'écran au scroll.

## 3. Composants (nouveaux vs réutilisés)

- Réutilisés (D14) : `Rail`, `TitleCard`, `AdSlot`, header/footer ;
- Nouveaux : `MediaHero` (backdrop+affiche+méta), `CtaBar` (sticky mobile), `WatchProviders` (+ fallback + attribution), `RatingBadge`, `PersonCard`, `TrailerModal` (façade → iframe nocookie, focus-trap, Échap), `DetailsTable`, `Lightbox`.

## 4. Contenu & copy

- H1 = titre FR ; titre original en sous-titre si différent ;
- `<title>` : « {Titre} ({année}) — où regarder, bande-annonce, casting | {Marque} » — aligne l'intention SEO ;
- Meta description generée : « {Titre} ({année}) de {réalisateur} avec {2 acteurs}. Note {x}/10. Où le regarder en streaming, bande-annonce et casting complet. » ;
- Libellés d'offre FR : Abonnement · Location · Achat · **Gratuit sur {Marque}** (si visionnable).

## 5. SEO (cœur du gabarit)

- **JSON-LD `Movie`** : name, alternateName, image (affiche), datePublished, duration (ISO 8601), genre, director, actor (top 5), `aggregateRating` (visible §2), `trailer` (VideoObject), `potentialAction WatchAction` vers /regarder/… si visionnable ;
- `BreadcrumbList` (§12) ; canonical auto-référentiel ; slug + ID stable, 301 sur changement de slug (D10) ;
- **OG image composée dynamiquement** 1200×630 : backdrop + affiche + titre + note (D1 §6.1 — l'affiche 2:3 seule ne suffit pas) + Twitter Card `summary_large_image` ;
- ISR : revalidation 24 h (fiches chaudes : 1 h via tag de cache lors des pics de tendance) ;
- Anti-thin-content : la fiche agrège toujours ≥ 3 blocs de valeur (dispo + note + casting) sinon `noindex` (titres quasi vides de TMDB).

## 6. Performance & accessibilité

- LCP = backdrop (preload, AVIF/WebP, tailles TMDB alignées) ; affiche en `w342/w500` ;
- CLS 0 : ratios réservés (16:9 backdrop, 2:3 affiche, hauteurs de rails fixes) ;
- `TrailerModal` et `Lightbox` code-splittés (INP) ;
- A11y : H1 unique, ordre de titres logique (H2 par section), alt descriptif sur l'affiche (page de destination — D1 §6.3), boutons CTA ≥ 24 px, focus visible sur toutes les cartes, modale conforme (focus-trap, `aria-modal`, retour du focus au déclencheur).

## 7. États

- **Visionnable** : CTA primaire ▶ Regarder + badge + bloc source/licence (§9) ;
- **Progression existante** : « Reprendre à 1 h 12 » + barre de progression sous le CTA ;
- **Aucune dispo streaming** : fallback §4 (jamais de module vide) ;
- **Titre sans backdrop** (fréquent hors blockbusters) : hero dégradé de couleur extraite de l'affiche ;
- **Panne TMDB** : version cache stale + bandeau discret (D1) ;
- **Pub OFF** : section 7 absente du DOM (D14).

## 8. Événements analytics

`film.view` (id, source d'arrivée) · `film.cta.watch/trailer/watchlist/seen.click` · `film.providers.outbound` (**la sortie « Où regarder » = conversion North Star**, avec provider + type d'offre) · `film.similar.click` · `film.ad.impression/click` `[pub ON]`.

---

## Hypothèses signalées

- **H25** : « M'alerter » (dispo streaming) est un Could-have (D4) — le bouton est spécifié mais peut être livré en v1.5 ; à trancher au développement.
- **H26** : la note affichée est celle de TMDB seule en v1 (pas d'agrégation multi-sources — OMDb reporté en v2, D5 §3.4).
