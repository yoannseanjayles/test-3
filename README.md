# Ciné+ (CinePlus) — Plateforme Premium de Découverte, Visionnage & Monétisation de Films et Séries

Plateforme « 6 étoiles » de découverte, référencement, **visionnage** et **monétisation** de films et séries — moderne, rapide, sécurisée, évolutive — construite exclusivement sur des **API et hébergements gratuits ou disposant d'un plan gratuit**.

## Documentation

| Document | Description |
|---|---|
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Vision, fonctionnalités, état actuel |
| [Roadmap](docs/ROADMAP.md) | Phases terminées, en cours, à venir (9 phases) |
| [Decision Log](docs/DECISION_LOG.md) | Historique des décisions validées |

## Livrables par phase

### Phase 1 — Architecture
- [1.0 — Best Practices Summary](docs/phase-1/1.0-best-practices-summary.md) ✅ *(validé HITL)*
- [1.0 — Addendum : Visionnage & Monétisation](docs/phase-1/1.0-addendum-visionnage-monetisation.md) ✅ *(validé HITL)*
- [1.1 — Vision Produit v2](docs/phase-1/1.1-vision-produit.md) ✅ *(validé HITL — périmètre élargi)*
- [1.2 — Architecture des APIs](docs/phase-1/1.2-architecture-apis.md) ✅ *(validé HITL)*
- [1.3 — Video Streaming Architecture](docs/phase-1/1.3-architecture-streaming.md) ✅ *(validé HITL)*
- [1.4 — Sitemap](docs/phase-1/1.4-sitemap.md) ✅ *(validé HITL)*
- [1.5 — Parcours utilisateur](docs/phase-1/1.5-parcours-utilisateur.md) ✅ *(validé HITL — Phase 1 terminée)*

### Phase 2 — Définition des pages
- [2.0 — Best Practices Summary : Pages](docs/phase-2/2.0-best-practices-pages.md) ✅ *(validé HITL)*
- 2.1 — Spécifications de pages ✅ **14/14** *(validées, dont validation anticipée D18)* : [Accueil](docs/phase-2/2.1-pages/accueil.md) · [Fiche Film](docs/phase-2/2.1-pages/fiche-film.md) · [Fiche Série](docs/phase-2/2.1-pages/fiche-serie.md) · [Watch](docs/phase-2/2.1-pages/watch.md) · [Recherche](docs/phase-2/2.1-pages/recherche.md) · [Grilles catalogue](docs/phase-2/2.1-pages/grilles-catalogue.md) · [Découverte/Tendances/Nouveautés](docs/phase-2/2.1-pages/decouverte-tendances-nouveautes.md) · [Gratuit ▶](docs/phase-2/2.1-pages/gratuit.md) · [Ma liste](docs/phase-2/2.1-pages/ma-liste.md) · [Profil/Paramètres](docs/phase-2/2.1-pages/profil-parametres.md) · [Studio UGC](docs/phase-2/2.1-pages/studio-ugc.md) · [Auth/Onboarding](docs/phase-2/2.1-pages/auth-onboarding.md) · [Support & légal](docs/phase-2/2.1-pages/support-legal.md) · [Personne & Listes](docs/phase-2/2.1-pages/personne-listes.md)
- [2.2 — Video Experience Specification](docs/phase-2/2.2-video-experience-specification.md) ✅ *(validé HITL — Phase 2 terminée)*

### Phase 3 — Génération des médias
- [3.0 — Best Practices Summary : Médias](docs/phase-3/3.0-best-practices-medias.md) ✅ *(validé HITL)*
- [3.1 — Media Inventory](docs/phase-3/3.1-media-inventory.md) ✅ *(validé HITL)*
- [3.2 — Media Prompt Library](docs/phase-3/3.2-media-prompt-library.md) ✅ *(validé HITL — Phase 3 terminée ; illustrations réceptionnées dans [media/interface](media/interface/README.md))*

### Phase 4 — Design System
- [4.0 — Best Practices Summary : Design System](docs/phase-4/4.0-best-practices-design-system.md) ✅ *(validé HITL)*
- [4.1 — Design Guidelines](docs/phase-4/4.1-design-guidelines.md) + [tokens](design/tokens.css) ✅ *(validé HITL — Phase 4 terminée ; nom définitif Ciné+/CinePlus)*

### Phase 5 — Front-end
- [5.0 — Best Practices Summary : Front-end](docs/phase-5/5.0-best-practices-frontend.md) ✅ *(validé HITL)*
- 5.1 — Développement : [Lot 1 — Socle](docs/phase-5/5.1-frontend/lot-1-socle.md) ✅ *(validé HITL — D27)* · [Lot 2 — Catalogue](docs/phase-5/5.1-frontend/lot-2-catalogue.md) (code dans [`app/`](app/)) ⏳ *(en attente de validation HITL — P28)*
- 5.1 — Déploiement : [Déploiement Vercel](docs/phase-5/5.1-frontend/deploiement-vercel.md) ✅ *(en ligne : [cineplus-eight.vercel.app](https://cineplus-eight.vercel.app))*
  - Rapports de recherche détaillés : [architecture](docs/phase-1/research/architecture.md) · [UX & navigation](docs/phase-1/research/ux-navigation.md) · [recherche & recommandations](docs/phase-1/research/recherche-recommandations.md) · [SEO, performance & accessibilité](docs/phase-1/research/seo-performance-accessibilite.md)

## Méthode

Le projet avance **phase par phase** (9 phases), avec **validation HITL (Human In The Loop) obligatoire** à la fin de chaque sous-étape. Aucun passage à l'étape suivante sans validation explicite.
