# Cambio Pendant Planner

A single-page app to design an [About Space Cambio](https://www.aboutspace.net.au/collections/cambio) pendant light by dragging shades onto a fixture. Includes a running cost tally (sale + RRP) and one-click PNG export of the design.

The entire product catalogue (shade shapes, dimensions, per-colour prices and RRPs) is stored in the codebase at [`lib/catalog.ts`](lib/catalog.ts) — no backend or database required.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

This produces a fully static site in `out/` (no server required). Preview it with any static file server, e.g.:

```bash
npx serve out
```

## Deploy to GitHub Pages (no Vercel)

The app is a pure static export, so it can be hosted anywhere that serves HTML/CSS/JS — including GitHub Pages for free.

One-time setup in your GitHub repo:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Then just push to `main`. The [workflow](.github/workflows/deploy.yml) builds the site with `BASE_PATH=/cambio-planner` and deploys the `out/` folder to Pages. The site will be live at:

```
https://<your-username>.github.io/cambio-planner/
```

> **Important:** the `BASE_PATH` must match your repository name. If you rename the repo or use a custom domain, change `BASE_PATH` in `.github/workflows/deploy.yml` (and optionally the branch in `on.push.branches`).
>
> GitHub Pages on the free plan requires the repository to be **public** (or a paid plan for private repos).

## How the catalogue works

The data was extracted from the About Space Shopify storefront API (`/products/<handle>.json`) and hand-curated into `lib/catalog.ts`. Each item records:

- shade shape profile (`dome` / `cone` / `flat`), diameter and height in mm
- fixture type (`cord` / `flush` / `linear`) and drop/length in mm
- available colours with a hex value, current sale price and RRP

To refresh prices, re-fetch the product JSON and update the `c()` entries in `lib/catalog.ts`.

## Notes

- Sale prices change frequently on the source site; the tally is indicative — always confirm on aboutspace.net.au before ordering.
- Designs are saved to `localStorage` and survive a refresh.
