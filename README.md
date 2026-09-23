# Crise Permanente — Revue en ligne

Revue trimestrielle de critique sociale, politique et culturelle, développée avec Astro et Decap CMS, hébergée sur **Cloudflare Workers avec Static Assets**.

---

## Architecture unifiée (Workers + Static Assets)

- **Moteur SSG** : [Astro](https://astro.build/) avec Content Collections (`issues` & `articles`)
- **Admin CMS** : [Decap CMS](https://decapcms.org/) dans `public/admin/`
- **Hébergement & Backend** : Cloudflare Worker unifié (`wrangler.jsonc`) :
  - `ASSETS` : sert le site statique et `/admin/` depuis `./dist`
  - Routes `/auth` et `/callback` : authentification instantanée Decap CMS via `GITHUB_PAT`
- **Sécurité Admin** : Cloudflare Access (Zero Trust) protégeant l'accès à `/admin*`

---

## Commandes locales

```bash
# Installer les dépendances
npm install

# Démarrer Astro en dev
npm run dev

# Compiler le site statique
npm run build

# Tester en local avec l'environnement Cloudflare Worker + Assets
npx wrangler dev
```

---

## Déploiement sur Cloudflare

### 1. Configurer le secret GitHub PAT dans Cloudflare
Le secret est maintenant rattaché directement au projet Cloudflare `crise-permanente` :

```bash
npx wrangler secret put GITHUB_PAT
# (Collez votre fine-grained personal access token GitHub)
```

### 2. Déployer
```bash
npm run deploy
```
*(ou simplement `git push` si vous avez configuré le déploiement continu Cloudflare Workers).*

---

## Documentation

- 🔒 [Guide Cloudflare Access (/admin)](docs/CLOUDFLARE_ACCESS.md)
