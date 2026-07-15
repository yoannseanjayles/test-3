# Project Overview

## Vision

Concevoir et livrer une **plateforme premium (« 6 étoiles ») de découverte, de référencement, de visionnage et de monétisation de films et séries** : moderne, rapide, sécurisée, évolutive, entièrement documentée, utilisant **exclusivement des API et hébergements gratuits ou disposant d'un plan gratuit**.

> Brief élargi le 2026-07-15 : la mission couvre désormais aussi le **visionnage vidéo premium**, la **publicité intelligente** et le **modèle économique** (9 phases). Vision produit détaillée : [1.1 Vision Produit v2](phase-1/1.1-vision-produit.md) (validée — D4).

## Fonctionnalités cibles

- Catalogue complet de films et séries ;
- Fiches détaillées (film, série, personne) ;
- Recherche performante (instantanée, facettes) ;
- Recommandations intelligentes et explicables ;
- Suivi utilisateur (favoris, historique, progression, profil) ;
- **Expérience de visionnage premium** (lecteur HLS adaptatif, sous-titres, reprise cross-device) ;
- **Publicité intelligente non intrusive** (AVOD plafonné, VAST/VMAP, consentement TCF) ;
- Interface premium inspirée des meilleures plateformes du marché ;
- Back-office d'administration (contenus, utilisateurs, campagnes pub, analytics, revenus) ;
- Modèle économique viable (AVOD → freemium).

## État actuel

| Élément | Statut |
|---|---|
| **Phases terminées** | ✅ Phase 1 — Architecture (D1-D12) · ✅ Phase 2 — Pages (D13-D20) · ✅ Phase 3 — Médias (D21-D23, 35 assets réceptionnés) · ✅ Phase 4 — Design System (D24-D25, nom **Ciné+**, risque marque R6 ouvert) |
| **Phase en cours** | Phase 5 — Front-end |
| **Sous-étape en cours** | 5.0 Recherche — livrable rédigé (dont proposition de stack Next.js 15), **en attente de validation HITL** |
| **Dernier livrable** | [Best Practices Summary — Front-end](phase-5/5.0-best-practices-frontend.md) |
| **Exigences fermes actées** | **pub ON/OFF + pré-roll avant chaque vidéo** (D6) · **ingestion vidéo depuis l'appli** (D8) · **toute option = exigence** (D9) · **upload utilisateur avec interrupteur** (D11) |

## Méthode de travail

Travail phase par phase (**9 phases**), avec **validation HITL obligatoire** à la fin de chaque sous-étape. Aucun passage à l'étape suivante sans validation explicite. Voir [ROADMAP.md](ROADMAP.md) et [DECISION_LOG.md](DECISION_LOG.md).
