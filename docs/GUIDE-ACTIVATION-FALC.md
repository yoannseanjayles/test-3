# Guide facile pour activer Ciné+

> Ce guide est écrit en langage simple (FALC = Facile À Lire et à Comprendre).
> Des phrases courtes. Une idée par phrase. Pas de mots compliqués sans explication.

## Pourquoi ce guide ?

Le site Ciné+ fonctionne déjà.
Mais certaines fonctions sont **éteintes**.
Elles s'allument quand vous donnez des « clés » au site.

Une clé, c'est un mot de passe secret.
Chaque service (base de données, connexion, vidéos...) a sa clé.

Vous n'êtes pas obligé de tout faire d'un coup.
Chaque bloc de ce guide fonctionne **tout seul**.
Vous pouvez faire un bloc aujourd'hui, et un autre bloc demain.

## Avant de commencer

Tout se passe au même endroit : **le site Vercel**.
Vercel est le service qui héberge Ciné+ (qui le fait tourner sur internet).

1. Allez sur **vercel.com** et connectez-vous.
2. Cliquez sur le projet **cineplus**.
3. Cliquez sur **Settings** (Réglages), en haut.
4. Cliquez sur **Environment Variables** (Variables d'environnement) dans le menu de gauche.

C'est ici que vous allez coller toutes les clés de ce guide.

Pour chaque clé :
1. Cliquez sur **Add New** (Ajouter).
2. Dans la case **Key** (Nom), écrivez le nom exact indiqué dans ce guide (par exemple `DATABASE_URL`).
3. Dans la case **Value** (Valeur), collez la clé secrète.
4. Cochez les 3 cases en bas (**Production**, **Preview**, **Development**).
5. Cliquez sur **Save** (Enregistrer).

⚠️ **Règle importante** : ne partagez jamais ces clés par e-mail ou message public.
Elles donnent accès à votre site.

## À la fin de chaque bloc : il faut redéployer

Après avoir ajouté des clés, le site ne les utilise pas tout de suite.
Il faut lui dire de redémarrer. Ça s'appelle **redéployer**.

1. Dans Vercel, cliquez sur l'onglet **Deployments** (Déploiements).
2. Cliquez sur les **3 petits points** à droite du dernier déploiement.
3. Cliquez sur **Redeploy** (Redéployer).
4. Attendez 1 à 2 minutes. Le site se remet à jour tout seul.

Faites cette étape à la fin de chaque bloc que vous activez.

---

## Bloc 1 — Le catalogue de films et séries (TMDB)

**À quoi ça sert :** sans cette clé, le site montre des exemples de démonstration.
Avec cette clé, le site montre les vrais films et séries, avec vraies affiches et vraies notes.

**C'est le bloc le plus simple. On commence par lui.**

1. Allez sur **themoviedb.org**.
2. Créez un compte gratuit (bouton en haut à droite).
3. Une fois connecté, allez dans les réglages de votre compte, puis dans la section **API**.
4. Demandez une clé API (choisissez « Développeur », c'est gratuit).
5. Vous obtenez un long code. C'est votre clé.

Collez-la dans Vercel :

| Nom de la variable | Ce qu'on colle |
|---|---|
| `TMDB_ACCESS_TOKEN` | Le « jeton d'accès en lecture » (le plus long des deux codes fournis par TMDB) |

**Après le redéploiement** : la page d'accueil affiche de vrais films. C'est le signe que ça marche.

---

## Bloc 2 — La base de données (Neon)

**À quoi ça sert :** la base de données est la mémoire du site.
Elle retient les comptes, les listes de films, les vidéos envoyées.
Sans elle, rien de tout ça n'est possible.

**Ce bloc est le plus important.** Beaucoup d'autres blocs en dépendent.

1. Allez sur **neon.tech**.
2. Créez un compte gratuit.
3. Créez un nouveau projet (« New Project »). Donnez-lui un nom, par exemple « cineplus ».
4. Sur la page du projet, cherchez le bouton **Connection string** (Chaîne de connexion).
5. Copiez la chaîne de connexion. Elle ressemble à une longue adresse qui commence par `postgresql://`.
6. Vérifiez qu'elle se termine bien par `?sslmode=require`. Si non, ajoutez-le à la fin.

Collez-la dans Vercel :

| Nom de la variable | Ce qu'on colle |
|---|---|
| `DATABASE_URL` | La chaîne de connexion complète copiée depuis Neon |

**Une étape technique en plus** : la base de données est vide au départ.
Il faut créer les « tiroirs » à l'intérieur (les tables qui accueilleront les comptes, les listes, etc.).
Cette étape s'appelle une **migration**.

Deux façons de le faire :
- **Vous êtes à l'aise avec un ordinateur** : ouvrez un terminal dans le dossier du projet et lancez la commande `npm run db:migrate`.
- **Vous préférez qu'on le fasse pour vous** : donnez-moi (Claude) la valeur de `DATABASE_URL` dans cette conversation, et je lance la migration à votre place.

**Après le redéploiement et la migration** : rien ne change encore à l'écran.
C'est normal. La base de données sert de fondation aux blocs suivants (comptes, vidéos).

---

## Bloc 3 — Les comptes utilisateurs (connexion et inscription)

**À quoi ça sert :** sans ce bloc, la page « Connexion » dit que les comptes ne sont pas encore ouverts.
Avec ce bloc, les visiteurs peuvent créer un compte, se connecter, et retrouver leur liste sur tous leurs appareils.

**Ce bloc a besoin du Bloc 2 (base de données) déjà activé.**

### 3a. La clé de sécurité

Cette clé sert à protéger les connexions des utilisateurs. C'est un code que vous inventez vous-même, très compliqué.

Si vous avez un terminal, tapez cette commande pour en générer un automatiquement :
```
openssl rand -base64 32
```
Sinon, demandez-moi de vous en générer un dans cette conversation.

| Nom de la variable | Ce qu'on colle |
|---|---|
| `AUTH_SECRET` | Le code généré (une suite de lettres et de chiffres) |

### 3b. Qui a le droit d'administrer le site

Vous voulez sûrement être **administrateur** : la personne qui peut modérer les vidéos, voir les messages, régler les paramètres.

Écrivez votre adresse e-mail (celle avec laquelle vous créerez votre compte sur le site).
Si plusieurs personnes doivent être administrateurs, séparez les adresses par une virgule.

| Nom de la variable | Ce qu'on colle |
|---|---|
| `ADMIN_EMAILS` | Votre adresse e-mail (ex. `vous@exemple.fr`) |

**Après le redéploiement** :
1. Allez sur le site, cliquez sur « Créer un compte ».
2. Inscrivez-vous avec l'adresse e-mail que vous avez mise dans `ADMIN_EMAILS`.
3. Un lien « Back-office » doit apparaître dans le menu. C'est le signe que vous êtes bien administrateur.
4. Allez sur `/admin` pour voir le tableau de bord.

---

## Bloc 4 — L'envoi de vidéos par les créateurs (Studio)

**À quoi ça sert :** ce bloc permet aux utilisateurs d'envoyer leurs propres vidéos sur le site.
Les vidéos sont stockées sur un service appelé Cloudflare R2 (gratuit jusqu'à une certaine taille).
Elles sont ensuite transformées automatiquement dans un format adapté au streaming.

**Ce bloc a besoin du Bloc 2 (base de données) déjà activé. C'est le bloc le plus long à mettre en place.**

### 4a. Le stockage des vidéos (Cloudflare R2)

1. Allez sur **cloudflare.com** et créez un compte gratuit.
2. Dans le menu, cherchez **R2**. Activez R2 (c'est gratuit pour un usage raisonnable).
3. Créez un « bucket » (un espace de stockage). Donnez-lui un nom, par exemple `cineplus-videos`.
4. Notez l'**ID de compte** Cloudflare : il est visible dans le tableau de bord R2, sur la droite.
5. Créez un **jeton API** (API Token) avec le droit de lire et écrire dans R2 (« Object Read & Write »).
6. Notez les deux codes fournis : la clé d'accès et la clé secrète.
7. Rendez le bucket accessible publiquement (Settings du bucket → Public access), et notez l'adresse publique fournie.

Collez tout ça dans Vercel :

| Nom de la variable | Ce qu'on colle |
|---|---|
| `R2_ACCOUNT_ID` | L'ID de compte Cloudflare |
| `R2_ACCESS_KEY_ID` | La clé d'accès du jeton API |
| `R2_SECRET_ACCESS_KEY` | La clé secrète du jeton API |
| `R2_BUCKET` | Le nom du bucket (ex. `cineplus-videos`) |
| `R2_PUBLIC_BASE_URL` | L'adresse publique du bucket |

### 4b. La transformation automatique des vidéos (GitHub)

Quand une vidéo est envoyée, le site doit la transformer dans un format lisible sur tous les appareils.
Cette transformation se fait automatiquement sur GitHub (le service qui héberge déjà le code du site).

1. Allez sur **github.com** et connectez-vous avec le compte qui possède le dépôt du projet.
2. Allez dans **Settings** (les réglages de votre compte, pas ceux du projet) → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**.
3. Cliquez sur **Generate new token**.
4. Choisissez le dépôt `test-3` (celui du projet Ciné+).
5. Donnez le droit **Contents : Read and write**.
6. Créez le jeton et copiez-le tout de suite (il ne se réaffiche plus après).
7. Inventez un deuxième code secret pour vérifier que les messages viennent bien de votre site. Si vous avez un terminal :
```
openssl rand -hex 32
```
Sinon, demandez-moi de vous en générer un.

Collez tout ça dans Vercel :

| Nom de la variable | Ce qu'on colle |
|---|---|
| `GITHUB_DISPATCH_TOKEN` | Le jeton copié depuis GitHub |
| `GITHUB_ENCODE_REPO` | `yoannseanjayles/test-3` (déjà le bon dépôt, rien à changer) |
| `INGEST_WEBHOOK_SECRET` | Le deuxième code secret inventé à l'étape 7 |
| `APP_BASE_URL` | `https://cineplus-eight.vercel.app` (l'adresse de votre site) |

**Attention** : le code `INGEST_WEBHOOK_SECRET` doit être mis à **deux endroits différents** pour fonctionner :
1. Dans Vercel (comme indiqué ci-dessus).
2. Dans GitHub aussi : allez dans le dépôt `test-3` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Nom : `INGEST_WEBHOOK_SECRET`. Valeur : le même code exact.

Si vous préférez, donnez-moi les deux jetons GitHub dans cette conversation et je configure les deux endroits pour vous.

**Après le redéploiement** :
1. Connectez-vous sur le site, allez sur `/studio`.
2. Déposez une petite vidéo de test.
3. Attendez quelques minutes.
4. Allez sur `/admin/videos` : la vidéo doit passer de « Encodage » à « En modération ».
5. Allez sur `/admin/moderation` et publiez-la.
6. Vérifiez qu'elle se lit bien.

---

## Bloc 5 — Les e-mails automatiques (facultatif)

**À quoi ça sert :** sans ce bloc, les notifications (modération acceptée, message reçu...) apparaissent seulement dans la petite cloche du site.
Avec ce bloc, elles sont **aussi** envoyées par e-mail.

Ce bloc n'est pas obligatoire. Le site fonctionne très bien sans lui.

1. Allez sur **resend.com** et créez un compte gratuit (100 e-mails par jour offerts).
2. Créez une clé API (API Key).
3. Copiez-la.

| Nom de la variable | Ce qu'on colle |
|---|---|
| `RESEND_API_KEY` | La clé copiée depuis Resend |
| `EMAIL_FROM` | Le nom et l'adresse d'envoi, par exemple `Ciné+ <notifications@votre-domaine.fr>` |

Pour `EMAIL_FROM`, il faut un nom de domaine que vous possédez (pas une adresse Gmail).
Si vous n'avez pas de nom de domaine, laissez ce bloc de côté pour l'instant.

---

## Ce qu'on laisse volontairement éteint pour l'instant

### La publicité

Le site sait afficher de la publicité, mais elle est **éteinte par choix**.
Avant de l'activer, il faut vérifier un point juridique (la licence TMDB commerciale).
Ne changez pas la variable `ADS_ENABLED` sans en parler d'abord.

---

## Résumé — l'ordre conseillé

1. **Bloc 1 — TMDB** : le plus rapide, pour voir de vrais films tout de suite.
2. **Bloc 2 — Base de données** : la fondation, indispensable pour la suite.
3. **Bloc 3 — Comptes** : pour vous connecter et devenir administrateur.
4. **Bloc 4 — Vidéos** : le plus long, à faire quand vous avez un peu de temps devant vous.
5. **Bloc 5 — E-mails** : facultatif, à faire en dernier si vous le souhaitez.

## Besoin d'aide ?

À chaque étape, vous pouvez :
- me coller directement les clés dans cette conversation, et je les vérifie et je fais les branchements techniques (migration, vérification) à votre place ;
- ou me dire simplement « bloc 2 fait » après avoir tout collé vous-même dans Vercel, et je vérifie que tout fonctionne.

Vous n'avez pas besoin de tout comprendre techniquement.
Suivez les étapes une par une. C'est tout.
