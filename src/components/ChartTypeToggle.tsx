export type ChartType = 'line' | 'candlestick'

interface ChartTypeToggleProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

function ChartTypeToggle({ value, onChange }: ChartTypeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-1">
      {(['line', 'candlestick'] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
            value === t ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {t === 'line' ? 'Line' : 'Candles'}
        </button>
      ))}
    </div>
  )
}

export default ChartTypeToggle
