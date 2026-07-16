# Phase 6.1 — Lot 4 : Back-office complet (D36)

> **Livrable** : espace `/admin` complet — tableau de bord, modération avec audit, gestion des vidéos, pilotage publicité/UGC à effet immédiat, messages & takedown, utilisateurs & rôles, ingestion admin
> **Statut** : ⏳ En attente de validation HITL (P37)
> **Périmètre** : back-office **complet** (directive D36) — il absorbe l'essentiel du périmètre prévu en 7.1 ; la Phase 7 se recentrera sur les compléments (revenus, quotas paramétrables, affinages).

## Accès & sécurité

- **Rôle admin obligatoire** (D11) : garde serveur sur toutes les pages ET revérification dans chaque action serveur ; non connecté → `/connexion`, connecté non-admin → 404 (l'espace n'est pas révélé) ;
- **Amorçage** : `ADMIN_EMAILS` (liste d'e-mails) — promotion automatique à l'inscription/connexion ; ensuite gestion des rôles depuis l'écran Utilisateurs (on ne peut pas se rétrograder soi-même) ;
- `noindex`, rendu dynamique (aucune mise en cache des données d'admin).

## Les 7 écrans

| Écran | Contenu |
|---|---|
| **Tableau de bord** `/admin` | Tuiles actionnables (vidéos en modération, encodages, publiées, messages non traités, utilisateurs — mises en évidence si action attendue) + état des services (base/TMDB/R2) |
| **Modération** `/admin/moderation` | File `pending_review` (plus ancienne d'abord), déclaration de droits affichée, **aperçu du rendu HLS**, ✓ Publier / ✕ Refuser avec **motif obligatoire** — chaque décision tracée dans `moderation_events` (audit D11) |
| **Vidéos** `/admin/videos` | Catalogue complet avec statuts ; **retrait/takedown** (motif obligatoire, audité) ; **relance d'encodage** des vidéos bloquées (re-dispatch GitHub Actions) |
| **Publicité & flags** `/admin/publicite` | Les 7 interrupteurs D6/D11 (global, 4 emplacements display/natif, pré-roll, UGC) — **effet ≤ 30 s sans redéploiement** ; rappel du kill switch env prioritaire |
| **Messages** `/admin/messages` | File de contact, **takedowns non traités épinglés en tête** (D11), détail structuré (URL, qualité du demandeur), cycle nouveau → en cours → traité |
| **Utilisateurs** `/admin/utilisateurs` | Liste, rôles, promotion/rétrogradation admin |
| **Ingestion** `/admin/ingestion` | Upload admin (D8) : même pipeline que le Studio, sans quota et hors interrupteur UGC (D11) |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** (le site public est inchangé) ;
- Garde vérifiée : `/admin/*` → 307 vers `/connexion` sans session ;
- Les 7 routes admin construites en rendu dynamique ; lien « Back-office » visible dans le header uniquement pour les admins.

## Hypothèses signalées

- **H94** : notifications aux créateurs (motifs de refus, publication) affichées dans « Mes vidéos » ; l'envoi d'e-mails attend Resend (H83).
- **H95** : le tableau « revenus » (Phase 7/8) sera ajouté quand la publicité produira des données ; l'écran Publicité couvre déjà tout le pilotage D6.
- **H96** : quota UGC (5/compte) encore constant — passage en `app_config` numérique prévu en Phase 7 (la table est aujourd'hui booléenne).

## Activation

Aucune variable nouvelle hors `ADMIN_EMAILS` (Vercel, Production + Preview). Chemin complet : `DATABASE_URL` + `AUTH_SECRET` + `ADMIN_EMAILS` → créer son compte → le lien « Back-office » apparaît dans le header.
