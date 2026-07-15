# Phase 5.1 — Lot 3 : Compte & interactions

> **Livrable** : Ma liste (favoris/en-cours/historique) avec UI optimiste + bouton Ma liste sur les fiches + pages Connexion/Inscription + page d'attente Gratuit ▶ (`app/`)
> **Statut** : ✅ Validé HITL (D29) — déployé en production

## Contenu du lot

| Élément | Fichier(s) | Décisions appliquées |
|---|---|---|
| Store bibliothèque | `lib/library/store.ts` (client) : favoris/en-cours/historique, `useSyncExternalStore`, persistance `localStorage`, synchronisation entre onglets, écritures optimistes | D19 Ma liste ; **H70** (persistance locale en attendant le BFF 6.1 — même API d'opérations, seul le transport changera) |
| Bouton « Ma liste » | `components/library/WatchlistButton.tsx` (`aria-pressed`, bascule instantanée), intégré à l'en-tête des fiches Film/Série | D15 §CTA (« Regarder » arrive avec le lecteur, Lot 4) |
| Page Ma liste | `/ma-liste` : onglets **Radix Tabs** Favoris / En cours / Historique avec compteurs, grilles avec retrait à l'unité, 3 états vides illustrés (B3), `noindex` | D19, D13 §5 |
| Connexion / Inscription | `/connexion`, `/inscription` : parcours annoncé honnêtement (comptes actifs avec 6.1), mise en avant de Ma liste locale, `noindex` — plus de liens morts depuis le header et le bandeau conversion | D19 Auth/Onboarding |
| Gratuit ▶ (attente) | `/gratuit` : page d'attente illustrée (catalogue visionnable + lecteur au Lot 4, H69) — plus de 404 depuis la navigation principale | D19 |

## Vérifications effectuées

- `npm run build` ✅ (TypeScript strict, 0 erreur) ; `npm run lint` ✅ ;
- Serveur de production local : `/ma-liste`, `/connexion`, `/inscription`, `/gratuit` → 200 ; onglets et états vides rendus ;
- Rendu serveur de Ma liste : état vide (le store s'hydrate côté client, pas de mismatch).

## Hypothèses signalées

- **H70** : Ma liste persiste en `localStorage` (par appareil) jusqu'au back-end 6.1 ; à l'ouverture des comptes, migration du contenu local vers le profil à la première connexion.
- **H71** : « En cours » et « Historique » sont en lecture seule tant que le lecteur (Lot 4) ne les alimente pas — leurs états vides l'expliquent.
- **H72** : TanStack Query entre en scène au branchement BFF (6.1) pour le serveur ; le store local n'en a pas besoin (état synchrone).

## Reste à faire (Lots 4-6, rappel)

Lecteur Vidstack/hls.js + page Watch + pré-roll + catalogue Gratuit (Internet Archive), Studio UGC, pages support & légal, tests Playwright/axe/Lighthouse CI.
