// Kredoc Family Academy — daily-update Worker.
//
// Fetches the market close once per trading day and caches it, so no client
// ever holds a key and the site has a single source of truth.
//
// Nothing here costs money any more. Every source is keyless and public —
// Yahoo's chart and spark endpoints, Treasury.gov's yield CSVs — and the daily
// written read that used to come from Gemini is now composed in the browser
// from these same numbers (see src/data/dailyRead.ts). What's left to protect
// is not a bill but a workload: a rebuild is ~35 outbound fetches, so the
// manual trigger still asks for the passphrase. Reading never does.
//
// GET /api/daily-update
//   No auth. Returns the most recent cached payload (today's if it exists,
//   otherwise the newest of the last few days), or 404 if KV is empty.
//   Edge-cached briefly so repeat visitors don't even reach KV.
//
// POST /api/daily-update
//   Manual rebuild, for when the cron missed a day. Returns a cached day to
//   anyone; a genuine rebuild wants Authorization: Bearer <FAMILY_ACCESS_TOKEN>.
//   -> { day, generatedAt, markets, tickers }
//
// scheduled()
//   The normal path. Runs on the crons in wrangler.toml shortly after the US
//   close and builds the day unattended. Nobody has to press anything.

export interface Env {
  DAILY_KV: KVNamespace
  FAMILY_ACCESS_TOKEN: string
  ALLOWED_ORIGIN: string
}

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Quote {
  symbol: string
  price: number
  change: number
  changePct: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  name: string
}

interface MarketEntry {
  quote: Quote
  /**
   * The full daily series, oldest first. Clients slice their own ranges from
   * this (see src/data/marketFeed.ts). It used to ship as a
   * Record<RangeKey, Candle[]>, but every range except 5Y was a suffix of the
   * same array — 21% of the payload was duplicate candles, and the whole thing
   * grew past the ~5MB localStorage quota once the Micro tab's six stocks
   * arrived, so the browser silently stopped persisting it.
   */
  candles: Candle[]
}

interface DailyPayload {
  day: string // YYYY-MM-DD, the trading day this close data represents
  generatedAt: number
  markets: Record<string, MarketEntry>
  tickers: Record<string, Quote>
  // No `narrative` field. It used to hold Gemini's prose; the site now composes
  // the day's read client-side from `markets` and `tickers`, which costs
  // nothing and needs nobody to trigger it. Payloads written before that change
  // still carry the old field — harmless, and simply ignored.
}

