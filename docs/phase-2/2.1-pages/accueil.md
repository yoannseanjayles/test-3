# Spécification de page — Accueil (`/`)

> **Étape** : 2.1 (page 1/14, ordre validé D13)
> **Statut** : ⏳ En attente de validation HITL
> **S'appuie sur** : D1 (hero unique, rails explicables), D4 (North Star), D6 (pub ON/OFF), D10 (sitemap), D12 (flows V1/U1), D13 (variété de conteneurs, états vides)

---

## 1. Objectif

L'Accueil est la **vitrine et l'aiguillage** : amener chaque visiteur à une **action de valeur en moins de 2 minutes** (O1) — reprendre une lecture, lancer un titre gratuit, ouvrir une fiche, chercher. Il doit démontrer la promesse premium en un coup d'œil (qualité visuelle, fraîcheur, personnalisation explicable) et exposer le différenciateur **Gratuit ▶**.

**KPI de la page** : taux de sessions avec ≥ 1 action de valeur depuis l'accueil ; CTR du hero ; CTR du rail 1.

## 2. Structure (sections, de haut en bas)

| # | Section | Anonyme | Connecté |
|---|---|---|---|
| 0 | **Header/nav** (6 entrées D10 + recherche + avatar/connexion) — sticky, translucide sur le hero | ✔ | ✔ |
| 1 | **Hero** : 1 titre unique mis en avant (curation admin, fallback = n°1 des tendances). Backdrop plein cadre, dégradé de lisibilité, logo/titre, métadonnées courtes (année · genre · durée), synopsis 2 lignes, **CTA primaire ▶ Regarder** (si visionnable, sinon Bande-annonce) + **CTA secondaire + Ma liste**. Jamais d'autoplay sonore ; motion léger désactivé si `prefers-reduced-motion` | ✔ | ✔ |
| 2 | **Rail « Continuer la lecture »** — cartes avec barre de progression, reprise 1 clic (flow U1) | — (si progression localStorage : oui + invite compte) | ✔ rail n°1 |
| 3 | **Rail « Tendances cette semaine »** — « Voir tout » → /tendances | ✔ | ✔ |
| 4 | **Étagère « Gratuit ▶ » (conteneur distinct : cartes larges 16:9 + badge)** — « Voir tout » → /gratuit | ✔ | ✔ |
| 5 | `ad.display.home` **[pub ON]** — bannière responsive entre rails, étiquetée « Publicité » | ✔ | ✔ |
| 6 | **Rails personnalisés explicables** (« Parce que vous avez ajouté *Dune* ») — max 2 | — remplacé par « Les mieux notés » | ✔ |
| 7 | **Grille mise en avant** : liste éditoriale du moment (6-8 cartes + intro courte) → /liste/{slug} | ✔ | ✔ |
| 8 | **Rail « Nouveautés »** → /nouveautes | ✔ | ✔ |
| 9 | `ad.native.rail` **[pub ON]** — rail sponsorisé étiqueté, même gabarit de cartes | ✔ | ✔ |
| 10 | **Rail « Bientôt plus disponible »** (si données providers) ou 2e liste éditoriale | ✔ | ✔ |
| 11 | **Bandeau conversion** (anonyme seulement) : « Créez un compte gratuit — reprenez où vous en êtes, sur tous vos écrans » → /inscription | ✔ | — |
| 12 | **Footer** (D10) | ✔ | ✔ |

**Total : 8 rails/conteneurs de contenu max** (D1 ≤ 12, resserré) ; aucun titre ne peut apparaître dans plus de 2 conteneurs (dédoublonnage descendant : le rail le plus haut gagne).

## 3. Composants mobilisés (premières définitions pour la Phase 4/5)

- `Header` (nav 6 + recherche + compte, variante mobile bottom-bar) ;
- `HeroBillboard` (image responsive `fetchpriority=high`, jamais lazy — budget LCP) ;
- `TitleCard` affiche 2:3 (badges : Gratuit ▶ · Nouveau) + variante `WideCard` 16:9 (étagère Gratuit) + `ProgressCard` (reprise) ;
- `Rail` (scroll horizontal, boutons ‹ › ≥ 24 px, `role=region` + `aria-label`, cartes tabbables — D1) ;
- `EditorialGrid` (grille mise en avant) ;
- `AdSlot` (display + native, chargé uniquement si pub ON **et** consentement — D6/D7) ;
- `ConversionBanner` ; `SkeletonRail` (état de chargement).

## 4. Contenu & copy (FR, ton premium sobre)

- Titres de rails : courts, **explicables**, sans jargon (« Parce que vous avez ajouté X », jamais « Recommandé pour vous ») ;
- Hero : synopsis coupé à ~140 caractères, verbe d'action dans le CTA (« Regarder », « Voir la bande-annonce ») ;
- Étiquette pub : « Publicité » / « Sponsorisé » — explicite, jamais « Suggestion » (D6, confiance) ;
- `<title>` : « {Marque} — Films et séries : découvrez, choisissez, regardez » ; meta description orientée promesse (< 155 car.).

## 5. CTA (hiérarchie)

1. **▶ Regarder** (hero + cartes gratuites) — primaire, accent unique de la palette ;
2. **Reprendre** (cartes progression) ;
3. **+ Ma liste** (hero + hover/focus de toute carte) ;
4. **Voir tout** (chaque rail) ;
5. **Créer un compte** (bandeau anonyme).

## 6. SEO, performance, accessibilité (application des budgets validés)

- **SEO** : ISR revalidation ~1 h ; HTML complet (rails crawlables en `<a>`) ; JSON-LD `WebSite` + `SearchAction` (sitelinks searchbox) ; canonical `/`.
- **Performance** : LCP = image hero (preload, AVIF/WebP, < 2,5 s mobile) ; CLS 0 (ratios réservés partout) ; rails sous la flottaison en `content-visibility:auto` ; page servie sans JS bloquant — l'interactivité s'hydrate par îlots.
- **Accessibilité** : ordre de focus logique, skip-link « Aller au contenu », contrastes AA sur dégradé du hero (vérifiés sur l'image la plus claire), annonces `aria-live` sur l'ajout Ma liste.

## 7. États

- **Chargement** : skeleton hero + 3 skeleton rails (jamais de spinner plein écran) ;
- **Anonyme sans données** : pas de rail 2/6 — la page reste pleine (tendances/gratuit/éditorial) ;
- **Connecté sans historique** (post-onboarding) : rail « Pour commencer » basé sur le taste picker ;
- **Panne API TMDB** : contenus servis du cache stale + bandeau discret « Données en cours d'actualisation » (D1) ;
- **Pub OFF** (D6) : sections 5 et 9 **absentes du DOM** (pas d'espace réservé vide).

## 8. Événements analytics (Phase 9, posés dès maintenant)

`home.hero.impression/click` · `home.rail.impression/click` (avec position + type) · `home.ad.impression/click` `[pub ON]` · `home.resume.click` · `home.signup_banner.click`.

---

## Hypothèses signalées

- **H23** : le hero est curable par l'admin (back-office, section « mises en avant ») avec fallback automatique tendances — cohérent A5, à confirmer en 7.1.
- **H24** : 8 conteneurs max à l'accueil (resserrement du ≤ 12 validé) — la densité premium prime ; ajustable après données réelles.
