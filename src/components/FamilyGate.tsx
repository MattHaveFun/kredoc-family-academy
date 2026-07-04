import { useState, type ReactNode } from 'react'
import { getFamilyToken, setFamilyToken } from '../data/familyAccess'

// The front door: nothing else in the app renders until the family
// passphrase is on file. This isn't what stops outside cost — the Worker's
// once-a-day cache does that — but it keeps the site itself invite-only.
function FamilyGate({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getFamilyToken())
  const [input, setInput] = useState('')
  const [visible, setVisible] = useState(false)

  if (token) return <>{children}</>

  const submit = () => {
    if (!input.trim()) return
    setFamilyToken(input)
    setToken(input.trim())
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <p className="eyebrow text-center">Kredoc Family Academy</p>
        <h1 className="mt-3 text-center font-display text-2xl font-bold tracking-tight text-slate-50">
          Family passphrase
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-slate-400">
          Ask whoever set up the site if you don't have it yet.
        </p>

        <div className="panel mt-8 space-y-4 p-6">
          <div className="relative">
            <input
              type={visible ? 'text' : 'password'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Passphrase"
              autoFocus
              className="w-full rounded-xl border border-slate-400/15 bg-ink-950/70 px-4 py-3 pr-12 text-slate-100 placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-sky-300"
              aria-label={visible ? 'Hide passphrase' : 'Show passphrase'}
              tabIndex={-1}
            >
              {visible ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim()}
            className="w-full rounded-xl bg-sky-400/15 px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-sky-300 ring-1 ring-inset ring-sky-400/40 transition-all duration-200 hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enter →
          </button>
        </div>
      </div>
    </div>
  )
}

export default FamilyGate
