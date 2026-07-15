# Spécification de page — Gratuit ▶ (`/gratuit`)

> **Étape** : 2.1 (lot 8/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D4 (H8), D5 (Internet Archive), D8/D11 (contenus ingérés + UGC), D13 (« vitrine, pas un filtre »)

## 1. Objectif
La **vitrine du différenciateur** : tout ce qui se regarde gratuitement, immédiatement, sur place. C'est aussi la destination de l'entrée de nav « Gratuit ▶ » (D10) et la page qui prouve la promesse (« commencez à regarder immédiatement », D4).

**KPI** : taux visite → lecture ; part des sessions lecteur initiées ici.

## 2. Structure
| # | Section | Détail |
|---|---|---|
| 1 | **Hero éditorial** | Le « film gratuit de la semaine » (curation) : backdrop + pitch 1 phrase + ▶ Regarder direct |
| 2 | **Rail « Ajoutés récemment »** | fraîcheur visible = catalogue vivant |
| 3 | **Collections curatées** | étagères thématiques : « Classiques du film noir », « Cinéma muet », « Open movies », « Créations de la communauté » `[UGC]` — chaque étagère = liste éditoriale |
| 4 | **Grille complète facettée** (gabarit lot 6) | facettes réduites : genre · décennie · durée · type (Film/Série/Court/UGC) · tri |
| 5 | **Bandeau explicatif** (bas de page) | d'où viennent ces contenus : domaine public, licences ouvertes, créateurs — transparence licences (D5 §3.3) + lien FAQ |

- **Qualité d'abord** : seuls les titres passés par la curation (H12) apparaissent ; pas de dump Internet Archive brut ;
- Chaque carte : badge de source discret (Domaine public · CC · Communauté) ;
- Section UGC séparée visuellement des œuvres patrimoniales (attentes différentes) — présente uniquement si des vidéos UGC sont publiées.

## 3. SEO
Indexable, fort potentiel (« films gratuits en streaming », « films domaine public ») ; intro éditoriale unique ; JSON-LD `ItemList` ; ISR 1 h.

## 4. États & analytics
- Catalogue restreint au lancement (dizaines de titres) : la page reste dense grâce aux collections — jamais une grille clairsemée ; le hero et 2 étagères suffisent à un lancement propre ;
- `free.view` · `free.hero.play` · `free.collection.click` · `free.card.play` (source de la carte) · `free.explainer.click`.

## Hypothèses
- **H37** : « film gratuit de la semaine » curé manuellement (back-office, H23) ; fallback = dernier ajout le mieux noté.
- **H38** : pas de pagination des collections au lancement (catalogue < 200 titres) ; la grille lot 6 prend le relais à mesure que le catalogue grandit.
