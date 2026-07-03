export type RangeKey = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '1D', label: '1D' },
  { key: '1W', label: '1W' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '1Y', label: '1Y' },
  { key: '5Y', label: '5Y' },
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
  what: string
  why: string
  academyAnchor: string // Academy lesson id
}

export const MARKET_SYMBOLS: MarketSymbol[] = [
  {
    id: 'sp500',
    symbol: 'SPX',
    name: 'S&P 500',
    assetClass: 'Index',
    what: 'A basket of 500 of the largest publicly traded U.S. companies, weighted by size.',
    why: 'It is the single most-watched gauge of how the U.S. stock market — and by extension, corporate America — is doing.',
    academyAnchor: 'sp500',
  },
  {
    id: 'nasdaq',
    symbol: 'IXIC',
    name: 'NASDAQ Composite',
    assetClass: 'Index',
    what: 'An index of every stock listed on the Nasdaq exchange, heavily tilted toward technology companies.',
    why: 'It moves fastest when tech sentiment shifts, making it a leading signal for growth and innovation stocks.',
    academyAnchor: 'nasdaq',
  },
  {
    id: 'dow',
    symbol: 'DJI',
    name: 'Dow Jones Industrial Average',
    assetClass: 'Index',
    what: 'A price-weighted index of 30 large, well-established American companies across many industries.',
    why: 'It is the oldest and most quoted index in the world, often used as shorthand for "the market" in headlines.',
    academyAnchor: 'dow',
  },
  {
    id: 'russell2000',
    symbol: 'RUT',
    name: 'Russell 2000',
    assetClass: 'Index',
    what: 'An index tracking 2,000 smaller U.S. companies, known as small-caps.',
    why: 'Small companies are more sensitive to the domestic economy, so this index is a barometer for U.S. economic health.',
    academyAnchor: 'russell2000',
  },
  {
    id: 'vix',
    symbol: 'VIX',
    name: 'CBOE Volatility Index',
    assetClass: 'Volatility',
    what: 'A measure of how much traders expect the S&P 500 to swing over the next 30 days, derived from options prices.',
    why: 'Nicknamed the "fear gauge" — it spikes when investors expect turbulence and stays low when markets feel calm.',
    academyAnchor: 'vix',
  },
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    assetClass: 'Crypto',
    what: 'A decentralized digital currency that trades 24/7 on exchanges around the world, uncorrelated with any single government.',
    why: 'It behaves nothing like a stock index — no closing bell, no earnings reports — making it a useful contrast for how differently assets can move.',
    academyAnchor: 'bitcoin',
  },
]

export function formatPrice(value: number, assetClass: MarketSymbol['assetClass']): string {
  if (assetClass === 'Crypto') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
