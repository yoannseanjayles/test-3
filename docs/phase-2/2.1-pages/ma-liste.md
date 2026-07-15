# Spécification de pages — Ma liste (`/ma-liste`) : Favoris, En cours (Continuer la lecture), Historique

> **Étape** : 2.1 (lots 9 + 14/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D7 (progression), D12 (flows U2-U4), D13 (états vides à action unique) · Privé, noindex

## 1. Objectif
Le **QG personnel** : tout ce que l'utilisateur a gardé, entamé ou vu — le socle des recommandations et de la rétention (O3).

## 2. Hub `/ma-liste`
Onglets persistants : **Favoris** (défaut) · **En cours** · **Historique**. Compteurs par onglet. Le hub conserve l'onglet actif en session.

## 3. Favoris (`/ma-liste/favoris`)
- Grille `TitleCard` + retrait 1 clic (annulable 5 s — toast « Annuler ») ;
- Tri : Ajout récent (défaut) · Note · Année · A-Z ; filtres rapides : Film/Série · **Gratuit ▶** · « Dispo sur mes services » ;
- Badge dynamique : « Désormais gratuit » / « Arrive sur Netflix » (si données) ;
- **État vide** (D13) : illustration + « Parcourez les tendances et ajoutez votre premier titre » → /tendances (action unique).

## 4. En cours (`/ma-liste/en-cours`) — la page « Continuer la lecture »
- `ProgressCard` large : vignette 16:9, barre de progression, « il reste 42 min », SxEy le cas échéant ;
- Actions : ▶ Reprendre (primaire) · Recommencer · ✓ Marquer vu · ✕ Retirer ;
- Tri par activité récente (D7) ; les éléments > 92 % ou marqués vus disparaissent ;
- Sections : **À reprendre** (entamés) · **Épisode suivant** (séries à jour d'épisodes vus mais pas de saison) ;
- État vide : « Rien en cours — trouvez votre prochain film » → /gratuit.

## 5. Historique (`/ma-liste/historique`)
- Liste chronologique groupée par jour ; entrée = vignette + titre + type d'événement (Vu · Entamé · Consulté — consultations optionnelles, OFF par défaut, H39) ;
- **RGPD (D12/U4)** : suppression unitaire (— retire aussi le signal de reco) · « Effacer tout l'historique » (double confirmation) · lien vers l'export de données (/parametres) ;
- Recherche interne dans l'historique ;
- État vide : « Votre historique apparaîtra ici » + lien /gratuit.

## 6. Transverses
- Sync temps réel entre onglets/appareils (les mutations passent par l'API — pas d'état local divergent) ;
- Aucune publicité sur l'espace personnel (D10 §3 : zone interdite) ;
- Analytics : `mylist.tab.view` · `favorites.add/remove/undo` · `resume.play/restart/markseen/remove` · `history.delete.item/all`.

## Hypothèses
- **H39** : le tracking des simples consultations de fiches dans l'historique est **désactivé par défaut** (opt-in dans Paramètres) — principe de minimisation RGPD ; « Vu » et « Entamé » restent natifs.
