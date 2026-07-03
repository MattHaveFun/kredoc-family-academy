import { RANGE_OPTIONS, type RangeKey } from '../data/markets'

interface TimeRangeSelectorProps {
  value: RangeKey
  onChange: (range: RangeKey) => void
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-400/10 bg-ink-950/60 p-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)]">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-md px-2.5 py-1 font-mono text-xs font-semibold transition-all duration-200 sm:px-3 ${
            value === opt.key
              ? 'bg-sky-400/15 text-sky-300 shadow-[0_0_14px_-4px_rgba(56,189,248,0.6)]'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
