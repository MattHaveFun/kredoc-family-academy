# kredoc-daily-update Worker

Server-side companion to the site: fetches yesterday's market close from
Yahoo Finance directly (no CORS relay needed, since this runs server-side)
and writes a Gemini-generated narrative, at most once per trading day. See
the repo root README / the deployment runbook for full setup steps.

Two routes, and the split is the whole cost model:

- `GET /api/daily-update` — **public, no passphrase.** Returns the newest
  payload already in KV (today's, else the most recent within a 6-day
  lookback). Reading costs nothing, so anyone may read; the site calls this
  automatically on every page load, which is how guests get a full dashboard.
  Edge-cached for 5 minutes so a burst of visitors shares one KV read.
- `POST /api/daily-update` — the refresh button. If today is already in KV it
  is returned as-is, still without a passphrase, because that branch spends
  nothing. Only a genuine cache miss — ~26 Yahoo chart fetches, ~6 Treasury
  years, 2 spark chunks and one Gemini call — requires
  `Authorization: Bearer $FAMILY_ACCESS_TOKEN`, and rejects with
  `{ code: 'refresh-locked' }` otherwise.

So the ceiling on outside traffic is unchanged: one generation per trading
day, no matter who shows up. Payloads carry a 7-day TTL, which is also the
window a guest can still see something if nobody presses refresh.

Quick reference:

```
npm install
npx wrangler login
npm run kv:create          # paste the printed id into wrangler.toml's kv_namespaces
npx wrangler secret put FAMILY_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```
