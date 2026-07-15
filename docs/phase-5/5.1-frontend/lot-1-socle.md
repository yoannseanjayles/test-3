# Phase 5.1 — Lot 1 : Socle front-end

> **Livrable** : projet initialisé + design system en code + layout global (`app/`)
> **Statut** : ✅ Validé HITL (D27)
> **Stack** (D26) : Next.js **16.2** (App Router, plus récent que le 15 proposé — API identique, params asynchrones et nouveau modèle de cache pris en compte) · TypeScript strict · Tailwind v4 · Radix (installé, utilisé dès les modales) · TanStack Query (installé, utilisé au Lot 3) · Zod.

## Contenu du lot

| Élément | Fichier(s) | Décisions appliquées |
|---|---|---|
| Thème = tokens D25 | `src/app/globals.css` (`@theme inline` sur les variables) | palette charbon/ambre/violet, surfaces à paliers, motion + reduced-motion, scrims, focus ring |
| Fontes self-hosted | `src/app/layout.tsx` (`next/font` : Space Grotesk, Inter, JetBrains Mono) | D25 §1.5, zéro layout shift |
| Layout global | `Header` (nav 6 entrées + recherche), `BottomNav` (5 items mobile, safe-area), `Footer` (**attributions TMDB/JustWatch**), skip-link | D10 §1, D5 §3.3, D1 a11y |
| Design system (base) | `ui/` : `Button` (3 variantes, loading stable), `TitleCard` (2:3, badge Gratuit ▶/Nouveau, fallback couleur dominante + monogramme), `Rail` (region nommée, « Voir tout », libellé explicable), `Badge`, `Skeleton`/`SkeletonRail`, `EmptyState` (illustration B3 + 1 action), `Logo` (provisoire) | D25 §3, D13 §5 |
| Advertising DS (base) | `ads/` : `AdSlot` (hauteur **réservée**, `null` si OFF — absent du DOM), `AdLabel` | D25 §4, D6, D14 |
| Feature flags serveur | `lib/ads/flags.ts` (`server-only`) : `ads.enabled` + par emplacement + `ugc.upload.enabled` (non-admin seulement) ; env en Lot 1, config runtime en 6.1/7.1 | D6, D11/D13 |
| Accueil de démonstration | `src/app/page.tsx` : hero (image B5) + rails démo + AdSlot + bandeau conversion | structure D14 (données réelles au Lot 2) |
| Médias servis | `public/media/interface/` (35 assets B3-B6) | 3.1 |

## Vérifications effectuées

- `npm run build` ✅ (TypeScript strict, 0 erreur) ;
- Rendu production vérifié (curl) : skip-link, nav, hero, badges présents ; **« Publicité » absente du DOM** avec `ADS_ENABLED=false` (conformité D6/D14) ;
- `.env.example` documente tous les flags.

## Lots suivants (proposition)

- **Lot 2 — Catalogue** : client TMDB (`lib/tmdb`, server-only, modèles canoniques), accueil réel (ISR), grilles Films/Séries/Genres facettées, fiches Film/Série, recherche ;
- **Lot 3 — Compte & interactions** : auth, Ma liste (favoris/historique/en-cours, optimistic UI), paramètres ;
- **Lot 4 — Lecteur** : Vidstack+hls.js, page Watch, reprise, adSlot pré-roll ;
- **Lot 5 — Studio UGC + pages support** ; **Lot 6 — qualité** (tests Playwright/axe/Lighthouse CI).

## Hypothèses signalées

- **H66** : Next 16.2 retenu (version installée par le scaffold officiel) au lieu de 15 — aucune incidence sur les décisions D26 ; le nouveau modèle de cache (`use cache`/`cacheLife`) sera utilisé au Lot 2 pour l'équivalent ISR.
