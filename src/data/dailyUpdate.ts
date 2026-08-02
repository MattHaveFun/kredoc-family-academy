import type { Candle } from './markets'

// The single client-side entry point for the daily-update Worker. Nothing in
// this app calls a market or AI API directly — everything market-related comes
// from one cached payload the Worker's cron builds once per trading day.
// marketFeed.ts reads through this module; nothing else should import it
// directly.
//
// One way in: loadPublicDailyUpdate() — GET, no credentials, runs
// automatically on load for everyone. It reads a payload the cron already
// built, so it costs nothing and is safe to hand to guests.
//
// The client can no longer *trigger* a rebuild. The Worker still accepts an
// authenticated POST for the rare day the cron misses (see worker/README.md),
// but that's a terminal command now, not a button and a passphrase every
// visitor had to scroll past.

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
  /** Full daily series, oldest first. marketFeed slices the display ranges. */
  candles: Candle[]
}

export interface DailyPayload {
  day: string // YYYY-MM-DD trading day this data represents
  generatedAt: number
  markets: Record<string, MarketEntry>
  tickers: Record<string, Quote>
  // No `narrative`. The day's written read is composed from `markets` and
  // `tickers` in dailyRead.ts — free, instant, and needing nobody to trigger
  // it. Payloads cached before that change still carry the old field; it's
  // simply ignored.
}

// v2: entries carry a single `candles` array instead of a per-range record.
// The bump matters — a v1 payload left in a browser would render every chart
// empty, since `candles` simply wouldn't be there.
const CACHE_KEY = 'kredoc.dailyUpdate.v2'
const LEGACY_CACHE_KEYS = ['kredoc.dailyUpdate.v1']

type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify(): void {
  listeners.forEach((l) => l())
}

// In-memory copy of whatever this session last fetched. It exists for devices
// where localStorage writes fail (private mode, storage-locked in-app
// browsers, or simply a payload over quota) — without it, a successful fetch
// would be wiped out by the very next read-back.
let memoryPayload: DailyPayload | null = null

/**
 * Whatever this session fetched is always at least as fresh as what's on disk,
 * so it wins. Reading disk first was a subtle trap: when a write failed, the
 * *previous* payload was still sitting in localStorage, so a successful fetch
 * was silently ignored in favour of stale data — the app looked like it had
 * simply failed to load the new symbols.
 */
export function getCachedPayload(): DailyPayload | null {
  if (memoryPayload) return memoryPayload
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return JSON.parse(raw) as DailyPayload
  } catch {
    // unreadable storage — nothing cached as far as we're concerned
  }
  return null
}

function setCachedPayload(payload: DailyPayload): { storageOk: boolean; storageError: string | null } {
  memoryPayload = payload
  let storageOk = true
  let storageError: string | null = null
  try {
    // Clear the old value first: a failed setItem leaves the previous payload
    // behind, and a stale payload on disk is worse than none — on the next
    // page load it would be served as though it were current.
    localStorage.removeItem(CACHE_KEY)
    for (const key of LEGACY_CACHE_KEYS) localStorage.removeItem(key)
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

let publicInFlight: Promise<RefreshResult> | null = null
let publicAttempted = false

/**
 * Pull whatever the Worker has already built. No passphrase, no build, no
 * cost — it reads KV and stops. Called once per page load so that anyone
 * landing on the site, family or not, sees real markets instead of a wall of
 * "DATA UNAVAILABLE".
 *
 * Skipped entirely when this device already holds today's payload, so the
 * common case is zero network.
 */
export function loadPublicDailyUpdate(): Promise<RefreshResult> {
  if (publicInFlight) return publicInFlight
  publicAttempted = true

  const workerUrl = import.meta.env.VITE_WORKER_URL
  if (!workerUrl) {
    return Promise.resolve({ ok: false, error: undefined, debug: 'no VITE_WORKER_URL' })
  }

  publicInFlight = (async () => {
    try {
      const res = await fetch(`${workerUrl}/api/daily-update`, { method: 'GET' })
      if (res.status === 404) {
        // KV is genuinely empty — nobody has run a build inside the Worker's
        // lookback window. Not an error the visitor can act on.
        return { ok: false as const, debug: 'HTTP 404 (nothing built yet)' }
      }
      if (!res.ok) return { ok: false as const, debug: `HTTP ${res.status}` }

      const text = await res.text()
      const payload = JSON.parse(text) as DailyPayload
      // Never trade down: a device that already holds a newer day (because a
      // family member rebuilt here first) must not be rolled back by the edge's
      // slightly stale copy. Day strings are YYYY-MM-DD, so they sort.
      const existing = getCachedPayload()
      if (existing && existing.day > payload.day) {
        return { ok: true as const, debug: `HTTP 200, kept newer local day=${existing.day}` }
      }
      const { storageOk } = setCachedPayload(payload)
      return {
        ok: true as const,
        debug: `HTTP 200, ${text.length}B, day=${payload.day}, public${storageOk ? '' : ' (memory only)'}`,
      }
    } catch (err) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
      return { ok: false as const, debug: `public fetch threw: ${msg}` }
    } finally {
      publicInFlight = null
      // Wake the snapshot cache even when the load failed, so badges can move
      // off "CONNECTING" — a success already notified via setCachedPayload.
      notify()
    }
  })()

  return publicInFlight
}

/** True once loadPublicDailyUpdate has run this session — keeps the auto-load one-shot. */
export function hasAttemptedPublicLoad(): boolean {
  return publicAttempted
}

/**
 * True while the public read is in flight. Lets badges say "CONNECTING"
 * instead of flashing "DATA UNAVAILABLE" during the first second of every
 * guest's visit.
 */
export function isDailyUpdateLoading(): boolean {
  return publicInFlight !== null
}
