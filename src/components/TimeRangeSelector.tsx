import { RANGE_OPTIONS, type RangeKey } from '../data/markets'

interface TimeRangeSelectorProps {
  value: RangeKey
  onChange: (range: RangeKey) => void
}

function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 ${
            value === opt.key
              ? 'bg-sky-500/20 text-sky-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
