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

// In-memory fallback for devices where localStorage writes silently fail
// (mobile Safari private mode, storage-locked in-app browsers, etc). Without
// this, a successful fetch would immediately be wiped out: the write to
// localStorage fails silently, then the very next read-back (triggered by
// notify()) hits the same broken storage and returns null.
let memoryPayload: DailyPayload | null = null

export function getCachedPayload(): DailyPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw) as DailyPayload
  } catch {
    // fall through to in-memory copy
  }
  return memoryPayload
}

function setCachedPayload(payload: DailyPayload): { storageOk: boolean; storageError: string | null } {
  memoryPayload = payload
  let storageOk = true
  let storageError: string | null = null
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch (err) {
    storageOk = false
    storageError = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  }
  notify()
  return { storageOk, storageError }
}

/** Local calendar day (device timezone) — used only to badge freshness in the UI. */
export function todayStamp(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface RefreshResult {
  ok: boolean
  error?: string
  /** One-line trace of what actually happened, always populated — shown in the UI so a
   *  failure that isn't easily reproducible (mobile browsers we can't attach a debugger
   *  to) is still diagnosable from a screenshot. */
  debug: string
}

let inFlight: Promise<RefreshResult> | null = null

/** Triggered only by the "Get today's update" button — never automatically. */
export function refreshDailyUpdate(): Promise<RefreshResult> {
  if (inFlight) return inFlight

  const token = getFamilyToken()
  const workerUrl = import.meta.env.VITE_WORKER_URL
  if (!token) {
    return Promise.resolve({ ok: false, error: 'No family passphrase on file — sign in again.', debug: 'no token' })
  }
  if (!workerUrl) {
    return Promise.resolve({
      ok: false,
      error: 'Site is not configured with a Worker URL yet.',
      debug: 'no VITE_WORKER_URL',
    })
  }

  inFlight = (async () => {
    try {
      const res = await fetch(`${workerUrl}/api/daily-update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        return {
          ok: false as const,
          error: 'That family passphrase was rejected — try entering it again.',
          debug: 'HTTP 401',
        }
      }
      if (!res.ok) {
        return {
          ok: false as const,
          error: `Update failed (${res.status}). Try again in a moment.`,
          debug: `HTTP ${res.status}`,
        }
      }
      const text = await res.text()
      let payload: DailyPayload
      try {
        payload = JSON.parse(text) as DailyPayload
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return {
          ok: false as const,
          error: 'Update service returned an unreadable response. Try again in a moment.',
          debug: `HTTP ${res.status}, ${text.length}B, JSON parse failed: ${msg}`,
        }
      }
      const { storageOk, storageError } = setCachedPayload(payload)
      return {
        ok: true as const,
        debug: storageOk
          ? `HTTP ${res.status}, ${text.length}B, day=${payload.day}, saved`
          : `HTTP ${res.status}, ${text.length}B, day=${payload.day}, storage failed (${storageError}) — using session memory only`,
      }
    } catch (err) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
      return {
        ok: false as const,
        error: 'Could not reach the update service — check your connection.',
        debug: `fetch threw: ${msg}`,
      }
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
