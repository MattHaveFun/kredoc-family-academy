import { useEffect, useState } from 'react'
import { generateSeries, type Candle, type MarketSymbol, type RangeKey } from '../data/markets'
import { fetchSeriesWithFallback, type FeedState } from '../data/liveFeed'

interface LiveSeriesResult {
  candles: Candle[]
  status: FeedState
}

/** Fetches a live OHLC series for a market/range, falling back to the deterministic simulated series on failure. */
export function useLiveSeries(market: MarketSymbol, range: RangeKey): LiveSeriesResult {
  const [result, setResult] = useState<LiveSeriesResult>(() => ({
    candles: generateSeries(market, range),
    status: 'connecting',
  }))

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    setResult({ candles: generateSeries(market, range), status: 'connecting' })

    fetchSeriesWithFallback(market, range, controller.signal).then((next) => {
      if (!cancelled) setResult(next)
    })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [market, range])

  return result
}
