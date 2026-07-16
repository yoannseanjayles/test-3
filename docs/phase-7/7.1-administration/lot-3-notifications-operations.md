# Phase 7.1 — Lot 3 : Notifications & opérations

> **Livrable** : notifications créateurs/admins (in-app + e-mail Resend), suppression de compte RGPD, runbook opérationnel, surveillance hebdomadaire des seuils free tier — **clôture de la 7.1**
> **Statut** : ⏳ En attente de validation HITL (P42)
> **Lève** : H94 (notifications) · H83 partiellement (e-mail si clé fournie) · concrétise 7.0 §5-6

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Notifications in-app | `lib/notifications` + table `notifications` (migration `0003`) | 5 types : vidéo publiée 🎉 / refusée (avec motif) / encodée (en modération) / **takedown reçu (admins)** / alerte quota (admins) ; best-effort — n'échoue jamais l'action métier |
| Émissions branchées | modération (approve/reject), webhook d'encodage, formulaire de contact | Le créateur est prévenu à chaque étape de la vie de sa vidéo ; les admins le sont dès qu'un ayant droit écrit (priorité D11) |
| Cloche header | `NotificationsBell` (dans `HeaderAuth`) | Badge non-lus, panneau accessible, ouverture = tout lu ; chargée au montage (pas de temps réel v1, H103) ; invisible si aucune notification |
| Écho e-mail (H83) | `lib/notifications` §Resend | Envoyé si `RESEND_API_KEY` + `EMAIL_FROM` configurés (100/jour gratuits) ; l'in-app reste le canal de référence |
| Suppression RGPD | `deleteUserAction` + bouton `/admin/utilisateurs` | Listes/notifications effacées (FK cascade), vidéos publiées **anonymisées** (owner → null, licence de diffusion conservée) ; jamais soi-même |
| Surveillance quotas (H81) | `/api/ops/usage` + `.github/workflows/quota-watch.yml` | Job hebdomadaire (lundi 08:00 UTC + manuel) : taille base Neon mesurée, **alerte admin ≥ 80 %** (cloche + e-mail) ; extensible R2/minutes Actions |
| Runbook | `docs/OPERATIONS.md` | Procédures : takedown (SLA paramétrable), panne d'encodage, rotation des secrets (tableau complet), seuils free tier avec plans B, suppression RGPD, restauration Neon (branches) |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** (site public inchangé — la cloche n'apparaît qu'avec des notifications) ;
- Migration `0003` versionnée ; `.env.example` complété (Resend, facultatif).

## Hypothèses signalées

- **H108** : l'opt-out e-mail (paramètre utilisateur) arrivera avec la page Profil/Paramètres utilisateur — volume négligeable d'ici là (notifications transactionnelles uniquement, jamais marketing).
- **H109** : la mesure R2/minutes GitHub du job quotas nécessite leurs APIs respectives — v1 mesure la base (le quota le plus contraint) ; extension documentée dans OPERATIONS.md §4.

## 7.1 — bilan de clôture

3 lots livrés : paramètres typés & anti-abus (D41), mesure & revenus (D42), notifications & opérations (P42). Le back-office compte **10 écrans** et la plateforme est intégralement opérable depuis l'interface. Reste de la Phase 7 : néant — direction **Phase 8 (Modèle économique)**.
