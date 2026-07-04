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

// Mirrors src/data/markets.ts MARKET_SYMBOLS ids -> Yahoo ticker.
const MARKETS: Record<string, { yahoo: string; name: string }> = {
  sp500: { yahoo: '^GSPC', name: 'S&P 500' },
  nasdaq: { yahoo: '^IXIC', name: 'NASDAQ Composite' },
  dow: { yahoo: '^DJI', name: 'Dow Jones Industrial Average' },
  russell2000: { yahoo: '^RUT', name: 'Russell 2000' },
  vix: { yahoo: '^VIX', name: 'CBOE Volatility Index' },
  bitcoin: { yahoo: 'BTC-USD', name: 'Bitcoin' },
  gold: { yahoo: 'GC=F', name: 'Gold' },
  oil: { yahoo: 'CL=F', name: 'WTI Crude Oil' },
  tnx: { yahoo: '^TNX', name: '10-Year Treasury Yield' },
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
  const entries = await Promise.all(
    Object.entries(MARKETS).map(async ([id, { yahoo, name }]) => {
      const result = await fetchYahooChart(yahoo, '5y', '1d')
      const candles = toCandles(result)
      const quote = quoteFromChart(id, name, result, candles)
      return [id, { quote, series: sliceRanges(candles) }] as const
    }),
  )
  return Object.fromEntries(entries)
}

async function buildTickerQuote(symbol: string, yahoo: string): Promise<Quote> {
  const result = await fetchYahooChart(yahoo, '5d', '1d')
  const candles = toCandles(result)
  return quoteFromChart(symbol, symbol, result, candles)
}

async function buildTickers(): Promise<Record<string, Quote>> {
  const sectorEntries = await Promise.all(
    SECTOR_ETFS.map(async (symbol) => [symbol, await buildTickerQuote(symbol, symbol)] as const),
  )
  const watchlistEntries = await Promise.all(
    WATCHLIST.map(async ({ symbol, yahoo }) => [symbol, await buildTickerQuote(symbol, yahoo)] as const),
  )
  return Object.fromEntries([...sectorEntries, ...watchlistEntries])
}

const SYSTEM_PROMPT = `You write a short daily markets narrative for a family financial-literacy site read by smart, curious 20-year-olds. Voice: Morgan Housel meets Morning Brew — warm, plainspoken, lightly irreverent, stories over jargon. Rules: 200-300 words. No financial advice, ever — educate about how to think, never what to buy. Be honest about uncertainty ("historically this has tended to…" not "this means…"). Always land on "so what does this mean for your life" for a young adult. No headers, no bullet lists, just 2-4 short paragraphs. This is describing the PREVIOUS trading day's close, not live/intraday action — write accordingly (e.g. "yesterday" / the given date, never "right now" or "today so far").`

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
          generationConfig: { maxOutputTokens: 500 },
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
      const markets = await buildMarkets()
      console.log(`[daily-update] buildMarkets ok, ${Object.keys(markets).length} markets`)
      const tickers = await buildTickers()
      console.log(`[daily-update] buildTickers ok, ${Object.keys(tickers).length} tickers`)
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
