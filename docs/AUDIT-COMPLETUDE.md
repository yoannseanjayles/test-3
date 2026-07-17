# Audit de complétude — Ciné+ (2026-07-16)

> **Objet** : audit honnête et professionnel — cohérence, fonctionnalités, UX/UI, SEO, sécurité, qualité — dans le but de compléter le projet.
> **Méthode** : revue systématique code ↔ spécifications validées (D1-D42), vérification de chaque constat dans le dépôt (grep/lecture), état de la production.
> **Suivi (2026-07-16, D43)** : correctifs appliqués — ✅ A3, A4, A6, B1, B2, B3, B4, B7, C1, C2, D1, D3. Restent ouverts : §0/E3 (vérification live — clés commanditaire), A1, A2, A5, A7, A8, B5, B6 partiel (logo), D2 (arbitrage juridique), D4, E1, E2 → lots C1/C3/C5.
> **Réserve d'honnêteté** : cet audit est réalisé par l'auteur du code — un regard externe et des tests utilisateurs réels restent irremplaçables. Les sévérités sont assumées, y compris quand elles fâchent.

## 0. Limite n°1, avant toute chose

**Le back-end n'a jamais tourné en conditions réelles.** Tout ce qui dépend de `DATABASE_URL`, `AUTH_SECRET`, R2 et Resend (comptes, synchro, ingestion, back-office, notifications, revenus) est du code testé en mode repli, jamais exécuté contre de vrais services (H89). Les 19 tests E2E couvrent uniquement le site public sans configuration. **C'est le risque principal du projet** : aucune complétion ne devrait être considérée comme réelle avant une campagne de vérification live (checklist en annexe A). Idem pour les 3 sources vidéo Internet Archive (H75, jamais vérifiées depuis cet environnement).

## 1. Forces (pour l'équilibre — vérifiées)

Discipline décisionnelle rare (42 décisions HITL + ~40 hypothèses tracées) · exigences fermes verrouillées par des tests bloquants (pub OFF absente du DOM, footer sans lien mort) · états vides/replis honnêtes systématiques · accessibilité auditée (11 violations réelles corrigées) · a11y/perf : pages statiques préservées malgré l'auth · design system cohérent appliqué partout · 4 migrations propres · CI verte.

## 2. Constats

Sévérité : 🔴 majeur (bloque la promesse produit) · 🟠 significatif · 🟡 mineur/dette. Effort : S (< ½ j) · M (½-2 j) · L (> 2 j).

### A. Cohérence produit ↔ spécifications

| # | Constat | Sévérité | Effort |
|---|---|---|---|
| A1 | **Fiches film/série sans CTA « ▶ Regarder » ni bloc « Où regarder »** — D15 les exige (« CTA avec reprise, Où regarder avec fallback ») ; H68 jamais levée. La promesse centrale « trouvez OÙ regarder » n'existe pas dans le produit. Aucun pont fiche TMDB ↔ catalogue gratuit (un classique du domaine public présent dans /gratuit n'est pas regardable depuis sa fiche). | 🔴 | M |
| A2 | **Fiche série sans saisons ni épisodes** (D16 : « saisons/épisodes spoiler-safe ») — la fiche série est structurellement une fiche film. | 🔴 | M |
| A3 | **2 emplacements pub sur 5 réellement montés** : `display.browse` et `native.rail` ont un flag, un écran back-office, une hauteur réservée… et aucun rendu dans aucune page. Le back-office pilote des interrupteurs fantômes. | 🟠 | S |
| A4 | **`ads.preroll.session_cap` paramétrable mais jamais consommé** — le capping du lecteur est codé en dur (1/titre/session). L'écran Paramètres promet un effet qu'il n'a pas. | 🟠 | S |
| A5 | Pages du sitemap validé absentes : `/tendances`, `/nouveautes` (fusionnées de fait dans /decouvrir sans le dire), **page Personne** (`/personne/{slug}`), **fiche vidéo UGC** (`/video/{slug}`). | 🟠 | M-L |
| A6 | **Rétention 13 mois des `events` annoncée** (page Cookies + 7.0 §3) **mais aucune purge implémentée** — engagement public non tenu techniquement. | 🟠 | S |
| A7 | Recherche « instantanée » (D1 n°7) non tenue : page GET correcte mais aucune suggestion à la frappe ; TanStack Query installé depuis le Lot 1… jamais utilisé. | 🟠 | M |
| A8 | 26 assets média générés et validés (Phase 3) dorment : **8 chips d'intention B6** (l'accueil D14 les prévoyait) et la majorité des **18 cartes genres B5** (aucune page genre, grilles sans facettes — spec grilles-catalogue). | 🟠 | M |

