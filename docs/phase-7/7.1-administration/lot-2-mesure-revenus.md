# Phase 7.1 — Lot 2 : Mesure & revenus

> **Livrable** : socle d'événements unique, décision publicitaire house ads branchée sur les AdSlots (palier P-1 du 6.2), écran back-office « Revenus », CMP maison dormante
> **Statut** : ⏳ En attente de validation HITL (P41)
> **Lève** : H95 (tableau Revenus) · met en œuvre P-1 (6.2/D39) — le tout dormant tant que la pub est OFF (D6)

## Contenu du lot

| Élément | Fichier(s) | Détail |
|---|---|---|
| Socle événements | `lib/events.ts` + table `events` (migration `0002`) | Écriture serveur best-effort (jamais bloquante), **session anonyme = hash rotatif quotidien IP+UA** — aucun cookie, aucun identifiant stable (H101) ; un seul pipeline pour `ad.*` (Revenus) et les analytics (Phase 9) |
| Beacon client | `/api/events` + `AdCreative` | Liste blanche stricte (`ad.impression`, `ad.click`, `video.view`), rate-limité 120/min/IP, réponse 204 systématique ; envoi `sendBeacon` avec repli fetch |
| Décision publicitaire | `lib/ads/decision.ts` | Régie directe v1 (6.2 §2) : 3 house ads (catalogue gratuit, Ma liste, Studio) sur les illustrations B5 (créas B7 à venir, H100) ; rotation déterministe par emplacement — le contrat accueillera campagnes (P-2) puis VAST (P-3) |
| AdSlots rendus | `components/ads/AdSlot.tsx` + `AdCreative.tsx` | La créa remplit le conteneur à hauteur réservée (zéro CLS conservé) ; **impression = visible ≥ 50 % pendant ≥ 1 s (MRC)** envoyée une fois, clic tracké ; toujours `null` (absent du DOM) si pub OFF — test E2E D6 inchangé |
| Lecteur | `VideoPlayer` | Événement `video.view` au lancement effectif (repère d'audience de l'écran Revenus) |
| Écran Revenus | `/admin/revenus` | Impressions/clics/CTR + **revenu estimé** (paramètre `ads.ecpm_cents`, réglable dans Paramètres), répartition par emplacement, 30 jours ; **état vide honnête pub OFF** avec rappel du garde-fou R1/H99 ; agrégats à la lecture (H102) |
| CMP maison (6.2 §4) | `ConsentBanner` + `ManageConsentButton` + `/api/flags-status` | **Dormante** : ne s'affiche que si la pub est ON et sans choix stocké ; Accepter/Refuser symétriques (CNIL), choix 6 mois en localStorage, réouverture depuis `/cookies` (bouton enfin câblé) ; bascule CMP IAB au palier P-3 |

## Vérifications effectuées

- `npm run build` + `npm run lint` ✅ ; **19/19 tests E2E verts** — dont le test bloquant « pub OFF ⇒ rien dans le DOM » qui couvre désormais aussi créas et CMP ;
- Migration `0002` versionnée ; nav back-office : entrée « Revenus » ajoutée.

## Hypothèses signalées

- **H106** : l'impression est comptée au standard MRC côté client — les rendus serveur ne sont jamais comptés (pages ISR : la décision est prise à la revalidation, la mesure au vrai affichage).
- **H107** : les beacons de mesure sont envoyés sans consentement car strictement anonymes (hash rotatif quotidien, pas de cookie) — adossé à l'exemption CNIL « mesure d'audience » (H101) ; à confirmer en revue juridique H46 avant activation publique de la pub.

## Reste à faire (Lot 3, rappel)

Notifications créateurs in-app (+ Resend H83), suppression de compte RGPD, OPERATIONS.md, job de surveillance des seuils free tier — clôture de la 7.1.