// Mirrors src/data/markets.ts MARKET_SYMBOLS ids -> Yahoo ticker. Rate symbols
// (2Y/10Y/30Y) are NOT here — they come from Treasury.gov instead, because
// Yahoo's yield indices (^TNX/^TYX) only ever return a single candle from the
// chart endpoint (verified), useless for a series. See buildRates() below.
const MARKETS: Record<string, { yahoo: string; name: string }> = {
  sp500: { yahoo: '^GSPC', name: 'S&P 500' },
  nasdaq: { yahoo: '^IXIC', name: 'NASDAQ Composite' },
  dow: { yahoo: '^DJI', name: 'Dow Jones Industrial Average' },
  russell2000: { yahoo: '^RUT', name: 'Russell 2000' },
  vix: { yahoo: '^VIX', name: 'CBOE Volatility Index' },
  bitcoin: { yahoo: 'BTC-USD', name: 'Bitcoin' },
  ethereum: { yahoo: 'ETH-USD', name: 'Ethereum' },
  gold: { yahoo: 'GC=F', name: 'Gold' },
  oil: { yahoo: 'CL=F', name: 'WTI Crude Oil' },
  silver: { yahoo: 'SI=F', name: 'Silver' },
  natgas: { yahoo: 'NG=F', name: 'Natural Gas' },
  copper: { yahoo: 'HG=F', name: 'Copper' },
  // DX=F 404s on the chart endpoint; DX-Y.NYB (ICE US Dollar Index) is the
  // stable, keyless series that resolves.
  dxy: { yahoo: 'DX-Y.NYB', name: 'U.S. Dollar Index' },
  // World markets — quoted in their home currencies (JPY/GBP/EUR/HKD/CNY), so
  // read them as percent moves, not dollar prices.
  nikkei: { yahoo: '^N225', name: 'Nikkei 225' },
  ftse: { yahoo: '^FTSE', name: 'FTSE 100' },
  dax: { yahoo: '^GDAXI', name: 'DAX' },
  hangseng: { yahoo: '^HSI', name: 'Hang Seng' },
  shanghai: { yahoo: '000001.SS', name: 'Shanghai Composite' },
  sensex: { yahoo: '^BSESN', name: 'Sensex' },
  // The six largest S&P 500 companies — the Micro tab. These also appear in
  // WATCHLIST below, but that's the `spark` endpoint: price and daily change
  // only. The Micro tab charts them and replays order fills against real
  // highs/lows, which needs the full OHLCV series only a chart fetch returns.
  // Budget note: this brings buildMarkets to 26 chart subrequests; plus ~6
  // Treasury years, 2 spark chunks, and 1 Gemini call, the daily build sits
  // near 35 — comfortably under the Workers subrequest ceiling, but that
  // ceiling is the thing to check before adding another block of symbols.
  nvda: { yahoo: 'NVDA', name: 'NVIDIA' },
  aapl: { yahoo: 'AAPL', name: 'Apple' },
  msft: { yahoo: 'MSFT', name: 'Microsoft' },
  amzn: { yahoo: 'AMZN', name: 'Amazon' },
  googl: { yahoo: 'GOOGL', name: 'Alphabet' },
  avgo: { yahoo: 'AVGO', name: 'Broadcom' },
}

// U.S. Treasury par-yield curve rates (id -> CSV column header). One keyless
// source gives the whole 2Y/10Y/30Y curve on the same daily rows — cleaner
// than mixing Yahoo yield indices, and it's the only reliable series source
// for the 2-year yield (Yahoo has no native constant-maturity 2Y ticker).
const RATES: Record<string, { column: string; name: string }> = {
  ust2y: { column: '2 Yr', name: '2-Year Treasury Yield' },
  tnx: { column: '10 Yr', name: '10-Year Treasury Yield' },
  ust30y: { column: '30 Yr', name: '30-Year Treasury Yield' },
}

// Mirrors src/data/sectors.ts + src/data/companies.ts. BRK.B is Twelve-Data
// style (kept for display); Yahoo wants BRK-B.
const SECTOR_ETFS = ['XLK', 'XLE', 'XLV', 'XLF', 'XLY', 'XLP', 'XLI', 'XLB', 'XLRE', 'XLU', 'XLC']
const WATCHLIST: Array<{ symbol: string; yahoo: string }> = [
  { symbol: 'AAPL', yahoo: 'AAPL' },
  { symbol: 'MSFT', yahoo: 'MSFT' },
  { symbol: 'NVDA', yahoo: 'NVDA' },
  { symbol: 'AVGO', yahoo: 'AVGO' },
  { symbol: 'GOOGL', yahoo: 'GOOGL' },
  { symbol: 'AMZN', yahoo: 'AMZN' },
  { symbol: 'META', yahoo: 'META' },
  { symbol: 'TSLA', yahoo: 'TSLA' },
  { symbol: 'BRK.B', yahoo: 'BRK-B' },
  { symbol: 'JPM', yahoo: 'JPM' },
  { symbol: 'V', yahoo: 'V' },
  { symbol: 'UNH', yahoo: 'UNH' },
  { symbol: 'XOM', yahoo: 'XOM' },
  { symbol: 'WMT', yahoo: 'WMT' },
  { symbol: 'KO', yahoo: 'KO' },
  { symbol: 'DIS', yahoo: 'DIS' },
  { symbol: 'NFLX', yahoo: 'NFLX' },
]

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/'

