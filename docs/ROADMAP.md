# Roadmap

> **Note** : le brief de mission a été élargi le 2026-07-15 (visionnage vidéo + publicité + monétisation). La roadmap compte **9 phases**.

## Phases terminées

### ✅ Phase 1 — Architecture (terminée le 2026-07-15)

| Étape | Livrable | Décisions |
|---|---|---|
| 1.0 Recherche | [Best Practices Summary](phase-1/1.0-best-practices-summary.md) + [Addendum Visionnage & Monétisation](phase-1/1.0-addendum-visionnage-monetisation.md) | D1, D2, D3 |
| 1.1 Vision produit | [Vision Produit v2](phase-1/1.1-vision-produit.md) | D4 |
| 1.2 Choix des APIs | [Architecture des APIs](phase-1/1.2-architecture-apis.md) | D5 |
| 1.3 Architecture Streaming | [Video Streaming Architecture](phase-1/1.3-architecture-streaming.md) | D7, D8 |
| 1.4 Sitemap | [Sitemap](phase-1/1.4-sitemap.md) | D10, D11 |
| 1.5 Parcours utilisateur | [User Flows](phase-1/1.5-parcours-utilisateur.md) | D12 |

Exigences transverses actées : **pub ON/OFF + pré-roll** (D6), **ingestion vidéo depuis l'appli** (D8), **toute option = exigence ferme** (D9), **upload utilisateur avec interrupteur** (D11).

### ✅ Phase 2 — Définition des pages (terminée le 2026-07-15)

| Étape | Livrable | Décisions |
|---|---|---|
| 2.0 Recherche | [Best Practices Summary — Pages](phase-2/2.0-best-practices-pages.md) | D13 |
| 2.1 Conception des pages (14/14) | [Accueil](phase-2/2.1-pages/accueil.md) · [Fiche Film](phase-2/2.1-pages/fiche-film.md) · [Fiche Série](phase-2/2.1-pages/fiche-serie.md) · [Watch](phase-2/2.1-pages/watch.md) · [Recherche](phase-2/2.1-pages/recherche.md) · [Grilles](phase-2/2.1-pages/grilles-catalogue.md) · [Découverte/Tendances/Nouveautés](phase-2/2.1-pages/decouverte-tendances-nouveautes.md) · [Gratuit ▶](phase-2/2.1-pages/gratuit.md) · [Ma liste](phase-2/2.1-pages/ma-liste.md) · [Profil/Paramètres](phase-2/2.1-pages/profil-parametres.md) · [Studio UGC](phase-2/2.1-pages/studio-ugc.md) · [Auth/Onboarding](phase-2/2.1-pages/auth-onboarding.md) · [Support & légal](phase-2/2.1-pages/support-legal.md) · [Personne & Listes](phase-2/2.1-pages/personne-listes.md) | D14-D19 |
| 2.2 Expérience Visionnage | [Video Experience Specification](phase-2/2.2-video-experience-specification.md) | D20 |

### ✅ Phase 3 — Génération des médias (terminée le 2026-07-15)

| Étape | Livrable | Décisions |
|---|---|---|
| 3.0 Recherche | [Best Practices Summary — Médias](phase-3/3.0-best-practices-medias.md) | D21 |
| 3.1 Inventaire | [Media Inventory](phase-3/3.1-media-inventory.md) | D22 |
| 3.2 Bibliothèque de prompts IA | [Media Prompt Library](phase-3/3.2-media-prompt-library.md) — familles B3+B4 générées et réceptionnées (`media/interface/src/`) | D23 |

### ✅ Phase 4 — Design System (terminée le 2026-07-15)

| Étape | Livrable | Décisions |
|---|---|---|
| 4.0 Recherche | [Best Practices Summary — Design System](phase-4/4.0-best-practices-design-system.md) | D24 |
| 4.1 Design System + Advertising DS | [Design Guidelines](phase-4/4.1-design-guidelines.md) + [tokens.css](../design/tokens.css)/[.json](../design/tokens.json) — nom définitif **Ciné+ / CinePlus** (risque marque R6 ouvert) | D25 |

### ✅ Phase 5 — Front-end (terminée le 2026-07-15)

