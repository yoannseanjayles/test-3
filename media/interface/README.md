# Médias d'interface

Assets générés selon la [Media Prompt Library 3.2](../../docs/phase-3/3.2-media-prompt-library.md), inventoriés en [3.1](../../docs/phase-3/3.1-media-inventory.md).

## `src/` — sources 1024×1024 (JPEG, palette provisoire H57)

| Fichier | Inventaire | Usage |
|---|---|---|
| `empty-favorites@1024.jpg` | B3 | État vide — Favoris |
| `empty-resume@1024.jpg` | B3 | État vide — Continuer la lecture |
| `empty-history@1024.jpg` | B3 | État vide — Historique |
| `empty-search@1024.jpg` | B3 | État vide — Recherche sans résultat |
| `empty-studio@1024.jpg` | B3 | État vide — Studio UGC |
| `error-404@1024.jpg` | B4 | Page 404 |
| `error-500@1024.jpg` | B4 | Page 500 / panne |
| `error-player@1024.jpg` | B4 | Erreur lecteur |
| `error-410@1024.jpg` | B4 | Contenu retiré (410) |

## `src/` — fonds de chips d'intention 1376×768 (B6, 8 humeurs)

`chip-{slug}@1376.jpg` : frissons · famille · rire · aventure · larmes · rapide · pépites · romance — moitié droite libre pour le libellé (posé en CSS).

## `src/` — cartes de genres 1376×768 (B5, 18 genres)

`genre-{slug}@1376.jpg` : action · animation · aventure · comedie · crime · documentaire · drame · famille · fantastique · guerre · histoire · horreur · musique · mystere · romance · science-fiction · thriller · western.
Composition : tiers gauche/zone libre pour le texte (posé en CSS).

---

Réceptionnés le 2026-07-15 (fournis par le commanditaire). Conversion AVIF/WebP + exports responsive : étape de build front (Phase 5). La palette définitive (Phase 4) pourra déclencher une regénération — les prompts sont paramétrés (H57).

**Reste à générer** (prompts en [3.2](../../docs/phase-3/3.2-media-prompt-library.md)) : B7 onboarding (3) · B8 heros (3) · C2 OG statiques (5, Ideogram) · B1 logo (après naming Phase 4) · P1 : B12 (2), D1-D3 house ads.
