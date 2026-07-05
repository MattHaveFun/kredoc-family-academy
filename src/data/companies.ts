// The watchlist shown in the scrolling ticker strip. Quotes come from the
// daily-update Worker (see useQuotes) — this file only defines which symbols
// to show and their display names. BRK.B keeps its dot for display; the
// Worker maps it to Yahoo's BRK-B internally.
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
  { symbol: 'WMT', name: 'Walmart' },
  { symbol: 'KO', name: 'Coca-Cola' },
  { symbol: 'DIS', name: 'Disney' },
  { symbol: 'NFLX', name: 'Netflix' },
]
