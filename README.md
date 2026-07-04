# Kredoc Family Academy

The family wisdom platform behind [kredoc.me](https://kredoc.me). Finance is Chapter 1:
a professional-grade markets dashboard where every number teaches, paired with a
chapter-based Academy that helps young adults build judgment — not stock tips.

## What's here

- **Markets Dashboard** — previous trading day's close (SPX, IXIC, DJI, RUT, VIX, BTC),
  sector heat map, market mood gauge, economic calendar, and a "Today in Markets" panel,
  all refreshed once per trading day by a family member pressing "Get today's update"
  (see `worker/`). Every data point is labeled honestly with its age.
- **Teaching chart** — hover any candle body, wick, volume bar, or OHLC stat for a
  plain-English tooltip; click to open a full deep-dive drawer with a lesson.
- **The Academy** — Chapter 1: Reading the Market. Nine lessons, each with three layers of
  depth, a character scenario, and a question in your preferred learning mode
  (Gut Check / Real Scenario / Myth vs. Reality).
- **Knowledge Map** — a force-directed graph of every lesson and its conceptual links.
- **Family profiles** — up to 6 local profiles (no accounts, localStorage only) tracking
  progress, quiz answers, and votes on what to build next.
- **Daily Brief** — the default mobile entry point: five swipeable cards, two minutes.
- **Family gate** — the whole site sits behind a shared family passphrase (see `FamilyGate`),
  separate from profiles. It's a front door, not the cost control — see `worker/README.md`.

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · React Router v6 (HashRouter, required
for GitHub Pages) · d3-force (knowledge map, lazy-loaded). Market data and the daily narrative
come from a separate Cloudflare Worker (`worker/`) — see its README for that half of the stack
(Yahoo Finance, Gemini, Workers KV).

## Getting started

```bash
npm install
cp .env.example .env   # then paste the deployed Worker's URL
npm run dev
```

The dev server runs at http://localhost:5173. You'll need the `worker/` Worker running/deployed
too (see `worker/README.md`) — the client has no data of its own to show without it.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_WORKER_URL` | yes | Base URL of the deployed `kredoc-daily-update` Worker. Not a secret — just where the client sends its Bearer-token requests. |

`.env` is gitignored.

## Available scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the local development server   |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint the codebase                    |

## Deployment

Two independent deploy workflows:

- `.github/workflows/deploy.yml` — pushing to `main` builds the site and publishes it to
  GitHub Pages.
- `.github/workflows/deploy-worker.yml` — pushing changes under `worker/` deploys the
  Cloudflare Worker.

### Required repository secrets/variables (Settings → Secrets and variables → Actions)

- `WORKER_URL` (repository **variable**, not secret) — the deployed Worker's URL, injected
  at build time as `VITE_WORKER_URL`.
- `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` — used only by `deploy-worker.yml`.

The Worker's own secrets (`FAMILY_ACCESS_TOKEN`, `GEMINI_API_KEY`) are set directly on
Cloudflare via `wrangler secret put` — see `worker/README.md`. They never pass through
GitHub Actions or this repo's build.

### One-time Pages setup

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Set the custom domain to `kredoc.me` (the `CNAME` file in `public/` is included in
   every build) and enable **Enforce HTTPS** once DNS resolves.

## Data honesty rules

- The dashboard never shows simulated prices. Numbers are exactly what the Worker fetched
  from Yahoo Finance at the last "Get today's update" press, labeled with their age.
- Fetching (and the one Gemini call for the narrative) happens at most once per trading day,
  cached in Workers KV — see `worker/src/index.ts`. No family member visiting the site ever
  causes a second real fetch for a day that's already cached.

## Maintenance notes

- **Economic calendar** (`src/data/economicCalendar.ts`) is static and manually maintained —
  refresh it roughly quarterly from federalreserve.gov and bls.gov schedules.
- **News snippets** come from public RSS feeds via a CORS relay; if a feed dies, swap the
  URL in `src/data/newsFeed.ts`.
