# Kredoc Family Academy

The family wisdom platform behind [kredoc.me](https://kredoc.me). Finance is Chapter 1:
a professional-grade markets dashboard where every number teaches, paired with a
chapter-based Academy that helps young adults build judgment — not stock tips.

## What's here

- **Markets Dashboard** — live Twelve Data quotes and charts (SPX, IXIC, DJI, RUT, VIX, BTC),
  sector heat map, market mood gauge, economic calendar, and a "Today in Markets" panel.
  Every data point is labeled honestly: `LIVE`, `CACHED · Xm ago`, or `DATA UNAVAILABLE`.
- **Teaching chart** — hover any candle body, wick, volume bar, or OHLC stat for a
  plain-English tooltip; click to open a full deep-dive drawer with a lesson.
- **The Academy** — Chapter 1: Reading the Market. Nine lessons, each with three layers of
  depth, a character scenario, and a question in your preferred learning mode
  (Gut Check / Real Scenario / Myth vs. Reality).
- **Knowledge Map** — a force-directed graph of every lesson and its conceptual links.
- **Family profiles** — up to 6 local profiles (no accounts, localStorage only) tracking
  progress, quiz answers, and votes on what to build next.
- **Daily Brief** — the default mobile entry point: five swipeable cards, two minutes.

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · React Router v6 (HashRouter, required
for GitHub Pages) · d3-force (knowledge map, lazy-loaded) · Twelve Data API.

## Getting started

```bash
npm install
cp .env.example .env   # then paste your Twelve Data API key
npm run dev
```

The dev server runs at http://localhost:5173.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_TWELVEDATA_API_KEY` | yes | Free key from [twelvedata.com](https://twelvedata.com). Free tier = 800 requests/day, 8/minute — the app's rate limiter, request queue, and 10-minute cache are built around exactly these limits. |
| `VITE_OPENAI_API_KEY` | no | Enables the AI-written "What it actually means" daily narrative. **Any `VITE_`-prefixed value ships in the client bundle and is visible to anyone.** Use a restricted, low-spend-limit key or leave unset (the panel shows an honest placeholder). |

`.env` is gitignored. Never commit a real key.

## Available scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the local development server   |
| `npm run build`   | Type-check and build for production  |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint the codebase                    |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
publishes it to GitHub Pages.

### Required repository secrets (Settings → Secrets and variables → Actions)

- `TWELVEDATA_API_KEY` — injected at build time as `VITE_TWELVEDATA_API_KEY`.
- `OPENAI_API_KEY` — optional; injected as `VITE_OPENAI_API_KEY` (restricted key only).

### One-time Pages setup

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Set the custom domain to `kredoc.me` (the `CNAME` file in `public/` is included in
   every build) and enable **Enforce HTTPS** once DNS resolves.

## Data honesty rules

- The dashboard never shows simulated prices. If the feed is unreachable, panels show the
  most recent cached values with their age, or a friendly "taking a break" message.
- The rate limiter (`src/data/twelveDataService.ts`) enforces ≤8 credits per rolling minute
  and stops near the 800/day ceiling, serving cache instead. `CACHE_TTL_MS` (default
  10 minutes) is the single knob for freshness vs. quota.

## Maintenance notes

- **Economic calendar** (`src/data/economicCalendar.ts`) is static and manually maintained —
  refresh it roughly quarterly from federalreserve.gov and bls.gov schedules.
- **News snippets** come from public RSS feeds via a CORS relay; if a feed dies, swap the
  URL in `src/data/newsFeed.ts`.
