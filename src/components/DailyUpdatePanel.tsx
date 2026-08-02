import { useEffect, useState } from 'react'
import {
  getCachedPayload,
  hasAttemptedPublicLoad,
  loadPublicDailyUpdate,
  subscribe,
  todayStamp,
  type DailyPayload,
} from '../data/dailyUpdate'

// A freshness label, and nothing else.
//
// The Worker's cron builds each trading day on its own and this pulls whatever
// it built — no passphrase, no cost, no button. The manual rebuild control
// that used to live here is gone: the cron has made it dead weight, a browser
// reload re-reads the day's payload for free, and the one genuine fallback (a
// missed cron) is a one-line POST from a terminal, documented in
// worker/README.md. A control nobody needs is a control everybody has to
// wonder about.
function DailyUpdatePanel() {
  const [payload, setPayload] = useState<DailyPayload | null>(() => getCachedPayload())
  const [autoLoading, setAutoLoading] = useState(false)
  const [debug, setDebug] = useState<string | null>(null)

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

  // MM/DD/YYYY, spelled out. "Today's close" read as a claim about today's
  // trading, which it never was — this is the session the numbers came from.
  const closeDate = payload
    ? new Date(`${payload.day}T12:00:00`).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : null

  return (
    <div className="border-b border-slate-400/10 bg-ink-950/40 px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          {closeDate
            ? `Data based on close of ${closeDate}`
            : autoLoading
              ? 'Loading market data…'
              : 'No market data cached yet'}
        </p>
      </div>
      {debug && (
        <p className="mx-auto mt-1 max-w-7xl select-text break-all font-mono text-[9px] text-slate-600">{debug}</p>
      )}
    </div>
  )
}

export default DailyUpdatePanel
