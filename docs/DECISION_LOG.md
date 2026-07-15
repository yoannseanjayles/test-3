# Decision Log

Historique des décisions importantes du projet. Une décision n'est inscrite ici qu'après **validation HITL**.

| # | Date | Étape | Décision | Justification | Statut |
|---|---|---|---|---|---|
| D1 | 2026-07-15 | 1.0 | Adoption des **10 principes directeurs** du [Best Practices Summary](phase-1/1.0-best-practices-summary.md) comme référentiel pour toute la suite du projet (ISR+BFF+cache 3 étages, miroir local incrémental, nav simple, rails explicables, facettes d'excellence, fiche hiérarchisée, recherche instantanée, recos sans ML, SEO programmatique légitime, WCAG 2.2/CWV dès la conception) | Synthèse sourcée de l'état de l'art 2025-2026 (leaders du streaming, sites de découverte, NN/g, Baymard, W3C, web.dev, Google Search Central) | ✅ Validé HITL |
| D2 | 2026-07-15 | Mission | **Élargissement du brief acté** : la mission couvre le **visionnage vidéo premium**, la **publicité intelligente** et la **monétisation** (9 phases au lieu de 7). La v1 du livrable 1.1 (découverte seule, jamais validée) est remplacée. | Nouveau prompt de mission du 2026-07-15 | ✅ Validé HITL |
| D3 | 2026-07-15 | 1.0 | Adoption des **principes directeurs 11-15** de l'[Addendum Visionnage & Monétisation](phase-1/1.0-addendum-visionnage-monetisation.md) : HLS + lecteur open source, hébergement vidéo free tier, visionnage premium complet (reprise cross-device, WebVTT), publicité plafonnée VAST/VMAP + consentement TCF, non-dégradation UX avant tout placement | Synthèse sourcée de l'état de l'art streaming/AVOD 2025-2026 | ✅ Validé HITL |
| D4 | 2026-07-15 | 1.1 | Adoption de la [Vision Produit v2](phase-1/1.1-vision-produit.md) : plateforme hybride « découverte + visionnage », North Star « sessions à valeur », AVOD léger v1, trajectoire v1→v3, et hypothèse structurante **H8** (catalogue visionnable v1 = domaine public/licences ouvertes + trailers ; contenu licencié en v2) | Contrainte légale : aucune API gratuite ne confère de droits de diffusion sur du contenu récent sous copyright | ✅ Validé HITL |

## Décisions proposées (en attente de validation)

| # | Date | Étape | Proposition | Justification |
|---|---|---|---|---|
| P5 | 2026-07-15 | 1.2 | Adopter l'[Architecture des APIs](phase-1/1.2-architecture-apis.md) : **TMDB** (source principale catalogue/images/discover/recos), **TMDB watch/providers** avec attribution JustWatch (« Où regarder »), **YouTube embeds** via IDs TMDB (bandes-annonces), **Internet Archive** (catalogue visionnable domaine public), compléments optionnels (TVmaze, OMDb, Wikidata) — avec le risque R1 (licence commerciale TMDB dès monétisation effective) explicitement accepté et budgété dans la trajectoire | Voir le livrable 1.2 |
