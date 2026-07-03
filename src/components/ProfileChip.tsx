import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfiles } from '../context/ProfileContext'

// The avatar/name chip in the NavBar. Opens a dropdown to switch profiles,
// visit the profile page, or return to the "who's learning" gate.
function ProfileChip() {
  const { profiles, activeProfile, selectProfile, signOut } = useProfiles()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!activeProfile) return null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-slate-400/15 bg-ink-850/80 py-1 pl-1 pr-3 transition-colors hover:border-slate-400/30"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="grid h-7 w-7 place-items-center rounded-full text-sm"
          style={{ backgroundColor: `${activeProfile.color}22`, boxShadow: `inset 0 0 0 1.5px ${activeProfile.color}88` }}
        >
          {activeProfile.emoji}
        </span>
        <span className="max-w-[90px] truncate text-xs font-semibold text-slate-200">{activeProfile.name}</span>
        <span className={`text-[9px] text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-400/15 bg-ink-900/95 shadow-card backdrop-blur-xl"
        >
          <div className="border-b border-slate-400/10 px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-600">Learning as</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-100">
              {activeProfile.emoji} {activeProfile.name}
            </p>
          </div>
          {profiles.filter((p) => p.id !== activeProfile.id).length > 0 && (
            <div className="border-b border-slate-400/10 py-1">
              {profiles
                .filter((p) => p.id !== activeProfile.id)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      selectProfile(p.id)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-400/[0.07] hover:text-slate-100"
                  >
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full text-xs"
                      style={{ backgroundColor: `${p.color}22`, boxShadow: `inset 0 0 0 1px ${p.color}88` }}
                    >
                      {p.emoji}
                    </span>
                    Switch to {p.name}
                  </button>
                ))}
            </div>
          )}
          <div className="py-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-400/[0.07] hover:text-slate-100"
            >
              My progress & settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                signOut()
                setOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-slate-400 transition-colors hover:bg-slate-400/[0.07] hover:text-slate-100"
            >
              Who's learning today?
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileChip
