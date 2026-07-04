# kredoc-daily-update Worker

Server-side companion to the site: fetches yesterday's market close from
Yahoo Finance directly (no CORS relay needed, since this runs server-side)
and writes a Gemini-generated narrative, at most once per trading day,
behind a shared family passphrase. See the repo root README / the
deployment runbook for full setup steps.

Quick reference:

```
npm install
npx wrangler login
npm run kv:create          # paste the printed id into wrangler.toml's kv_namespaces
npx wrangler secret put FAMILY_ACCESS_TOKEN
npx wrangler secret put GEMINI_API_KEY
npm run deploy
```
