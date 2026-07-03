import { NavLink, Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import ProfileGate from './ProfileGate'
import WelcomeBack from './WelcomeBack'
import { FeedStatusProvider } from '../context/FeedStatusContext'
import { ProfileProvider, useProfiles } from '../context/ProfileContext'

const FOOTER_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/academy', label: 'Academy', end: false },
  { to: '/about', label: 'About', end: false },
]

function Shell() {
  const { activeProfile } = useProfiles()

  return (
    <div className="relative flex min-h-screen flex-col text-slate-100">
      <NavBar />
      <main className="flex-1">
        {activeProfile ? (
          <>
            <WelcomeBack />
            <Outlet />
          </>
        ) : (
          <ProfileGate />
        )}
      </main>

      <footer className="mt-16 border-t border-slate-400/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400/20 to-sky-600/10 font-display text-sm font-bold text-sky-300 ring-1 ring-inset ring-sky-400/25">
              K
            </span>
            <div>
              <p className="font-display text-sm font-semibold tracking-[0.08em] text-slate-100">
                KREDOC <span className="text-slate-500">FAMILY ACADEMY</span>
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                The language of markets, translated for everyone at the table.
              </p>
            </div>
          </div>

          <nav className="flex gap-6">
            {FOOTER_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-sky-300"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <p className="max-w-xs font-mono text-[11px] leading-relaxed text-slate-600">
            Market data is provided by Twelve Data and labeled honestly everywhere it appears: LIVE
            when fresh from the feed, CACHED with its age when served from memory, and DATA
            UNAVAILABLE when neither exists. Educational only — never investment advice.
          </p>
        </div>
        <div className="border-t border-slate-400/5 py-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-slate-700">
          Kredoc Family Academy
        </div>
      </footer>
    </div>
  )
}

function Layout() {
  return (
    <ProfileProvider>
      <FeedStatusProvider>
        <Shell />
      </FeedStatusProvider>
    </ProfileProvider>
  )
}

export default Layout
