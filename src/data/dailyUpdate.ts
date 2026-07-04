import type { Candle, RangeKey } from './markets'
import { getFamilyToken } from './familyAccess'

// The single client-side entry point for the daily-update Worker. Nothing in
// this app calls Yahoo, Twelve Data, or Gemini directly anymore — everything
// market-related comes from one cached payload, refreshed at most once per
// trading day, only when a family member presses the button (see
// DailyUpdatePanel). marketFeed.ts reads through this module; nothing else
// should import it directly.

export interface Quote {
  symbol: string
  price: number
  change: number
  changePct: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  name: string
}

export interface MarketEntry {
  quote: Quote
  series: Record<RangeKey, Candle[]>
}

export interface DailyPayload {
  day: string // YYYY-MM-DD trading day this data represents
  generatedAt: number
  markets: Record<string, MarketEntry>
  tickers: Record<string, Quote>
  narrative: { text: string; state: 'ready' } | { text: null; state: 'error' }
}

const CACHE_KEY = 'kredoc.dailyUpdate.v1'

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify(): void {
  listeners.forEach((l) => l())
}

export function getCachedPayload(): DailyPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as DailyPayload) : null
  } catch {
    return null
  }
}

function setCachedPayload(payload: DailyPayload): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // storage unavailable — payload still notified for this session
  }
  notify()
}

/** Local calendar day (device timezone) — used only to badge freshness in the UI. */
export function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let inFlight: Promise<{ ok: true } | { ok: false; error: string }> | null = null

/** Triggered only by the "Get today's update" button — never automatically. */
export function refreshDailyUpdate(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (inFlight) return inFlight

  const token = getFamilyToken()
  const workerUrl = import.meta.env.VITE_WORKER_URL
  if (!token) {
    return Promise.resolve({ ok: false, error: 'No family passphrase on file — sign in again.' })
  }
  if (!workerUrl) {
    return Promise.resolve({ ok: false, error: 'Site is not configured with a Worker URL yet.' })
  }

  inFlight = (async () => {
    try {
      const res = await fetch(`${workerUrl}/api/daily-update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        return { ok: false as const, error: 'That family passphrase was rejected — try entering it again.' }
      }
      if (!res.ok) {
        return { ok: false as const, error: `Update failed (${res.status}). Try again in a moment.` }
      }
      const payload = (await res.json()) as DailyPayload
      setCachedPayload(payload)
      return { ok: true as const }
    } catch {
      return { ok: false as const, error: 'Could not reach the update service — check your connection.' }
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
