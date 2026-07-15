# Phase 5.1 — Lot 2 : Catalogue (TMDB)

> **Livrable** : client TMDB server-only + accueil en données réelles + fiches Film/Série + grilles + recherche (`app/`)
> **Statut** : ⏳ En attente de validation HITL (P28)
> **Pré-requis d'activation** : configurer `TMDB_ACCESS_TOKEN` (ou `TMDB_API_KEY`) — voir « Activation » ci-dessous. Sans clé, toutes les pages restent fonctionnelles en mode repli (démo/états vides), jamais d'erreur.

## Contenu du lot

| Élément | Fichier(s) | Décisions appliquées |
|---|---|---|
| Client TMDB bas niveau | `lib/tmdb/client.ts` (`server-only`, Bearer v4 ou clé v3, `fr-FR`, cache Next `revalidate`) | D5, D26 (clé jamais côté client) |
| Schémas de frontière | `lib/tmdb/schemas.ts` (Zod ; éléments malformés écartés silencieusement des listes) | D26 |
| Modèles canoniques | `lib/tmdb/models.ts` : `Title`/`TitleDetails`, mappers, URLs images, **slugs FR `titre-ID`** (l'ID fait foi) | D26, D10 |
| Requêtes catalogue | `lib/tmdb/queries.ts` : tendances, populaires/mieux notés (films+séries), sorties FR, détails (`credits,videos,similar`), recherche multi — échec ⇒ données vides + log serveur, jamais d'erreur de rendu | D5, D14 §états |
| Accueil réel | `page.tsx` : hero = 1er titre tendance avec backdrop (curation admin en 7.1), rails Tendances/Nouveautés/Séries, revalidation 30 min ; repli démo Lot 1 sans clé | D14 |
| Fiches Film & Série | `film/[slug]` + `serie/[slug]` + `components/title/TitleDetailPage.tsx` : hero backdrop, affiche, métadonnées, genres, synopsis, bande-annonce YouTube (`youtube-nocookie`), casting (12), similaires, **JSON-LD Movie/TVSeries + AggregateRating**, OG + canonical, AdSlot fiche | D15, D16, D5 |
| Grilles | `/films`, `/series`, `/decouvrir` (tendances mixtes) : grille responsive + pagination par liens (sans JS), plafond TMDB 500 pages | D19 |
| Recherche | `/recherche` : formulaire GET server-rendered (fonctionne sans JS), résultats films+séries, `noindex` | D19 |
| 404 globale | `not-found.tsx` (illustration B4 `error-404`) + 404 sur slug/ID invalide | D13 §5 |
| Config images | `next.config.ts` : `image.tmdb.org` seul hôte distant autorisé | D5 |
| DS complété | `ButtonLink` (variante lien du bouton), `TitleGrid`/`Pagination` | D25 §3 |

## Activation des données réelles

1. Créer un compte TMDB (gratuit) → [Paramètres → API](https://www.themoviedb.org/settings/api) → copier le **jeton d'accès en lecture v4**.
2. **Vercel** : Settings → Environment Variables → `TMDB_ACCESS_TOKEN` = le jeton (Production + Preview) → redéployer.
3. **Local** : `cp .env.example .env.local` puis renseigner la variable.

## Vérifications effectuées

- `npm run build` ✅ (TypeScript strict, 0 erreur) ; `npm run lint` ✅ ;
- Serveur de production local testé : `/`, `/films`, `/series`, `/decouvrir`, `/recherche(?q=)` → 200 ; slug invalide ou ID inconnu → 404 personnalisée ;
- Mode repli sans clé vérifié sur toutes les pages (démo/états vides, aucune erreur) ;
- « Publicité » toujours absente du DOM avec `ADS_ENABLED=false` (D6/D14).

## Hypothèses signalées

- **H67** : cache classique Next (`revalidate` fetch + segment) retenu pour l'équivalent ISR au lieu de `use cache`/`cacheComponents` (flag encore optionnel en 16.2) — révisable sans impact d'API.
- **H68** : attribution JustWatch et bloc « Où regarder » (D15 §Où regarder) reportés au Lot 3 avec les fonctionnalités compte — l'attribution TMDB est déjà dans le footer global.
- **H69** : la page `/gratuit` (catalogue Internet Archive, D5) reste sur contenus de démonstration — elle constitue un sous-lot dédié (pipeline visionnage, Lot 4).

## Reste à faire (Lots 3-6, rappel)

Compte & Ma liste (optimistic UI), lecteur Vidstack/hls.js + Watch + pré-roll, Studio UGC, pages support, tests Playwright/axe/Lighthouse CI.
