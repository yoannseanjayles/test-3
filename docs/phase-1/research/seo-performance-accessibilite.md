# Rapport : SEO, Performance & Accessibilité pour plateformes catalogue films/séries (état de l'art 2025-2026)

---

## 1. SEO pour sites catalogue

### 1.1 Données structurées (Schema.org)

- **Format** : JSON-LD est le format recommandé par Google, dans un `<script type="application/ld+json">`. ([Google — Movie structured data](https://developers.google.com/search/docs/appearance/structured-data/movie), [Yoast](https://yoast.com/structured-data-schema-ultimate-guide/))
- **Types clés** : `Movie` pour les pages film, `TVSeries` (+ `TVSeason`/`TVEpisode`) pour les séries, `ItemList` pour les pages listes/collections (éligibilité au carrousel de films mobile de Google — exige `name`, `image`, `director` ; recommandé : `aggregateRating`, `dateCreated`, `review`, `actor`). ([Google Movie doc](https://developers.google.com/search/docs/appearance/structured-data/movie), [Karpi — Movie schema](https://www.karpi.studio/schema-glossary-types/movie))
- **AggregateRating** : les étoiles en SERP sont un levier CTR majeur, mais la note affichée dans le balisage DOIT être visible sur la page ; sinon risque d'action manuelle "structured data spam". Distinguer `Review` (avis individuel) et `AggregateRating` (synthèse). ([Opace](https://opace.agency/blog/structured-data-schema-for-seo/), [Playwire — entertainment schema](https://www.playwire.com/blog/entertainment-website-seo-recommendations-how-to-use-schema-markup))
- **Tendance 2025-2026** : les données structurées servent aussi la visibilité dans les réponses IA (GEO/AEO — Google AI Overviews, assistants LLM) qui s'appuient sur les entités bien balisées. ([Digital Applied — structured data 2026](https://www.digitalapplied.com/blog/structured-data-seo-2026-rich-results-guide), [GW Content](https://www.gwcontent.com/blogs/news/structured-data-for-seo))
- **Validation obligatoire** : Rich Results Test + rapport Search Console ; un balisage erroné ou manipulateur peut coûter des pénalités. ([SEO-Day wiki](https://www.seo-day.de/wiki/on-page-seo/html-optimierung/strukturierte-daten/schema-org.php?lang=en))

**Recommandation** : sur chaque fiche titre, un bloc JSON-LD `Movie`/`TVSeries` avec `name`, `image` (affiche), `datePublished`, `director`, `actor`, `genre`, `duration`, `aggregateRating` (si notes réellement affichées), + `BreadcrumbList`. Sur les pages listes : `ItemList` pointant vers les fiches.

### 1.2 URLs et slugs

- Slugs en minuscules, mots séparés par tirets, courts (3-5 mots), avec le titre du film. ([Conductor](https://www.conductor.com/academy/urls/faq/slug/), [SEO Sherpa — URL slugs](https://seosherpa.com/url-slugs/))
- **Modèle éprouvé du secteur** : `/film/titre-annee` ou `/film/titre-id` — l'ID ou l'année désambiguïse les homonymes (remakes : *Dune 1984* vs *Dune 2021*). IMDb utilise `/title/tt0111161/` (ID stable), JustWatch et Letterboxd `/film/slug-lisible/` (slug + suffixe numérique en cas de collision). Un identifiant stable dans l'URL évite les 404 lors des renommages de titres provenant d'API tierces (TMDB change parfois les titres).
- Hiérarchie reflétant la structure : `/films/...`, `/series/...`, `/acteur/...` aide Google à comprendre le site. ([Octaria — URL structure 2025](https://www.octaria.com/blog/seo-friendly-url-structure-best-practices-2025))

### 1.3 Canonical à grande échelle

- Chaque fiche titre : canonical **auto-référentiel** absolu. Les variantes (paramètres de tracking, tri, onglets) canonicalisent vers l'URL propre. ([Yoast — rel=canonical](https://yoast.com/rel-canonical/))
- **Pagination** : ne PAS canonicaliser les pages 2+ vers la page 1 — chaque page paginée a un contenu unique et doit s'auto-canonicaliser. ([Search Engine Zine](https://searchenginezine.com/technical/crawl-index/canonical-tags-explained/))
- Attention : Google ignore souvent le canonical si la similarité de contenu entre les deux pages est trop faible — le canonical est un *hint*, pas une directive. ([ClickRank — canonical](https://www.clickrank.ai/canonical-tags/))

### 1.4 Sitemaps à grande échelle

- Une **flotte de sitemaps segmentés par type de contenu** (films, séries, personnes, listes, éditorial), référencés dans un index de sitemaps ; limite 50 000 URLs / 50 Mo par fichier. ([dbeta — indexation large sites](https://www.dbeta.co.uk/blog/website-indexation-strategies-large-sites.html), [ALM Corp — crawl budget enterprise](https://almcorp.com/blog/crawl-budget-optimization-enterprise-sites/))
- N'inclure QUE des URLs canoniques, indexables, en statut 200. Retirer vite les URLs redirigées/noindexées/en erreur.
- `lastmod` fiable et lié à un vrai changement de contenu (Google l'ignore s'il est mensonger) — utile pour les fiches où la disponibilité streaming change (modèle JustWatch : données rafraîchies toutes les 24 h). ([JustWatch API docs](https://www.justwatch.com/us/JustWatch-Streaming-API))
- La segmentation par template permet de diagnostiquer l'indexation par section dans Search Console.

### 1.5 Stratégie d'indexation (index / noindex / blocage)

- **Priorité de crawl budget selon Google (doc déc. 2025)** : 1) vitesse serveur (TTFB), 2) qualité du contenu indexable, 3) volume d'URLs. ([Falia — faceted nav & crawl budget](https://falia.co/en/faceted-navigation-crawl-budget/), [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies))
- **Matrice de gouvernance des facettes** (genre, plateforme, année, pays…) : valider chaque facette contre le volume de recherche réel, puis classer en 3 catégories : *indexable* (ex. "films d'horreur sur Netflix" — vraie requête), *noindex,follow*, ou *bloquée en robots.txt*. ([Oncrawl](https://www.oncrawl.com/technical-seo/managing-faceted-navigation-scale/), [Digital Applied — decision matrix](https://www.digitalapplied.com/blog/faceted-navigation-indexation-2026-seo-decision-matrix))
- **Règle piège** : ne jamais combiner `noindex` + `Disallow` robots.txt sur la même URL — Google ne peut pas lire le noindex d'une page qu'il ne crawle pas. ([Get-Ryze](https://www.get-ryze.ai/blog/faceted-navigation-seo-for-ecommerce-index-noindex-or-canonical))
- **À noindexer typiquement** : résultats de recherche interne, combinaisons de filtres multiples, pages de tri, pages compte/watchlist.
- **Risque "scaled content abuse"** : les updates spam de Google (février et août 2025) ont frappé le SEO programmatique à contenu mince. Un catalogue est légitime si **chaque page apporte une valeur unique** (dispo streaming, notes, casting, données fraîches) — Google juge l'utilité, pas l'existence d'un template. C'est exactement la valeur différenciante de JustWatch : la donnée de disponibilité par pays/service, introuvable ailleurs. ([Digital Applied — scaled content](https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated), [SEO Guru](https://www.seoguru.ai/blog/how-to-build-programmatic-seo-pages-that-do-not-get-flagged-as-thin), [RebelMouse — spam update août 2025](https://www.rebelmouse.com/google-spam-update-2025))

### 1.6 Pourquoi JustWatch / IMDb rankent si bien

- **IMDb** : autorité massive (~1,89 Md de backlinks, 1,23 M de domaines référents ; ~40e site mondial en 2025), couverture exhaustive de l'intent (fiches + notes + trivia + bandes-annonces), architecture hiérarchique claire, IDs d'URL stables depuis 25 ans. ([Semrush — imdb.com](https://www.semrush.com/website/imdb.com/overview/), [Brafton — user intent IMDb/Wikipedia](https://www.brafton.com/blog/seo/why-wikipedia-and-imdbs-user-intent-strategies-work-so-well/))
- **JustWatch** : SEO programmatique sur des requêtes transactionnelles ("where to watch X", "X streaming") avec une donnée propriétaire fraîche (600+ services, 400 000+ titres, 140+ pays, refresh < 24 h), déclinée par pays (sous-répertoires `/fr/`, `/us/` + hreflang). Chaque page cible une intention précise : titre × pays × disponibilité. ([JustWatch — Streaming API](https://www.justwatch.com/us/JustWatch-Streaming-API), [NoGood — programmatic SEO](https://nogood.io/2025/02/18/programmatic-seo/), [SE Ranking](https://seranking.com/blog/programmatic-seo/))
- Leçon transférable : template + **donnée différenciante et fraîche** + maillage interne dense (fiche → casting → genres → listes) + intent long-tail.

### 1.7 Open Graph & cartes sociales

- Taille universelle : **1200×630 px (ratio 1,91:1)** pour `og:image` — fonctionne sur Facebook, X, LinkedIn, Slack, Discord, WhatsApp, iMessage. X "summary_large_image" : 1200×675 (16:9). JPG/PNG < 1 Mo, zone sûre centrale ~1080×600. ([Krumzi — OG sizes 2025](https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2025-guide), [Coywolf — OG/Twitter optimization](https://coywolf.com/guides/open-graph-twitter-card-image-optimization/))
- Définir OG **et** Twitter Cards ; les cartes avec image obtiennent 2-5× plus de clics. ([SocialCard](https://socialcard.live/blog/best-image-sizes-meta-tags-social-sharing-2025))
- Pour un catalogue : génération dynamique d'images OG par titre (affiche + backdrop + note) — pattern utilisé par Letterboxd/IMDb ; attention, les affiches sont en 2:3, il faut composer une image paysage dédiée plutôt que laisser recadrer l'affiche.

### 1.8 hreflang / i18n

- À grande échelle, la méthode **sitemap XML** l'emporte sur les balises `<head>` (50+ locales = poids HTML inutile). ([LinkGraph — hreflang guide](https://www.linkgraph.com/blog/hreflang-implementation-guide/))
- Les annotations doivent être **bidirectionnelles** (lien retour obligatoire, sinon ignorées) ; toujours inclure une auto-référence et un `x-default` (sélecteur de langue ou version principale). ([Backlinko — hreflang](https://backlinko.com/hreflang-tag), [Scalarly — 5 erreurs](https://scalarly.com/blog/hreflang-implementation-guide/))
- Automatiser la génération (impossible à maintenir à la main sur des milliers de fiches). Une étude Ahrefs 2025 citée mesure +47 % de trafic organique hors marché principal avec un hreflang correct. ([OutreachMonks](https://outreachmonks.com/hreflang-seo/))
- Modèle JustWatch : `justwatch.com/fr/film/...` vs `/us/movie/...` — sous-répertoires par pays avec contenu réellement localisé (disponibilité par pays = contenu unique par locale, pas une simple traduction).

---

## 2. Stratégie de rendu pour le SEO (pages adossées à des API tierces type TMDB)

- **Le CSR pur reste risqué en 2025-2026** : Google indexe en deux vagues (HTML brut, puis rendu JS via le WRS Chromium) ; le délai de la 2e vague varie de quelques secondes à des jours/semaines, et le taux de succès chute sur les gros sites (budget de rendu, timeouts, erreurs JS) — confirmé par l'étude Vercel/MERJ. De plus, la plupart des crawlers IA (ChatGPT, Perplexity…) **n'exécutent pas le JavaScript**, ce qui pénalise la visibilité GEO. ([SEO Beni — JS SEO 2026](https://seobeni.com/blog/javascript-seo-guide-2026/), [ClickRank — JS rendering](https://www.clickrank.ai/javascript-rendering-affect-seo/))
- **Hiérarchie SEO des modes de rendu** : SSG ≥ ISR > SSR >> CSR. Tous trois livrent du HTML pré-rendu ; SSG/ISR sont les plus rapides (Core Web Vitals). ([Next.js — rendering strategies](https://nextjs.org/learn/seo/rendering-strategies), [Vercel — choisir sa stratégie](https://vercel.com/blog/how-to-choose-the-best-rendering-strategy-for-your-app), [DEV — CSR/SSR/SSG/ISR 2025](https://dev.to/rayan2228/nextjs-rendering-strategies-csr-vs-ssr-vs-ssg-vs-isr-complete-guide-26j4))
- **Pour un catalogue sur API tierce, le sweet spot est l'ISR** (ou équivalent cache + revalidation) :
  - SSG pur : impossible de builder 400 000 fiches, et données de dispo/notes périmées.
  - SSR pur : chaque requête dépend de la latence et des quotas de l'API tierce (TMDB) — TTFB dégradé, fragilité.
  - ISR : pré-génère les titres populaires au build, génère les autres à la demande (`fallback`/`dynamicParams`), revalide périodiquement (ex. 24 h pour les métadonnées, plus court pour la dispo) — HTML complet pour la 1re vague d'indexation, cache CDN, découplage des pannes API. ([Easton — SSR/SSG/ISR guide](https://eastondev.com/blog/en/posts/dev/20251219-nextjs-ssr-ssg-isr-guide/), [Strapi — SSR vs SSG](https://strapi.io/blog/ssr-vs-ssg-in-nextjs-differences-advantages-and-use-cases))
- **Pattern hybride recommandé** : coquille + contenu SEO-critique (titre, synopsis, casting, JSON-LD, meta/OG) rendus serveur ; interactions (watchlist, notes utilisateur, recherche instantanée) hydratées côté client. Vérifier que le HTML initial contient les liens `<a href>` crawlables (pas de navigation uniquement onClick).

---

## 3. Core Web Vitals sur pages riches en images

Contexte 2025 (Web Almanac) : le LCP est la métrique la plus souvent en échec (~62 % de passage mobile) ; l'image est l'élément LCP sur 76-85 % des pages. ([Web Almanac via corewebvitals.io](https://www.corewebvitals.io/pagespeed/fix-slow-hero-images-core-web-vitals), [seo-kreativ — CWV 2026](https://www.seo-kreativ.de/en/blog/core-web-vitals-optimizing/))

### 3.1 LCP (affiche/hero)

- Image hero/affiche above-the-fold : `fetchpriority="high"` + `loading="eager"` — sur **une seule** image par page (plusieurs "high" s'annulent). Les tests Google : LCP 2,6 s → 1,9 s avec ce seul attribut. ([MDN — fix image LCP](https://developer.mozilla.org/en-US/blog/fix-image-lcp/))
- `<link rel="preload" as="image" fetchpriority="high">` pour l'image LCP (avec `imagesrcset` si responsive) — seulement 2,1 % des pages le font. ([corewebvitals.io](https://www.corewebvitals.io/pagespeed/optimize-images-for-core-web-vitals))
- **Jamais de lazy-load sur l'image LCP** — pénalité classique confirmée par Google. ([Etavrian — lazy loading LCP](https://www.etavrian.com/news/lazy-loading-lcp-hero-images))
- L'image doit être découvrable dans le HTML initial (pas injectée en JS, pas en `background-image` CSS).

### 3.2 Formats & responsive

- Chaîne de formats : **AVIF (support ~95 %, ~-50 % vs JPEG) → WebP (~96 %, -25/35 %) → JPEG fallback**, via `<picture>` ou négociation CDN. En 2025, 57 % des images LCP sont encore en JPEG, <1 % en AVIF : gros levier. ([Logos Web Designs — playbook images](https://logoswebdesigns.com/blog/image-optimization-website-speed-2026/), [Cloudinary/DEV](https://dev.to/cloudinary/your-images-are-probably-slowing-down-your-website-heres-how-to-fix-it-23je))
- `srcset`/`sizes` calculés selon la grille réelle (colonnes − gaps − padding) ; **3-5 breakpoints max** pour préserver le cache hit ratio du CDN d'images. ([DEV — responsive images 2025](https://dev.to/razbakov/responsive-images-best-practices-in-2025-4dlb), [ImageKit — guide responsive](https://imagekit.io/responsive-images/))
- Affiches TMDB : utiliser les tailles natives de l'API (`w185/w342/w500`) alignées sur les breakpoints plutôt que l'original.
- Placeholders : dimensions `width`/`height` explicites (ou `aspect-ratio` 2:3 pour les affiches) + placeholder flou (LQIP/blurhash) ou couleur dominante — élimine le CLS et améliore la perception.

### 3.3 CLS (carrousels/rails)

- Les carrousels touchent les trois métriques ; l'erreur n°1 est de charger leur contenu en JavaScript (images non découvertes par le preload scanner). Rendre le premier slide en HTML statique avec `fetchpriority="high"`, `loading="lazy"` sur les suivants. ([web.dev — carousel best practices](https://web.dev/articles/carousel-best-practices), [Portent — carousels & CWV](https://portent.com/blog/design-dev/how-website-carousels-impact-core-web-vitals-and-best-practices.htm))
- Réserver l'espace de chaque rail (hauteur fixe / `aspect-ratio`) ; les carrousels autoplay qui décalent la mise en page comptent en CLS **en boucle**. ([web.dev — optimize CLS](https://web.dev/articles/optimize-cls))
- Transitions en `transform` (composited) uniquement, jamais en `left/top/width`.
- Lazy loading : uniquement below-the-fold, avec `rootMargin` d'anticipation pour éviter les apparitions tardives au scroll. ([DebugBear — lazy loading](https://www.debugbear.com/blog/lazy-loading-performance))

### 3.4 INP (seuil : ≤ 200 ms)

- Découper les longues tâches (>50 ms) : `setTimeout`, `scheduler.yield`/Scheduler API, `requestIdleCallback`. ([web.dev — optimize INP](https://web.dev/articles/optimize-inp))
- En React : `useTransition`/`useDeferredValue` pour les mises à jour non urgentes (filtrage de grille, recherche instantanée), mémoïsation ciblée, code-splitting des features non critiques (lecteur de bande-annonce, modales). ([Egnworks — INP frontend](https://www.egnworks.com/blog/optimizing-interaction-to-next-paint-for-frontend-developers), [Hashmeta — INP 2025](https://hashmeta.com/blog/interaction-to-next-paint-inp-complete-optimization-guide-for-2025/))
- ~43-47 % des sites échouent encore au seuil INP ; les grilles catalogue avec gros DOM sont exposées (limiter la taille du DOM, virtualiser les longues listes, `content-visibility: auto` sur les rails hors écran).

---

## 4. Accessibilité (WCAG 2.2)

### 4.1 Nouveaux critères WCAG 2.2 pertinents

- **2.5.8 Target Size (Minimum, AA)** : cibles tactiles ≥ 24×24 px CSS — concerne flèches de carrousel, points de pagination, boutons watchlist sur cards. ([W3C — new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/))
- **2.4.11 Focus Not Obscured (AA)** : l'élément focalisé ne doit pas être masqué (headers sticky, overlays de rails). ([Deque — WCAG 2.2](https://dequeuniversity.com/resources/wcag-2.2/))
- **2.4.13 Focus Appearance (AAA, bonne cible)** : indicateur ≈ périmètre 2 px, contraste ≥ 3:1 focus/non-focus. ([W3C — Understanding 2.4.13](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html))

### 4.2 Carrousels / rails

Référence : [tutoriel carrousels W3C WAI](https://www.w3.org/WAI/tutorials/carousels/functionality/), [Smashing Magazine — accessible carousels](https://www.smashingmagazine.com/2023/02/guide-building-accessible-carousels/), [A11Y Collective](https://www.a11y-collective.com/blog/accessible-carousel/) :

- Boutons précédent/suivant réels (`<button>`), le **focus reste sur le bouton** après activation (appuis répétés possibles) ; le focus ne doit pas être déplacé automatiquement par l'avance auto.
- Autoplay : contrôle pause/stop obligatoire (WCAG 2.2.2), pause au survol/focus.
- ARIA : `role="region"` + `aria-roledescription="carousel"`, `aria-label` par rail ("Tendances de la semaine"), annonces de changement via live region désactivée pendant l'autoplay.
- Flèches clavier pour naviguer entre slides quand le pattern tabs est utilisé ; Tab traverse les éléments interactifs dans l'ordre logique. Pour les rails type Netflix, un simple conteneur scrollable (`overflow-x`) avec cards tabbables + boutons de scroll est souvent plus robuste qu'un vrai carrousel ARIA.

### 4.3 Navigation clavier des grilles & focus

- Tout doit être atteignable au clavier (WCAG 2.1.1), sans piège (2.1.2) ; les actions révélées au hover (boutons sur poster) doivent aussi apparaître au focus. ([UXPin — keyboard accessibility](https://www.uxpin.com/studio/blog/wcag-211-keyboard-accessibility-explained/), [TestParty — keyboard guide](https://testparty.ai/blog/keyboard-accessibility-guide))
- Grilles longues : lien d'évitement / structure de headings par rail pour ne pas imposer 50 tabulations ; à l'ouverture/fermeture d'une modale (bande-annonce), piéger puis restituer le focus à l'élément déclencheur.
- Un seul lien englobant par card (éviter poster-lien + titre-lien dupliqués qui créent des tabulations redondantes).

### 4.4 Contraste en dark mode

- Le dark mode ne dispense de rien : **4,5:1 texte normal, 3:1 grand texte et composants UI**, dans chaque thème. ([BOIA — dark mode ≠ conformité](https://www.boia.org/blog/offering-a-dark-mode-doesnt-satisfy-wcag-color-contrast-requirements))
- Éviter le noir pur `#000000` (halation, fatigue) — préférer `#121212`/gris très foncé ; éviter le blanc pur pour le texte (utiliser ~87 % d'opacité). ([AccessibilityChecker — dark mode](https://www.accessibilitychecker.org/blog/dark-mode-accessibility/), [NN/g — dark mode](https://www.nngroup.com/articles/dark-mode-users-issues/))
- Les apps streaming (Netflix, Disney+, Max) sont dark-first pour faire ressortir les visuels ; vérifier spécialement les états focus, textes secondaires (gris sur gris) et badges de note sur fond sombre. ([See Me Please — dark mode](https://seemeplease.com/blog/dark-mode))
- Respecter `prefers-color-scheme` si un mode clair existe.

### 4.5 Reduced motion

- Respecter `prefers-reduced-motion` : désactiver autoplay des carrousels, parallax, zooms de hover sur posters, transitions de page — crucial pour les troubles vestibulaires. Remplacer par des fondus courts ou rien. ([DEV — dark mode perf & a11y](https://dev.to/javascriptwizzard/dark-mode-done-right-performance-accessibility-considerations-43b1), [greeden — guide dark mode/contraste](https://blog.greeden.me/en/2026/02/23/complete-accessibility-guide-for-dark-mode-and-high-contrast-color-design-contrast-validation-respecting-os-settings-icons-images-and-focus-visibility-wcag-2-1-aa/))

### 4.6 Alt text des affiches

- Card avec titre visible sous l'affiche : l'affiche est **redondante → `alt=""`** (ou alt intégré au lien unique : `alt="Affiche de Dune : Deuxième partie"` si le titre n'est pas répété à côté). Ne jamais omettre l'attribut alt (les lecteurs d'écran liraient le nom de fichier). ([W3C WAI — decorative images](https://www.w3.org/WAI/tutorials/images/decorative/), [W3C WAI — tips](https://www.w3.org/WAI/tutorials/images/tips/), [Deque — great alt text](https://www.deque.com/blog/great-alt-text-introduction/))
- Sur la page détail, l'affiche porte de l'information : alt descriptif court ("Affiche du film X") sans répéter le H1 mot pour mot. Nota SEO : un alt pertinent aide aussi Google Images (source de trafic notable pour les catalogues).

---

## 5. Synthèse des recommandations actionnables (par priorité)

1. **Rendu** : SSR/ISR pour toutes les pages fiches et listes ; HTML initial complet (contenu, liens `<a>`, JSON-LD, meta/OG) ; cacher/revalider les données API tierces (métadonnées ~24 h, dispo plus court) ; réserver le CSR aux features personnalisées.
2. **Structured data** : JSON-LD `Movie`/`TVSeries` + `AggregateRating` (si visible) + `BreadcrumbList` sur les fiches ; `ItemList` sur les listes ; monitoring Rich Results dans Search Console.
3. **URLs** : `/film/slug-annee` (ou slug-id stable), minuscules, tirets ; canonical auto-référentiel ; pagination auto-canonique.
4. **Indexation** : indexer fiches + pages genre/plateforme à demande réelle ; noindex recherche interne, tris, combinaisons de filtres ; robots.txt pour les paramètres purement techniques (jamais noindex+disallow ensemble) ; sitemaps segmentés < 50 k URLs avec lastmod fiables.
5. **Différenciation anti-thin-content** : chaque fiche doit agréger de la valeur unique (dispo, notes, casting, similaires, fraîcheur) — condition de survie face aux spam updates 2025.
6. **LCP** : affiche hero en HTML avec `fetchpriority="high"` + preload, jamais lazy ; AVIF→WebP→JPEG ; srcset aligné sur la grille, 3-5 breakpoints.
7. **CLS/INP** : `aspect-ratio` 2:3 réservé sur toutes les affiches, blur placeholders ; premiers slides en HTML statique ; transitions en transform ; `useTransition` pour les filtres ; DOM limité/virtualisé.
8. **A11y** : cibles ≥ 24 px, focus visible non masqué (sticky headers !), pause sur autoplay, `prefers-reduced-motion`, contraste 4,5:1 vérifié sur le thème sombre (fond `#121212`, pas de noir pur), `alt=""` sur affiches redondantes en card, alt descriptif sur la fiche.
9. **Social** : og:image dynamique 1200×630 par titre (composée, pas l'affiche 2:3 recadrée) + Twitter Card large.
10. **i18n** : sous-répertoires par locale, hreflang via sitemaps, bidirectionnel + x-default, contenu réellement localisé (dispo par pays = valeur unique par locale, modèle JustWatch).
