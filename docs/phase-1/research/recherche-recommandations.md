# Rapport de recherche — Bonnes pratiques 2025-2026 : recherche & recommandations pour une plateforme de découverte films/séries (budget gratuit / API tierces)

---

## 1. UX de recherche

### 1.1 Recherche instantanée / autocomplétion
- **Débounce de 200-300 ms** après la dernière frappe, combiné à un cache des requêtes déjà effectuées pour donner une impression de latence nulle. Les suggestions doivent s'afficher en **moins de ~100 ms** perçues ([Algolia — Search UX](https://www.algolia.com/blog/ux/how-to-streamline-your-search-ux-design), [Meilisearch — Typeahead search](https://www.meilisearch.com/blog/typeahead-search)).
- **Tolérance aux fautes indispensable** : plus de 30 % des requêtes contiennent une faute de frappe. Prévoir fuzzy matching + « Vouliez-vous dire… » ([Algolia — Predictive search](https://www.algolia.com/blog/ai/predictive-search-and-autocomplete), [Blueniaga — Search UX 2025](https://blueniaga.com/essential-search-ux-best-practices-to-implement-in-2025/)).
- **6 à 8 suggestions maximum** (Baymard recommande 6-8 ; d'autres sources 5-10), navigation clavier flèches haut/bas avec bouclage, style distinct pour les suggestions de portée (« Inception *dans Films* ») vs suggestions de requête. Seuls **19 % des sites** implémentent tous les détails correctement ([Baymard — Autocomplete design](https://baymard.com/blog/autocomplete-design)).
- Pour un catalogue média : **suggestions riches avec vignette (affiche), année, type (film/série/personne)** — les indices visuels améliorent fortement la scannabilité ([LogRocket — Search bar UI](https://blog.logrocket.com/ux-design/design-search-bar-intuitive-autocomplete/)). Afficher aussi recherches récentes et requêtes tendance dans le champ vide.

### 1.2 Patterns observés sur Netflix / JustWatch / TMDB
- **Netflix** : recherche-pendant-la-frappe sans bouton « Rechercher » — la grille de résultats se remplit à chaque frappe, mélangeant correspondances exactes et titres « proches » recommandés ; le champ de recherche est volontairement discret (icône loupe) car Netflix pousse d'abord la navigation par rails personnalisés. Netflix teste depuis 2025 une recherche en langage naturel propulsée par IA (beta mobile) ([Medium — Science of search Netflix/YouTube](https://medium.com/design-bootcamp/the-science-of-search-understanding-user-experience-behind-youtube-and-netflixs-search-2538603f952e), [Netflix Help](https://help.netflix.com/en/node/47765)). Point clé : Netflix **ne renvoie jamais zéro résultat** — en cas d'absence de correspondance, il affiche des titres apparentés/populaires.
- **TMDB** : le site utilise lui-même `/search/multi` comme autocomplétion — l'endpoint accepte les requêtes partielles et répond vite (~75 ms avec keep-alive), sans rate limiting strict ([TMDB Talk — autocomplete](https://www.themoviedb.org/talk/613c8c7d322b2b0029660e34), [TMDB — Search & query](https://developer.themoviedb.org/docs/search-and-query-for-details)). Limite : **pas de vraie tolérance aux fautes** documentée (préfixe/partial match seulement).
- **JustWatch** : référence du filtrage — « Watchbar » persistante avec filtres par **services de streaming de l'utilisateur** (Tous / Mes services / Abonnement / Achat-location / Gratuit), année de sortie, note IMDb, genre, prix, classification d'âge ([JustWatch Support — Provider filters](https://support.justwatch.com/hc/en-us/articles/25403490091421-Understanding-Provider-Filters-in-the-JustWatch-App), [justwatch.com](https://www.justwatch.com/us)).

### 1.3 Recherche à facettes / filtres
- **5 à 7 facettes** par page de résultats est le bon équilibre ; libellés sans jargon, valeurs triées logiquement (notes croissantes/décroissantes) ([NN/g — Filter categories](https://www.nngroup.com/articles/filter-categories-values/), [Fact-Finder — Faceted search](https://www.fact-finder.com/blog/faceted-search/)).
- Pour films/séries les facettes canoniques sont : **genre, année/décennie, note, plateforme de streaming, type (film/série), durée**. Afficher le **compteur de résultats par valeur de filtre** et un état clair des filtres actifs (chips supprimables) ([Algolia — Search filters](https://www.algolia.com/blog/ux/search-filter-ux-best-practices)).
- Mobile : sélection multiple puis bouton **« Appliquer » unique**, pas de rechargement à chaque coche ([Algolia — Faceted search](https://www.algolia.com/blog/ux/faceted-search-and-navigation)).
- Les facettes doivent s'adapter au contexte de la requête (pas de filtre « saison » sur une recherche de films) ([UXPin — Advanced search UX](https://www.uxpin.com/studio/blog/advanced-search-ux/)).

### 1.4 États vides et zéro résultat
- Un « Aucun résultat » nu est un cul-de-sac qui augmente le rebond. La page doit : (1) dire clairement qu'il n'y a pas de correspondance pour « X », (2) proposer une correction orthographique, (3) suggérer contenus populaires/apparentés, (4) offrir d'élargir/réinitialiser les filtres ([LogRocket — No results found](https://blog.logrocket.com/ux-design/no-results-found-page-ux/), [Eleken — Empty state UX](https://www.eleken.co/blog-posts/empty-state-ux), [Pencil & Paper — Empty states](https://www.pencilandpaper.io/articles/empty-states)).
- Pattern « Netflix » à copier : remplacer la page vide par une grille **« Titres semblables à votre recherche »** (tendances + proches sémantiquement) — l'utilisateur reste dans le flux.
- Autres états vides à soigner : watchlist vide (CTA vers tendances/onboarding), filtres trop restrictifs (proposer de retirer le filtre le plus contraignant).

---

## 2. Technologie de recherche (stack petit budget)

### 2.1 Option A — API tierce directe (coût zéro)
- **TMDB `/search/multi`** : gratuit, sans rate limit strict, supporte la frappe partielle → suffisant pour un MVP d'autocomplétion, avec débounce 250 ms + annulation des requêtes en vol (AbortController) + cache. Faiblesses : pas de typo-tolérance, pertinence non configurable, dépendance réseau à chaque frappe ([TMDB — search-multi](https://developer.themoviedb.org/reference/search-multi)).
- **TMDB `/discover/movie|tv`** = moteur à facettes gratuit : 30+ filtres (`with_genres`, `primary_release_year`, `vote_average.gte`, `with_watch_providers`, `with_runtime`…), opérateurs AND (virgule) / OR (pipe), tri multiple → permet de construire toute la navigation filtrée sans base de données propre ([TMDB — discover-movie](https://developer.themoviedb.org/reference/discover-movie)).

### 2.2 Option B — Index propre (si catalogue local / watchlists)
| Solution | Type | Forces | Limites | Coût |
|---|---|---|---|---|
| **Fuse.js** | client-side JS | zéro infra, fuzzy natif, parfait ≤ quelques milliers d'entrées (watchlist, catalogue restreint) | ne scale pas, tout le dataset chargé au client | 0 € |
| **Postgres FTS (+ pg_trgm)** | serveur, dans la BDD existante | pragmatique, pas de service en plus | matching strict par défaut (« lambo » ≠ « Lamborghini »), typo-tolérance à bricoler via trigrammes | 0 € (BDD existante) |
| **Meilisearch** (self-host) | moteur dédié | typo-tolérance native, schemaless, setup en minutes, excellent multilingue | un service à héberger ; Cloud payant (~30 $/mois après essai 14 j) | 0 € en self-host (VPS/Fly.io) |
| **Typesense** (self-host) | moteur dédié | très rapide, facettes natives | schéma obligatoire ; Cloud ~7-40 $/mois | 0 € en self-host |
| **Algolia** | SaaS | référence UX, InstantSearch UI | plan gratuit **10 000 recherches/mois** (1 M d'enregistrements) — vite limitant en search-as-you-type | freemium |

Sources : [Supabase — Postgres FTS vs the rest](https://supabase.com/blog/postgres-full-text-search-vs-the-rest), [Nomadz — Postgres vs Meilisearch/Typesense](https://nomadz.pl/en/blog/postgres-full-text-search-or-meilisearch-vs-typesense), [npm-compare](https://npm-compare.com/algoliasearch,elasticsearch,fuse.js,lunr,meilisearch,typesense), [Typesense — comparaison](https://typesense.org/docs/overview/comparison-with-alternatives.html), [Algolia — pricing](https://www.algolia.com/pricing), [Meilisearch — pricing](https://www.meilisearch.com/pricing).

### 2.3 Client vs serveur — règle de décision
- **< ~5 000 titres** (ex. catalogue curaté, watchlists) → recherche client (Fuse.js ou simple index préchargé) : latence nulle, zéro coût.
- **Catalogue complet films/séries** → proxy vers TMDB search (avec cache serveur Redis/edge sur les requêtes populaires) ; c'est le choix « gratuit » le plus robuste.
- **Besoin de typo-tolérance + facettes + classement custom sur données propres** → Meilisearch self-hosted, le meilleur rapport simplicité/fonctionnalités en 2025.

---

## 3. Recommandations sans budget ML

### 3.1 Ce que font réellement les plateformes de référence
- **TMDB** expose deux endpoints distincts : `/movie/{id}/similar` (ancien, pur **content-based** : genres + keywords) et `/movie/{id}/recommendations` (basé sur les **notes et favoris des utilisateurs TMDB** — collaboratif pré-calculé, nettement meilleur, c'est ce qu'affiche le site TMDB) ([TMDB Talk — Similar vs Recommendations](https://www.themoviedb.org/talk/59efc7fcc3a3680682004dba), [TMDB — movie-recommendations](https://developer.themoviedb.org/reference/movie-recommendations)). **À retenir : préférer `/recommendations` à `/similar`.**
- **Letterboxd** : officiellement pas de moteur « Pour vous » — la plateforme se présente comme « un grand moteur de recommandation organique » (social : activité des amis, listes, likes) + listes « Similar Films » par thèmes/« nanogenres » ([Letterboxd Help](https://letterboxd.zendesk.com/hc/en-us/articles/15178828078223-Can-Letterboxd-generate-recommendations-for-me)). Un écosystème tiers comble le vide avec du **filtrage collaboratif SVD sur données scrapées** ([letterboxd_recommendations — GitHub](https://github.com/sdl60660/letterboxd_recommendations)). Leçon : le **social + éditorial (listes)** peut remplacer l'algorithme.
- **Trakt** : recommandations personnalisées basées sur historique de visionnage + notes, filtrées par les services de streaming liés de l'utilisateur ([TWiT — JustWatch vs Letterboxd vs Trakt](https://twit.tv/posts/tech/justwatch-letterboxd-trakt-which-app-should-you-use-manage-your-watchlist)).
- **JustWatch** : mise avant tout sur la **disponibilité streaming + filtres neutres** (pas de mise en avant sponsorisée) et des rails populaires/nouveautés par service, plus que sur un recommender sophistiqué ([TWiT, ibid.](https://twit.tv/posts/tech/justwatch-letterboxd-trakt-which-app-should-you-use-manage-your-watchlist)).

### 3.2 Boîte à outils sans ML (par coût croissant)
1. **Trending/popularité** : TMDB `/trending/{all|movie|tv}/{day|week}` + `popular` + `top_rated` → rails « Tendances cette semaine », « Populaires sur Netflix » (croisé avec `with_watch_providers`) ([TMDB — trending-all](https://developer.themoviedb.org/reference/trending-all)).
2. **Similarité contenu maison** : score pondéré genres ∩ + keywords ∩ + cast/réalisateur ∩ + proximité d'année — c'est exactement ce que fait `/similar`, réplicable en une requête SQL si les métadonnées sont stockées localement ([Medium — Movie recommender TMDB](https://medium.com/@garvitgoyal144/building-a-movie-recommender-system-using-tmdb-dataset-eb0cc0a07092)).
3. **Collaboratif « mémoire » item-item** : si la plateforme a des likes/watchlists, un simple calcul de co-occurrence (« les gens qui ont aimé A ont aussi aimé B », similarité cosinus sur la matrice item×user) tourne en batch nocturne sans infra ML et scale mieux que le user-based ([IteratorsHQ — Collaborative filtering](https://www.iteratorshq.com/blog/collaborative-filtering-in-recommender-systems/)).
4. **Curation éditoriale** : listes thématiques manuelles (à la Letterboxd) — coût nul, forte valeur perçue, excellent pour le SEO et le cold start.

---

## 4. Patterns de personnalisation

- **Onboarding « taste picker »** : carte « choisissez 3+ titres/genres que vous aimez » à l'inscription (pattern Netflix) pour amorcer les recommandations ; sans cela la première session est du bruit. Fallback contenu (genre, langue) tant que l'historique est vide ([Fora Soft — Streaming UX best practices 2026](https://www.forasoft.com/blog/article/streaming-app-ux-best-practices)).
- **Rails « Parce que vous avez aimé X »** : prendre les N derniers items likés/ajoutés en watchlist → TMDB `/recommendations` pour chacun → dédupliquer, exclure le déjà-vu/déjà en watchlist. Le titre du rail doit être **explicable** (« Parce que vous avez ajouté Dune ») : la transparence augmente la confiance ([PMC — Because You Watched study](https://pmc.ncbi.nlm.nih.gov/articles/PMC12649538/), [Robosoft — Personalization for streaming](https://www.robosoftin.com/blog/personalization-for-streaming-services)).
- **Watchlist comme signal central** (pattern JustWatch/Trakt) : la watchlist alimente (1) les recs, (2) les notifications « désormais dispo sur vos services », (3) le filtre « Mes services » ([JustWatch — Google Play](https://play.google.com/store/apps/details?id=com.justwatch.justwatch&hl=en_US)).
- **Profil de goût dynamique** : tendance 2025-2026 — recalculer le profil à chaque interaction (like, ajout, clic) plutôt que par batch statique ; même une version simple (compteurs de genres/keywords pondérés par récence) suffit ([Medium — Streaming personalization](https://medium.com/@bestech.contactus/streaming-personalization-that-actually-works-architecting-taste-profiles-and-real-time-feeds-e59d9f727a61)).

---

## 5. Recommandations actionnables (plateforme adossée à des API gratuites)

**Recherche**
1. Autocomplétion via TMDB `/search/multi` : débounce 250 ms, annulation des requêtes obsolètes, cache LRU client + cache serveur/edge ; résultats dès la 1re-2e frappe ; 6-8 suggestions avec affiche + année + badge type ; navigation clavier complète.
2. Compenser l'absence de typo-tolérance TMDB : normalisation (accents, casse), et si zéro résultat, retenter automatiquement avec la requête tronquée d'un caractère ou passer par un petit index Fuse.js des ~5 000 titres les plus populaires (pré-généré) pour le « Vouliez-vous dire ».
3. Page « Explorer » = TMDB `/discover` avec 5-7 facettes (genre, décennie, note min, plateforme, type, durée), chips de filtres actifs, bouton Appliquer unique sur mobile.
4. Zéro résultat = jamais vide : message explicite + suggestion orthographique + rail « Tendances » + bouton « réinitialiser les filtres ».
5. Migration future : Meilisearch self-hosted dès qu'un classement custom ou des données propres (listes, users) doivent être cherchées.

**Recommandations**
6. Fiche titre : utiliser `/recommendations` (pas `/similar`) comme rail principal, `/similar` en secours si vide.
7. Accueil : mix de rails = Tendances semaine (TMDB trending) + « Parce que vous avez ajouté X » (watchlist → recommendations) + Top par genre favori + 1-2 listes éditoriales curatées.
8. Onboarding : sélecteur de 3 genres + 3 titres aimés + sélection des services de streaming (pattern JustWatch « Mes services ») pour filtrer toutes les recs par disponibilité réelle (`with_watch_providers`).
9. Dès ~quelques centaines d'utilisateurs actifs : job nocturne de co-occurrence item-item sur watchlists/likes (« Les membres qui ont aimé X ont aussi aimé ») — SQL pur, zéro infra ML.
10. Toujours exclure des rails le déjà-vu / déjà-en-watchlist, et étiqueter chaque rail avec sa raison (explicabilité = confiance).
