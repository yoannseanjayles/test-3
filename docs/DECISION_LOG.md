# Decision Log

Historique des décisions importantes du projet. Une décision n'est inscrite ici qu'après **validation HITL**.

| # | Date | Étape | Décision | Justification | Statut |
|---|---|---|---|---|---|
| D1 | 2026-07-15 | 1.0 | Adoption des **10 principes directeurs** du [Best Practices Summary](phase-1/1.0-best-practices-summary.md) comme référentiel pour toute la suite du projet (ISR+BFF+cache 3 étages, miroir local incrémental, nav simple, rails explicables, facettes d'excellence, fiche hiérarchisée, recherche instantanée, recos sans ML, SEO programmatique légitime, WCAG 2.2/CWV dès la conception) | Synthèse sourcée de l'état de l'art 2025-2026 (leaders du streaming, sites de découverte, NN/g, Baymard, W3C, web.dev, Google Search Central) | ✅ Validé HITL |

## Décisions proposées (en attente de validation)

| # | Date | Étape | Proposition | Justification |
|---|---|---|---|---|
| P2 | 2026-07-15 | Mission | **Prendre acte de l'élargissement du brief** : la mission couvre désormais aussi le **visionnage vidéo premium**, la **publicité intelligente** et la **monétisation** (9 phases au lieu de 7). La v1 du livrable 1.1 (découverte seule, jamais validée) est remplacée. | Nouveau prompt de mission du 2026-07-15 |
| P3 | 2026-07-15 | 1.0 | Adopter les **principes directeurs 11-15** de l'[Addendum Visionnage & Monétisation](phase-1/1.0-addendum-visionnage-monetisation.md) (HLS + lecteur open source, hébergement vidéo free tier, visionnage premium complet, publicité plafonnée VAST/VMAP + TCF, non-dégradation UX) en complément des 10 principes validés (D1) | Synthèse sourcée de l'état de l'art streaming/AVOD 2025-2026 |
| P4 | 2026-07-15 | 1.1 | Adopter la [Vision Produit v2](phase-1/1.1-vision-produit.md) : plateforme hybride « découverte + visionnage », North Star « sessions à valeur », AVOD léger, et notamment l'hypothèse structurante **H8** (catalogue visionnable v1 = domaine public/licences ouvertes + trailers ; contenu licencié en v2) | Voir le livrable 1.1 v2 ; contrainte légale : aucune API gratuite ne confère de droits de diffusion |