### B. UX / UI

| # | Constat | Sévérité | Effort |
|---|---|---|---|
| B1 | **Sur mobile, impossible de se connecter ou de voir ses notifications par la navigation** : la zone compte du header est `hidden md:block` et la BottomNav n'a aucune entrée compte/profil. La moitié du produit (comptes, synchro, studio, cloche) est invisible pour un mobinaute — seuls des chemins détournés y mènent. | 🔴 | S-M |
| B2 | **Aucune page Profil/Paramètres utilisateur** (spec 2.1 validée) : pas de changement de mot de passe, pas de suppression de compte self-service (le RGPD passe par un admin, contrairement à la politique de confidentialité qui promet des « boutons directs »), pas d'opt-out e-mail (H108). | 🔴 | M |
| B3 | Ma liste « En cours » n'affiche **ni barre de progression ni position de reprise** alors que les données existent (progress/positionSeconds stockés). L'utilisateur ne voit pas « où il en est » — c'est pourtant la raison d'être de l'onglet. | 🟠 | S |
| B4 | Le bandeau « Créer un compte » de l'accueil s'affiche **même connecté** (D14 le réservait aux anonymes). | 🟡 | S |
| B5 | Lecteur : pas de sous-titres, pas de sélecteur de qualité, contrôles natifs (H73 documenté) — en dessous de la matrice 2.2 validée ; « À regarder ensuite » ignore les vidéos communauté. | 🟠 | L |
| B6 | Logo provisoire (monogramme) et aucune OG image par défaut : un partage du site sur les réseaux n'a **aucun visuel** (D25 branding + B7/B8/C2 reportés). | 🟠 | S-M |
| B7 | La cloche de notifications disparaît totalement quand il n'y a aucune notification — un utilisateur ne découvre jamais que la fonctionnalité existe (discoverabilité). | 🟡 | S |

### C. SEO & découvrabilité

| # | Constat | Sévérité | Effort |
|---|---|---|---|
| C1 | **Ni `sitemap.xml` ni `robots.txt`** — contradiction directe avec D1 §6.1 (« SEO programmatique légitime ») et le budget SEO de chaque spec de page. Les fiches ISR ne seront découvertes que par crawl de liens. | 🔴 | S |
| C2 | Canonical absent des grilles paginées (`/films?page=N`), pas de `rel=prev/next` méta. | 🟡 | S |

### D. Sécurité & technique

| # | Constat | Sévérité | Effort |
|---|---|---|---|
| D1 | **Aucun en-tête de sécurité** (CSP, HSTS, X-Frame-Options, Referrer-Policy) alors que 6.0 §6 (validé D33) les promettait. | 🔴 | S-M |
| D2 | Les beacons de mesure partent **sans tenir compte d'un refus CMP** — défendable (anonymat strict, H101/H107) mais non tranché juridiquement (H46) ; à arbitrer avant toute activation pub. | 🟠 | S |
| D3 | `deleteUserAction` : suppression RGPD sans confirmation (un clic = irréversible) ; pas d'export des données (droit à la portabilité promis dans la politique de confidentialité). | 🟠 | S-M |
| D4 | Workflow d'encodage : sources sans piste audio non gérées (H92) ; pas de garde sur la durée/type réel du fichier avant encodage (un fichier renommé `.mp4` consommera des minutes GitHub pour rien). | 🟡 | M |

