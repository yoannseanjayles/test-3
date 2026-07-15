# Rapport de recherche UX — Plateformes de découverte de films/séries (bonnes pratiques 2025-2026)

## 1. Patterns de navigation

**Constats clés**

- **Convergence vers une nav horizontale simple et courte (5-7 entrées).** Prime Video a abandonné en 2024 sa sidebar verticale (introduite en 2022) au profit d'une navbar horizontale avec destinations par type de contenu : Home, Movies, TV Shows, Sports, Live TV, Subscriptions ([Variety](https://variety.com/2024/digital/news/amazon-prime-video-interface-update-whats-new-1236081109/), [Engadget](https://www.engadget.com/prime-video-gets-a-much-needed-ui-overhaul-with-a-new-content-bar-and-ai-recommendations-120019397.html)). Disney+ a fait de même en octobre 2025 : barre de navigation en haut, page « For You » par défaut, onglets de marques (Disney+, Hulu, ESPN) et hub « Live » ([9to5Google](https://9to5google.com/2025/10/02/disney-shows-off-app-redesign-coming-to-google-tv-with-global-hulu-integration-gallery/), [FlatpanelsHD](https://flatpanelshd.com/news.php?id=1759474431&subaction=showfull)).
- **Méga-menus : seulement si catalogue très profond.** Le consensus 2025 : nav simple par défaut ; méga-menu réservé aux sites à très nombreuses catégories (cas d'IMDb). NN/G confirme que les méga-menus fonctionnent bien *quand ils sont justifiés* ([NN/G](https://www.nngroup.com/articles/mega-menus-work-well/), [Design Shack](https://designshack.net/articles/ux-design/mega-menus-ux/)). Le benchmark Baymard 2025 note que 58 % des navs desktop et 67 % des navs mobiles sont « médiocres ou pires ».
- **Mobile : tab bar en bas, pas de hamburger pour le primaire.** Apple HIG et Material Design recommandent 3-5 destinations en bottom bar ; les fonctionnalités cachées dans un hamburger sont découvertes 30-50 % moins souvent ; le passage hamburger → tab bar augmente sessions et découverte de +30 % dans plusieurs études de cas ([Acclaim](https://acclaim.agency/blog/the-future-of-mobile-navigation-hamburger-menus-vs-tab-bars), [NN/G mobile patterns](https://www.nngroup.com/articles/mobile-navigation-patterns/)). Pattern hybride accepté : tab bar + menu secondaire pour réglages/aide.
- **TV (10-foot UI) ≠ web.** Règles propres : chaque élément atteignable au D-pad, état de focus surdimensionné et toujours visible (on doit retrouver sa position d'un coup d'œil), typographie ≥ 24sp, zones de sûreté (overscan), interactions « paresseuses » ([Fire TV Guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html), [Toptal](https://www.toptal.com/designers/ui/tv-ui-design), [Spyrosoft](https://spyro-soft.com/blog/media-and-entertainment/8-ux-ui-best-practices-for-designing-user-friendly-tv-apps)). Ne pas copier une UI TV sur le web : au clavier/souris, on attend des liens réels, du deep-linking et des pages de catégorie.

**Recommandations**
- Nav globale : 5-7 entrées max (Accueil, Films, Séries, Découvrir/Genres, Ma liste, Recherche).
- Recherche toujours visible (icône + raccourci `/`), pas enfouie.
- Mobile : bottom tab bar 4-5 items ; hamburger uniquement pour le secondaire.
- URLs propres et navigables pour chaque section (avantage web sur les apps TV).

## 2. UX de navigation catalogue (browse)

**Constats clés**

- **Hero : la tendance 2025 est au hero vidéo + tuiles enrichies.** Netflix a dévoilé en mai 2025 une refonte TV : tuiles plus grandes, infos contextuelles directement sur la tuile (badges type « Emmy », « n°1 »), recommandations « responsive » en temps réel selon l'humeur, et recherche conversationnelle OpenAI ([About Netflix](http://about.netflix.com/en/news/unveiling-our-innovative-new-tv-experience), [CNBC](https://www.cnbc.com/2025/05/07/netflix-homepage-app-revamp-openai-tool.html), [Variety](https://variety.com/2025/tv/news/netflix-redesigns-homepage-ai-chatbot-1236388858/)). Disney+ ajoute la vidéo dans le hero et des « content sets » à visuels cinématographiques ([What's On Disney Plus](https://whatsondisneyplus.com/disney-launching-new-navigation-ux-design/)).
- **Carrousels/rails : utiles pour regrouper, mais lourds en risques.** Recherche NN/G : seulement ~1 % des utilisateurs interagissent avec un carrousel de type bannière, et 89 % de ces interactions concernent la première slide ; l'auto-défilement nuit aux lecteurs lents, aux utilisateurs à mobilité réduite et fait perdre le focus clavier/lecteur d'écran ([NN/G auto-forwarding](https://www.nngroup.com/articles/auto-forwarding/), [shouldiuseacarousel.com](https://shouldiuseacarousel.com/), [Smashing — carousels accessibles](https://www.smashingmagazine.com/2023/02/guide-building-accessible-carousels/)). Les rails horizontaux (type Netflix) restent le standard du secteur car ils segmentent le catalogue en catégories digestes, mais exigent : contrôles visibles, pas d'autoplay non désactivable, ARIA + navigation clavier, boutons de scroll assez grands ([Smashing — carousel UX](https://www.smashingmagazine.com/2022/04/designing-better-carousel-ux/)).
- **Nombre de rails : 8-15 est la fourchette de travail**, avec ordre canonique : Continue Watching → Tendances/Nouveautés → 6-10 rails personnalisés « Parce que vous avez regardé » → rails thématiques ([Fora Soft](https://www.forasoft.com/blog/article/streaming-app-ux-best-practices)).
- **Grilles + filtres pour les pages de genre/catalogue.** C'est là que les sites de découverte (Letterboxd, JustWatch, TMDB) excellent face aux streamers. Bonnes pratiques Baymard : facettes combinables (genre + année + note + plateforme), compteurs de résultats sur chaque facette « (47) », application en temps réel sur desktop mais bouton « Voir X résultats » sur mobile, filtres actifs affichés et retirables individuellement ([Baymard](https://baymard.com/learn/ecommerce-filter-ui), [LogRocket faceted filtering](https://blog.logrocket.com/ux-design/faceted-filtering-better-ecommerce-experiences/)). 78 % des sites mobiles ont un filtrage médiocre — grosse opportunité de différenciation.
- **Infinite scroll vs pagination : « Load More » gagne.** Baymard (mises à jour 2024-2025) recommande le bouton « Charger plus » plutôt que l'infinite scroll pur ou la pagination classique pour les listes de produits ; l'infinite scroll convient aux feeds de découverte homogènes mais gêne la recherche d'un titre précis, rend le footer inaccessible et casse le retour arrière si la position de scroll n'est pas préservée ([Crocoblock/Baymard](https://crocoblock.com/blog/pagination-vs-infinite-scroll/), [NN/G](https://www.nngroup.com/videos/infinite-scrolling-when/), [LogRocket](https://blog.logrocket.com/ux-design/pagination-vs-infinite-scroll-ux/)). Garder des URLs paginées crawlables pour le SEO même avec Load More.

**Recommandations**
- Hero : 1 seul titre mis en avant (ou rotation manuelle), jamais d'auto-défilement sans pause ; CTA clairs (Lecture/Détails/+ Ma liste).
- Rails : max ~10-12, libellés explicites (« Parce que vous avez aimé Dune » > « Recommandé »), flèches visibles au hover, support clavier complet, `prefers-reduced-motion` respecté.
- Pages genre : grille + facettes (année, note, durée, plateforme de streaming, langue), tri visible, compteurs par facette, « Load More » + URL d'état.
- Préserver la position de scroll au retour depuis une fiche.

## 3. Fiches détail (film/série)

**Constats clés**

- **Hiérarchie above-the-fold éprouvée** : backdrop/affiche en fond, puis titre + année + durée + genres + classification, note agrégée, synopsis 1-2 paragraphes, CTA (bande-annonce, + watchlist, où regarder) — le tout visible sans scroll ([Tubik](https://blog.tubikstudio.com/spectacular-design-elements-of-cinema-app-ui/), [Design4Users](https://design4users.com/mobile-app-design-elements-ui-cinema-applications/)).
- **Bande-annonce accessible en 1 clic**, lisible dans la page (modale/lecteur intégré), jamais en autoplay sonore.
- **Casting avec visages** : les photos des acteurs facilitent la décision et l'engagement ; TMDB et IMDb en font un rail horizontal cliquable vers des fiches personne. Plex 2025 a massivement enrichi ses fiches détail et profils cast/crew avec de l'artwork ([Plex blog](https://www.plex.tv/blog/the-new-plex-experience/)).
- **Notes multi-sources** : croiser note communautaire + presse (modèle IMDb/Metacritic/Rotten Tomatoes agrégés sur Plex) renforce la confiance.
- **« Où regarder » est devenu un élément central** : le modèle de référence est le module JustWatch (intégré à Letterboxd depuis 2019) — liste par pays des offres streaming/location/achat avec logos des plateformes et prix ; la neutralité de JustWatch (pas de mise en avant sponsorisée) est citée comme un atout de confiance ([TWiT comparatif](https://twit.tv/posts/tech/justwatch-letterboxd-trakt-which-app-should-you-use-manage-your-watchlist)).
- **Titres similaires** en bas de fiche (rail « Plus comme ça ») : indispensable pour maintenir la session de découverte ; les données structurées type Movie schema améliorent aussi le SEO ([Infidigit](https://www.infidigit.com/blog/what-is-movie-schema/)).

**Recommandations**
- Ordre : hero visuel → métadonnées + note → CTA (trailer / watchlist / où regarder) → synopsis → casting → médias → avis → similaires.
- Où regarder : par pays, par type d'offre (abonnement/location/achat), avec deep links.
- Séries : ajouter sélecteur de saisons, progression d'épisodes, badge « Nouvel épisode » (cf. tags Disney+ 2025 « Season Finale », « New Series »).
- Prévoir le partage social et les listes (force de Letterboxd : log, note, review, listes — son moteur de croissance culturelle, [Wikipedia](https://en.wikipedia.org/wiki/Letterboxd)).

## 4. Sensation « premium » : motion, dark mode, personnalisation

**Constats clés**

- **Skeleton screens** : placeholders reprenant la structure finale de la page avec shimmer subtil gauche→droite ; améliorent la vitesse perçue ; à ne pas suranimer ([Medium/Bootcamp skeleton guide](https://medium.com/design-bootcamp/the-ultimate-guide-to-skeleton-screens-in-modern-ui-design-4df362615113), [MUI Skeleton](https://mui.com/material-ui/react-skeleton/)).
- **Micro-interactions** : transitions de ~200 ms au hover ; règle empirique « 3 secondes » — si le cumul d'animations attendues sur une page dépasse 3 s, il y en a trop ([Roberto Moreno Celta](https://robertcelt95.medium.com/micro-interactions-that-dont-annoy-the-3-second-rule-for-ui-animation-9881300cd187), [Bricxlabs](https://bricxlabs.com/blogs/micro-interactions-2025-examples)). Prime Video 2024 a ajouté des transitions de page fluides et des effets de zoom comme signature premium.
- **Hover previews** : carte agrandie au survol (modèle Netflix web) = bon compromis, mais l'autoplay vidéo avec son a été un fiasco documenté — pétition Change.org à 120 000+ signatures avant que Netflix n'ajoute un réglage de désactivation ([Forbes](https://www.forbes.com/sites/paultassi/2020/02/06/heres-how-to-finally-turn-off-netflix-autoplay-previews-and-next-episodes/), [HowToGeek](https://www.howtogeek.com/how-to-disable-netflix-autoplay-previews/)). Leçon : preview après délai, muet par défaut, opt-out visible.
- **Dark-mode-first** : standard du secteur (Netflix, Disney+, Apple TV, Plex) car les visuels ressortent mieux sur fond sombre, usage en environnement peu éclairé, économie OLED. Bonnes pratiques : éviter #000 pur et #FFF pur (préférer ~#121212 et off-white #E0E0E0), attention astigmatisme/halos, proposer quand même un mode clair ou respecter `prefers-color-scheme` ([Smashing — inclusive dark mode](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/), [NN/G dark mode](https://www.nngroup.com/articles/dark-mode-users-issues/)).
- **Tendance visuelle 2025-2026** : Apple TV (tvOS 26/iOS 26) passe au « Liquid Glass » — matériaux translucides réactifs, affiches verticales, plus de contenus visibles à l'écran ([Apple Newsroom](https://www.apple.com/newsroom/2025/06/apple-tv-brings-a-beautiful-redesign-and-enhanced-home-entertainment-experience/), [9to5Mac](https://9to5mac.com/2025/07/16/apples-tv-app-gets-fresh-design-in-ios-26-and-tvos-26-heres-whats-new/)).
- **Personnalisation UI** : « Continue Watching » en premier rail (+30 % d'engagement selon les études OTT) ; 70 % des utilisateurs se servent d'une watchlist ; watchlist et reprise de lecture doivent être traitées comme de la *navigation*, pas du stockage ; libellés transparents (« Parce que vous avez regardé X ») surperforment les libellés opaques ([Fora Soft](https://forasoft.medium.com/user-experience-ux-design-for-streaming-apps-best-practices-for-seamless-viewing-458e995decf5), [MoldStud](https://moldstud.com/articles/p-ultimate-ux-guide-designing-customizable-interfaces-for-video-streaming-apps)).

**Recommandations**
- Dark par défaut (#0e-#14 de fond, surfaces élevées légèrement plus claires), accent coloré unique, images = héros du design.
- Skeletons partout où il y a du fetch ; transitions 150-250 ms ; `prefers-reduced-motion`.
- Hover preview : agrandissement de carte + métadonnées après ~500 ms de survol ; vidéo seulement muette et différée.
- Historique + watchlist + « reprendre » accessibles depuis la nav, synchronisés, avec retrait facile d'un élément.

## 5. Erreurs fréquentes documentées

- **Surcharge de carrousels / paralysie du choix** : l'utilisateur Netflix moyen passe ~17 min par choix, 100+ h/an à chercher ; Nielsen mesure 7-25 min de browsing par session ; le « Netflix Syndrome » (plus de temps à choisir qu'à regarder) est étudié académiquement ([UX Collective](https://uxdesign.cc/netflix-vs-decision-fatigue-how-to-solve-the-paradox-of-choice-888ca56db4b), [AJPOR](https://www.ajpor.org/article/129993-why-does-netflix-syndrome-occur-a-study-on-the-effect-of-content-choice-deferral-on-stress), [Octane Seating — streaming fatigue](https://octaneseating.com/blog/streaming-fatigue/)).
- **Autoplay agressif** (previews sonores, épisode suivant forcé) : backlash massif documenté chez Netflix (cf. §4).
- **Rails opaques et redondants** : mêmes titres répétés dans 5 rails différents, libellés vagues → sentiment de manipulation et catalogue perçu comme petit.
- **Mauvaise découvrabilité hors algorithme** : les streamers offrent peu de vraies pages de genre filtrables ; c'est la critique récurrente qui pousse les utilisateurs vers JustWatch/Letterboxd. Les études de cas Letterboxd notent aussi que sa « découverte » reste basée popularité/classements, peu personnalisée, et que son design system est incohérent entre pages ([Pratt IXD](https://ixd.prattsi.org/2025/05/letterboxd-disassembled-creating-a-design-system-for-movie-review-site-letterboxd/), [case study Medium](https://medium.com/@khushi.pro/letterboxd-redesign-improving-the-user-experience-of-a-social-film-discovery-platform-1b94a404ae09)).
- **Carrousels auto-défilants inaccessibles** : perte de focus clavier, dots minuscules → rage clicks (NN/G, Smashing, cf. §2).
- **Filtres médiocres** : 78 % des sites mobiles (Baymard 2025) ; l'abandon passe de 67-90 % à 17-33 % avec des listes produits optimisées.
- **UI TV transposée telle quelle au web** (pas de liens réels, pas d'URLs, scroll horizontal uniquement) — anti-pattern fréquent des clones de Netflix.

## Synthèse actionnable (top 10)

1. Nav horizontale 5-7 items + recherche proéminente ; bottom tab bar sur mobile.
2. Page d'accueil : hero unique sans auto-rotation + ≤ 12 rails ordonnés (reprise → tendances → personnalisé → thématique), libellés explicites.
3. Chaque rail doit avoir un lien « Voir tout » vers une vraie page grille filtrable.
4. Filtres facettés avec compteurs, état dans l'URL, « Load More » plutôt qu'infinite scroll pur.
5. Fiche : hiérarchie métadonnées → CTA → synopsis → cast → similaires ; module « où regarder » neutre par pays (modèle JustWatch).
6. Dark mode first mais pas #000/#FFF purs ; images cinématographiques comme matière première du design.
7. Skeletons + transitions 200 ms + `prefers-reduced-motion` ; preview au hover différée et muette.
8. Watchlist/continue browsing traités comme navigation de premier niveau.
9. Accessibilité des carrousels : clavier, ARIA, focus visible, pas d'autoplay non contrôlable.
10. Réduire la paralysie du choix : moins de rails mais mieux expliqués, recommandations transparentes, éventuellement recherche en langage naturel (tendance Netflix/Prime 2025).
