import { useMemo, useState } from 'react'
import { COMPANY_PROFILES, PROMPT_SECTIONS, buildResearchPrompt } from '../data/stockPicking'
import InfoDisclosure from './InfoDisclosure'

// The research prompt. The point isn't to have an AI hand over a verdict — it's
// to have it walk you through the same interrogation a professional would run,
// in an order that makes the bear case unavoidable and asks it to show its
// arithmetic. Toggle sections off and you can watch the prompt get lazier.

interface ResearchPromptBuilderProps {
  selectedId: string
  onSelect: (id: string) => void
}

const DEFAULT_ON = PROMPT_SECTIONS.filter((s) => s.defaultOn).map((s) => s.id)

function ResearchPromptBuilder({ selectedId, onSelect }: ResearchPromptBuilderProps) {
  const [active, setActive] = useState<string[]>(DEFAULT_ON)
  const [customTicker, setCustomTicker] = useState('')
  const [copied, setCopied] = useState(false)

  const known = COMPANY_PROFILES.find((p) => p.id === selectedId) ?? COMPANY_PROFILES[0]
  const trimmed = customTicker.trim().toUpperCase()
  // A typed-in ticker takes over: the whole point is that this works for the
  // random company someone heard about, not only the six on this page. Memoized
  // so the prompt below isn't rebuilt on every keystroke elsewhere.
  const target = useMemo(
    () => (trimmed ? { symbol: trimmed, name: trimmed } : { symbol: known.symbol, name: known.name }),
    [trimmed, known.symbol, known.name],
  )

  // Keep the prompt's numbering in the authored order no matter what order the
  // reader clicked the toggles in.
  const orderedIds = useMemo(
    () => PROMPT_SECTIONS.filter((s) => active.includes(s.id)).map((s) => s.id),
    [active],
  )
  const prompt = useMemo(() => buildResearchPrompt(target, orderedIds), [target, orderedIds])

  const toggle = (id: string) =>
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable — the text is still selectable
    }
  }

  return (
    <div className="panel animate-fade-up p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Ask better questions
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-500">
            A research prompt you can paste into Claude or any capable AI. It never asks "should I
            buy this" — that question invites a confident answer nobody can honestly give. It asks
            for the business, the moat, the numbers, and the strongest case <em>against</em>, with
            the working shown so you can check it.
          </p>
        </div>
      </div>

      {/* who are we researching */}
      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            One of these six
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {COMPANY_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setCustomTicker('')
                  onSelect(p.id)
                }}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wide transition-all duration-200 ${
                  !trimmed && p.id === known.id
                    ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
                    : 'border-transparent text-slate-500 hover:border-slate-400/15 hover:text-slate-200'
                }`}
              >
                {p.symbol}
              </button>
            ))}
          </div>
        </div>
        <div className="font-mono text-xs text-slate-600">or</div>
        <label className="block">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Any other ticker
          </span>
          <input
            type="text"
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.slice(0, 8))}
            placeholder="e.g. COST"
            maxLength={8}
            className="mt-2 block w-32 rounded-lg border border-slate-400/15 bg-ink-950/70 px-3 py-1.5 font-mono text-sm uppercase tracking-wide text-slate-100 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-600 focus:border-sky-400/50 focus:outline-none"
          />
        </label>
      </div>

      {/* section toggles */}
      <div className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            What to ask about
          </p>
          <button
            type="button"
            onClick={() => setActive(active.length === PROMPT_SECTIONS.length ? DEFAULT_ON : PROMPT_SECTIONS.map((s) => s.id))}
            className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 transition-colors hover:text-sky-300"
          >
            {active.length === PROMPT_SECTIONS.length ? 'Back to essentials' : 'Ask everything'}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PROMPT_SECTIONS.map((s) => {
            const on = active.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-200 ${
                  on
                    ? 'border-sky-400/30 bg-sky-400/[0.07]'
                    : 'border-slate-400/10 bg-slate-400/[0.02] hover:border-slate-400/25'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[10px] leading-none transition-all duration-200 ${
                    on
                      ? 'border-sky-400/60 bg-sky-400/20 text-sky-300'
                      : 'border-slate-400/30 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span className="min-w-0">
                  <span className={`block text-[13px] font-medium ${on ? 'text-slate-100' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-600">{s.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* the prompt */}
      <div className="mt-6 rounded-2xl border border-slate-400/10 bg-ink-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-400/10 px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            Your prompt · {target.symbol} · {orderedIds.length} section
            {orderedIds.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={copy}
            disabled={orderedIds.length === 0}
            className="rounded-lg border border-slate-400/20 px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? '✓ Copied' : 'Copy prompt'}
          </button>
        </div>
        {orderedIds.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-600">
            Turn on at least one section and the prompt assembles itself here.
          </p>
        ) : (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap px-4 py-4 text-[12.5px] leading-relaxed text-slate-300">
            {prompt}
          </pre>
        )}
      </div>

      {/* how to use the answer */}
      <div className="mt-5 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4 sm:p-5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-300">
          What to do with the answer
        </p>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-300">
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-amber-400/70">01</span>
            <span>
              Check two numbers by hand. Any two. AI models get financial figures wrong — sometimes
              subtly, sometimes badly — and one deliberately verified number tells you how much to
              trust the other twenty.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-amber-400/70">02</span>
            <span>
              Read the bear case twice, and notice whether you skimmed it the first time. Everyone
              does. That reflex is the most expensive habit in investing.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-amber-400/70">03</span>
            <span>
              Save the four-sentence thesis somewhere you will find it again. In two years it is
              either a receipt for good judgment or the cheapest lesson you will ever get — and both
              of those are worth having.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-amber-400/70">04</span>
            <span>
              If the answer makes you feel certain, be suspicious of the answer. Good research
              usually leaves you with a clearer view of what you <em>do not</em> know.
            </span>
          </li>
        </ul>
      </div>

      <InfoDisclosure
        what="A research prompt built for whichever company you pick, assembled from toggleable sections — the business model, five years of fundamentals, the moat, a peer comparison, what the valuation already assumes, the bear case, and a short thesis you can check later."
        why="An AI will happily tell you a stock is a great buy, and that answer is worth nothing, because it is generated to satisfy you. The way to get real value is to ask for structure, evidence, and the argument against — then verify. Learning to aim the question is a more durable skill than any single answer."
        academyAnchor="research"
      />
    </div>
  )
}

export default ResearchPromptBuilder
