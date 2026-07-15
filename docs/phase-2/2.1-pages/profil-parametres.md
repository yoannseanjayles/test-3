# Spécification de pages — Profil (`/profil`) & Paramètres (`/parametres`)

> **Étape** : 2.1 (lot 10/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D6 (consentements), D7 (préférences lecteur), D11 (UGC), D12 (U6) · Privé, noindex

## 1. Profil (`/profil`)
**Objectif** : identité + le tableau de bord de ses goûts.
| Section | Contenu |
|---|---|
| En-tête | Avatar (initiales/couleur, upload optionnel), pseudo, membre depuis |
| **Mes services de streaming** | sélection (logos toggle) — alimente le filtre « Mes services » et les recos (D1) |
| **Profil de goût** | stats lisibles : genres les plus vus (barres), décennies, temps de visionnage total, titres vus — **explicabilité des recos** (« vos recommandations s'appuient sur ces signaux ») |
| Mes contributions `[UGC ON]` | raccourci → /studio |
| Raccourcis | Ma liste · Historique · Paramètres |

## 2. Paramètres (`/parametres`) — sections
1. **Compte** : e-mail, mot de passe, suppression de compte (double confirmation + délai de grâce 14 j) ;
2. **Lecture** : lecture auto épisode suivant (ON) · qualité par défaut (Auto) · masquer les spoilers (ON, D16) · langue audio/sous-titres préférée ;
3. **Sous-titres** : taille (S/M/L/XL), fond (transparent/semi/plein), aperçu en direct — appliqué au lecteur (D7, EAA) ;
4. **Notifications** (Could-have H25) : alertes dispo, nouveaux épisodes — e-mail uniquement en v1 ;
5. **Confidentialité & données (RGPD)** : consentements pub personnalisée / analytics (reflet du CMP, modifiables — D6) · historique des consultations ON/OFF (H39) · **Exporter mes données** (JSON, asynchrone → e-mail) · **Supprimer mes données** ;
6. **Interface** : langue (FR ; EN préparé H17) · thème (Sombre par défaut · Clair Could-have) ;
7. `[UGC ON]` **Studio** : quotas utilisés (x/5 vidéos, y/10 Go — H18), lien règles de publication.

- Chaque modification sauvegarde immédiatement (autosave + toast) ; pas de bouton global « Enregistrer » ;
- Analytics : `settings.change` (clé, valeur anonymisée) · `privacy.export.request` · `account.delete.request`.

## Hypothèses
- **H40** : délai de grâce de 14 j sur la suppression de compte (annulable par reconnexion) — standard anti-regret ; purge effective ensuite (cascade D12/U4).
