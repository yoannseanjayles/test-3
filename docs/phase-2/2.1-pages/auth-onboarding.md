# Spécification de pages — Connexion (`/connexion`), Inscription (`/inscription`), Onboarding (`/bienvenue`)

> **Étape** : 2.1 (lot 12/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D12 (flow V5 : conversion contextuelle), D13 (onboarding 3 écrans max) · noindex sauf mention

## 1. Principes
- L'auth est un **détour, pas une destination** : retour garanti à la page et à l'action d'origine (`?next=` signé, action rejouée — le favori cliqué est ajouté après connexion) ;
- Formulaires minimaux, erreurs inline explicites, jamais de CAPTCHA visible (honeypot + rate limit).

## 2. Inscription (`/inscription`) — indexable (SEO « compte gratuit »)
- Bandeau valeur (3 puces : reprise partout · liste personnelle · recos qui s'expliquent) ;
- Champs : e-mail · mot de passe (jauge de robustesse, règles affichées avant erreur) — **pas de confirmation de mot de passe** (pattern obsolète, œil de visualisation) ; pseudo demandé plus tard (défaut dérivé de l'e-mail) ;
- Cases : CGU (obligatoire) · newsletter (optionnelle, décochée — RGPD) ;
- Vérification e-mail **non bloquante** : compte utilisable immédiatement, bandeau de rappel ; requis seulement pour l'upload UGC (D11) ;
- OAuth (Google) = Could-have v1.5 (H43).

## 3. Connexion (`/connexion`)
E-mail + mot de passe · « Rester connecté » (30 j) · lien `/mot-de-passe-oublie` (e-mail avec lien à expiration 1 h, réponse toujours neutre — pas d'énumération de comptes) · verrouillage progressif après échecs (backoff, pas de blocage sec).

## 4. Onboarding (`/bienvenue`) — 3 écrans, skippable à chaque étape (D13)
1. **3 genres favoris** (grille de chips visuelles, min 1 pour « Continuer ») ;
2. **3 titres aimés** (recherche instantanée intégrée + suggestions populaires par genre choisi) ;
3. **Mes services de streaming** (logos toggle) ;
→ Atterrissage : Accueil avec rail « Pour commencer » (D14) + toast « Vos recommandations sont prêtes ».
- Skip total → Accueil générique ; l'onboarding reste accessible depuis /profil (« Affiner mes goûts ») ;
- Barre de progression, < 60 s au total ; mesure du taux de complétion par écran.

## 5. Analytics
`auth.signup.start/success` (source du déclencheur V5) · `auth.login.success/fail` · `auth.reset.request` · `onboarding.step.view/complete/skip` · `onboarding.finish` (nb de signaux collectés).

## Hypothèses
- **H43** : v1 = e-mail/mot de passe seul ; OAuth Google en v1.5 (réduit la friction mais ajoute une dépendance et un flux RGPD).
- **H44** : session par cookie httpOnly sécurisé (défini en 6.1) ; « Rester connecté » = refresh token 30 j révocable.
