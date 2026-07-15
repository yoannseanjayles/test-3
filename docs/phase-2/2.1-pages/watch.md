# Spécification de page — Watch (`/regarder/{slug}-{id}` · `…/s{n}e{m}`)

> **Étape** : 2.1 (page 4/14, ordre validé D13)
> **Statut** : ✅ Validé HITL le 2026-07-15 (décision D17)
> **S'appuie sur** : D6 (pré-roll exigence ferme + kill switch), D7 (lecteur hls.js+Vidstack, reprise, sécurité), D13 (benchmarks TTFF < 2 s, fiche allégée sous lecteur), D12 (flow V4), D16 (mode épisode)
> **Note** : cette page pose la structure ; les comportements fins du lecteur (gestes, TV, file publicitaire) seront consolidés dans la **2.2 Video Experience Specification**.

---

## 1. Objectif

Livrer la **session de visionnage premium** : démarrage < 2 s, zéro friction, contrôle total — et porter le pré-roll (D6) sans jamais dégrader l'expérience (principe 15). C'est la page qui produit le **temps de visionnage** (O4) et l'inventaire publicitaire vidéo (O5).

**KPI de la page** : TTFF, rebuffer ratio, complétion contenu, complétion pré-roll, taux de clic épisode suivant.

## 2. Structure

