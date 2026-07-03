import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FeedState } from '../data/liveFeed'

interface FeedStatusContextValue {
  status: FeedState
  setStatus: (status: FeedState) => void
}

const FeedStatusContext = createContext<FeedStatusContextValue | null>(null)

// Global "is the live market feed reachable" indicator, shown in the nav
// bar. The ticker strip (the most visible, always-mounted data consumer)
// is the source of truth for this — individual panels track their own
// live/sim state independently since different symbols can succeed or
// fall back independently of one another.
export function FeedStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<FeedState>('connecting')
  const value = useMemo(() => ({ status, setStatus }), [status])
  return <FeedStatusContext.Provider value={value}>{children}</FeedStatusContext.Provider>
}

export function useFeedStatus(): FeedStatusContextValue {
  const ctx = useContext(FeedStatusContext)
  if (!ctx) throw new Error('useFeedStatus must be used within FeedStatusProvider')
  return ctx
}
