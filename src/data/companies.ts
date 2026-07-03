export interface TickerQuote {
  symbol: string
  name: string
  price: number
  changePct: number
}

// Static snapshot values for the scrolling ticker strip. In a future phase
// these will be replaced by a live market-data feed.
export const TOP_COMPANIES: TickerQuote[] = [
  { symbol: 'AAPL', name: 'Apple', price: 227.52, changePct: 0.84 },
  { symbol: 'MSFT', name: 'Microsoft', price: 441.06, changePct: 0.31 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 118.11, changePct: 2.47 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 176.23, changePct: -0.42 },
  { symbol: 'AMZN', name: 'Amazon', price: 197.85, changePct: 1.05 },
  { symbol: 'META', name: 'Meta Platforms', price: 512.34, changePct: -0.63 },
  { symbol: 'TSLA', name: 'Tesla', price: 251.77, changePct: 3.18 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 447.90, changePct: 0.12 },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 213.44, changePct: 0.55 },
  { symbol: 'V', name: 'Visa', price: 279.61, changePct: -0.18 },
  { symbol: 'UNH', name: 'UnitedHealth', price: 498.20, changePct: -1.02 },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 118.65, changePct: 0.72 },
]
