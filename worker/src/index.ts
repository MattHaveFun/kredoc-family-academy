// Kredoc Family Academy — daily-update Worker.
//
// The whole point of this Worker: do the expensive stuff (market data +
// Gemini narrative) server-side, at most once per trading day, behind a
// shared family passphrase — so no client ever holds an API key, and no
// amount of outside traffic can run up a bill beyond one extra generation.
//
// POST /api/daily-update
//   Authorization: Bearer <FAMILY_ACCESS_TOKEN>
//   -> { day, generatedAt, markets, tickers, narrative }
//
// Flow: check the token -> check KV for today's (market-calendar) entry ->
// if present, return it untouched (zero external calls) -> if absent, pull
// Yahoo's chart endpoint directly (server-side, so no CORS relay needed —
// that relay was the actual source of the flakiness this replaces), build
// the payload, ask Gemini for the narrative, cache it, return it.

export interface Env {
  DAILY_KV: KVNamespace
  FAMILY_ACCESS_TOKEN: string
  GEMINI_API_KEY: string
  ALLOWED_ORIGIN: string
}

type RangeKey = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

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
  series: Record<RangeKey, Candle[]>
}

interface DailyPayload {
  day: string // YYYY-MM-DD, the trading day this close data represents
  generatedAt: number
  markets: Record<string, MarketEntry>
  tickers: Record<string, Quote>
  narrative: { text: string; state: 'ready' } | { text: null; state: 'error' }
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
function sliceRanges(candles: Candle[]): Record<RangeKey, Candle[]> {
  const take = (n: number) => candles.slice(Math.max(0, candles.length - n))
  return {
    '1D': take(2),
    '1W': take(5),
    '1M': take(22),
    '3M': take(65),
    '1Y': take(252),
    '5Y': candles,
  }
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
      return [id, { quote, series: sliceRanges(candles) }] as const
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
// flows through the exact same sliceRanges / chart pipeline as everything else.
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
    result[id] = { quote: quoteFromCandles(id, name, candles), series: sliceRanges(candles) }
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

const SYSTEM_PROMPT = `You write a short daily markets narrative for a family financial-literacy site read by smart, curious 20-year-olds. Voice: Morgan Housel meets Morning Brew — warm, plainspoken, lightly irreverent, stories over jargon. Rules: aim for about 220-250 words — stop with a complete, landed final sentence well before any length limit, never mid-thought. No financial advice, ever — educate about how to think, never what to buy. Be honest about uncertainty ("historically this has tended to…" not "this means…"). Always land on "so what does this mean for your life" for a young adult. No headers, no bullet lists, just 2-4 short paragraphs. This is describing the PREVIOUS trading day's close, not live/intraday action — write accordingly (e.g. "yesterday" / the given date, never "right now" or "today so far").`

async function generateNarrative(env: Env, day: string, markets: Record<string, MarketEntry>): Promise<DailyPayload['narrative']> {
  const snapshot = Object.values(markets)
    .map((m) => `${m.quote.name}: ${m.quote.changePct >= 0 ? '+' : ''}${m.quote.changePct.toFixed(2)}%`)
    .join(', ')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: 'user',
              parts: [{ text: `Market close for ${day}: ${snapshot}. Write today's "what it actually means" narrative.` }],
            },
          ],
          // gemini-flash-latest thinks by default, and thinking tokens are
          // deducted from maxOutputTokens — that silent budget contention is
          // what was truncating the narrative mid-sentence. Disable thinking
          // (not needed for writing a short narrative) so the whole budget
          // goes to visible text, with headroom above the ~250-word target.
          generationConfig: {
            maxOutputTokens: 700,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    )
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) throw new Error('Gemini returned no text')
    return { text, state: 'ready' }
  } catch (err) {
    console.error('[narrative] generation failed:', err instanceof Error ? err.message : err)
    return { text: null, state: 'error' }
  }
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

function corsHeaders(env: Env, origin: string | null): HeadersInit {
  const allow = origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    Vary: 'Origin',
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin')
    const cors = corsHeaders(env, origin)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    if (url.pathname !== '/api/daily-update' || request.method !== 'POST') {
      return new Response('Not found', { status: 404, headers: cors })
    }

    const auth = request.headers.get('Authorization') ?? ''
    // .trim() guards against a stray trailing newline/space baked into the
    // secret when it was set (e.g. via `echo "x" | wrangler secret put`) —
    // an invisible mismatch that would otherwise 401 every request forever.
    const expectedAuth = `Bearer ${(env.FAMILY_ACCESS_TOKEN ?? '').trim()}`
    console.log(`[daily-update] request received, origin=${origin}, authMatches=${auth === expectedAuth}`)
    if (auth !== expectedAuth) {
      console.log('[daily-update] rejecting: passphrase mismatch')
      return new Response(JSON.stringify({ error: 'Invalid family passphrase' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const day = tradingDayKey()
    const kvKey = `daily:${day}`

    const cached = await env.DAILY_KV.get(kvKey, 'json')
    if (cached) {
      console.log(`[daily-update] cache hit for ${kvKey}`)
      return new Response(JSON.stringify(cached), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    console.log(`[daily-update] cache miss for ${kvKey}, building fresh payload`)

    try {
      // Build the three sections independently — a failure in one (e.g. a
      // Treasury hiccup) must not blank out the others. As long as we get some
      // markets, we cache a useful payload instead of 502-ing to nothing.
      const [marketsRes, ratesRes, tickersRes] = await Promise.allSettled([
        buildMarkets(),
        buildRates(),
        buildTickers(),
      ])
      const yahooMarkets = marketsRes.status === 'fulfilled' ? marketsRes.value : {}
      const rates = ratesRes.status === 'fulfilled' ? ratesRes.value : {}
      const tickers = tickersRes.status === 'fulfilled' ? tickersRes.value : {}
      if (ratesRes.status === 'rejected') console.error('[buildRates] failed:', ratesRes.reason)
      if (tickersRes.status === 'rejected') console.error('[buildTickers] failed:', tickersRes.reason)
      const markets = { ...yahooMarkets, ...rates }
      console.log(
        `[daily-update] built ${Object.keys(yahooMarkets).length} yahoo + ${Object.keys(rates).length} rates + ${Object.keys(tickers).length} tickers`,
      )
      if (Object.keys(markets).length === 0) throw new Error('no market data could be built')
      const narrative = await generateNarrative(env, day, markets)
      console.log(`[daily-update] narrative state=${narrative.state}`)

      const payload: DailyPayload = { day, generatedAt: Date.now(), markets, tickers, narrative }
      await env.DAILY_KV.put(kvKey, JSON.stringify(payload), { expirationTtl: 60 * 60 * 24 * 3 })
      console.log(`[daily-update] KV put ok for ${kvKey}, returning 200`)

      return new Response(JSON.stringify(payload), { headers: { ...cors, 'Content-Type': 'application/json' } })
    } catch (err) {
      console.error('[daily-update] generation failed:', err instanceof Error ? err.message : err, err instanceof Error ? err.stack : '')
      return new Response(JSON.stringify({ error: 'Failed to generate daily update' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }
  },
} satisfies ExportedHandler<Env>
