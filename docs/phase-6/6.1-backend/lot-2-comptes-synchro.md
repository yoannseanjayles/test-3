# Phase 6.1 — Lot 2 : Comptes & synchro

> **Livrable** : Auth.js v5 (credentials + argon2), inscription/connexion réelles, synchro bidirectionnelle Ma liste (migration H70), formulaire de contact actif (levée H77)
> **Statut** : ✅ Validé HITL (D35) — déployé en production (prêt-à-activer)
> **Construit prêt-à-activer** (D34) : sans `DATABASE_URL` + `AUTH_SECRET`, l'application garde exactement ses comportements actuels (annonces honnêtes, listes locales) — 19/19 tests verts inchangés.

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Auth.js v5 | `lib/auth/config.ts` + `/api/auth/[...nextauth]` | Credentials (e-mail + mot de passe **argon2**), sessions **JWT**, rôle dans le token (admin D11), `trustHost`, secret placeholder inerte sans `AUTH_SECRET` ; magic link (H83) et OAuth s'ajouteront sans changer le module |
| Actions auth | `lib/auth/actions.ts` | `registerAction` (Zod, hash argon2, message neutre anti-énumération), `loginAction` (AuthError → « Identifiants invalides »), `logoutAction` ; honeypot D13 ; **progressive enhancement** (fonctionnent sans JS) |
| Pages Connexion/Inscription | `connexion/`, `inscription/`, `components/auth/AuthForm.tsx` | Formulaires réels si l'auth est configurée (erreurs `aria-live`), état d'annonce actuel sinon |
| Session côté client | `components/auth/useSessionLite.ts` + `HeaderAuth.tsx` | Le header **reste statique** (aucune lecture de cookies au rendu) : la session est lue après hydratation via `/api/auth/session`, uniquement si l'auth est configurée ; affiche « Mon compte / Se déconnecter » |
| Synchro Ma liste (H70) | `lib/library/actions.ts` + `components/library/LibrarySync.tsx` | Montée dans le layout : pousse l'état local, **fusion serveur** (upsert par utilisateur/liste/titre), renvoie l'état consolidé réinjecté dans le store (`replaceLibrary`) ; debounce 5 s sur les changements ; l'UI reste **local-first** (H87) |
| Contact actif (H77) | `lib/support/actions.ts` + `components/support/ContactForm.tsx` | Enregistrement en base (`contact_messages`), champs takedown structurés affichés pour le motif ayants droit (D11), honeypot, confirmation réelle — jamais de faux succès sans base |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** (comportements par défaut inchangés) ;
- Accueil toujours **statique** (ISR 30 min) malgré l'auth — vérifié au build ;
- `/api/auth/session` → 200 (session nulle) sans configuration ; `/connexion` reste en mode annonce.

## Activation (actions commanditaire)

1. `DATABASE_URL` (Neon) — voir Lot 1 — puis `npm run db:migrate` ;
2. `AUTH_SECRET` : `openssl rand -base64 32` → variable Vercel (Production + Preview) ;
3. Redéployer → inscription/connexion et contact deviennent actifs ; la liste locale migre au premier login.

## Hypothèses signalées

- **H87** : l'UI des listes reste local-first (réponse instantanée) ; le serveur est la vérité durable via fusion à la connexion et debounce sur modification. Les suppressions inter-appareils convergent à la synchro suivante ; une résolution plus fine (tombstones) attendra un besoin réel.
- **H88** : rate limiting en base (fenêtre glissante) prévu au Lot 4 avec le back-office ; l'anti-abus v1 = honeypot + validations strictes.
- **H89** : la vérification live (créer un compte, synchroniser deux navigateurs, recevoir un message contact) sera faite dès la fourniture des variables — à intégrer à la validation P35 ou à un avenant.

## Reste à faire (Lots 3-4, rappel)

Ingestion vidéo R2 + GitHub Actions (D7/D8, upload studio H78) ; back-office minimal des flags + rate limiting + 6.2 (Advertising Technical Specification).