interface YahooChartResult {
  meta: {
    regularMarketPrice?: number
    previousClose?: number
    chartPreviousClose?: number
    regularMarketVolume?: number
    regularMarketDayHigh?: number
    regularMarketDayLow?: number
    regularMarketOpen?: number
  }
  timestamp?: number[]
  indicators: {
    quote: Array<{
      open: Array<number | null>
      high: Array<number | null>
      low: Array<number | null>
      close: Array<number | null>
      volume: Array<number | null>
    }>
  }
}

async function fetchYahooChart(symbol: string, range: string, interval: string): Promise<YahooChartResult> {
  const url = `${YAHOO_CHART_URL}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (KredocDailyUpdateWorker)' } })
  if (!res.ok) throw new Error(`Yahoo ${symbol} failed (${res.status})`)
  const data = (await res.json()) as {
    chart: { result: YahooChartResult[] | null; error: { description: string } | null }
  }
  const result = data.chart.result?.[0]
  if (!result) throw new Error(data.chart.error?.description ?? `Yahoo ${symbol}: no chart data`)
  return result
}

function toCandles(result: YahooChartResult): Candle[] {
  const timestamps = result.timestamp ?? []
  const quote = result.indicators.quote[0]
  const candles: Candle[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const open = quote.open[i]
    const high = quote.high[i]
    const low = quote.low[i]
    const close = quote.close[i]
    if (open == null || high == null || low == null || close == null) continue
    candles.push({ time: timestamps[i], open, high, low, close, volume: quote.volume[i] ?? 0 })
  }
  return candles
}

// One 5-year daily-candle fetch per market feeds every range tab — far
// cheaper than a separate request per range, and keeps every tab's numbers
// self-consistent (same source, same day) since it's all one response.
//
// Yahoo returns full float precision (214.14999389648438), which is noise on a
// price and roughly a quarter of the payload's size once multiplied across
// ~29,000 candles. Two decimals is the precision every price on this dashboard
// is actually displayed at.
function round2(v: number): number {
  return Math.round(v * 100) / 100
}

function compactCandles(candles: Candle[]): Candle[] {
  return candles.map((c) => ({
    time: c.time,
    open: round2(c.open),
    high: round2(c.high),
    low: round2(c.low),
    close: round2(c.close),
    volume: Math.round(c.volume),
  }))
}

function quoteFromChart(symbol: string, name: string, result: YahooChartResult, candles: Candle[]): Quote {
  const meta = result.meta
  const last = candles[candles.length - 1]
  const price = meta.regularMarketPrice ?? last?.close ?? 0
  // candles[-2] is the true prior trading day's close. Yahoo's chartPreviousClose
  // is the close before the requested chart RANGE started (e.g. 5 years ago for a
  // 5y/1d fetch) — not yesterday's close — so it must rank below the series itself,
  // only used as a fallback when there's just one candle to work with.
  const previousClose = candles[candles.length - 2]?.close ?? meta.previousClose ?? meta.chartPreviousClose ?? price
  return {
    symbol,
    name,
    price,
    previousClose,
    change: price - previousClose,
    changePct: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
    open: meta.regularMarketOpen ?? last?.open ?? price,
    high: meta.regularMarketDayHigh ?? last?.high ?? price,
    low: meta.regularMarketDayLow ?? last?.low ?? price,
    volume: meta.regularMarketVolume ?? last?.volume ?? 0,
  }
}

async function buildMarkets(): Promise<Record<string, MarketEntry>> {
  // Per-symbol resilience: one flaky Yahoo response must not sink the whole
  // daily build (which would 502 and cache nothing). A failed symbol is simply
  // absent from the payload and its card shows the "press update" empty state.
  const settled = await Promise.allSettled(
    Object.entries(MARKETS).map(async ([id, { yahoo, name }]) => {
      const result = await fetchYahooChart(yahoo, '5y', '1d')
      const candles = toCandles(result)
      const quote = quoteFromChart(id, name, result, candles)
      return [id, { quote, candles: compactCandles(candles) }] as const
    }),
  )
  const entries: Array<readonly [string, MarketEntry]> = []
  for (const s of settled) {
    if (s.status === 'fulfilled') entries.push(s.value)
    else console.error('[buildMarkets] symbol failed:', s.reason instanceof Error ? s.reason.message : s.reason)
  }
  return Object.fromEntries(entries)
}

// --- U.S. Treasury par-yield rates (2Y/10Y/30Y) --------------------------------

const TREASURY_CSV =
  'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/'

// Minimal CSV line parser: Treasury quotes its header cells ("1.5 Month") but
// never embeds commas in a field, so this only has to strip surrounding quotes.
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

// "07/02/2026" -> unix seconds (UTC noon, to dodge timezone-edge date shifts).
function treasuryDateToUnix(s: string): number | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  return Math.floor(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2]), 12) / 1000)
}

async function fetchTreasuryYear(year: number): Promise<{ header: string[]; rows: string[][] }> {
  const url = `${TREASURY_CSV}${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (KredocDailyUpdateWorker)' } })
  if (!res.ok) throw new Error(`Treasury ${year} failed (${res.status})`)
  const lines = (await res.text()).trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error(`Treasury ${year}: empty CSV`)
  return { header: parseCsvLine(lines[0]), rows: lines.slice(1).map(parseCsvLine) }
}

// A yield series has no OHLC — each daily par yield becomes a flat candle so it
// flows through the exact same candle / chart pipeline as everything else.
function quoteFromCandles(symbol: string, name: string, candles: Candle[]): Quote {
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const price = last?.close ?? 0
  const previousClose = prev?.close ?? price
  return {
    symbol,
    name,
    price,
    previousClose,
    change: price - previousClose,
    changePct: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
    open: last?.open ?? price,
    high: last?.high ?? price,
    low: last?.low ?? price,
    volume: 0,
  }
}

async function buildRates(): Promise<Record<string, MarketEntry>> {
  // Current year plus five prior calendar years guarantees a full 5Y window.
  const currentYear = new Date().getUTCFullYear()
  const years = [0, 1, 2, 3, 4, 5].map((n) => currentYear - n)
  // Tolerate a missing/failed year (Treasury occasionally hiccups) rather than
  // dropping every rate; only bail if the whole source is unreachable.
  const settled = await Promise.allSettled(years.map(fetchTreasuryYear))
  const yearData = settled.flatMap((s) => (s.status === 'fulfilled' ? [s.value] : []))
  if (yearData.length === 0) {
    console.error('[buildRates] all Treasury years failed')
    return {}
  }

  const result: Record<string, MarketEntry> = {}
  for (const [id, { column, name }] of Object.entries(RATES)) {
    const points: Array<{ time: number; value: number }> = []
    for (const { header, rows } of yearData) {
      const colIdx = header.indexOf(column)
      if (colIdx < 0) continue
      for (const row of rows) {
        const value = Number(row[colIdx])
        const time = treasuryDateToUnix(row[0] ?? '')
        if (time == null || !Number.isFinite(value) || row[colIdx] === '') continue
        points.push({ time, value })
      }
    }
    // Treasury CSVs are newest-first and per-year, so sort ascending and dedupe.
    points.sort((a, b) => a.time - b.time)
    const seen = new Set<number>()
    const candles: Candle[] = []
    for (const p of points) {
      if (seen.has(p.time)) continue
      seen.add(p.time)
      candles.push({ time: p.time, open: p.value, high: p.value, low: p.value, close: p.value, volume: 0 })
    }
    result[id] = { quote: quoteFromCandles(id, name, candles), candles: compactCandles(candles) }
  }
  return result
}

const YAHOO_SPARK_URL = 'https://query1.finance.yahoo.com/v8/finance/spark'

interface SparkEntry {
  close?: Array<number | null>
  chartPreviousClose?: number
}

// The ticker strip and sector heat map only need price + daily change, not full
// OHLCV — so one multi-symbol `spark` request replaces ~30 per-symbol chart
// fetches. That single change is what pulls the whole daily build back under
// the Worker subrequest ceiling (crossing it was 502-ing the entire build and
// caching nothing, which is why new symbols weren't loading).
async function buildTickers(): Promise<Record<string, Quote>> {
  const list: Array<{ symbol: string; yahoo: string }> = [
    ...SECTOR_ETFS.map((symbol) => ({ symbol, yahoo: symbol })),
    ...WATCHLIST,
  ]
  // Yahoo's spark endpoint caps at 20 symbols per request, so chunk it — still
  // just a couple of subrequests instead of one chart fetch per symbol.
  const chunks: Array<typeof list> = []
  for (let i = 0; i < list.length; i += 20) chunks.push(list.slice(i, i + 20))
  const responses = await Promise.all(
    chunks.map(async (chunk) => {
      const symbols = chunk.map((l) => l.yahoo).join(',')
      const url = `${YAHOO_SPARK_URL}?symbols=${encodeURIComponent(symbols)}&range=5d&interval=1d`
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (KredocDailyUpdateWorker)' } })
      if (!res.ok) throw new Error(`Yahoo spark failed (${res.status})`)
      return (await res.json()) as Record<string, SparkEntry>
    }),
  )
  const data: Record<string, SparkEntry> = Object.assign({}, ...responses)

  const out: Record<string, Quote> = {}
  for (const { symbol, yahoo } of list) {
    const closes = (data[yahoo]?.close ?? []).filter((c): c is number => c != null)
    if (closes.length === 0) continue
    const price = closes[closes.length - 1]
    const previousClose = closes[closes.length - 2] ?? data[yahoo]?.chartPreviousClose ?? price
    out[symbol] = {
      symbol,
      name: symbol,
      price,
      previousClose,
      change: price - previousClose,
      changePct: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
      open: price,
      high: price,
      low: price,
      volume: 0,
    }
  }
  return out
}

// --- The free half of the build -----------------------------------------------

interface FreeData {
  markets: Record<string, MarketEntry>
  tickers: Record<string, Quote>
}

/**
 * Everything sourced from keyless public endpoints: Yahoo charts, Treasury.gov
 * yields, Yahoo spark. No API key, no account, no bill — which is precisely
 * why the scheduled build is allowed to do this much on its own.
 *
 * Each section is settled independently so one flaky source (Treasury has
 * hiccups) can't blank out the others.
 */
async function buildFreeData(): Promise<FreeData> {
  const [marketsRes, ratesRes, tickersRes] = await Promise.allSettled([
    buildMarkets(),
    buildRates(),
    buildTickers(),
  ])
  const yahooMarkets = marketsRes.status === 'fulfilled' ? marketsRes.value : {}
  const rates = ratesRes.status === 'fulfilled' ? ratesRes.value : {}
  const tickers = tickersRes.status === 'fulfilled' ? tickersRes.value : {}
  if (marketsRes.status === 'rejected') console.error('[buildMarkets] failed:', marketsRes.reason)
  if (ratesRes.status === 'rejected') console.error('[buildRates] failed:', ratesRes.reason)
  if (tickersRes.status === 'rejected') console.error('[buildTickers] failed:', tickersRes.reason)
  const markets = { ...yahooMarkets, ...rates }
  console.log(
    `[build] ${Object.keys(yahooMarkets).length} yahoo + ${Object.keys(rates).length} rates + ${Object.keys(tickers).length} tickers`,
  )
  if (Object.keys(markets).length === 0) throw new Error('no market data could be built')
  return { markets, tickers }
}

/** Unix seconds -> YYYY-MM-DD in US market time. */
function etDateOf(unixSeconds: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(unixSeconds * 1000))
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

/**
 * Did a US session actually close on `day`?
 *
 * The cron fires every weekday, but Thanksgiving is a weekday. On a market
 * holiday Yahoo happily returns the *previous* session's candles, which would
 * get filed under today's date and badged "TODAY'S CLOSE" — stale data wearing
 * a fresh label. Yahoo's own newest daily candle is the honest answer: if it
 * isn't stamped `day`, no session closed and there is nothing new to cache.
 */
function hasSessionFor(day: string, markets: Record<string, MarketEntry>): boolean {
  // The S&P is the reference — it's the one symbol that is never absent from a
  // successful build, and every US equity venue keeps the same holiday calendar.
  const candles = markets.sp500?.candles
  const last = candles?.[candles.length - 1]
  if (!last) return false
  return etDateOf(last.time) === day
}

// Trading-day key in US market time — so a run just after midnight ET still
// keys to the day that just closed, not the calendar day at the request's UTC.
function tradingDayKey(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}

// "2026-08-01" -> "2026-07-31". Calendar days, not trading days — walking back
// over a weekend just costs a couple of cheap KV misses.
function previousDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d) - 86_400_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

