# Création d'une GitHub OAuth App pour Decap CMS

Pour que Decap CMS puisse lire et écrire dans votre dépôt GitHub via votre Cloudflare Worker, vous devez créer une **OAuth App** sur GitHub.

---

## 1. Créer l'application sur GitHub

1. Rendez-vous sur GitHub : [Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Cliquez sur **« New OAuth App »** (ou « Register a new application »).
3. Remplissez le formulaire comme suit :
   - **Application name** : `Crise Permanente CMS` (ou le nom de votre choix)
   - **Homepage URL** : `https://crisepermanente.fr` (ou l'URL de votre site Cloudflare Pages)
   - **Application description** : `Fournisseur OAuth pour l'administration Decap CMS`
   - **Authorization callback URL** :  
     `https://<votre-worker-oauth>.workers.dev/callback`  
     *(⚠️ Remplacez `<votre-worker-oauth>` par le sous-domaine de votre Cloudflare Worker déployé, par exemple `https://crise-permanente-oauth.workers.dev/callback`)*
4. Cliquez sur **« Register application »**.

---

## 2. Récupérer les identifiants

1. Sur la page de votre nouvelle OAuth App, notez le **Client ID** (ex: `Iv1.xxxxxxxxxxxx`).
2. Cliquez sur **« Generate a new client secret »**.
3. Copiez immédiatement le **Client Secret** généré (il ne sera plus affiché ensuite).

---

## 3. Injecter les identifiants dans le Cloudflare Worker

Dans le dossier `workers/github-oauth`, configurez les deux secrets via Wrangler :

```bash
cd workers/github-oauth

# Injecter le Client ID
npx wrangler secret put GITHUB_CLIENT_ID
# (Collez la valeur du Client ID puis appuyez sur Entrée)

# Injecter le Client Secret
npx wrangler secret put GITHUB_CLIENT_SECRET
# (Collez la valeur du Client Secret puis appuyez sur Entrée)
```

Une fois ces variables configurées et le worker déployé, l'authentification GitHub est opérationnelle.
