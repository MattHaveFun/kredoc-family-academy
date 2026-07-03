import { TOP_COMPANIES } from '../data/companies'

function TickerStrip() {
  const doubled = [...TOP_COMPANIES, ...TOP_COMPANIES]

  return (
    <div className="overflow-hidden border-y border-slate-800 bg-slate-950/80">
      <div className="animate-ticker flex w-max gap-8 py-2.5">
        {doubled.map((quote, i) => {
          const isUp = quote.changePct >= 0
          return (
            <div key={`${quote.symbol}-${i}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
              <span className="font-mono font-semibold text-slate-200">{quote.symbol}</span>
              <span className="text-slate-500">{quote.name}</span>
              <span className="font-mono text-slate-300">${quote.price.toFixed(2)}</span>
              <span className={`font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(quote.changePct).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TickerStrip
