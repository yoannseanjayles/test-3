# Phase 5.1 — Lot 4 : Lecteur & Gratuit ▶

> **Livrable** : lecteur vidéo (hls.js + MP4 progressif), page Watch `/regarder/{slug}`, catalogue Gratuit ▶ réel, reprise/heartbeat/historique branchés sur Ma liste (`app/`)
> **Statut** : ✅ Validé HITL (D30) — déployé en production

## Contenu du lot

| Élément | Fichier(s) | Décisions appliquées |
|---|---|---|
| Lecteur v1 | `components/player/VideoPlayer.tsx` (client) : `<video>` natif + **hls.js** en import dynamique (manifestes `.m3u8` hors Safari, repli MP4 sur erreur fatale), écrans d'intro/reprise, pré-roll, fin et erreur (asset B4 `error-player`) | D7 (cœur hls.js), D17 |
| Séquence de lancement | intro → **pré-roll conditionnel** (pub ON via `video.preroll` + jamais à la reprise + **capping 1/titre/session** en `sessionStorage`) → contenu ; pré-roll placeholder 15 s skippable après 5 s (VAST réel en 6.2) ; **seule pub de la page** (décision de non-pollution D17) | D6, D17 |
| Reprise & heartbeat | position sauvée toutes les ~10 s dans Ma liste « En cours » (progress + positionSeconds), « Reprendre à mm:ss / Recommencer », fin → retrait d'« En cours » + entrée « Historique » + écran de fin avec recos | D7, D17, D19 Ma liste |
| Page Watch | `/regarder/{slug}` (URL D10) : lecteur + **fiche allégée** (titre, année, durée, genre, synopsis, licence + attribution), JSON-LD `VideoObject` + `WatchAction`, suggestions ; 404 sur slug inconnu | D17, D13 |
| Catalogue Gratuit ▶ | `lib/free-catalog.ts` : 7 œuvres éditorialisées (4 open movies Blender CC BY + 3 classiques du domaine public d'Internet Archive), licence/attribution obligatoires ; `/gratuit` en vraie vitrine (cartes 16:9, badges Gratuit ▶ + licence) ; rail accueil branché | D5, H8, D21 (médias contenu jamais générés) |
| Store étendu | `lib/library/store.ts` : `LibraryKind` (+`video`), `saveResumeProgress`, `markCompleted`, `positionSeconds` | D19 |

## Vérifications effectuées

- `npm run build` ✅ (TypeScript strict, 0 erreur) ; `npm run lint` ✅ (2 erreurs react-hooks corrigées en passant) ;
- Serveur local : `/gratuit` et les 7 pages `/regarder/*` → 200 (SSG), slug inconnu → 404 ;
- JSON-LD `VideoObject`, licence et attribution rendus ; « Publicité » absente du DOM avec pub OFF.

## Hypothèses signalées

- **H73** : UI **Vidstack reportée** — `@vidstack/react` (stable) exige React 18, incompatible avec notre React 19 ; le cœur reste hls.js (D7), contrôles natifs + surcouches DS en attendant (matrice complète 2.2 : itération dédiée quand Vidstack supportera React 19, ou UI custom complète en Lot 6).
- **H75** : les URLs sources (Internet Archive, bucket open movies) sont des hôtes tiers **non vérifiables depuis l'environnement de dev** (proxy) — à contrôler en preview ; l'état d'erreur du lecteur couvre toute source morte.
- **H76** : lecture progressive/HLS directe depuis les sources en attendant le pipeline ffmpeg→HLS→R2 + URLs signées (D7), livré en 6.1.

## Reste à faire (Lots 5-6, rappel)

Studio UGC + pages support & légal (Lot 5) ; qualité — tests Playwright/axe/Lighthouse CI, i18n structure, mode épisode série (Lot 6).
