import { useEffect, useState } from 'react'
import {
  getCachedPayload,
  hasAttemptedPublicLoad,
  loadPublicDailyUpdate,
  refreshDailyUpdate,
  subscribe,
  todayStamp,
  type DailyPayload,
} from '../data/dailyUpdate'
import { clearFamilyToken, getFamilyToken, setFamilyToken } from '../data/familyAccess'

// Mostly a freshness label now.
//
// The Worker's cron builds each trading day on its own, and this pulls whatever
// it built — no passphrase, no cost, no button. Everyone sees the same thing,
// and nothing on the site waits for a person.
//
// The rebuild control stays for the day the cron misses. It's deliberately
// quiet, and a wrong passphrase costs a visitor nothing: declined once,
// plainly, leaving all the data on screen. It must never re-prompt into a loop.
function DailyUpdatePanel() {
  const [payload, setPayload] = useState<DailyPayload | null>(() => getCachedPayload())
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [autoLoading, setAutoLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState(() => Boolean(getFamilyToken()))
  const [signingIn, setSigningIn] = useState(false)
  const [passphrase, setPassphrase] = useState('')

  useEffect(() => subscribe(() => setPayload(getCachedPayload())), [])

  // Public read-through, once per page load. Skipped when this device already
  // holds today's payload, so the usual case is no network at all.
  useEffect(() => {
    if (hasAttemptedPublicLoad()) return
    const cached = getCachedPayload()
    if (cached && cached.day === todayStamp()) return
    setAutoLoading(true)
    loadPublicDailyUpdate().then((result) => {
      setAutoLoading(false)
      // Only surface the trace when it went wrong — a guest shouldn't read
      // HTTP chatter on a normal visit, but a blank dashboard needs to stay
      // diagnosable from a screenshot.
      if (!result.ok) setDebug(`${new Date().toLocaleTimeString()} — ${result.debug}`)
    })
  }, [])

  const isFresh = payload?.day === todayStamp()
  const buttonLabel = state === 'loading' ? 'Fetching…' : isFresh ? 'Refresh' : "Rebuild today's data"

  const handleClick = async () => {
    setState('loading')
    setError(null)
    const result = await refreshDailyUpdate()
    setDebug(`${new Date().toLocaleTimeString()} — ${result.debug}`)
    if (result.ok) {
      setState('idle')
      return
    }
    setState('error')
    setError(result.error ?? 'Unknown error')
    if (result.debug.includes('401')) {
      // Wrong passphrase. Forget it so the next attempt starts clean, but do
      // NOT reopen the input — re-prompting on every rejection is what turned
      // a single "no" into a loop nobody could get out of. The message says
      // what happened; the "Family refresh" link is there if they want
      // another go.
      clearFamilyToken()
      setHasToken(false)
      setSigningIn(false)
    }
  }

  const submitPassphrase = () => {
    if (!passphrase.trim()) return
    setFamilyToken(passphrase)
    setPassphrase('')
    setHasToken(true)
    setSigningIn(false)
  }

  const changePassphrase = () => {
    setPassphrase('')
    setSigningIn(true)
  }

  return (
    <div className="border-b border-slate-400/10 bg-ink-950/40 px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          {payload
            ? `Markets as of ${new Date(`${payload.day}T12:00:00`).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })} close`
            : autoLoading
              ? 'Loading market data…'
              : 'No market data cached yet'}
        </p>

        {signingIn ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitPassphrase()}
              placeholder="Family passphrase"
              autoFocus
              className="w-40 rounded-lg border border-slate-400/15 bg-ink-950/70 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={submitPassphrase}
              disabled={!passphrase.trim()}
              className="rounded-lg bg-sky-400/15 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-colors hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setSigningIn(false)}
              className="font-mono text-[10px] uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        ) : hasToken ? (
          <span className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClick}
              disabled={state === 'loading'}
              className="rounded-lg bg-up/15 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-up ring-1 ring-inset ring-up/40 transition-colors hover:bg-up/25 disabled:cursor-wait disabled:opacity-60"
            >
              {buttonLabel}
            </button>
            <button
              type="button"
              onClick={changePassphrase}
              className="font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-slate-300"
            >
              Change passphrase
            </button>
          </span>
        ) : (
          // Understated on purpose. This is a family shortcut, not a gate —
          // nothing on the site is waiting behind it.
          <button
            type="button"
            onClick={() => setSigningIn(true)}
            className="font-mono text-[10px] uppercase tracking-wider text-slate-600 transition-colors hover:text-sky-300"
          >
            Family refresh
          </button>
        )}
      </div>
      {signingIn && (
        <p className="mx-auto mt-1.5 max-w-7xl text-[10px] leading-relaxed text-slate-500">
          Optional, and almost never needed — the day's numbers publish automatically after the market
          closes. This is only here to rebuild by hand if that ever misses.
        </p>
      )}
      {error && <p className="mx-auto mt-1.5 max-w-7xl font-mono text-[10px] text-amber-400/80">{error}</p>}
      {debug && (
        <p className="mx-auto mt-1 max-w-7xl select-text break-all font-mono text-[9px] text-slate-600">{debug}</p>
      )}
    </div>
  )
}

export default DailyUpdatePanel
