import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { CATEGORY_META, LESSONS, type LessonCategory } from '../data/lessons'
import { useProfiles } from '../context/ProfileContext'

// The bird's-eye view: every lesson as a node, conceptual relationships as
// edges, laid out by a d3 force simulation. Node size = lesson depth, color =
// category, glow = visited (per profile). Lazy-loaded — d3-force ships only
// to visitors who open this page.

const WIDTH = 900
const HEIGHT = 620

interface MapNode extends SimulationNodeDatum {
  id: string
  title: string
  category: LessonCategory
  radius: number
}

interface MapLink extends SimulationLinkDatum<MapNode> {
  source: string | MapNode
  target: string | MapNode
}

function buildGraph(): { nodes: MapNode[]; links: MapLink[] } {
  const nodes: MapNode[] = LESSONS.map((l) => ({
    id: l.id,
    title: l.title,
    category: l.category,
    radius: 18 + l.depth * 8,
  }))
  const seen = new Set<string>()
  const links: MapLink[] = []
  for (const lesson of LESSONS) {
    for (const target of lesson.connects) {
      if (!LESSONS.some((l) => l.id === target)) continue
      const key = [lesson.id, target].sort().join('|')
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ source: lesson.id, target })
    }
  }
  return { nodes, links }
}

function KnowledgeMap() {
  const navigate = useNavigate()
  const { activeProfile } = useProfiles()
  const [hovered, setHovered] = useState<string | null>(null)
  const [, forceRender] = useState(0)
  const graph = useRef(buildGraph())
  const settled = useRef(false)

  useEffect(() => {
    const { nodes, links } = graph.current
    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink<MapNode, MapLink>(links)
          .id((d) => d.id)
          .distance(150)
          .strength(0.4),
      )
      .force('charge', forceManyBody().strength(-420))
      .force('center', forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('collide', forceCollide<MapNode>().radius((d) => d.radius + 26))
      .on('tick', () => {
        // Keep nodes inside the frame.
        for (const n of nodes) {
          n.x = Math.max(n.radius + 10, Math.min(WIDTH - n.radius - 10, n.x ?? WIDTH / 2))
          n.y = Math.max(n.radius + 10, Math.min(HEIGHT - n.radius - 10, n.y ?? HEIGHT / 2))
        }
        forceRender((v) => v + 1)
      })
      .on('end', () => {
        settled.current = true
      })

    return () => {
      simulation.stop()
    }
  }, [])

  const legend = useMemo(() => {
    const cats = new Set(LESSONS.map((l) => l.category))
    return [...cats].map((c) => ({ category: c, ...CATEGORY_META[c] }))
  }, [])

  const { nodes, links } = graph.current
  const hoveredLesson = hovered ? LESSONS.find((l) => l.id === hovered) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Knowledge map</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50">
            Everything you know. Everything still out there.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            Each node is a lesson; each line is a real conceptual connection. Bigger nodes go
            deeper. Glowing nodes are ones you've visited. Click any node to jump in.
          </p>
        </div>
        <Link
          to="/academy"
          className="rounded-xl border border-slate-400/15 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-300 transition-colors hover:border-sky-400/40 hover:text-sky-300"
        >
          ← Academy home
        </Link>
      </header>

      <div className="panel animate-fade-up relative mt-8 overflow-hidden" style={{ animationDelay: '120ms' }}>
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full">
          {/* edges */}
          {links.map((link, i) => {
            const s = link.source as MapNode
            const t = link.target as MapNode
            if (s.x === undefined || t.x === undefined) return null
            const active = hovered !== null && (s.id === hovered || t.id === hovered)
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={active ? 'rgba(56, 189, 248, 0.55)' : 'rgba(148, 163, 184, 0.16)'}
                strokeWidth={active ? 2 : 1.2}
                style={{ transition: 'stroke 200ms ease' }}
              />
            )
          })}

          {/* nodes */}
          {nodes.map((node) => {
            const color = CATEGORY_META[node.category].color
            const visited = activeProfile?.visitedLessons.includes(node.id) ?? false
            const done = activeProfile?.completedLessons.includes(node.id) ?? false
            const isHovered = hovered === node.id
            if (node.x === undefined || node.y === undefined) return null
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/academy/lesson/${node.id}`)}
              >
                {/* gentle idle float once the layout settles */}
                <g className={settled.current ? 'animate-node-float' : undefined} style={{ animationDelay: `${(node.index ?? 0) * 400}ms` }}>
                  {visited && (
                    <circle r={node.radius + 7} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={2}>
                      <animate attributeName="r" values={`${node.radius + 5};${node.radius + 9};${node.radius + 5}`} dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r={node.radius}
                    fill={`${color}${visited ? '33' : '14'}`}
                    stroke={color}
                    strokeWidth={isHovered ? 2.5 : done ? 2 : 1.2}
                    strokeOpacity={visited ? 0.95 : 0.5}
                    style={{
                      filter: visited || isHovered ? `drop-shadow(0 0 ${isHovered ? 14 : 8}px ${color}88)` : undefined,
                      transition: 'stroke-width 200ms ease',
                    }}
                  />
                  {done && (
                    <text textAnchor="middle" dy="0.35em" fill={color} fontSize={node.radius * 0.8} fontFamily="monospace">
                      ✓
                    </text>
                  )}
                  <text
                    textAnchor="middle"
                    y={node.radius + 16}
                    fill={isHovered ? '#e2e8f0' : '#94a3b8'}
                    fontSize={12}
                    fontWeight={isHovered ? 600 : 400}
                    style={{ transition: 'fill 200ms ease', pointerEvents: 'none' }}
                  >
                    {node.title.length > 24 ? `${node.title.slice(0, 23)}…` : node.title}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        {/* hover detail */}
        {hoveredLesson && (
          <div className="pointer-events-none absolute left-4 top-4 max-w-xs animate-fade-in rounded-xl border border-slate-400/15 bg-ink-950/95 px-4 py-3 shadow-xl backdrop-blur">
            <p
              className="font-mono text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: CATEGORY_META[hoveredLesson.category].color }}
            >
              {CATEGORY_META[hoveredLesson.category].label}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-100">{hoveredLesson.title}</p>
            <p className="mt-1 text-xs italic leading-snug text-slate-400">{hoveredLesson.tagline}</p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-600">
              Click to open lesson
            </p>
          </div>
        )}

        {/* legend */}
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-400/10 px-5 py-3">
          {legend.map((item) => (
            <span key={item.category} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-slate-600">
            {activeProfile ? `${activeProfile.visitedLessons.length}/${LESSONS.length} explored` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeMap
