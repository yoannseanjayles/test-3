# Phase 6.1 — Lot 3 : Ingestion vidéo

> **Livrable** : stockage R2 (uploads présignés), pipeline d'encodage ffmpeg→HLS sur GitHub Actions, parcours de dépôt réel du Studio, diffusion des vidéos publiées
> **Statut** : ✅ Validé HITL (D37) — déployé en production (prêt-à-activer)
> **Prêt-à-activer** (D34/D35) : sans les variables R2, le Studio garde ses états actuels — 19/19 tests verts inchangés.

## Le flux complet (D7/D8/D11)

```
Studio (formulaire + déclaration de droits obligatoire)
  → createUploadAction : garde-fous (session, switch UGC sauf admin, quota 5/compte H91)
    → ligne `videos` en `uploading` + URL présignée PUT
  → PUT direct navigateur → R2 (progression affichée, le fichier ne transite pas par Vercel)
  → finalizeUploadAction : `processing` + repository_dispatch GitHub Actions (H82)
  → encode.yml : ffmpeg → HLS 3 qualités (1080p/720p/480p, D7) → R2 `hls/{id}/`
  → webhook `/api/ingest/complete` (secret Bearer) : `pending_review`
  → modération (7.1) : `published` → visible dans /gratuit (« Créations de la communauté »)
    et lisible sur /regarder/{slug} (résolution en base pour les slugs hors catalogue éditorial)
```

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Client R2 | `lib/storage/r2.ts` | S3 API (endpoint compte), presign PUT (upload) / GET (job, modération), URL publique des rendus publiés (H90) |
| Actions Studio | `lib/studio/actions.ts` | create/finalize/listMyVideos — session obligatoire, **switch UGC non appliqué aux admins (D11)**, quota 5 vidéos/compte (H91), licence + **déclaration de droits ≥ 20 caractères obligatoires**, 2 Go max |
| Worker d'encodage | `.github/workflows/encode.yml` | `repository_dispatch` → aws cli (endpoint R2) → **ffmpeg HLS 3 qualités** (segments 6 s, VOD) → upload R2 → callback signé (succès/échec) ; timeout 2 h, concurrence par vidéo |
| Webhook complétion | `/api/ingest/complete` | Bearer `INGEST_WEBHOOK_SECRET`, Zod, transitions strictes `processing→pending_review` (succès) ou `→uploading` (échec ffmpeg, relançable) — **jamais de publication directe (D11)** |
| UI Studio | `components/studio/UploadForm.tsx` | Upload avec progression (XHR), messages d'erreur accessibles, **« Mes vidéos » avec statuts** (envoi/encodage/modération/publiée/refusée) |
| Diffusion | `lib/videos/published.ts` + `/gratuit` + `/regarder/[slug]` | Vidéos `published` uniquement, section « Créations de la communauté », lecture HLS via URL publique du bucket ; pages en revalidation 300 s |
| Health | `/api/health` | + statut `r2` |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** (comportements par défaut inchangés) ;
- `/api/health` : `{"database":"unconfigured","tmdb":"unconfigured","r2":"unconfigured"}` ;
- Studio : état fermé conforme sans configuration ; transitions du webhook vérifiées par lecture de type (statuts stricts).

## Activation (actions commanditaire — après Neon/AUTH_SECRET)

1. **Cloudflare R2** (gratuit) : créer un bucket + un jeton API S3 → variables Vercel `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` (accès public du bucket) ;
2. **GitHub** : ajouter les secrets du dépôt (`R2_*`, `INGEST_WEBHOOK_SECRET`) ; créer un fine-grained token (permission Contents RW) → `GITHUB_DISPATCH_TOKEN` + `GITHUB_ENCODE_REPO` + `APP_BASE_URL` + `INGEST_WEBHOOK_SECRET` sur Vercel ;
3. Activer l'upload : `ugc.upload.enabled` en base (ou `UGC_UPLOAD_ENABLED=true`) — les admins peuvent déposer même switch OFF (D11).

## Hypothèses signalées

- **H90** : les rendus HLS publiés sont servis par l'URL publique du bucket (contenu public par nature) ; les URLs signées HMAC par session (D7) arrivent avec le Worker Cloudflare dédié (trajectoire 6.2/7).
- **H91** : quota v1 = 5 vidéos/compte non-admin — ajustable en base au back-office (7.1).
- **H92** : sources sans piste audio non gérées par le mapping ffmpeg v1 (échec propre → statut relançable) ; à traiter au premier cas réel.
- **H93** : la publication (`pending_review → published`) n'a pas encore d'interface — c'est le premier écran du back-office (Lot 4 / 7.1) ; en attendant, publiable via SQL (`db:studio`).

## Reste à faire (Lot 4, rappel)

Back-office minimal : modération (publier/refuser + `moderation_events`), pilotage des flags D6, rate limiting (H88) ; puis 6.2 Advertising Technical Specification.
