import type { Candle, RangeKey } from './markets'
import { getCachedPayload, isDailyUpdateLoading, todayStamp, type DailyPayload } from './dailyUpdate'

// ---------------------------------------------------------------------------
// marketFeed — the read-only layer every hook goes through. There is no
// fetching logic here: everything comes from the single payload the Worker's
// cron builds once per trading day and dailyUpdate.ts caches (see
// worker/src/index.ts). This module's only job is shaping that payload into
// what marketStore's snapshot cache expects, so the hooks
// (useMarketQuote/useSeries/useQuotes) never had to change.
// ---------------------------------------------------------------------------

export type DataStatus = 'loading' | 'live' | 'cached' | 'unavailable'

export interface Quote {
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

export interface QuoteResult {
  quote: Quote | null
  status: DataStatus
  fetchedAt: number | null
}

export interface SeriesResult {
  candles: Candle[]
  status: DataStatus
  fetchedAt: number | null
}

// proxyNote is kept for interface compatibility with existing callers (e.g.
// DailyBrief/TodayInMarkets check it to only trust the "true" VIX level) —
// it's always null now since Yahoo, fetched server-side, never needs the
// ETF-proxy substitution Twelve Data's free plan forced.
export interface MarketQuoteResult extends QuoteResult {
  proxyNote: string | null
}

export interface MarketSeriesResult extends SeriesResult {
  proxyNote: string | null
}

// payload.day is the US-market trading day (America/New_York), computed by
// the Worker; todayStamp() is the device's local calendar date. They can
// disagree for a user well outside US time zones right at midnight — an
// acceptable approximation for badging freshness, not for the data itself.
function statusFor(payload: DailyPayload | null): DataStatus {
  // Nothing yet, but the public read is still on the wire — every visitor now
  // starts here, so calling it "unavailable" would libel a dashboard that is
  // about to fill in.
  if (!payload) return isDailyUpdateLoading() ? 'loading' : 'unavailable'
  return payload.day === todayStamp() ? 'live' : 'cached'
}

export function peekMarketQuote(marketId: string): MarketQuoteResult {
  const payload = getCachedPayload()
  const entry = payload?.markets[marketId]
  return {
    quote: entry?.quote ?? null,
    status: statusFor(payload),
    fetchedAt: payload?.generatedAt ?? null,
    proxyNote: null,
  }
}

// Trading days per display range. The Worker ships one daily series per market
// and every range is a suffix of it, so slicing happens here — shipping six
// overlapping copies of the same candles is what pushed the payload past the
// browser's storage quota.
const RANGE_DAYS: Record<RangeKey, number> = {
  '1D': 2,
  '1W': 5,
  '1M': 22,
  '3M': 65,
  '1Y': 252,
  '5Y': Infinity,
}

export function peekMarketSeries(marketId: string, range: RangeKey): MarketSeriesResult {
  const payload = getCachedPayload()
  const entry = payload?.markets[marketId]
  // A pre-v2 payload has no `candles`; treat it as absent rather than crashing.
  const all = entry?.candles ?? []
  const days = RANGE_DAYS[range]
  return {
    candles: days === Infinity ? all : all.slice(Math.max(0, all.length - days)),
    status: statusFor(payload),
    fetchedAt: payload?.generatedAt ?? null,
    proxyNote: null,
  }
}

export function peekQuote(symbol: string): QuoteResult {
  const payload = getCachedPayload()
  return {
    quote: payload?.tickers[symbol] ?? null,
    status: statusFor(payload),
    fetchedAt: payload?.generatedAt ?? null,
  }
}

// --- Empty-state copy ---------------------------------------------------------
/** What an empty panel should tell the person actually looking at it. */
export function emptyStateHint(): string {
  return "The latest close hasn't landed yet — it publishes automatically after the market closes."
}

// --- Badge helpers ------------------------------------------------------------

/** The trading day the cached payload represents, as MM/DD/YYYY. Null if nothing is cached. */
export function dataCloseDate(): string | null {
  const day = getCachedPayload()?.day
  if (!day) return null
  const [year, month, date] = day.split('-')
  return year && month && date ? `${month}/${date}/${year}` : null
}

/**
 * Human label for a badge.
 *
 * It used to read "TODAY'S CLOSE", which invited the wrong reading twice over:
 * the numbers are the *previous* session's close, and "today" tells you
 * nothing on a Monday looking at Friday's tape. Naming the actual date can't
 * be misread — and it does the honest job the old label was meant to do,
 * since a stale date announces itself.
 */
export function describeStatus(status: DataStatus, fetchedAt: number | null): string {
  void fetchedAt // freshness now comes from the data's own date, not when we fetched it
  if (status === 'live' || status === 'cached') {
    const date = dataCloseDate()
    return date ? `CLOSE ${date}` : 'MARKET CLOSE'
  }
  if (status === 'loading') return 'CONNECTING'
  return 'DATA UNAVAILABLE'
}

/** The long form, for the badge's tooltip. */
export function describeStatusTitle(status: DataStatus, fetchedAt: number | null): string {
  if (status === 'loading') return 'Loading the latest market data'
  if (status === 'unavailable') return 'No market data available yet'
  const date = dataCloseDate()
  const base = date ? `Data based on close of ${date}` : 'Data based on the most recent market close'
  if (status === 'cached' && fetchedAt) {
    const mins = Math.max(0, Math.round((Date.now() - fetchedAt) / 60_000))
    const age =
      mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins / 60)}h ago` : `${Math.round(mins / 1440)}d ago`
    return `${base} · fetched ${age}`
  }
  return base
}
