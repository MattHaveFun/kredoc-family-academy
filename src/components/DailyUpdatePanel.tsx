import { useEffect, useState } from 'react'
import { getCachedPayload, refreshDailyUpdate, subscribe, todayStamp, type DailyPayload } from '../data/dailyUpdate'
import { clearFamilyToken } from '../data/familyAccess'

// The demand-driven trigger: nothing fetches market data or calls Gemini
// until someone here presses the button. One press can only ever cause at
// most one real generation per trading day — see worker/src/index.ts's KV
// check — so this is safe to leave visible to every signed-in family member.
function DailyUpdatePanel() {
  const [payload, setPayload] = useState<DailyPayload | null>(() => getCachedPayload())
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => subscribe(() => setPayload(getCachedPayload())), [])

  const isFresh = payload?.day === todayStamp()

  const handleClick = async () => {
    setState('loading')
    setError(null)
    const result = await refreshDailyUpdate()
    if (result.ok) {
      setState('idle')
      return
    }
    setState('error')
    setError(result.error)
    if (result.error.toLowerCase().includes('rejected')) {
      // Give the rejection message a moment on screen before bouncing back
      // to the passphrase gate — reloading immediately meant it never
      // actually painted, so a wrong passphrase looked like nothing happened.
      setTimeout(() => {
        clearFamilyToken()
        window.location.reload()
      }, 3000)
    }
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
        <button
          type="button"
          onClick={handleClick}
          disabled={state === 'loading'}
          className="rounded-lg bg-up/15 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-up ring-1 ring-inset ring-up/40 transition-colors hover:bg-up/25 disabled:cursor-wait disabled:opacity-60"
        >
          {state === 'loading' ? 'Fetching…' : isFresh ? 'Refresh' : "Get today's update"}
        </button>
      </div>
      {error && <p className="mx-auto mt-1.5 max-w-7xl font-mono text-[10px] text-down">{error}</p>}
    </div>
  )
}

export default DailyUpdatePanel
