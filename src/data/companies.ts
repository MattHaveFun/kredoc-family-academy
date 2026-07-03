// The watchlist shown in the scrolling ticker strip. Quotes come live from
// Twelve Data (see useQuotes) — this file only defines which symbols to show
// and their display names. Symbols are already in Twelve Data format
// (BRK.B keeps its dot, unlike Yahoo's BRK-B).
export interface WatchlistEntry {
  symbol: string
  name: string
}

export const TOP_COMPANIES: WatchlistEntry[] = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'UNH', name: 'UnitedHealth' },
  { symbol: 'XOM', name: 'Exxon Mobil' },
]
