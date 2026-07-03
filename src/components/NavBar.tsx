import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/academy', label: 'Academy', end: false },
  { to: '/about', label: 'About', end: false },
]

function SessionClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="tabular-nums text-slate-300">
      {now.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  )
}

function NavBar() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-sky-400/[0.08] text-sky-300 shadow-[inset_0_-2px_0_rgba(56,189,248,0.55)]'
        : 'text-slate-400 hover:bg-slate-400/[0.06] hover:text-slate-100'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-400/10 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sky-400/25 to-sky-600/10 font-display text-base font-bold text-sky-300 shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] ring-1 ring-inset ring-sky-400/30 transition-shadow duration-300 group-hover:shadow-[0_0_32px_-4px_rgba(56,189,248,0.7)]">
            K
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold tracking-[0.08em] text-slate-50">
              KREDOC
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-slate-500">
              Family Academy
            </span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 rounded-full border border-slate-400/10 bg-ink-850/80 py-1.5 pl-3 pr-4 font-mono text-[11px] font-medium tracking-wider text-slate-400 md:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-up opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
          </span>
          <span className="text-up">SIM FEED</span>
          <span className="text-slate-600">|</span>
          <SessionClock />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-md border border-slate-400/15 bg-ink-850/60 p-2.5 text-slate-300 transition-colors hover:border-slate-400/30 sm:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
              open ? 'translate-y-[6px] rotate-45' : ''
            }`}
          />
          <span
            className={`mt-1 block h-0.5 w-5 bg-current transition-opacity duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`mt-1 block h-0.5 w-5 bg-current transition-transform duration-200 ${
              open ? '-translate-y-[6px] -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {open && (
        <nav className="animate-fade-in flex flex-col gap-1 border-t border-slate-400/10 bg-ink-950/95 px-4 py-3 backdrop-blur-xl sm:hidden">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

export default NavBar
