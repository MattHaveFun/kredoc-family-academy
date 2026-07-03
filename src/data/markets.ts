export type RangeKey = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

export const RANGE_OPTIONS: { key: RangeKey; label: string; points: number; stepHours: number }[] = [
  { key: '1D', label: '1D', points: 78, stepHours: 0.0833333 }, // 5-minute bars over 6.5h session
  { key: '1W', label: '1W', points: 35, stepHours: 1 },
  { key: '1M', label: '1M', points: 30, stepHours: 8 },
  { key: '3M', label: '3M', points: 90, stepHours: 24 },
  { key: '1Y', label: '1Y', points: 52, stepHours: 168 },
  { key: '5Y', label: '5Y', points: 60, stepHours: 730 },
]

export interface Candle {
  time: number // unix seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketSymbol {
  id: string
  symbol: string
  name: string
  assetClass: 'Index' | 'Volatility' | 'Crypto'
  basePrice: number
  volatility: number // daily-ish volatility fraction
  drift: number // slight upward/downward bias
  what: string
  why: string
  academyAnchor: string
}

export const MARKET_SYMBOLS: MarketSymbol[] = [
  {
    id: 'sp500',
    symbol: 'SPX',
    name: 'S&P 500',
    assetClass: 'Index',
    basePrice: 5460,
    volatility: 0.009,
    drift: 0.0002,
    what: 'A basket of 500 of the largest publicly traded U.S. companies, weighted by size.',
    why: 'It is the single most-watched gauge of how the U.S. stock market — and by extension, corporate America — is doing.',
    academyAnchor: 'sp500',
  },
  {
    id: 'nasdaq',
    symbol: 'IXIC',
    name: 'NASDAQ Composite',
    assetClass: 'Index',
    basePrice: 17600,
    volatility: 0.012,
    drift: 0.00025,
    what: 'An index of every stock listed on the Nasdaq exchange, heavily tilted toward technology companies.',
    why: 'It moves fastest when tech sentiment shifts, making it a leading signal for growth and innovation stocks.',
    academyAnchor: 'nasdaq',
  },
  {
    id: 'dow',
    symbol: 'DJI',
    name: 'Dow Jones Industrial Average',
    assetClass: 'Index',
    basePrice: 39100,
    volatility: 0.008,
    drift: 0.00015,
    what: 'A price-weighted index of 30 large, well-established American companies across many industries.',
    why: 'It is the oldest and most quoted index in the world, often used as shorthand for "the market" in headlines.',
    academyAnchor: 'dow',
  },
  {
    id: 'russell2000',
    symbol: 'RUT',
    name: 'Russell 2000',
    assetClass: 'Index',
    basePrice: 2040,
    volatility: 0.013,
    drift: 0.0001,
    what: 'An index tracking 2,000 smaller U.S. companies, known as small-caps.',
    why: 'Small companies are more sensitive to the domestic economy, so this index is a barometer for U.S. economic health.',
    academyAnchor: 'russell2000',
  },
  {
    id: 'vix',
    symbol: 'VIX',
    name: 'CBOE Volatility Index',
    assetClass: 'Volatility',
    basePrice: 14.5,
    volatility: 0.06,
    drift: -0.0002,
    what: 'A measure of how much traders expect the S&P 500 to swing over the next 30 days, derived from options prices.',
    why: 'Nicknamed the "fear gauge" — it spikes when investors expect turbulence and stays low when markets feel calm.',
    academyAnchor: 'vix',
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    assetClass: 'Crypto',
    basePrice: 62500,
    volatility: 0.025,
    drift: 0.0004,
    what: 'A decentralized digital currency that trades 24/7 on exchanges around the world, uncorrelated with any single government.',
    why: 'It behaves nothing like a stock index — no closing bell, no earnings reports — making it a useful contrast for how differently assets can move.',
    academyAnchor: 'bitcoin',
  },
]

// Deterministic pseudo-random number generator (mulberry32) so charts are
// stable across renders instead of jumping around on every re-render.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

export function generateSeries(market: MarketSymbol, range: RangeKey): Candle[] {
  const opts = RANGE_OPTIONS.find((r) => r.key === range)!
  const rand = mulberry32(hashString(market.id + range))
  const candles: Candle[] = []
  let price = market.basePrice
  const nowSec = Math.floor(Date.now() / 1000)
  const stepSec = Math.round(opts.stepHours * 3600)

  for (let i = 0; i < opts.points; i++) {
    const time = nowSec - (opts.points - i) * stepSec
    const shock = (rand() - 0.5) * 2 * market.volatility
    const open = price
    const close = open * (1 + shock + market.drift)
    const high = Math.max(open, close) * (1 + rand() * market.volatility * 0.4)
    const low = Math.min(open, close) * (1 - rand() * market.volatility * 0.4)
    const volume = Math.round((5_000_000 + rand() * 20_000_000) * (market.assetClass === 'Crypto' ? 0.6 : 1))
    candles.push({ time, open, high, low, close, volume })
    price = close
  }

  return candles
}

export function formatPrice(value: number, assetClass: MarketSymbol['assetClass']): string {
  if (assetClass === 'Crypto') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  if (value < 100) {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
