# Crise Permanente — Revue en ligne

Site web statique et revue trimestrielle développée avec Astro, Decap CMS et Cloudflare.

## Architecture

- **Moteur SSG** : [Astro](https://astro.build/) avec Content Collections (`issues` & `articles`)
- **Design & Style** : Vanilla CSS avec variables custom (`#db142c` rouge, blanc, nuances de rouge profond)
- **Hébergement** : [Cloudflare Pages](https://pages.cloudflare.com/)
- **CMS** : [Decap CMS](https://decapcms.org/) (anciennement Netlify CMS) avec backend GitHub
- **OAuth** : Cloudflare Worker autonome (`workers/github-oauth`)
- **Sécurité Admin** : Cloudflare Access (Zero Trust) protégeant uniquement `/admin/*`

---

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement local
npm run dev

# Compiler pour la production
npm run build
```

---

## Documentation et déploiement

- 📖 [Guide de création de la GitHub OAuth App](docs/GITHUB_OAUTH_APP.md)
- 🔒 [Guide de sécurisation Cloudflare Access pour /admin](docs/CLOUDFLARE_ACCESS.md)
- 🚀 [Guide de déploiement sur Cloudflare Pages](docs/DEPLOY_CLOUDFLARE_PAGES.md)
