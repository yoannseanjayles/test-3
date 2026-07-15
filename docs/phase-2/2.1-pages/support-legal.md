# Spécification de pages — Support & légal : Contact, FAQ, À propos, CGU, Confidentialité, Cookies, Mentions légales, 404/500

> **Étape** : 2.1 (lot 13/14) · **Statut** : ✅ Validé (validation anticipée D18)
> **S'appuie sur** : D5 (attributions), D6 (CMP), D11 (takedown), D13 (FAQ post-dépréciation, formulaires courts)

## 1. FAQ (`/faq`) — indexable
- Accordéons groupés : **Compte** · **Visionnage** (qualité, sous-titres, reprise) · **Catalogue gratuit** (d'où viennent les films, licences) · **Publicité** (pourquoi de la pub, comment gérer le consentement) · **Publier une vidéo** `[UGC ON]` (droits, modération, quotas) · **Données personnelles** (export, suppression) ;
- Réponse directe en 1re phrase (format extractible IA — D13) ; JSON-LD `FAQPage` conservé sans attente de rich result ;
- Recherche interne dans la FAQ ; bloc final « Vous n'avez pas trouvé ? » → /contact ;
- Alimentée en continu par les `search.zero` et les motifs de contact (boucle 7.1).

## 2. Contact (`/contact`) — indexable
- Formulaire 4 champs : motif (select : Question · Bug · **Signaler un contenu** · Ayants droit/retrait · Annonceurs · Autre) · e-mail · message · pièce jointe optionnelle ;
- Motif « Ayants droit/retrait » → formulaire enrichi (URL du contenu, qualité du demandeur, déclaration) = **procédure notice & takedown D11**, routée en priorité vers A3 ;
- Motif « Annonceurs » → mention du kit média (Phase 8) ;
- Confirmation immédiate + e-mail récapitulatif + délai annoncé (72 h) ; honeypot + rate limit (D13).

## 3. À propos (`/a-propos`) — indexable
Mission (1 paragraphe, ton D4) · **Attributions obligatoires** : logo TMDB + mention non-endorsement, attribution JustWatch pour les disponibilités (D5 §3.3) · explication du catalogue gratuit (domaine public, CC, créateurs) · lien contact/annonceurs.

## 4. Pages légales
- **CGU** (`/cgu`) : inclut les règles UGC (droits déclarés, sanctions, retrait — D11) et les conditions du service gratuit avec publicité ;
- **Confidentialité** (`/confidentialite`) : données collectées (compte, progression, historique — avec finalités), bases légales, durées, droits RGPD + comment les exercer (liens directs vers /parametres) ;
- **Cookies** (`/cookies`) : catégories (essentiels/analytics/pub), tableau des cookies, **bouton « Gérer mes préférences » rouvrant le CMP** (D6/TCF) ;
- **Mentions légales** (`/mentions-legales`) : éditeur, hébergeurs (app + vidéo), directeur de publication ;
- Communs : sommaire ancré, « Dernière mise à jour », langage clair (résumé non-juridique en tête de section — le texte juridique reste faisant foi).

## 5. Pages d'erreur
- **404** : « Ce titre s'est perdu dans les archives » + recherche + rails tendances/gratuit (jamais un cul-de-sac — D1) ; suggestions si l'URL ressemble à un slug connu (« Vouliez-vous dire… ») ;
- **500/panne** : message honnête + retry ; si le cache CDN stale est disponible, l'utilisateur ne voit idéalement jamais cette page (D1) ;
- 404 renvoie un vrai statut HTTP 404 (SEO).

## 6. Analytics
`faq.view/search/item.open` (top questions → curation) · `contact.submit` (motif) · `takedown.request` · `error404.view` (URL demandée).

## Hypothèses
- **H45** : pas de chat/support temps réel en v1 — formulaire + FAQ suffisent au volume attendu ; réévaluation Phase 9.
- **H46** : les textes légaux définitifs relèvent d'un juriste ; les gabarits et le contenu structurel sont livrés, les clauses finales sont à faire valider juridiquement avant mise en production (signalé au Project Overview).
