import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { DataStatus } from '../data/marketFeed'

interface FeedStatusValue {
  status: DataStatus
  fetchedAt: number | null
  setStatus: (status: DataStatus, fetchedAt: number | null) => void
}

const FeedStatusContext = createContext<FeedStatusValue | null>(null)

// Global "how fresh is the market data" indicator shown in the nav bar and
// dashboard header. The ticker strip (the most visible, always-mounted data
// consumer) reports into this; individual panels carry their own badges since
// symbols can be live/cached independently.
export function FeedStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: DataStatus; fetchedAt: number | null }>({
    status: 'loading',
    fetchedAt: null,
  })

  // Stable identity + no-op on identical values, so reporting components can
  // safely depend on this in effects without re-render loops.
  const setStatus = useCallback((status: DataStatus, fetchedAt: number | null) => {
    setState((prev) => (prev.status === status && prev.fetchedAt === fetchedAt ? prev : { status, fetchedAt }))
  }, [])

  const value = useMemo(
    () => ({ status: state.status, fetchedAt: state.fetchedAt, setStatus }),
    [state, setStatus],
  )
  return <FeedStatusContext.Provider value={value}>{children}</FeedStatusContext.Provider>
}

export function useFeedStatus(): FeedStatusValue {
  const ctx = useContext(FeedStatusContext)
  if (!ctx) throw new Error('useFeedStatus must be used within FeedStatusProvider')
  return ctx
}