// How far back to look for a usable payload. Sized to clear a long weekend
// plus a holiday, so a guest arriving on a Monday morning — before anyone has
// pressed refresh — still sees Friday's close instead of an empty dashboard.
const MAX_LOOKBACK_DAYS = 6

// 7 days. Long enough that a guest still sees something through a holiday week
// when the cron finds no session to cache; short enough that KV stays small.
const PAYLOAD_TTL_SECONDS = 60 * 60 * 24 * 7

/**
 * Newest payload KV still holds, at or before `day`. Reads are the cheap half
 * of this Worker (no external calls, no Gemini), which is exactly why they
 * don't need the passphrase — this is the function guests hit.
 */
async function readLatestCached(env: Env, day: string): Promise<DailyPayload | null> {
  let key = day
  for (let i = 0; i <= MAX_LOOKBACK_DAYS; i++) {
    const hit = (await env.DAILY_KV.get(`daily:${key}`, 'json')) as DailyPayload | null
    if (hit) return hit
    key = previousDay(key)
  }
  return null
}

function corsHeaders(env: Env, origin: string | null): HeadersInit {
  const allow = origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    Vary: 'Origin',
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(env, origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    if (url.pathname !== '/api/daily-update' || (request.method !== 'GET' && request.method !== 'POST')) {
      return new Response('Not found', { status: 404, headers: cors })
    }

    const day = tradingDayKey()
    const kvKey = `daily:${day}`

    // --- GET: the public read path -------------------------------------------
    // Free to serve and free to build (it's already built), so it asks for
    // nothing. Every visitor — guest or family — loads the dashboard through
    // this; the passphrase only ever comes up on the POST path below.
    if (request.method === 'GET') {
      const cache = caches.default
      // Cache on the bare path: the payload is identical for every caller, so
      // one edge copy serves everyone and repeat visits never touch KV.
      const cacheKey = new Request(`${url.origin}${url.pathname}`, { method: 'GET' })
      const edgeHit = await cache.match(cacheKey)
      if (edgeHit) {
        console.log('[daily-update] GET edge cache hit')
        return edgeHit
      }

      const latest = await readLatestCached(env, day)
      if (!latest) {
        console.log('[daily-update] GET: nothing cached within lookback window')
        return new Response(
          JSON.stringify({ error: 'No daily update has been generated yet.', code: 'no-cache-yet' }),
          { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } },
        )
      }
      console.log(`[daily-update] GET serving cached day=${latest.day}`)
      const res = new Response(JSON.stringify(latest), {
        headers: {
          ...cors,
          'Content-Type': 'application/json',
          // Short enough that a fresh build shows up within minutes, long
          // enough that a burst of visitors costs one KV read between them.
          'Cache-Control': 'public, max-age=300',
        },
      })
      ctx.waitUntil(cache.put(cacheKey, res.clone()))
      return res
    }

    // --- POST: the manual rebuild --------------------------------------------
    // Normally nothing reaches this: the cron builds the day and the site only
    // ever reads. It exists for the case where the cron missed — a bad Yahoo
    // afternoon, or a day added between scheduled runs.
    const cached = await env.DAILY_KV.get(kvKey, 'json')
    if (cached) {
      console.log(`[daily-update] cache hit for ${kvKey}`)
      return new Response(JSON.stringify(cached), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // A rebuild is ~35 outbound fetches. No invoice attached any more, but it's
    // not something to leave open to the whole internet either, so the manual
    // trigger keeps the passphrase.
    const auth = request.headers.get('Authorization') ?? ''
    // .trim() guards against a stray trailing newline/space baked into the
    // secret when it was set (e.g. via `echo "x" | wrangler secret put`) —
    // an invisible mismatch that would otherwise 401 every request forever.
    const expectedAuth = `Bearer ${(env.FAMILY_ACCESS_TOKEN ?? '').trim()}`
    console.log(`[daily-update] rebuild requested, origin=${origin}, authMatches=${auth === expectedAuth}`)
    if (auth !== expectedAuth) {
      console.log('[daily-update] rejecting rebuild: passphrase mismatch')
      return new Response(
        JSON.stringify({
          error: "Today's numbers aren't cached yet. They publish automatically after the close — rebuilding by hand takes the family passphrase.",
          code: 'refresh-locked',
        }),
        { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    try {
      console.log(`[daily-update] cache miss for ${kvKey}, building fresh payload`)
      const { markets, tickers } = await buildFreeData()

      const payload: DailyPayload = { day, generatedAt: Date.now(), markets, tickers }
      await env.DAILY_KV.put(kvKey, JSON.stringify(payload), { expirationTtl: PAYLOAD_TTL_SECONDS })
      console.log(`[daily-update] KV put ok for ${kvKey}, returning 200`)
      // Drop the edge copy of the public GET so everyone else sees this build
      // now rather than up to max-age later.
      ctx.waitUntil(caches.default.delete(`${url.origin}${url.pathname}`))

      return new Response(JSON.stringify(payload), { headers: { ...cors, 'Content-Type': 'application/json' } })
    } catch (err) {
      console.error('[daily-update] generation failed:', err instanceof Error ? err.message : err, err instanceof Error ? err.stack : '')
      return new Response(JSON.stringify({ error: 'Failed to generate daily update' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
  },

  /**
   * The nightly build, and the only path that normally runs. Fires on the
   * crons in wrangler.toml shortly after the US close and fetches the keyless
   * sources — so the dashboard is complete for everyone, guests included,
   * without anyone pressing anything and without spending a cent.
   *
   * There is nothing left for a person to trigger: the site composes the day's
   * written read in the browser from what this stores.
   */
  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    const day = tradingDayKey()
    const kvKey = `daily:${day}`

    // Idempotent by design: the schedule includes a later retry pass, and a
    // family member may have already rebuilt the day by hand.
    const existing = await env.DAILY_KV.get(kvKey, 'json')
    if (existing) {
      console.log(`[cron ${event.cron}] ${kvKey} already present, nothing to do`)
      return
    }

    console.log(`[cron ${event.cron}] building ${day}`)
    const { markets, tickers } = await buildFreeData()

    if (!hasSessionFor(day, markets)) {
      // A market holiday, or the close hasn't propagated yet. Caching now
      // would file yesterday's numbers under today's date; the later cron pass
      // gets another go, and yesterday's cached day keeps serving meanwhile.
      console.log(`[cron ${event.cron}] no US session closed on ${day} — skipping write`)
      return
    }

    const payload: DailyPayload = { day, generatedAt: Date.now(), markets, tickers }
    await env.DAILY_KV.put(kvKey, JSON.stringify(payload), { expirationTtl: PAYLOAD_TTL_SECONDS })
    console.log(`[cron ${event.cron}] KV put ok for ${kvKey}`)
    // No edge purge here: a scheduled run has no request URL to build the
    // cache key from, and the GET's 5-minute max-age expires on its own long
    // before anyone reads the dashboard the next morning.
  },
} satisfies ExportedHandler<Env>
