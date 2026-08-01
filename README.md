# Kredoc Family Academy

The family wisdom platform behind [kredoc.me](https://kredoc.me). Finance is Chapter 1:
a professional-grade markets dashboard where every number teaches, paired with a
chapter-based Academy that helps young adults build judgment — not stock tips.

## What's here

- **Markets Dashboard** — previous trading day's close across four tabs, rebuilt
  automatically once per trading day shortly after the close (see `worker/`). Every data
  point is labeled honestly with its age.
  - **Markets** — indices and crypto, plus the sector heat map, market mood gauge, and a
    "Today in Markets" panel.
  - **Global** — foreign indices and a live world trading map that follows the sun.
  - **Macro** — commodities, currencies, the yield curve, and the economic calendar.
  - **Micro** — the six largest S&P 500 companies, an X-ray of each one's business model and
    moat, a sixteen-point good-business/bad-business flag test, the **Order Desk** (place a
    market/limit/stop/stop-limit/trailing-stop order against a real year of daily highs and
    lows and watch when, whether, and at what price it fills — plus a recurring-buy and
    dollar-cost-averaging simulator), and a research-prompt builder for any ticker.
- **Teaching chart** — hover any candle body, wick, volume bar, or OHLC stat for a
  plain-English tooltip; click to open a full deep-dive drawer with a lesson.
- **The Academy** — four chapters, 36 lessons: Reading the Market, Beneath the Surface,
  Picking a Stock (fundamentals, valuation, moats, red flags, order types, when to sell),
  and Six Giants, Six Business Models. Each lesson has three layers of depth, a character
  scenario, and a question in your preferred learning mode (Gut Check / Real Scenario /
  Myth vs. Reality).
- **Knowledge Map** — a force-directed graph of every lesson and its conceptual links.
- **Family profiles** — up to 6 local profiles (no accounts, localStorage only) tracking
  progress, quiz answers, and votes on what to build next.
- **Daily Brief** — the default mobile entry point: five swipeable cards, two minutes.
- **Open to guests** — nothing on the site is behind a login. Every visitor's browser reads
  the day's market payload straight from the Worker's cache, so a friend the kids bring along
  sees exactly the same charts, tickers and daily read the family does.
- **Built nightly, free** — a Worker cron runs shortly after each weekday close and fetches
  the whole dashboard from keyless sources (Yahoo, Treasury.gov). Nobody has to press
  anything, and it costs nothing.
- **Daily read, composed from the numbers** — "What it actually means" describes the day's
  direction, breadth, volatility and sector leadership, explains what that shape has tended
  to mean, and closes on a quote from someone who thought about markets for a living. Built
  in the browser from the cached payload: no API, no key, no cost, nothing to trigger.
- **Family passphrase** — now only guards a manual rebuild, for the rare day the cron
  misses. Nothing a visitor sees is behind it. See `worker/README.md`.

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · React Router v6 (HashRouter, required
for GitHub Pages) · d3-force (knowledge map, lazy-loaded). Market data comes from a separate
Cloudflare Worker (`worker/`) — see its README for that half of the stack (Yahoo Finance,
Treasury.gov, Workers KV). The daily read is composed client-side in `src/data/dailyRead.ts`.

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

The Worker's own secret (`FAMILY_ACCESS_TOKEN`) is set directly on
Cloudflare via `wrangler secret put` — see `worker/README.md`. It never passes through
GitHub Actions or this repo's build.

### One-time Pages setup

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Set the custom domain to `kredoc.me` (the `CNAME` file in `public/` is included in
   every build) and enable **Enforce HTTPS** once DNS resolves.

## Data honesty rules

- The dashboard never shows simulated prices. Numbers are exactly what the Worker fetched
  from Yahoo Finance and Treasury.gov on the last scheduled build, labeled with their age.
- Fetching happens at most once per trading day, on a schedule, cached in Workers KV — see
  `worker/src/index.ts`. No amount of visitors causes a second real fetch for a cached day.
- The daily read is derived from those same cached numbers, never generated per visitor, so
  everyone reads exactly the same thing.

## Maintenance notes

- **Economic calendar** (`src/data/economicCalendar.ts`) is static and manually maintained —
  refresh it roughly quarterly from federalreserve.gov and bls.gov schedules.
- **News snippets** come from public RSS feeds via a CORS relay; if a feed dies, swap the
  URL in `src/data/newsFeed.ts`.
