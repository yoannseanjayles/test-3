# Déploiement Vercel — Ciné+ (app/)

> Statut : préparation validée en local (build + lint OK). Le rattachement du dépôt à Vercel est une action à réaliser depuis le compte Vercel du propriétaire du projet (ou via un token CI).

## Pré-requis vérifiés

- **Build de production** : `npm run build` passe (Next.js 16.2.10, Turbopack, pages statiques générées).
- **Lint** : `npm run lint` sans erreur.
- **Variables d'environnement** : aucune n'est requise pour le Lot 1. Les feature flags ont des valeurs par défaut sûres :
  - `ADS_ENABLED` — publicité désactivée par défaut (activer avec `true`) ;
  - `ADS_SLOT_<ID>` — un slot est actif sauf s'il vaut `false` ;
  - `UGC_UPLOAD_ENABLED` — upload UGC désactivé par défaut (activer avec `true`).
- **Plan gratuit** : le projet respecte la contrainte « hébergement gratuit » (plan Hobby de Vercel, adapté à Next.js).

## Point clé : Root Directory = `app`

Le dépôt est un monorepo documentaire : l'application Next.js vit dans le sous-dossier **`app/`**. Vercel doit donc être configuré avec **Root Directory = `app`** (réglage projet, non configurable via `vercel.json`).

## Option A — Intégration Git (recommandée)

1. Se connecter sur [vercel.com](https://vercel.com) avec le compte GitHub propriétaire du dépôt.
2. **Add New… → Project** → importer `yoannseanjayles/test-3`.
3. Dans **Configure Project** :
   - **Root Directory** : `app` (bouton *Edit*) ;
   - **Framework Preset** : Next.js (auto-détecté) ;
   - laisser les commandes build/install par défaut ;
   - aucune variable d'environnement à saisir pour le Lot 1.
4. **Deploy**. Chaque push sur la branche de production déclenchera ensuite un déploiement automatique ; chaque push sur une autre branche créera un *Preview Deployment*.

## Option B — CLI avec token (déploiement depuis un agent/CI)

1. Créer un token sur [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. L'exposer en variable d'environnement `VERCEL_TOKEN` dans l'environnement d'exécution.
3. Depuis `app/` :

   ```bash
   npx vercel link --yes --token "$VERCEL_TOKEN"   # crée/relie le projet
   npx vercel deploy --prod --token "$VERCEL_TOKEN"
   ```

## Après le premier déploiement

- Vérifier la page d'accueil (rendu des rails, chips d'intention, images `public/media/interface`).
- Activer l'**Analytics Vercel** (plan gratuit) si souhaité — à rapprocher de la Phase 9.
- Le domaine `*.vercel.app` est fourni ; un domaine personnalisé pourra être ajouté plus tard (risque marque R6 « Ciné+ » toujours ouvert, cf. Decision Log D25).
