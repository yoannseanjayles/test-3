# Phase 6.1 — Lot 1 : Socle données

> **Livrable** : schéma Drizzle + migrations versionnées, client Neon avec repli sans base, flags D6 lus en base à effet immédiat, `/api/health`, CI GitHub Actions
> **Statut** : ⏳ En attente de validation HITL (P34)
> **Re-découpage** : Auth.js + synchro Ma liste passent au Lot 2 — livrables dès que `DATABASE_URL` existe (voir « Activation »).

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Schéma v1 | `app/src/lib/db/schema.ts` | `users` (rôles D11), `list_entries` (contrat exact du store front H70 : 3 listes, snapshot d'affichage, progress/position), `videos` (statuts `draft→uploading→processing→pending_review→published/rejected/removed`, licence + **déclaration de droits obligatoire** D11, clés R2 D7), `moderation_events` (audit trail 7.1), `app_config` (flags D6), `contact_messages` (+ champs takedown) |
| Migrations | `app/drizzle/0000_*.sql` | Générées par drizzle-kit, versionnées ; `npm run db:generate / db:migrate / db:studio` |
| Client base | `app/src/lib/db/index.ts` | Driver HTTP Neon (serverless, pas de pool), lazy ; **sans `DATABASE_URL` l'app fonctionne intégralement** (replis identiques à TMDB) |
| Flags runtime (D6) | `app/src/lib/ads/flags.ts` v2 | Lecture `app_config` avec cache mémoire 30 s + `invalidateConfigCache()` (7.1) ; **priorités : env `false` (kill switch) > base > env `true` (amorçage) > défaut OFF** ; API front inchangée |
| Health check | `/api/health` | `database`/`tmdb` : ok · unconfigured · error ; 503 si base en erreur ; R2 s'ajoutera au Lot 3 |
| CI (H84) | `.github/workflows/ci.yml` | lint + build + **19 tests E2E/a11y bloquants** sur PR et push branche par défaut ; rapport Playwright en artefact sur échec |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** (comportement sans base strictement identique — flags env only) ;
- `/api/health` vérifié : `{"status":"ok","database":"unconfigured","tmdb":"unconfigured"}` ;
- Kill switch vérifié par lecture de code et par la suite E2E (pub OFF par défaut inchangée).

## Activation (action commanditaire — 5 minutes)

1. Créer un projet gratuit sur [neon.tech](https://neon.tech) → copier la **connection string** (avec `?sslmode=require`).
2. Vercel → Settings → Environment Variables → `DATABASE_URL` (Production + Preview) → redéployer.
3. Local : renseigner `.env.local` puis `npm run db:migrate` (applique `drizzle/0000_*.sql`).
4. Vérifier `https://cineplus-eight.vercel.app/api/health` → `"database":"ok"`.

## Hypothèses signalées

- **H85** : re-découpage de 6.1 — Lot 2 = Auth.js v5 + adaptateur Drizzle + migration H70 de Ma liste + activation du formulaire de contact (H77) ; Lot 3 = ingestion R2/GitHub Actions (D7/D8) ; Lot 4 = studio upload (H78) + back-office minimal des flags.
- **H86** : le push du workflow CI dépend de la permission `workflows` du token GitHub (H84) — si refusé, le fichier est livré dans le dépôt de docs et sera activé manuellement.
