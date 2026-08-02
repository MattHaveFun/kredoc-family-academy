import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfiles } from '../context/ProfileContext'
import { ALL_AVATARS, AVATAR_BY_ID, isAvatarUnlocked, type AvatarDef } from '../data/avatars'

// The payoff moment. An avatar earned silently in localStorage is an avatar
// nobody knows they have — so anything that unlocks while you're on the site
// says so once, in the corner, and gets out of the way.
//
// It only ever announces changes it watched happen: the first render of a
// profile takes a baseline, so signing in doesn't replay a year of history.
function AvatarUnlockToast() {
  const { activeProfile, setAvatar } = useProfiles()
  const [queue, setQueue] = useState<AvatarDef[]>([])
  const baseline = useRef<{ profileId: string | null; ids: Set<string> }>({ profileId: null, ids: new Set() })

  useEffect(() => {
    if (!activeProfile) {
      baseline.current = { profileId: null, ids: new Set() }
      setQueue([])
      return
    }
    const unlockedNow = ALL_AVATARS.filter((a) => isAvatarUnlocked(a, activeProfile)).map((a) => a.id)
    if (baseline.current.profileId !== activeProfile.id) {
      baseline.current = { profileId: activeProfile.id, ids: new Set(unlockedNow) }
      return
    }
    const fresh = unlockedNow.filter((id) => !baseline.current.ids.has(id))
    if (fresh.length === 0) return
    fresh.forEach((id) => baseline.current.ids.add(id))
    setQueue((q) => [...q, ...fresh.map((id) => AVATAR_BY_ID[id]).filter(Boolean)])
  }, [activeProfile])

  const current = queue[0] ?? null

  // Each one gets its own moment, then hands off to the next in the queue.
  useEffect(() => {
    if (!current) return
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 7000)
    return () => clearTimeout(t)
  }, [current])

  if (!current) return null

  return (
    <div
      className="animate-fade-up fixed bottom-4 right-4 z-50 w-[min(20rem,calc(100vw-2rem))]"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3 rounded-2xl border p-4 shadow-panel backdrop-blur"
        style={{
          borderColor: `${current.color}55`,
          backgroundColor: 'rgba(6,10,18,0.94)',
          boxShadow: `0 0 40px -16px ${current.color}, 0 24px 48px -24px rgba(0,0,0,0.8)`,
        }}
      >
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl"
          style={{ backgroundColor: `${current.color}1f`, boxShadow: `inset 0 0 0 2px ${current.color}66` }}
        >
          {current.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: current.color }}>
            Avatar unlocked
          </p>
          <p className="truncate text-sm font-semibold text-slate-100">{current.label}</p>
          <p className="mt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAvatar(current.id)
                setQueue((q) => q.slice(1))
              }}
              className="font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-300 transition-colors hover:text-sky-200"
            >
              Wear it
            </button>
            <Link
              to="/profile"
              onClick={() => setQueue((q) => q.slice(1))}
              className="font-mono text-[10px] uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-200"
            >
              Collection
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setQueue((q) => q.slice(1))}
          aria-label="Dismiss"
          className="shrink-0 self-start text-slate-600 transition-colors hover:text-slate-300"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default AvatarUnlockToast
