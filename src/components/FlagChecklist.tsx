import { useMemo, useState } from 'react'
import { GREEN_FLAGS, RED_FLAGS, type Flag } from '../data/stockPicking'
import InfoDisclosure from './InfoDisclosure'

// The flag test — a working checklist for any stock, not just the six above.
// Deliberately not scored out of 100 and deliberately never conclusive: the
// verdict describes the *business*, then reminds you that price is a separate
// question the checklist cannot answer. Nothing is saved anywhere; it resets
// when you leave, because it's a thinking tool rather than a record.

function FlagRow({
  flag,
  checked,
  onToggle,
  tone,
}: {
  flag: Flag
  checked: boolean
  onToggle: () => void
  tone: 'green' | 'red'
}) {
  const [open, setOpen] = useState(false)
  // Written out rather than interpolated — Tailwind only generates classes it
  // can see as literal strings in the source.
  const boxChecked =
    tone === 'green' ? 'border-up/60 bg-up/20 text-up' : 'border-down/60 bg-down/20 text-down'

  return (
    <div
      className={`rounded-xl border transition-colors duration-200 ${
        checked
          ? tone === 'green'
            ? 'border-up/30 bg-up/[0.06]'
            : 'border-down/30 bg-down/[0.06]'
          : 'border-slate-400/10 bg-slate-400/[0.02]'
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={onToggle}
          role="checkbox"
          aria-checked={checked}
          aria-label={flag.label}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[10px] leading-none transition-all duration-200 ${
            checked ? boxChecked : 'border-slate-400/30 text-transparent hover:border-slate-400/60'
          }`}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onToggle} className="block w-full text-left">
            <span
              className={`text-[13px] font-medium leading-snug ${checked ? 'text-slate-100' : 'text-slate-400'}`}
            >
              {flag.label}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 transition-colors hover:text-sky-300"
            aria-expanded={open}
          >
            {open ? '− How to check it' : '+ How to check it'}
          </button>
          {open && (
            <div className="animate-fade-in mt-2 space-y-2">
              <p className="text-[12px] leading-relaxed text-slate-400">{flag.test}</p>
              <p className="border-l-2 border-slate-400/20 pl-2.5 text-[11px] leading-relaxed text-slate-500">
                <span className="font-mono uppercase tracking-wider text-slate-600">Where: </span>
                {flag.where}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface Verdict {
  label: string
  color: string
  body: string
}

function verdictFor(greens: number, reds: number, touched: boolean): Verdict {
  if (!touched) {
    return {
      label: 'Nothing checked yet',
      color: '#64748b',
      body: 'Pull up a company you are curious about — one of the six above, or anything else — and work down both columns honestly. The goal is not a high score. The goal is finding out how many of these you cannot actually answer yet.',
    }
  }
  if (reds >= 3) {
    return {
      label: 'Too many holes',
      color: '#ff6b7f',
      body: 'Three or more red flags is rarely bad luck; it is usually a pattern. None of these individually condemns a company, but together they describe a business whose story depends on things going right. If you still find it compelling, write down exactly which red flag you are betting against and why — and size the position like someone who might be wrong.',
    }
  }
  if (greens >= 6 && reds <= 1) {
    return {
      label: 'A genuinely strong business',
      color: '#2dd4a7',
      body: 'This is what a durable company looks like on paper: growing, profitable in cash terms, defensible, and not funding itself by shrinking your ownership. Now the part the checklist cannot help with — a wonderful business bought at a ridiculous price is still a bad investment. Everything above is about quality. Price is a separate question, and it is the one people skip.',
    }
  }
  if (greens >= 4) {
    return {
      label: 'Decent, with real questions',
      color: '#fbbf24',
      body: 'More right than wrong, but the gaps matter. Go back to the boxes you left unchecked and ask whether that is because the company fails the test or because you have not looked yet. Those are very different situations, and only one of them is the company\'s fault.',
    }
  }
  return {
    label: 'Mostly unanswered',
    color: '#94a3b8',
    body: 'Not much is ticked in either column, which usually means the research has not happened yet rather than that the company is bad. That is a completely fine place to be — it is just not a place to buy from. Use the prompt below to close the gaps.',
  }
}

function FlagChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const greens = useMemo(() => GREEN_FLAGS.filter((f) => checked.has(f.id)).length, [checked])
  const reds = useMemo(() => RED_FLAGS.filter((f) => checked.has(f.id)).length, [checked])
  const verdict = verdictFor(greens, reds, checked.size > 0)

  // A quality reading, not a score: greens lift it, reds cut deeper than
  // greens lift, because one accounting problem outweighs three good quarters.
  const reading = Math.max(
    0,
    Math.min(100, (greens / GREEN_FLAGS.length) * 100 - (reds / RED_FLAGS.length) * 130),
  )

  return (
    <div className="panel animate-fade-up p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            The flag test
          </h3>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-500">
            Sixteen questions that separate a business worth owning from a story worth avoiding.
            Tick what you can honestly confirm about a company you are researching. Nothing is
            saved — this is a thinking tool, not a form.
          </p>
        </div>
        {checked.size > 0 && (
          <button
            type="button"
            onClick={() => setChecked(new Set())}
            className="shrink-0 rounded-lg border border-slate-400/15 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:border-slate-400/35 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* the reading */}
      <div className="mt-5 rounded-2xl border border-slate-400/10 bg-ink-950/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p
            className="font-mono text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-500"
            style={{ color: verdict.color }}
          >
            {verdict.label}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
            {greens} green · {reds} red
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-400/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${reading}%`,
              background: `linear-gradient(90deg, ${verdict.color}77, ${verdict.color})`,
            }}
          />
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{verdict.body}</p>
      </div>

      {/* the two columns */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-up">
            Green flags · signs of a good business
          </p>
          <div className="mt-3 space-y-2">
            {GREEN_FLAGS.map((f) => (
              <FlagRow key={f.id} flag={f} checked={checked.has(f.id)} onToggle={() => toggle(f.id)} tone="green" />
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-down">
            Red flags · reasons to walk away
          </p>
          <div className="mt-3 space-y-2">
            {RED_FLAGS.map((f) => (
              <FlagRow key={f.id} flag={f} checked={checked.has(f.id)} onToggle={() => toggle(f.id)} tone="red" />
            ))}
          </div>
        </div>
      </div>

      <InfoDisclosure
        what="A sixteen-point checklist — eight signs of a durable business, eight warnings — with the specific financial statement each one lives on. It gives a quality reading, never a recommendation, and it deliberately weights red flags heavier than green ones."
        why="Professionals do not pick stocks by having better hunches; they pick by running the same boring checks every single time, on every single company, including the exciting ones. The checklist is the entire skill. Its most useful output is not a score — it is discovering which questions you cannot answer yet."
        academyAnchor="red-flags"
      />
    </div>
  )
}

export default FlagChecklist
