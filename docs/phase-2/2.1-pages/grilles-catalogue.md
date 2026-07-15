# Spécification de pages — Grilles catalogue : Films (`/films`), Séries (`/series`), Genres (`/genres`, `/genre/{slug}`)

> **Étape** : 2.1 (lot 6/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D1 (facettes d'excellence — notre différenciateur n°1), D5 (TMDB `/discover`), D10 (URLs), D13

## 1. Objectif
Le **gabarit grille facettée** partagé : explorer le catalogue complet avec le meilleur filtrage du marché. Films/Séries/Genre sont trois entrées du même gabarit.

## 2. Structure commune
| # | Section | Détail |
|---|---|---|
| 1 | H1 + intro courte (1 phrase, SEO) | « Films » · « Séries » · « Films et séries de science-fiction » |
| 2 | **Barre de facettes** (sticky) | Genre (multi) · Décennie/année · Note min · Durée · Plateforme de streaming · **Gratuit ▶** (toggle) · Tri (Popularité/Note/Récence/Alphabétique) |
| 3 | **Chips actives** | retirables une à une + « Tout effacer » ; compteur de résultats en direct |
| 4 | **Grille** `TitleCard` | responsive 2→6 colonnes, badges, hover preview (D14) |
| 5 | `ad.display.browse` **[pub ON]** | 1 insert par ~4 rangées, jamais en 1re rangée |
| 6 | **Load More** | + URLs `?page=n` crawlables auto-canoniques (D1) ; position de scroll restaurée au retour |

## 3. Règles de facettes (différenciateur)
- **Compteurs par valeur** (« Années 1990 (312) ») recalculés à chaque sélection ;
- État complet dans l'URL (`/films?genre=sf,thriller&decennie=1990&note=7`) — partageable, back/forward fiables ;
- Application instantanée (pas de bouton « Appliquer ») avec `useTransition` (INP — D1) ;
- Mobile : tiroir plein écran avec récap sticky « Voir les {n} résultats » ;
- Aucune combinaison ne mène à un cul-de-sac : 0 résultat → suggestion de relâcher la dernière facette (chip mise en évidence).

## 4. Spécificités par page
- **/films, /series** : gabarit pur ; rails éditoriaux optionnels en tête (1 max) ;
- **/genres** : hub visuel — cartes de genres (image représentative + nom), 2 sections Film/Série ;
- **/genre/{slug}** : gabarit + intro éditoriale de 2-3 phrases (valeur SEO unique, anti-thin) + rail « Les incontournables du genre » (curation) au-dessus de la grille ; `?type=film|serie` en onglets.

## 5. SEO & indexation (rappel D10)
- Indexables : pages de base + genre×type + décennie ; `noindex` au-delà d'**une** facette non-genre (canonical vers la vue de base) ;
- JSON-LD `ItemList` (première page) ; breadcrumb sur les genres.

## 6. États & analytics
- Skeleton grille ; panne TMDB → grille du miroir local (peut être légèrement datée, bandeau discret) ;
- `browse.view` (facettes actives) · `browse.facet.apply/remove` · `browse.loadmore` · `browse.card.click` (position) · `browse.zero` (combinaison).

## Hypothèses
- **H33** : les compteurs de facettes viennent du miroir local (PostgreSQL) — TMDB discover ne fournit pas de counts par valeur ; en attendant la complétude du miroir, compteurs masqués (dégradation propre).
