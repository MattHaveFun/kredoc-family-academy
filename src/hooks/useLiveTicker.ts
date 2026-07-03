import { useEffect, useState } from 'react'
import { TOP_COMPANIES, type TickerQuote } from '../data/companies'
import { fetchLiveQuote, type FeedState } from '../data/liveFeed'

interface LiveTickerResult {
  quotes: TickerQuote[]
  status: FeedState
}

/**
 * Fetches live quotes for every ticker in the watchlist strip. If any single
 * symbol fails, the whole strip falls back to the static snapshot rather than
 * mixing live and simulated rows — a partial feed would be confusing and
 * harder to reason about than an honest all-or-nothing status.
 */
export function useLiveTicker(): LiveTickerResult {
  const [result, setResult] = useState<LiveTickerResult>({
    quotes: TOP_COMPANIES,
    status: 'connecting',
  })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    Promise.all(
      TOP_COMPANIES.map((company) =>
        fetchLiveQuote(company.symbol, controller.signal).then(
          (quote): TickerQuote => ({
            symbol: company.symbol,
            name: company.name,
            price: quote.price,
            changePct: quote.changePct,
          }),
        ),
      ),
    )
      .then((quotes) => {
        if (!cancelled) setResult({ quotes, status: 'live' })
      })
      .catch(() => {
        if (!cancelled) setResult({ quotes: TOP_COMPANIES, status: 'sim' })
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return result
}
