# Spécification de page — Recherche & Résultats (`/recherche?q=…`)

> **Étape** : 2.1 (lot 5/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D1 (recherche instantanée, jamais zéro résultat), D5 (TMDB `/search/multi`), D13

## 1. Objectif
Réduire « j'ai un titre en tête » à **une frappe et un clic**. Deux modes : **overlay instantané** (partout) et **page de résultats** (exploration + partage d'URL).

## 2. Overlay instantané (global)
- Ouverture : icône loupe, raccourci `/`, focus auto ; plein écran mobile ;
- Débounce 250 ms, annulation des requêtes en vol, cache session des requêtes ;
- **6-8 suggestions riches** : affiche mini, titre, année, badge type (Film/Série/Personne), badge Gratuit ▶ ; navigation clavier complète (↑↓ Entrée Échap) ;
- Requêtes récentes de l'utilisateur (effaçables) quand le champ est vide + « Tendances actuelles » ;
- Tolérance aux fautes : normalisation accents/casse + index client des ~5 000 titres populaires (Fuse.js) pour « Vouliez-vous dire… » (D1) ;
- `Entrée` sans sélection → page Résultats.

## 3. Page Résultats
- H1 « Résultats pour “{q}” » + compte ; état dans l'URL (partageable) ;
- **Onglets** : Tout · Films · Séries · Personnes (compteurs) ;
- Facettes (onglets Films/Séries) : genre, décennie, note min, Gratuit ▶ seulement ;
- Grille `TitleCard` + « Load More » ; personnes en `PersonCard` ;
- **Zéro résultat impossible** : correction orthographique proposée + tendances + genres populaires (D1) ;
- `noindex` (D10), mais liens internes crawlables vers les fiches.

## 4. États, perf, analytics
- Skeleton dans l'overlay dès la frappe ; erreur API → requêtes récentes + tendances du cache ;
- Perçu < 100 ms : réponses servies du cache BFF pour les requêtes chaudes ;
- `search.open` · `search.type` (longueur, latence) · `search.suggestion.click` (position) · `search.results.view/click` · `search.zero` (q) — les `search.zero` alimentent la curation.

## Hypothèses
- **H32** : recherche par personne incluse dès la v1 (TMDB multi le permet sans coût) ; recherche par « univers/collection » = v2.
