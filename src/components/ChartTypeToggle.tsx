export type ChartType = 'line' | 'candlestick'

interface ChartTypeToggleProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-400/10 bg-ink-950/60 p-1 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)]">
      {(['line', 'candlestick'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-md px-3 py-1 font-mono text-xs font-semibold transition-all duration-200 ${
            value === t
              ? 'bg-sky-400/15 text-sky-300 shadow-[0_0_14px_-4px_rgba(56,189,248,0.6)]'
              : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          {t === 'line' ? 'Line' : 'Candles'}
        </button>
      ))}
    </div>
  )
}

export default ChartTypeToggle
