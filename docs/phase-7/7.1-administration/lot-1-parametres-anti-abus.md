# Phase 7.1 — Lot 1 : Paramètres & anti-abus

> **Livrable** : registre de paramètres typés + écran back-office « Paramètres » (quotas paramétrables) + rate limiting en base sur les mutations sensibles
> **Statut** : ⏳ En attente de validation HITL (P40)
> **Lève** : H96 (config numérique) · H88 (rate limiting) · H91 (quota constant → paramétrable)

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Registre typé | `lib/settings/index.ts` + table `app_settings` (migration `0001`) | **Seules les clés déclarées existent**, chacune avec défaut/bornes/description : `ugc.quota.videos_per_user` (5), `ugc.upload.max_mb` (2048), `ads.preroll.session_cap` (1 — consommé par la décision pub au Lot 2), `moderation.sla_hours` (72) ; cache 30 s + invalidation ; sans base = défauts. Les flags booléens D6/D11 restent dans `app_config` (API inchangée) |
| Écran Paramètres | `/admin/parametres` | Généré depuis le registre (label, bornes, unité, défaut), validation Zod bornée côté serveur, effet ≤ 30 s ; entrée de nav dédiée |
| Quotas branchés | `lib/studio/actions.ts` | Quota vidéos et taille max d'upload lus depuis les paramètres (plus de constantes) ; SLA affiché dans la file de modération |
| Rate limiting (H88) | `lib/rate-limit.ts` + table `rate_limits` | Fenêtre fixe en base (sans Redis), purge paresseuse, **fail-open** (une panne d'anti-abus ne casse jamais le service) ; appliqué à : connexion (10/15 min/IP), inscription (5/h/IP), contact (5/h/IP), création d'upload (10/h/utilisateur) ; jamais sur la modération admin |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** (site public inchangé) ;
- Migration `0001` générée et versionnée (s'applique avec `npm run db:migrate`) ;
- Sans base : paramètres = défauts, rate limiting inactif (les mutations concernées exigent la base de toute façon).

## Hypothèses signalées

- **H104** : fenêtre **fixe** (et non glissante) retenue pour le rate limiting v1 — plus simple, précision suffisante pour l'anti-abus ; glissante si besoin réel.
- **H105** : identification par IP via `x-forwarded-for` (fiable derrière Vercel) ; e-mails non utilisés comme sujet pour éviter de stocker des identifiants en clair dans `rate_limits`.

## Reste à faire (Lots 2-3, rappel)

Lot 2 — Mesure & revenus : socle `events`, `lib/ads/decision.ts` (house ads), écran Revenus, CMP maison. Lot 3 — Notifications & opérations : cloche in-app, Resend (H83), suppression de compte RGPD, OPERATIONS.md, job seuils free tier.
