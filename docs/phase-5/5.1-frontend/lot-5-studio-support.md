# Phase 5.1 — Lot 5 : Studio & Support

> **Livrable** : Studio UGC (gouverné par l'interrupteur D11) + FAQ + Contact + À propos + 4 pages légales — plus aucun lien mort dans le footer (`app/`)
> **Statut** : ✅ Validé HITL (D31) — déployé en production

## Contenu du lot

| Élément | Fichier(s) | Décisions appliquées |
|---|---|---|
| Studio UGC | `/studio` : OFF (défaut) → état d'attente illustré (B3 `empty-studio`) + **règles de publication déjà affichées** (droits déclarés, modération a priori, quotas, retrait) ; ON → tableau de bord + dépôt annoncé (ingestion réelle en 6.1, H78) | D11, D19 Studio |
| FAQ | `/faq` : 5 groupes (+ « Publier une vidéo » seulement si UGC ON), réponse directe en 1re phrase, accordéons natifs `<details>` (zéro JS), **JSON-LD FAQPage**, bloc « pas trouvé ? » → contact | D19 Support §1, D13 |
| Contact | `/contact` : motifs complets dont **« Ayants droit / demande de retrait » (notice & takedown D11)** et « Annonceurs » (kit média Phase 8) ; envoi désactivé honnêtement (H77 — jamais de faux succès), activation en 6.1 | D19 Support §2, D11 |
| À propos | `/a-propos` : mission, explication du catalogue gratuit, **attributions obligatoires TMDB (non-endorsement) + JustWatch** | D19 Support §3, D5 §3.3 |
| Pages légales | `LegalPage` (gabarit commun : sommaire ancré, « Dernière mise à jour », résumé « En clair » par section) + `/cgu` (règles UGC D11, service gratuit avec pub plafonnée D6), `/confidentialite` (données par état du produit, durées, droits RGPD), `/cookies` (tableau des stockages **réels** dont `cineplus.library.v1` et capping pré-roll, bouton CMP à activation 6.2), `/mentions-legales` (hébergeurs réels) | D19 Support §4, D6, H46 |

## Vérifications effectuées

- `npm run build` ✅ (TypeScript strict, 0 erreur) ; `npm run lint` ✅ ;
- Serveur local : les 8 routes → 200 ; JSON-LD `FAQPage` rendu ; Studio en état OFF conforme ;
- Le footer (7 liens) ne comporte plus aucun lien mort.

## Hypothèses signalées

- **H77** : les formulaires (contact, dépôt studio) affichent le parcours complet mais l'envoi est désactivé tant que le back-end (6.1) n'existe pas — aucun faux succès n'est simulé.
- **H78** : le parcours de dépôt 4 étapes (`/studio/upload`) et la gestion par vidéo (`/studio/video/{id}`) seront branchés avec l'ingestion (6.1) ; le Lot 5 livre le tableau de bord et le cadre.
- **H46 (rappel)** : gabarits légaux livrés ; clauses finales à faire valider par un juriste avant ouverture publique (mentions éditeur à compléter).

## Reste à faire (Lot 6, rappel)

Qualité : tests Playwright/axe/Lighthouse CI, budgets perf bloquants, mode épisode série, i18n structure.