| # | Section | Détail |
|---|---|---|
| 1 | **Lecteur** (au-dessus de la flottaison, dominant) | 16:9 pleine largeur (max ~1280 px centré desktop) ; thème sombre imposé sur cette page ; header simplifié (logo + retour fiche), disparaît en lecture |
| 2 | **Barre titre** (sous le lecteur) | Titre (lien fiche) · SxEy + titre d'épisode le cas échéant · badges (Gratuit ▶, licence) · actions : + Ma liste · Vu · Partager |
| 3 | **Fiche allégée** | Synopsis court, métadonnées essentielles, casting réduit (6 `PersonCard`), lien « Voir la fiche complète » — légitime la page en SEO (D13) sans concurrencer la lecture |
| 4 | **Mode épisode** : bande « À suivre » | Rail des épisodes de la saison (composant `EpisodeRow` compact, D16), épisode courant surligné |
| 5 | **Similaires** | Rail « À regarder ensuite » (gratuits d'abord — ils sont lisibles en 1 clic) |
| 6 | **Source & licence** | Bloc obligatoire pour le catalogue gratuit (D5 §3.3) : origine (Internet Archive / CC / UGC + auteur) et licence |

Pas d'emplacement display sur cette page : **la seule publicité de la page Watch est le pré-roll** (in-player). Décision de non-pollution : un display sous le lecteur cannibalise la complétion.

## 3. Séquence de lancement (flow V4 précisé)

```
Arrivée (clic ▶, deep link, épisode suivant)
 1. Shell de page instantané : poster + spinner lecteur (skeleton)
 2. Auth du flux : GET /api/token (URL signée D7) — en parallèle du rendu
 3. [pub ON + consentement TCF + capping OK] → pré-roll :
      - « Publicité — votre vidéo dans Xs » (compte à rebours honnête, D13)
      - skippable après 5 s (« Passer ▸ »), clic annonceur = nouvel onglet, pause
      - quartiles VAST trackés (0/25/50/75/100)
      - échec de chargement pub (timeout 3 s) → lecture directe (la pub ne bloque JAMAIS le contenu)
 4. Lecture HLS : reprise à la position serveur (ou 0), qualité auto ABR
 5. Heartbeat 15 s + sendBeacon à la fermeture (D7)
```

**Frequency capping pré-roll (D6)** : au plus 1 pré-roll par titre par session ; pas de pré-roll sur « épisode suivant » enchaîné dans les 30 min ; pas de pré-roll à la reprise d'un contenu déjà entamé ce jour. Paramètres pilotables en 6.2.

## 4. Lecteur — contrôles (rappel D7, arbitrages page)

- Barre : lecture/pause · -10/+10 s · volume (mémorisé) · sous-titres (menu pistes + « Personnaliser » → réglages inline taille/fond) · qualité (Auto + manuel) · vitesse (0,5-2×) · PiP · plein écran ;
- Clavier : `Espace/K` lecture · `←/→` ±10 s · `↑/↓` volume · `F` plein écran · `M` muet · `C` sous-titres · `?` aide raccourcis ;
- Contrôles masqués après 3 s de lecture (réapparition au mouvement/touche) — **jamais masqués en pause** ;
- Clic simple = pause/lecture ; double-clic = plein écran ; (gestes tactiles détaillés en 2.2) ;
- **Reprise** : toast discret « Reprise à 1 h 12 — ⟲ Reprendre du début » (5 s), pas de modale bloquante.

## 5. Écran de fin

- **Film** : recos post-visionnage (3 cartes, gratuits d'abord) + « Revoir » ; annulable d'un clic sur l'image de fond (retour aux crédits) ;
- **Série** : carte « Épisode suivant » avec compte à rebours 10 s (annulable, désactivable dans Paramètres : `Lecture automatique`), recos en secondaire ; dernier épisode → bascule gabarit film ;
- Déclenchement : aux crédits si repérables (métadonnée), sinon à 98 % ; jamais pendant une scène post-générique référencée.

## 6. SEO & partage

- Indexable (requêtes « regarder {titre} gratuitement » — D10) : SSR du shell avec titre, synopsis, JSON-LD `VideoObject` (name, thumbnailUrl, duration, uploadDate, `potentialAction WatchAction`) ; le flux vidéo lui-même reste derrière URL signée (non crawlable — voulu) ;
- `<title>` : « Regarder {Titre} ({année}) gratuitement en streaming | {Marque} » ;
- OG image : vignette 16:9 du titre avec bouton play incrusté.

## 7. Performance (budgets de la page)

- **TTFF < 2 s** : préconnexion CDN au hover du bouton ▶ (sur fiche), master playlist en cache edge, première qualité conservatrice (720p) puis montée ABR ;
- Rebuffer < 1 % : buffer cible 30 s, downswitch agressif ;
- Lecteur code-splitté mais **préchargé dès l'intention** (hover/focus ▶ sur la fiche) ;
- Poster affiché instantanément (LCP de la page).

## 8. Accessibilité (rappels critiques)

Sous-titres personnalisables (obligation EAA — D13) ; tous contrôles nommés (`aria-label`), focus visible, pièges de focus interdits ; annonces `aria-live` (changement de piste, reprise) ; `prefers-reduced-motion` → pas d'auto-masquage animé des contrôles ; cible tactile ≥ 24 px.

## 9. États & erreurs

- **Contenu non visionnable** (URL forgée) : redirection 302 vers la fiche ;
- **Token expiré en cours de lecture** : renouvellement silencieux, sans interruption ;
- **Erreur flux** (segment 404, réseau) : retry auto ×3 avec backoff → message « Un problème est survenu » + bouton Réessayer + retour fiche ; position sauvegardée ;
- **UGC retiré** (modération/takedown D11) : page 410 avec explication + similaires ;
- **Anonyme** : lecture autorisée (V4), progression en localStorage + invite douce à la fin ;
- **Pub OFF / consentement refusé / capping atteint** : étape 3 sautée intégralement (aucun module chargé, D7).

## 10. Analytics

`watch.start` (source : fiche/deeplink/autoplay-next) · `watch.ttff` · `watch.rebuffer` · `watch.progress` (quartiles contenu) · `watch.complete` · `watch.ad.request/start/quartiles/skip/click/error` `[pub ON]` · `watch.next.auto/click` · `watch.error` (code, position).

---

## Hypothèses signalées

- **H29** : règles de frequency capping (§3) posées comme défauts raisonnables — valeurs finales pilotables dans le back-office pub (6.2/7.1).
- **H30** : détection des crédits par métadonnée manuelle (curation/ingestion) en v1 ; détection automatique = v2.
- **H31** : préchargement du lecteur à l'intention (hover ▶) acceptable en poids réseau (~80 KB hls.js) — à mesurer au PoC (H12).
