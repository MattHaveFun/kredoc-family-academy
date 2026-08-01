import type { Candle, RangeKey } from './markets'
import { getCachedPayload, isDailyUpdateLoading, todayStamp, type DailyPayload } from './dailyUpdate'
import { getFamilyToken } from './familyAccess'

// ---------------------------------------------------------------------------
// marketFeed — the read-only layer every hook goes through. There is no
// fetching logic here anymore: everything comes from the single payload
// dailyUpdate.ts caches after a family member presses "Get today's update"
// (see DailyUpdatePanel + worker/src/index.ts). This module's only job is
// shaping that payload into what marketStore's snapshot cache expects, so
// hooks (useMarketQuote/useSeries/useQuotes) didn't need to change at all.
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
/**
 * What an empty panel should tell the person actually looking at it.
 *
 * "Press Get today's update" is only true for someone holding the passphrase —
 * a guest has no such button, so that wording sent them hunting for a control
 * that isn't on their screen. Everyone else gets told what's really going on:
 * the day hasn't been pulled yet, and somebody in the family does that daily.
 */
export function emptyStateHint(): string {
  // Deliberately doesn't quote the button's label: that label changes with
  // what's actually outstanding ("Get today's update" / "Write today's read" /
  // "Refresh"), and naming the wrong one sends people hunting.
  return getFamilyToken()
    ? 'Use the update button up top to pull the latest close.'
    : "Today's close hasn't landed yet — it publishes automatically after the market closes."
}

// --- Badge helpers ------------------------------------------------------------
/** Human label for a badge: "TODAY'S CLOSE", "CACHED · Xm ago" / "· Xh ago" / "· Xd ago", or "DATA UNAVAILABLE". */
export function describeStatus(status: DataStatus, fetchedAt: number | null): string {
  if (status === 'live') return "TODAY'S CLOSE"
  if (status === 'cached' && fetchedAt) {
    const mins = Math.max(0, Math.round((Date.now() - fetchedAt) / 60_000))
    if (mins < 1) return 'CACHED · just now'
    if (mins < 60) return `CACHED · ${mins}m ago`
    const hours = Math.round(mins / 60)
    if (hours < 24) return `CACHED · ${hours}h ago`
    const days = Math.round(hours / 24)
    return `CACHED · ${days}d ago`
  }
  if (status === 'loading') return 'CONNECTING'
  return 'DATA UNAVAILABLE'
}
