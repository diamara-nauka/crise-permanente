# Sécurisation de /admin/* avec Cloudflare Access (Zero Trust)

Ce guide explique comment restreindre l'accès à l'interface Decap CMS (`/admin/*`) aux seules personnes autorisées grâce à **Cloudflare Zero Trust / Access**.

---

## ⚠️ Règle d'or architecturale

> **IMPORTANT** :  
> Le Cloudflare Worker OAuth (`https://<mon-worker>.workers.dev`) ne doit **PAS** être protégé par Cloudflare Access.  
> Seul le chemin `/admin/*` de votre domaine principal (`crisepermanente.fr/admin*`) doit être protégé.  
> Si vous protégiez le worker avec Access, la redirection de callback GitHub après connexion échouerait avec une erreur d'authentification Access.

---

## 1. Accéder au tableau de bord Cloudflare Zero Trust

1. Connectez-vous à votre compte [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Dans le menu de gauche, sélectionnez **Zero Trust**.
3. Si c'est votre première utilisation, choisissez un sous-domaine d'équipe (ex: `crisepermanente.cloudflareaccess.com`) et sélectionnez le forfait gratuit (Free).

---

## 2. Créer une application Access

1. Dans le tableau de bord Zero Trust, allez dans **Access** > **Applications**.
2. Cliquez sur **« Add an application »** puis sélectionnez **« Self-hosted »**.
3. Remplissez les informations de base de l'application :
   - **Application name** : `Crise Permanente Admin`
   - **Session Duration** : Choisissez la durée de session souhaitée (ex: `24 hours` ou `7 days`)
   - **Application domain** :
     - Sous-domaine (optionnel) : laisser vide ou préciser si vous utilisez un sous-domaine
     - Domaine : sélectionnez votre domaine Cloudflare (ex: `crisepermanente.fr`)
     - Path : `admin*` *(ou `/admin` + `/admin/*`)*
4. Cliquez sur **« Next »** en haut à droite.

---

## 3. Définir la politique d'accès (Policy)

1. **Policy name** : `Rédacteurs et Rédactrices autorisés`
2. **Action** : `Allow`
3. Dans la section **Configure rules** (Assigner les critères d'accès) :
   - **Selector** : `Emails` (ou `Emails ending in` pour un nom de domaine entier)
   - **Value** : Renseignez les adresses e-mails de l'équipe éditoriale autorisée à accéder au CMS.
4. Cliquez sur **« Next »** puis sur **« Add application »**.

---

## 4. Fonctionnement pour l'utilisateur

1. Lorsqu'un membre de l'équipe se rend sur `https://crisepermanente.fr/admin` :
   - Cloudflare Access affiche un écran de connexion sécurisé (envoi d'un code OTP à usage unique par e-mail ou connexion Google/GitHub Workspace selon vos fournisseurs d'identité configurés dans Zero Trust).
2. Une fois validé, la page `/admin` Decap CMS se charge.
3. L'utilisateur clique sur « Se connecter avec GitHub » : une fenêtre popup s'ouvre sur le Cloudflare Worker OAuth (`https://<mon-worker>.workers.dev/auth`), valide les droits GitHub sur le dépôt, et autorise Decap CMS à modifier le contenu directement via Git.