### E. Qualité & tests

| # | Constat | Sévérité | Effort |
|---|---|---|---|
| E1 | **Zéro test sur le back-office et les server actions** (auth, synchro, modération, flags) — précisément le code jamais exécuté en réel (voir §0). Les 19 tests couvrent le site public seulement ; axe n'audite pas /admin. | 🔴 | M-L |
| E2 | Lighthouse CI configuré (budgets D26) mais jamais exécuté (H79) — les budgets perf validés ne sont pas mesurés. | 🟠 | S |
| E3 | H75 : les 3 URLs Internet Archive du catalogue gratuit n'ont jamais été vérifiées (l'état d'erreur du lecteur couvre, mais 3 titres sur 7 potentiellement morts = mauvaise vitrine). | 🟠 | S |

## 3. Plan de complétion proposé

Ordre recommandé — chaque lot reste soumis à validation HITL :

| Lot | Contenu | Constats couverts | Prérequis |
|---|---|---|---|
| **C1 — Vérification live** *(le plus important, 1 h dont ~15 min de ton côté)* | Brancher `DATABASE_URL` + `AUTH_SECRET` + `ADMIN_EMAILS` (puis R2/TMDB), dérouler la checklist annexe A, corriger ce qui casse | §0, E3 | **Tes clés** |
| **C2 — Mobile & compte** | Entrée compte dans la BottomNav + header mobile, page **Profil/Paramètres** (mot de passe, suppression + export RGPD self-service, opt-out e-mail), bandeau conversion masqué si connecté, progression visible dans « En cours » | B1, B2, B3, B4, D3 | — |
| **C3 — Cœur découverte** | CTA « ▶ Regarder » + « Où regarder » (JustWatch/TMDB) sur les fiches, pont fiche ↔ catalogue gratuit, **saisons séries**, chips d'intention + pages genres (assets dormants), /tendances + /nouveautes, suggestions incluant l'UGC | A1, A2, A5, A8, B5 partiel | TMDB token pour tester |
| **C4 — SEO, sécurité & cohérence technique** | sitemap.ts + robots.ts, OG image par défaut, en-têtes de sécurité (CSP/HSTS), purge `events` planifiée, `session_cap` branché au lecteur, AdSlots browse/native montés, canonical pagination | C1, C2, D1, A3, A4, A6 | — |
| **C5 — Qualité** | Tests server actions + parcours admin (avec base de test PGlite ou branche Neon), axe sur /admin, Lighthouse CI activé en CI | E1, E2 | C1 fait |
| *Ensuite* | Recherche instantanée (A7), lecteur avancé sous-titres/qualité (B5), branding définitif (B6/R6), Phases 8-9 | — | — |

## Annexe A — Checklist de vérification live (Lot C1)

1. `/api/health` → `database: ok` ; migrations appliquées (`npm run db:migrate`) ;
2. Inscription (e-mail listé dans `ADMIN_EMAILS`) → lien « Back-office » visible ;
3. Ma liste : ajouter un favori sur navigateur A connecté → visible sur navigateur B ;
4. Reprise : lancer une vidéo, quitter, reprendre sur l'autre appareil ;
5. Contact : envoyer un message takedown → cloche admin + tête de file dans /admin/messages ;
6. Flags : activer la pub → bandeau CMP + house ads + impressions dans /admin/revenus ; kill switch env ;
7. Ingestion (avec R2 + secrets GitHub) : upload → encodage Actions → modération → publication → lecture ;
8. Vérifier les 3 sources Internet Archive (H75) et remplacer les mortes ;
9. Paramètres : baisser le quota UGC à 1 → vérifier le blocage au 2ᵉ dépôt.

---
*Audit versionné pour trace ; les corrections feront l'objet des lots C1-C5 (propositions P43+).*
