import { useEffect, useMemo, useRef, useState } from 'react'
import { getQuotes, peekQuote, type DataStatus, type QuoteResult } from '../data/marketFeed'

export interface QuotesState {
  results: Record<string, QuoteResult>
  /** Aggregate: 'live' if any symbol is live, else 'cached' if any cached, else loading/unavailable. */
  status: DataStatus
  /** Oldest fetch time among resolved symbols (for the "CACHED · Xm ago" badge). */
  fetchedAt: number | null
}

function peekAll(symbols: string[]): Record<string, QuoteResult> {
  const seeded: Record<string, QuoteResult> = {}
  for (const symbol of symbols) seeded[symbol] = peekQuote(symbol)
  return seeded
}

/**
 * Quotes for a list of symbols, updating progressively as each resolves
 * (Yahoo first, Twelve Data fallback per symbol). Seeded synchronously from
 * cache so a re-render never blanks symbols that have previously loaded —
 * a failed refresh holds the last good quote instead of dropping it.
 */
export function useQuotes(symbols: string[], priority = 5): QuotesState {
  const key = symbols.join(',')
  const [results, setResults] = useState<Record<string, QuoteResult>>(() => peekAll(symbols))
  const generation = useRef(0)

  useEffect(() => {
    const gen = ++generation.current
    const list = key ? key.split(',') : []
    setResults(peekAll(list))
    if (list.length === 0) return

    getQuotes(list, {
      priority,
      onPartial: (partial) => {
        if (generation.current === gen) setResults((prev) => ({ ...prev, ...partial }))
      },
    }).catch(() => {}) // per-symbol resolution never rejects; guards against the unexpected
  }, [key, priority])

  return useMemo(() => {
    const values = Object.values(results)
    const resolved = values.filter((v) => v.quote !== null)
    let status: DataStatus
    if (values.length === 0) status = 'loading'
    else if (resolved.some((v) => v.status === 'live')) status = 'live'
    else if (resolved.length > 0) status = 'cached'
    else if (values.length < (key ? key.split(',').length : 0)) status = 'loading'
    else status = 'unavailable'

    const fetchedTimes = resolved.map((v) => v.fetchedAt ?? 0).filter((t) => t > 0)
    const fetchedAt = fetchedTimes.length ? Math.min(...fetchedTimes) : null
    return { results, status, fetchedAt }
  }, [results, key])
}
