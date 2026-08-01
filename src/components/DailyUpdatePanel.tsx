import { useEffect, useState } from 'react'
import { getCachedPayload, refreshDailyUpdate, subscribe, todayStamp, type DailyPayload } from '../data/dailyUpdate'
import { clearFamilyToken, getFamilyToken, setFamilyToken } from '../data/familyAccess'

// The demand-driven trigger: nothing fetches market data or calls Gemini
// until someone here presses the button. One press can only ever cause at
// most one real generation per trading day — see worker/src/index.ts's KV
// check — so this is safe to leave visible to everyone, signed in or not.
//
// The family passphrase used to be a full-screen wall in front of the whole
// site. It now only gates this one button — everything else (profiles,
// lessons, the dashboard) is open to anyone, including friends the kids want
// to show the site to. Entering the passphrase here just unlocks live daily
// updates on this device; it's remembered until changed or cleared.
function DailyUpdatePanel() {
  const [payload, setPayload] = useState<DailyPayload | null>(() => getCachedPayload())
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState(() => Boolean(getFamilyToken()))
  const [signingIn, setSigningIn] = useState(false)
  const [passphrase, setPassphrase] = useState('')

  useEffect(() => subscribe(() => setPayload(getCachedPayload())), [])

  const isFresh = payload?.day === todayStamp()

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
    if (result.error?.toLowerCase().includes('rejected')) {
      // Wrong passphrase — clear it and drop back into the inline sign-in
      // right here, instead of bouncing the whole page.
      clearFamilyToken()
      setHasToken(false)
      setSigningIn(true)
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
            : 'No update fetched yet today'}
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
              {state === 'loading' ? 'Fetching…' : isFresh ? 'Refresh' : "Get today's update"}
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
          <button
            type="button"
            onClick={() => setSigningIn(true)}
            className="rounded-lg border border-slate-400/20 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:border-sky-400/40 hover:text-sky-300"
          >
            Unlock live updates
          </button>
        )}
      </div>
      {error && <p className="mx-auto mt-1.5 max-w-7xl font-mono text-[10px] text-down">{error}</p>}
      {debug && (
        <p className="mx-auto mt-1 max-w-7xl select-text break-all font-mono text-[9px] text-slate-600">{debug}</p>
      )}
    </div>
  )
}

export default DailyUpdatePanel
