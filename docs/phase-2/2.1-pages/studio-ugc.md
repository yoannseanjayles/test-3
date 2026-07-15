# Spécification de pages — Studio UGC (`/studio`, `/studio/upload`, `/studio/video/{id}`)

> **Étape** : 2.1 (lot 11/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D8/D11 (upload + switch hors admins), D7 (pipeline), D12 (U5/A3) · Privé, noindex · Visible si `ugc.upload.enabled` OU rôle admin (D13)

## 1. Objectif
Permettre à un créateur de **publier proprement** : téléverser, déclarer ses droits, suivre l'encodage et la modération, mesurer ses vues. La friction est assumée là où elle protège (droits, modération) et éliminée partout ailleurs.

## 2. `/studio` — tableau de bord
- Cartes de mes vidéos : vignette, titre, **statut** (⬆ Envoi x % · ⚙ Encodage · 🕓 En modération · ✅ Publiée · ✕ Refusée (motif) · ⛔ Retirée) ;
- Stats simples par vidéo publiée : vues, minutes vues, complétion ;
- Quota visible (x/5 vidéos · y/10 Go — H18) ; CTA « Téléverser » (désactivé si quota atteint, avec explication) ;
- État vide (D13) : « Téléversez votre première vidéo » + encart règles (droits requis, formats, modération).

## 3. `/studio/upload` — parcours en 4 étapes
1. **Fichier** : drag & drop ; formats MP4/MOV/MKV, ≤ 4 Go (H41) ; upload **résumable** (reprise après coupure), progression + vitesse ; checksum côté client ;
2. **Droits & licence (bloquant)** : sélection obligatoire — « Œuvre dont je détiens les droits » · « Creative Commons (préciser) » · « Domaine public » + case de responsabilité + rappel sanctions (suspension du compte, retrait) ;
3. **Métadonnées** : titre (obligatoire), synopsis, genre(s), langue, année, vignette (frame auto ou upload), sous-titres `.srt/.vtt` (optionnels, multi-langues) ;
4. **Envoi** : récapitulatif → confirmation → statut « Encodage » (pipeline D7) puis « En modération » (A3) ; notification e-mail à la décision.

L'utilisateur peut quitter pendant l'encodage (asynchrone) ; brouillon conservé si le parcours est interrompu après l'étape 1.

## 4. `/studio/video/{id}` — gestion d'une vidéo
Édition métadonnées/vignette/sous-titres (re-modération **non** requise pour les métadonnées mineures, requise si remplacement du fichier — H42) · statistiques détaillées · **Retirer la vidéo** (immédiat, définitif après confirmation).

## 5. Garde-fous techniques (rappels D11)
Modération a priori (rien de public sans approbation) · scan antivirus + validation container/codec à l'ingestion · pré-roll identique au reste du catalogue `[pub ON]` (H20) · fiches publiques `/video/{slug}-{id}` en gabarit allégé avec mention « Par {pseudo} » + licence.

## 6. Analytics
`studio.view` · `upload.start/progress/complete/abort` (taille, durée) · `upload.rights.selected` · `moderation.decision` (côté admin) · `ugc.video.play` (public).

## Hypothèses
- **H41** : plafond 4 Go/fichier en v1 (aligné sur l'upload résumable et le pipeline) ; extensible par admin.
- **H42** : la re-modération n'est déclenchée que par un remplacement de fichier ou un signalement — pas pour une correction de titre/synopsis.
