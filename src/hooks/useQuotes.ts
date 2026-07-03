import { useEffect, useMemo, useRef, useState } from 'react'
import { getQuotes, type DataStatus, type QuoteResult } from '../data/twelveDataService'

export interface QuotesState {
  results: Record<string, QuoteResult>
  /** Aggregate: 'live' if any symbol is live, else 'cached' if any cached, else loading/unavailable. */
  status: DataStatus
  /** Oldest fetch time among resolved symbols (for the "CACHED · Xm ago" badge). */
  fetchedAt: number | null
}

/**
 * Quotes for a list of symbols, updating progressively as rate-limited
 * batches land. Symbols array is compared by value so callers can pass
 * inline literals.
 */
export function useQuotes(symbols: string[], priority = 5): QuotesState {
  const key = symbols.join(',')
  const [results, setResults] = useState<Record<string, QuoteResult>>({})
  const generation = useRef(0)

  useEffect(() => {
    const gen = ++generation.current
    setResults({})
    const list = key ? key.split(',') : []
    if (list.length === 0) return

    getQuotes(list, {
      priority,
      onPartial: (partial) => {
        if (generation.current === gen) setResults((prev) => ({ ...prev, ...partial }))
      },
    }).then((all) => {
      if (generation.current === gen) setResults((prev) => ({ ...prev, ...all }))
    })
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
