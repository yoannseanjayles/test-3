# Spécification de pages — Découverte (`/decouvrir`), Tendances (`/tendances`), Nouveautés (`/nouveautes`)

> **Étape** : 2.1 (lot 7/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D10 (sitemap), D13 (variété de conteneurs), D14 (composants), lot 6 (gabarit grille)

## 1. Découverte (`/decouvrir`) — le hub d'exploration
**Objectif** : la porte d'entrée « je ne sais pas quoi chercher » ; zéro grille brute, que des chemins qualifiés.
| # | Section |
|---|---|
| 1 | H1 + moteur d'humeur : rangée de **chips d'intention** (« Une soirée frissons », « Moins de 100 min », « À voir en famille », « Pépites gratuites ») → grilles préfiltrées (lot 6) |
| 2 | Cartes de genres (hub visuel, cf. /genres) |
| 3 | Rail Tendances (aperçu → /tendances) |
| 4 | Grille éditoriale : listes du moment (2-4 listes → /liste/{slug}) |
| 5 | `ad.native.rail` **[pub ON]** |
| 6 | Rail « Par décennie » (chips 70s → 2020s) |
| 7 | Bandeau Gratuit ▶ (aperçu → /gratuit) |

- Les **chips d'intention** sont des presets de facettes curables en back-office (H34) — contenu frais sans développement.
- SEO : indexable, intro éditoriale ; les presets pointent vers des URLs de facettes canoniques.

## 2. Tendances (`/tendances`)
**Objectif** : « ce que tout le monde regarde » — fraîcheur et social proof.
- Toggle **Aujourd'hui / Cette semaine** (TMDB trending day/week) ; onglets Tout · Films · Séries ;
- **Top 10 numéroté** en tête (gros chiffres, style billboard — signature visuelle) puis grille standard ;
- Badge de variation (↑3, nouveau) si calculable depuis le miroir (H35) ;
- ISR 1 h (fraîcheur = la valeur de la page) ; `trending.view/toggle/card.click`.

## 3. Nouveautés (`/nouveautes`)
**Objectif** : sorties récentes et à venir — la page « quoi de neuf ».
- Onglets : **Récent** (sorties < 60 j, tri par date) · **Prochainement** (dates futures, badges J-x) · **Nouveau en streaming** (nouveaux arrivages providers FR, si données disponibles — H36) ;
- Rangées datées (« Cette semaine », « La semaine dernière », « En juillet ») plutôt que grille infinie ;
- Connecté : « M'alerter » sur les titres à venir (Could-have H25) ;
- ISR 6 h ; `news.view/tab/card.click`.

## États communs
Skeleton ; panne API → cache stale ; pub OFF → sections pub absentes du DOM.

## Hypothèses
- **H34** : chips d'intention = presets de facettes éditables en back-office (7.1) — 8 presets au lancement.
- **H35** : variations de classement calculées par snapshot quotidien du trending dans le miroir local ; masquées sinon.
- **H36** : « Nouveau en streaming » dépend de la fraîcheur des données watch/providers de TMDB ; l'onglet est masqué si la donnée est insuffisante.
