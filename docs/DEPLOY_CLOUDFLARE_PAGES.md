# Déploiement sur Cloudflare Pages

Le site est entièrement statique (SSG) et se déploie nativement sur **Cloudflare Pages** avec des performances optimales et des coûts nuls sur le forfait Free.

---

## Méthode recommandée : Déploiement continu via Git (GitHub)

1. Poussez votre code sur votre dépôt GitHub :
   ```bash
   git init
   git add .
   git commit -m "feat: initialisation de la revue Crise Permanente"
   git remote add origin git@github.com:<votre-compte>/crise-permanente.git
   git push -u origin main
   ```

2. Rendez-vous sur le tableau de bord Cloudflare :
   - Allez dans **Compute (Workers & Pages)** > **Create application** > onglet **Pages** > **Connect to Git**.
   - Sélectionnez votre dépôt `crise-permanente`.

3. Renseignez les paramètres de build :
   - **Framework preset** : `Astro`
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (laissez vide ou `/`)

4. Variables d'environnement de build (Optionnel) :
   - Variable : `NODE_VERSION`
   - Valeur : `20` ou `22` (Cloudflare Pages utilisera alors une version récente de Node.js).

5. Cliquez sur **« Save and Deploy »**.

---

## Méthode alternative : Déploiement direct via Wrangler CLI

Si vous préférez déployer en ligne de commande sans connecter GitHub à Cloudflare Pages :

```bash
# Compiler le site
npm run build

# Déployer le dossier dist
npx wrangler pages deploy dist --project-name crise-permanente
```

---

## Configuration finale dans Decap CMS (`public/admin/config.yml`)

N'oubliez pas d'ajuster les deux lignes suivantes dans [public/admin/config.yml](file:///home/juves/WebstormProjects/crise-permanente/public/admin/config.yml) avant le déploiement :
- `repo: <votre-compte-github>/<nom-du-depot>` (ex: `juves/crise-permanente`)
- `base_url: https://<votre-worker-oauth>.workers.dev` (l'adresse de votre Cloudflare Worker OAuth)
