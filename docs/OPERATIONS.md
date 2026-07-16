# Runbook opérationnel — Ciné+ (7.0 §6)

> Procédures nommées pour l'exploitation quotidienne. Public : administrateurs.
> Rappel accès : `/admin` (rôle admin — amorçage `ADMIN_EMAILS`).

## 1. Takedown (demande d'ayant droit) — priorité absolue (D11)

1. Notification « ⚠️ Demande d'ayant droit » (cloche admin + e-mail si Resend) — le message est **épinglé en tête** de `/admin/messages` ;
2. Vérifier la demande (URL visée, qualité du demandeur) ; en cas de doute raisonnable : **retirer d'abord**, arbitrer ensuite ;
3. `/admin/videos` → « Retirer » avec motif (audité dans `moderation_events`) ;
4. Répondre au demandeur (e-mail du message) et passer le message en « Traité ». **SLA : paramètre `moderation.sla_hours` (défaut 72 h).**

## 2. Encodage en panne

- Vidéo bloquée en « Encodage » ou « Envoi à reprendre » : `/admin/videos` → **↻ Relancer l'encodage** ;
- Diagnostiquer : onglet Actions du dépôt GitHub (workflow « Encodage vidéo ») — logs ffmpeg complets ;
- Causes connues : source sans piste audio (H92), quota minutes GitHub épuisé (voir §4), secrets R2 invalides ;
- Échec répété : télécharger la source (URL présignée), encoder localement, déposer le rendu dans `hls/{id}/` et rejouer le webhook.

## 3. Rotation des secrets

| Secret | Où | Procédure |
|---|---|---|
| `AUTH_SECRET` | Vercel | Nouvelle valeur (`openssl rand -base64 32`) → redéploiement → toutes les sessions JWT sont invalidées (reconnexion) |
| `DATABASE_URL` | Vercel (+ local) | Régénérer le mot de passe dans Neon → mettre à jour → redéployer |
| Jeton R2 | Cloudflare + secrets GitHub + Vercel | Créer le nouveau jeton avant de révoquer l'ancien (pas d'interruption d'upload) |
| `INGEST_WEBHOOK_SECRET` | Vercel + secrets GitHub | Changer les **deux** simultanément (sinon les webhooks sont rejetés) |
| `GITHUB_DISPATCH_TOKEN` | Vercel | Fine-grained token, portée dépôt, permission Contents RW |

## 4. Seuils free tier (H81)

Le job hebdomadaire « Surveillance des quotas » appelle `/api/ops/usage` (alerte admin ≥ 80 %) :

| Ressource | Quota gratuit | À 80 % | Plan B |
|---|---|---|---|
| Neon (base) | 0,5 Go | Purger `events` anciens (rétention 13 mois), agrégats journaliers (H102) | Plan payant Neon (Phase 8 chiffre le coût) |
| R2 (vidéo) | 10 Go stockage | Supprimer les **sources** des vidéos publiées (garder les rendus HLS) | R2 payant — zéro egress reste l'avantage décisif |
| GitHub Actions | 2 000 min/mois | Suspendre l'ouverture UGC (switch D11) le temps du mois | Worker dédié (VPS) — même contrat (6.0 §5) |
| Resend | 100 e-mails/jour | L'in-app reste le canal de référence (H94) | Palier payant ou file d'attente |

## 5. Suppression de compte (RGPD)

Demande via contact (motif « Données personnelles ») → `/admin/utilisateurs` → **Supprimer (RGPD)** : listes, notifications et fenêtres de rate limit rattachées sont effacées (FK cascade) ; les vidéos publiées restent en catalogue (licence de diffusion déclarée à l'upload) mais sont **anonymisées** (plus de rattachement au compte). Répondre sous 30 jours (engagement de la politique de confidentialité).

## 6. Restauration base

Neon conserve l'historique (branches) : créer une branche au point-in-time voulu → vérifier → basculer `DATABASE_URL`. Toujours tester sur une branche avant de toucher la production.
