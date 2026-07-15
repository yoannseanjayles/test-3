# Decision Log

Historique des décisions importantes du projet. Une décision n'est inscrite ici qu'après **validation HITL**.

| # | Date | Étape | Décision | Justification | Statut |
|---|---|---|---|---|---|
| D1 | 2026-07-15 | 1.0 | Adoption des **10 principes directeurs** du [Best Practices Summary](phase-1/1.0-best-practices-summary.md) comme référentiel pour toute la suite du projet (ISR+BFF+cache 3 étages, miroir local incrémental, nav simple, rails explicables, facettes d'excellence, fiche hiérarchisée, recherche instantanée, recos sans ML, SEO programmatique légitime, WCAG 2.2/CWV dès la conception) | Synthèse sourcée de l'état de l'art 2025-2026 (leaders du streaming, sites de découverte, NN/g, Baymard, W3C, web.dev, Google Search Central) | ✅ Validé HITL |
| D2 | 2026-07-15 | Mission | **Élargissement du brief acté** : la mission couvre le **visionnage vidéo premium**, la **publicité intelligente** et la **monétisation** (9 phases au lieu de 7). La v1 du livrable 1.1 (découverte seule, jamais validée) est remplacée. | Nouveau prompt de mission du 2026-07-15 | ✅ Validé HITL |
| D3 | 2026-07-15 | 1.0 | Adoption des **principes directeurs 11-15** de l'[Addendum Visionnage & Monétisation](phase-1/1.0-addendum-visionnage-monetisation.md) : HLS + lecteur open source, hébergement vidéo free tier, visionnage premium complet (reprise cross-device, WebVTT), publicité plafonnée VAST/VMAP + consentement TCF, non-dégradation UX avant tout placement | Synthèse sourcée de l'état de l'art streaming/AVOD 2025-2026 | ✅ Validé HITL |
| D4 | 2026-07-15 | 1.1 | Adoption de la [Vision Produit v2](phase-1/1.1-vision-produit.md) : plateforme hybride « découverte + visionnage », North Star « sessions à valeur », AVOD léger v1, trajectoire v1→v3, et hypothèse structurante **H8** (catalogue visionnable v1 = domaine public/licences ouvertes + trailers ; contenu licencié en v2) | Contrainte légale : aucune API gratuite ne confère de droits de diffusion sur du contenu récent sous copyright | ✅ Validé HITL |

| D5 | 2026-07-15 | 1.2 | Adoption de l'[Architecture des APIs](phase-1/1.2-architecture-apis.md) : **TMDB** (source principale catalogue/images/discover/recos), **TMDB watch/providers** avec attribution JustWatch (« Où regarder »), **YouTube embeds** via IDs TMDB (bandes-annonces), **Internet Archive** (catalogue visionnable domaine public), compléments reportés en v2 — risque R1 (licence commerciale TMDB dès monétisation effective) accepté et budgété | Voir le livrable 1.2 | ✅ Validé HITL |
| D6 | 2026-07-15 | Transverse | **La publicité doit pouvoir être activée/désactivée** : interrupteur global (kill switch) + flags par emplacement (pré-roll, display, native…), pilotés depuis le back-office, effet immédiat sans redéploiement. La plateforme doit être pleinement fonctionnelle publicité désactivée (état par défaut au lancement, cohérent avec R1). | Directive utilisateur du 2026-07-15 ; à spécifier en 6.2 (architecture pub) et 7.1 (back-office) | ✅ Validé HITL |

## Décisions proposées (en attente de validation)

| # | Date | Étape | Proposition | Justification |
|---|---|---|---|---|
| P7 | 2026-07-15 | 1.3 | Adopter la [Video Streaming Architecture](phase-1/1.3-architecture-streaming.md) : pipeline d'encodage **ffmpeg → HLS** (H.264+AAC, 3 qualités), hébergement **Cloudflare R2** (zéro egress) avec alternative managée Mux free tier, lecteur **hls.js + UI Vidstack** (slot publicitaire abstrait, IMA-ready, conforme D6), sous-titres **WebVTT** multi-pistes, reprise de lecture par heartbeat, URLs signées | Voir le livrable 1.3 |
