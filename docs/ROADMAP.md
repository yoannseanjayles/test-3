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

## Phase en cours

**Phase 5 — Front-end**

| Étape | Livrable | Statut |
|---|---|---|
| 5.0 Recherche | [Best Practices Summary — Front-end](phase-5/5.0-best-practices-frontend.md) | ✅ Validé HITL (D26) |
| 5.1 Développement | Lot 1 [Socle](phase-5/5.1-frontend/lot-1-socle.md) (`app/`) ⏳ **en attente de validation** · Lots 2-6 à venir | En cours |

## Phases à venir

| Phase | Contenu | Livrables clés |
|---|---|---|
| **5 — Front-end** | Recherche (5.0) · Développement (5.1) dont lecteur vidéo et composants pub | Front-end documenté |
| **6 — Back-end** | Recherche (6.0) · Développement (6.1) · Architecture publicitaire (6.2) | Documentation technique, Advertising Technical Specification |
| **7 — Administration** | Recherche (7.0) · Back-office (7.1) dont modération UGC, pub et revenus | Back-office fonctionnel |
| **8 — Modèle économique** | Recherche (8.0) · Business Model Canvas (8.1) · Stratégie monétisation (8.2) | Business Model Canvas, Monetization Strategy |
| **9 — Analytics & croissance** | KPIs utilisateurs et business, dashboards, rapports | Growth & Analytics Roadmap |

## Prochaines étapes

1. **Validation HITL du Lot 1 (socle front)** ← nous sommes ici
2. Lots 2-6 de la 5.1 : catalogue TMDB → compte/interactions → lecteur → studio/support → qualité
3. Phases 6 à 9 · médias restants (B7/B8/C2/logo Ciné+) · risque R6 (marque) à lever
