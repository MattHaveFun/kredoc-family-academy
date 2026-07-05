import { useEffect, useMemo, useState } from 'react'
import { geoEquirectangular, geoPath, geoCircle, geoGraticule } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import landTopo from 'world-atlas/land-110m.json'
import type { MarketSymbol } from '../data/markets'
import { MARKET_GEO, isMarketOpenNow } from '../data/marketGeo'

interface WorldTradingMapProps {
  markets: MarketSymbol[]
  selectedId: string
  onSelect: (id: string) => void
}

const W = 960
const H = 480
// Crop the poles out of the viewBox — every exchange lives between the
// Arctic and ~35°S, and trimming Antarctica keeps the map dense and wide.
const VIEW_Y = 30
const VIEW_H = 370

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const projection = geoEquirectangular()
  .scale(W / (2 * Math.PI))
  .translate([W / 2, H / 2])
const path = geoPath(projection)

// Real Natural Earth coastlines (1:110m, ships locally with world-atlas —
// no runtime network fetch), rendered once as a single land silhouette.
const topo = landTopo as unknown as Topology<{ land: GeometryCollection }>
const LAND_PATH = path(feature(topo, topo.objects.land)) ?? ''
const GRATICULE_PATH = path(geoGraticule().step([30, 30])()) ?? ''

/** Subsolar longitude: where it's solar noon right now. */
function subsolarLongitude(now: Date): number {
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60
  return ((15 * (12 - utcHours) + 540) % 360) - 180
}

/** Solar declination (deg) — standard approximation, ±0.5° is plenty here. */
function solarDeclination(now: Date): number {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0)
  const dayOfYear = (now.getTime() - start) / 86_400_000
  return -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10))
}

/**
 * The night hemisphere as a projected geo-path: a 90°-radius circle on the
 * sphere centered at the antisolar point. d3-geo clips it across the
 * antimeridian, so the terminator renders as the real curved boundary
 * between day and night.
 */
function nightPath(now: Date): string {
  const lon = subsolarLongitude(now)
  const lat = solarDeclination(now)
  const antisolar: [number, number] = [lon > 0 ? lon - 180 : lon + 180, -lat]
  return path(geoCircle().center(antisolar).radius(90)()) ?? ''
}

// A couple of city pairs sit nearly on top of each other (London/Frankfurt,
// Shanghai/Hong Kong) — drop these labels below their dot instead of above.
const LABEL_BELOW = new Set(['dax', 'hangseng'])

/**
 * Flat equirectangular world map with real Natural Earth coastlines. Each
 * exchange glows at its true coordinates when it's live in its own local
 * session, and the actual day/night terminator (computed from the sun's
 * current position) sweeps across the map — the trading day, following the
 * sun around the planet.
 */
function WorldTradingMap({ markets, selectedId, onSelect }: WorldTradingMapProps) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) return
    const id = setInterval(() => forceTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const now = new Date()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const night = useMemo(() => nightPath(now), [Math.floor(now.getTime() / 60_000)])
  const byId = new Map(markets.map((m) => [m.id, m]))

  return (
    <div className="panel animate-fade-up overflow-hidden p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Follow the sun
        </h3>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-up" /> Open
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Closed
          </span>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-600">
        Each dot is a real exchange, glowing when it's live in its own local session. The shaded
        region is the night side of Earth right now — click a dot to chart it below.
      </p>

      <div className="mt-4">
        <svg viewBox={`0 ${VIEW_Y} ${W} ${VIEW_H}`} className="h-auto w-full rounded-xl">
          <defs>
            <linearGradient id="ocean-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1526" />
              <stop offset="100%" stopColor="#060b16" />
            </linearGradient>
            <linearGradient id="land-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c455e" />
              <stop offset="100%" stopColor="#1c2f44" />
            </linearGradient>
            <filter id="terminator-soft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <clipPath id="map-clip">
              <rect x={0} y={VIEW_Y} width={W} height={VIEW_H} />
            </clipPath>
          </defs>

          <rect x={0} y={VIEW_Y} width={W} height={VIEW_H} fill="url(#ocean-g)" />

          <g clipPath="url(#map-clip)">
            <path d={GRATICULE_PATH} fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth={1} />

            <path
              d={LAND_PATH}
              fill="url(#land-g)"
              stroke="rgba(125, 170, 205, 0.35)"
              strokeWidth={0.75}
            />

            {/* night side, real terminator, softened edge */}
            <path d={night} fill="rgba(2, 6, 23, 0.62)" filter="url(#terminator-soft)" />

            {/* exchange markers */}
            {MARKET_GEO.map((geo) => {
              const market = byId.get(geo.id)
              if (!geo.isReference && !market) return null
              const projected = projection([geo.lon, geo.lat])
              if (!projected) return null
              const [x, y] = projected
              const open = isMarketOpenNow(geo, now)
              const isSelected = market?.id === selectedId
              const color = geo.isReference ? '#94a3b8' : open ? '#2dd4a7' : '#7c8ba1'
              const labelY = LABEL_BELOW.has(geo.id) ? 19 : -11
              return (
                <g
                  key={geo.id}
                  transform={`translate(${x.toFixed(1)}, ${y.toFixed(1)})`}
                  style={{ cursor: market ? 'pointer' : 'default' }}
                  onClick={market ? () => onSelect(market.id) : undefined}
                >
                  {open && !geo.isReference && (
                    <circle r={8} fill={color} opacity={0.4} className="animate-ping" />
                  )}
                  <circle
                    r={isSelected ? 6 : 4.5}
                    fill={color}
                    stroke={isSelected ? '#38bdf8' : 'rgba(2,6,23,0.8)'}
                    strokeWidth={isSelected ? 2 : 1.25}
                  />
                  <text
                    x={0}
                    y={labelY}
                    textAnchor="middle"
                    className="select-none font-mono"
                    style={{ fontSize: 11, letterSpacing: '0.05em', fontWeight: 600 }}
                    fill={isSelected ? '#7dd3fc' : 'rgba(226, 232, 240, 0.9)'}
                    stroke="rgba(2, 6, 23, 0.85)"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {market ? market.symbol : geo.city.toUpperCase()}
                  </text>
                  {market && <title>{`${geo.city} — click to chart`}</title>}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {MARKET_GEO.map((geo) => {
          const market = byId.get(geo.id)
          const open = isMarketOpenNow(geo, now)
          const localTime = new Intl.DateTimeFormat('en-US', {
            timeZone: geo.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(now)
          return (
            <button
              key={geo.id}
              type="button"
              disabled={!market}
              onClick={() => market && onSelect(market.id)}
              className={`flex flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                market?.id === selectedId
                  ? 'border-sky-400/40 bg-sky-400/10'
                  : 'border-slate-400/10 bg-slate-400/5 hover:border-slate-400/20'
              } ${!market ? 'cursor-default opacity-70' : ''}`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="font-mono text-[10px] font-semibold tracking-wide text-slate-300">
                  {market ? market.symbol : geo.city.toUpperCase()}
                </span>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    geo.isReference ? 'bg-slate-500' : open ? 'bg-up' : 'bg-slate-500'
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-600">
                {geo.city} · {localTime}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WorldTradingMap
