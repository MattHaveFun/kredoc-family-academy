# kredoc-daily-update Worker

Server-side companion to the site: fetches each trading day's market close from
Yahoo Finance and Treasury.gov (directly — no CORS relay needed, since this
runs server-side) and caches it in KV. See the repo root README / the
deployment runbook for full setup steps.

## Nothing here costs money

Every source is keyless and public: Yahoo's chart and spark endpoints, and
Treasury.gov's daily par yield CSVs. There is no metered API in the request
path and no key that can be run up.

The daily written read used to come from Gemini, which was the one line item
with an invoice — and the reason the site needed a passphrase and a person to
press a button each day. It's now composed in the browser from the same numbers
this Worker caches (`src/data/dailyRead.ts`): the day's direction, breadth,
volatility and sector leadership, what that shape has historically tended to
mean, and a quote. Deterministic, instant, free, and the same for everyone.

## Scheduled build — the normal path

`crons` in `wrangler.toml` builds each trading day automatically, shortly after
the US close. Nobody triggers anything; the site only ever reads. See the
comment block above `[triggers]` for why those specific UTC times (short
version: Cloudflare crons don't observe DST, so they're picked to land in the
right window year-round). The run is idempotent — the second pass exits
immediately if the first already wrote the day.

`hasSessionFor()` guards against market holidays: the cron fires Mon–Fri, but
Thanksgiving is a Thursday. If Yahoo's newest daily candle isn't stamped with
today's ET date then no session closed, and writing would file yesterday's
numbers under today's label. It skips instead, and the previous cached day
keeps serving.

## Routes

- `GET /api/daily-update` — **public, no passphrase.** Returns the newest
  payload in KV (today's, else the most recent within a 6-day lookback). The
  site calls this on every page load, which is how every visitor — guest or
  family — gets a full dashboard without signing in to anything. Edge-cached
  for 5 minutes so a burst of visitors shares one KV read.
- `POST /api/daily-update` — **manual rebuild**, for the day the cron misses.
  A cached day is returned to anyone. An actual rebuild is ~35 outbound
  fetches, so it wants `Authorization: Bearer $FAMILY_ACCESS_TOKEN` and
  rejects with `{ code: 'refresh-locked' }` otherwise. Not money, just not
  something to leave open to the whole internet.

  **The site no longer calls this.** The passphrase box and rebuild button
  are gone from the header — the cron made them dead weight, and a control
  nobody needs is a control everybody has to wonder about. On the rare day
  both cron passes miss, run it by hand:

  ```bash
  curl -X POST https://kredoc-daily-update.<subdomain>.workers.dev/api/daily-update -H "Authorization: Bearer $FAMILY_ACCESS_TOKEN"
  ```

  Visitors pick the new payload up on their next page load.

Payloads carry a 7-day TTL, which is also the window a visitor still sees
something through a stretch with no sessions.

Quick reference:

```
npm install
npx wrangler login
npm run kv:create          # paste the printed id into wrangler.toml's kv_namespaces
npx wrangler secret put FAMILY_ACCESS_TOKEN
npm run deploy
```

`GEMINI_API_KEY` is no longer read. If it's still set on the deployed Worker
it does nothing; remove it with `npx wrangler secret delete GEMINI_API_KEY`.
