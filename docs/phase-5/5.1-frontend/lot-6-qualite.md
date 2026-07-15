# Phase 5.1 — Lot 6 : Qualité

> **Livrable** : suite E2E Playwright (parcours critiques) + audits d'accessibilité automatisés (axe-core, bloquants) + configuration Lighthouse CI (budgets D26) — **clôture de la 5.1**
> **Statut** : ✅ Validé HITL (D32) — déployé en production, Phase 5 close

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Config Playwright | `app/playwright.config.ts` | Exécution contre le **build de production** (`next start`, mêmes conditions que Vercel), flags par défaut (pub OFF, UGC OFF, TMDB non configuré ⇒ replis), Chromium préinstallé détecté automatiquement (CI : `npx playwright install chromium`) |
| Parcours critiques (9 tests) | `tests/e2e/parcours.spec.ts` | Accueil (hero, rails, skip-link) · **pub OFF ⇒ « Publicité » absente du DOM (D6/D14)** · Gratuit → page de lecture (écran d'intro, licence) · slug inconnu ⇒ vraie 404 · Ma liste (3 onglets + états vides) · recherche fonctionnelle **sans JS** · FAQ (accordéons) · **footer sans lien mort (7 liens vérifiés en HTTP)** · Studio fermé (D11) |
| Accessibilité (10 tests, bloquants) | `tests/e2e/accessibilite.spec.ts` | axe-core WCAG 2.1 AA sur 10 pages clés — toute violation fait échouer la suite ; l'audit auto couvre ~30-40 % de WCAG, les parcours clavier/lecteur d'écran restent au plan manuel |
| Lighthouse CI | `app/lighthouserc.json` | Budgets D26 bloquants : perf ≥ 90, a11y ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 300 ms sur 4 pages représentatives — à brancher en CI (GitHub Actions) avec le back-end |
| Scripts | `package.json` | `npm run test:e2e` / `test:e2e:ui` |

## Violations réelles corrigées par le lot

L'audit axe a détecté **11 violations sérieuses**, toutes corrigées :

- `color-contrast` (10 pages) : les textes en `text-primary/40`, `text-primary/50` (~3,9:1) et le texte légal du footer en `text-disabled` (3,34:1) passaient sous les 4,5:1 requis → remplacés par `text-secondary` (6,4:1, conforme). Le token `--text-disabled` reste réservé aux **contrôles réellement désactivés** (exemptés par WCAG).
- `link-in-text-block` (contact) : lien repérable uniquement par la couleur → soulignement ajouté.

## Vérifications effectuées

- **19/19 tests passent** (build de production) ; `npm run build` + `npm run lint` ✅ ;
- Contrastes recalculés : `text-secondary` = 6,37:1 (surface-raised) / 6,57:1 (surface-base).

## Hypothèses signalées

- **H79** : Lighthouse CI est configuré mais s'exécutera en CI (GitHub Actions) montée avec la Phase 6 — l'environnement de dev ne permet pas de run Lighthouse fiable.
- **H80** : reportés à une itération post-Phase 6 (dépendants du back-end ou de contenus réels) : mode épisode série (`/s{n}e{m}`), structure i18n, tests des parcours compte/UGC.

## Phase 5 — bilan de clôture

6 lots livrés et validés : socle + design system en code (L1), catalogue TMDB complet (L2), Ma liste optimiste (L3), lecteur + catalogue gratuit (L4), studio/support/légal (L5), qualité (L6). **Le front v1 est en production** : [cineplus-eight.vercel.app](https://cineplus-eight.vercel.app). Prochaine étape : **Phase 6 — Back-end** (6.0 recherche, 6.1 BFF/auth/ingestion, 6.2 architecture publicitaire).