| Étape | Livrable | Décisions |
|---|---|---|
| 5.0 Recherche | [Best Practices Summary — Front-end](phase-5/5.0-best-practices-frontend.md) | D26 |
| 5.1 Développement (6 lots) | [Socle](phase-5/5.1-frontend/lot-1-socle.md) · [Catalogue TMDB](phase-5/5.1-frontend/lot-2-catalogue.md) · [Compte & interactions](phase-5/5.1-frontend/lot-3-compte-interactions.md) · [Lecteur & gratuit](phase-5/5.1-frontend/lot-4-lecteur-gratuit.md) · [Studio & support](phase-5/5.1-frontend/lot-5-studio-support.md) · [Qualité](phase-5/5.1-frontend/lot-6-qualite.md) (19 tests E2E + axe) | D27-D32 |
| 5.1 Déploiement | [Vercel](phase-5/5.1-frontend/deploiement-vercel.md) — **en production : [cineplus-eight.vercel.app](https://cineplus-eight.vercel.app)** | D27 |

### ✅ Phase 6 — Back-end (terminée le 2026-07-16)

| Étape | Livrable | Décisions |
|---|---|---|
| 6.0 Recherche | [Best Practices Summary — Back-end](phase-6/6.0-best-practices-backend.md) | D33 |
| 6.1 Développement (4 lots) | [Socle données](phase-6/6.1-backend/lot-1-socle-donnees.md) · [Comptes & synchro](phase-6/6.1-backend/lot-2-comptes-synchro.md) · [Ingestion vidéo](phase-6/6.1-backend/lot-3-ingestion-video.md) · [**Back-office complet** (D36)](phase-6/6.1-backend/lot-4-back-office.md) — prêt-à-activer (variables Vercel) | D34, D35, D37, D38 |
| 6.2 Architecture publicitaire | [Advertising Technical Specification](phase-6/6.2-advertising-technical-specification.md) — v1 régie directe, v2 VAST/TCF | D39 |

### ✅ Phase 7 — Administration (terminée le 2026-07-16)

| Étape | Livrable | Décisions |
|---|---|---|
| 7.0 Recherche | [Best Practices Summary — Administration](phase-7/7.0-best-practices-administration.md) | D40 |
| 7.1 Développement (3 lots) | Lot 1 [Paramètres & anti-abus](phase-7/7.1-administration/lot-1-parametres-anti-abus.md) · Lot 2 [Mesure & revenus](phase-7/7.1-administration/lot-2-mesure-revenus.md) · Lot 3 [Notifications & opérations](phase-7/7.1-administration/lot-3-notifications-operations.md) | D41, D42, D44 |

Complément transverse : [Audit de complétude](AUDIT-COMPLETUDE.md) adopté et en partie corrigé (D43).

## Phase en cours

**Amélioration continue du contenu et des fonctionnalités des pages** (hors numérotation de phase — complète le produit livré en Phases 5-7)

| Lot | Contenu | Statut |
|---|---|---|
| P44 | Découverte (rails, hub /decouvrir, /nouveautes, /tendances), fiches (crew, détails, épisodes, page Personne), grilles & recherche instantanée, lecture (raccourcis, /gratuit enrichi), compte (tri/stats, données locales, ?next=), support & SEO transverse, back-office (badges, filtres, CSV) | ⏳ **en attente de validation** |

## Phases à venir

| Phase | Contenu | Livrables clés |
|---|---|---|
| **5 — Front-end** | Recherche (5.0) · Développement (5.1) dont lecteur vidéo et composants pub | Front-end documenté |
| **6 — Back-end** | Recherche (6.0) · Développement (6.1) · Architecture publicitaire (6.2) | Documentation technique, Advertising Technical Specification |
| **7 — Administration** | Recherche (7.0) · Compléments du back-office (7.1) : revenus, quotas paramétrables, affinages — le back-office complet est livré en 6.1 Lot 4 (D36) | Back-office consolidé |
| **8 — Modèle économique** | Recherche (8.0) · Business Model Canvas (8.1) · Stratégie monétisation (8.2) | Business Model Canvas, Monetization Strategy |
| **9 — Analytics & croissance** | KPIs utilisateurs et business, dashboards, rapports | Growth & Analytics Roadmap |

## Prochaines étapes

1. **Validation HITL du lot P44 (amélioration contenu & fonctionnalités)** ← nous sommes ici
2. Activation des services (variables Vercel) : `DATABASE_URL` + `AUTH_SECRET` + `ADMIN_EMAILS` → comptes/synchro/back-office · clés R2 + GitHub → ingestion vidéo · `TMDB_ACCESS_TOKEN` → catalogue réel · vérification live (Lot C1 de l'audit)
3. Reste de l'audit : lecteur avancé (sous-titres — B5), logo définitif (B6/R6), arbitrage juridique CMP (D2/H98), tests back-office (C5/E1), Lighthouse CI (E2)
4. Phases 8-9 (Business Model Canvas, monétisation, analytics) · risque R6 (marque) et H46 (juridique) à lever
