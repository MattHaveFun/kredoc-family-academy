# Kredoc Family Academy

Foundation project for [kredoc.me](https://kredoc.me), built with React, TypeScript, and Vite.

## Status

This is the initial scaffold. No dashboard, Academy content, or Knowledge Graph
features have been built yet — this step only establishes a clean, deployable
foundation.

## Stack

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- GitHub Actions → GitHub Pages deployment

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## Available scripts

| Command           | Description                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Start the local development server        |
| `npm run build`    | Type-check and build for production       |
| `npm run preview`  | Preview the production build locally      |
| `npm run lint`     | Lint the codebase                          |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages via the official Pages Actions.

### One-time repository setup (on GitHub)

1. Push this repository to GitHub as `kredoc-family-academy`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. In **Settings → Pages → Custom domain**, enter `kredoc.me` (the `CNAME`
   file in `public/` already contains this and will be included in every
   build).
4. Add the appropriate DNS records at your domain registrar to point
   `kredoc.me` at GitHub Pages (an `ANAME`/`ALIAS`/`A` record set, per
   [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
5. Once DNS resolves, enable **Enforce HTTPS** in the Pages settings.

## Project structure

```
kredoc-family-academy/
├── .github/workflows/deploy.yml   GitHub Pages deployment workflow
├── public/
│   ├── CNAME                      Custom domain (kredoc.me)
│   ├── .nojekyll                  Disables Jekyll processing on Pages
│   ├── 404.html                   SPA deep-link redirect for GitHub Pages
│   └── favicon.svg
├── src/
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx                    Route definitions
│   ├── main.tsx                   App entry point
│   ├── index.css                  Tailwind entry point
│   └── vite-env.d.ts
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```
