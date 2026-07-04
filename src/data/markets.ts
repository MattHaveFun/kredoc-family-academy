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
  assetClass: 'Index' | 'Volatility' | 'Crypto' | 'Commodity' | 'Rate'
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
  {
    id: 'gold',
    symbol: 'GOLD',
    name: 'Gold',
    assetClass: 'Commodity',
    what: 'The price of one troy ounce of gold, tracked here through the front-month COMEX futures contract.',
    why: 'Gold has served as a store of value for millennia and a "flight to safety" trade during crises — it tends to hold up, or even rise, when stocks and confidence in paper money wobble.',
    academyAnchor: 'gold',
  },
  {
    id: 'oil',
    symbol: 'WTI',
    name: 'WTI Crude Oil',
    assetClass: 'Commodity',
    what: 'The price of one barrel of West Texas Intermediate crude, tracked through the front-month NYMEX futures contract.',
    why: 'Oil powers the physical economy — transportation, manufacturing, shipping — so its price ripples into gas prices, inflation reports, and corporate earnings faster than almost anything else in markets.',
    academyAnchor: 'oil',
  },
  {
    id: 'tnx',
    symbol: 'US10Y',
    name: '10-Year Treasury Yield',
    assetClass: 'Rate',
    what: 'The annualized interest rate the U.S. government pays to borrow money for 10 years — the benchmark "risk-free" yield the entire financial system prices against.',
    why: 'Mortgage rates, corporate borrowing costs, and stock valuations all take their cue from this one number — when it rises, money gets more expensive everywhere at once.',
    academyAnchor: 'tnx',
  },
]

export function formatPrice(value: number, assetClass: MarketSymbol['assetClass']): string {
  if (assetClass === 'Crypto') {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  if (assetClass === 'Commodity') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (assetClass === 'Rate') {
    return `${value.toFixed(2)}%`
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
