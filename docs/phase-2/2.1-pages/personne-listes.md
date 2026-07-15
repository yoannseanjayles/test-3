# Spécification de pages — Fiche Personne (`/personne/{slug}-{id}`) & Liste éditoriale (`/liste/{slug}`, hub `/listes`)

> **Étape** : 2.1 (lot 14/14 — « Continuer la lecture » étant spécifié dans le lot Ma liste) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D5 (TMDB people), D10 (sitemap), D15 (composants fiche), D13

## 1. Fiche Personne — Should-have (D4), gabarit SEO complémentaire
**Objectif** : capter les requêtes « films de {réalisateur} », « filmographie {acteur} » et prolonger la navigation (flow cinéphile).
| # | Section |
|---|---|
| 1 | En-tête : photo, nom (H1), métier(s) principal(aux), naissance/décès, lieu |
| 2 | Biographie (dépliable, FR si dispo sinon EN avec mention) |
| 3 | **Connu·e pour** : rail des œuvres majeures (TMDB known_for) |
| 4 | **Filmographie complète** : liste chronologique groupée par métier (Acteur / Réalisation / Scénario…), filtrable Film/Série, badge Gratuit ▶ le cas échéant |
| 5 | `ad.display.fiche` **[pub ON]** (même règle que les fiches) |

- SEO : JSON-LD `Person`, breadcrumb, `<title>` « {Nom} — films, séries et biographie » ; indexable si ≥ 3 crédits (anti-thin, sinon noindex — même logique que D15) ;
- États : personne sans photo (avatar initiales), biographie absente (masquée, pas de bloc vide).

## 2. Liste éditoriale (`/liste/{slug}`) — l'outil de curation (D1)
**Objectif** : valeur perçue premium + SEO longue traîne (« meilleurs films de braquage ») + cold start des recos.
| # | Section |
|---|---|
| 1 | Hero éditorial : titre de liste (H1), intro 2-4 phrases (la valeur unique), auteur « La rédaction », date de mise à jour |
| 2 | **Items ordonnés** : carte large horizontale = affiche + titre + année + **1-2 phrases de justification éditoriale par titre** (c'est ce qui différencie d'une grille auto) + CTA contextuels (▶ / + Ma liste / fiche) |
| 3 | Rail « Autres listes » |

- Hub `/listes` : grille des listes (cover composée + titre + nb de titres), tri par fraîcheur ;
- SEO : `ItemList` avec positions ; les justifications par titre = contenu unique anti-thin ; ISR 24 h ;
- Gérées en back-office (7.1) : ordre drag & drop, brouillon/publié, programmation.

## 3. Analytics
`person.view/filmography.filter/credit.click` · `list.view/item.click` (position) / `list.completion` (scroll).

## Hypothèses
- **H47** : biographies TMDB parfois indisponibles en FR — affichage EN avec mention plutôt que traduction automatique (qualité maîtrisée) ; traduction éditoriale possible via back-office.
- **H48** : 6-10 listes éditoriales au lancement (rythme : 1-2/mois ensuite) — assez pour l'accueil, /decouvrir et /gratuit sans épuiser la rédaction.
