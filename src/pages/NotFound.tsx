import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="flex min-h-[70vh] animate-fade-up flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-down/80">
        Signal lost
      </p>
      <h1 className="mt-4 font-display text-7xl font-bold tracking-tight text-slate-50">
        404
        <span className="ml-1 inline-block h-12 w-[3px] animate-blink bg-sky-400 align-baseline" />
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
        This route doesn't exist on the console. Re-route to the dashboard to resume monitoring.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-lg border border-sky-400/30 bg-sky-400/10 px-5 py-2.5 text-sm font-semibold text-sky-300 shadow-[0_0_24px_-8px_rgba(56,189,248,0.5)] transition-all duration-200 hover:bg-sky-400/20 hover:shadow-[0_0_32px_-6px_rgba(56,189,248,0.7)]"
      >
        ← Return to Dashboard
      </Link>
    </main>
  )
}

export default NotFound
