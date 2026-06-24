'use client'

import { useLayoutEffect, useRef, useState } from 'react'

// Side-to-side offsets that give the path its winding shape (repeats every 8).
const WAVE = [0, 55, 80, 55, 0, -55, -80, -55]

// Renders the levels as a winding path of circular nodes connected by dotted
// lines. The connectors are drawn in an SVG layer behind the nodes; their
// endpoints are measured from the real DOM so they always track the responsive
// zigzag layout (and re-measure on resize).
export default function PathMap({ levels, getLevelStatus, currentLevelId, onSelect }) {
  const containerRef = useRef(null)
  const nodeRefs = useRef({}) // level_id -> DOM node
  const [layout, setLayout] = useState({ width: 0, height: 0, points: [] })

  // Precompute display metadata without mutating during render.
  const items = levels.map((level, i) => ({
    level,
    offset: WAVE[i % WAVE.length],
    startsUnit: i === 0 || levels[i - 1].archetype_stage !== level.archetype_stage,
  }))

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current
      if (!container) return
      const base = container.getBoundingClientRect()
      const points = levels.map((level) => {
        const el = nodeRefs.current[level.level_id]
        if (!el) return null
        const r = el.getBoundingClientRect()
        return {
          id: level.level_id,
          x: r.left - base.left + r.width / 2,
          y: r.top - base.top + r.height / 2,
        }
      })
      setLayout({ width: base.width, height: base.height, points })
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [levels])

  // Build smooth S-curve connectors between consecutive nodes within a unit.
  const connectors = []
  for (let i = 0; i < items.length - 1; i++) {
    if (items[i + 1].startsUnit) continue // a unit banner sits between them
    const a = layout.points[i]
    const b = layout.points[i + 1]
    if (!a || !b) continue
    const midY = (a.y + b.y) / 2
    connectors.push(`M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Dotted connector layer */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={layout.width}
        height={layout.height}
        aria-hidden="true"
      >
        {connectors.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#78716c"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="0.1 16"
          />
        ))}
      </svg>

      {/* Nodes + unit banners */}
      <div className="relative flex flex-col items-stretch">
        {items.map(({ level, offset, startsUnit }) => {
          const status = getLevelStatus(level)
          const isCurrent = level.level_id === currentLevelId
          return (
            <div key={level.level_id}>
              {startsUnit && <UnitBanner stage={level.archetype_stage} />}
              <div
                className="flex justify-center my-4"
                style={{ transform: `translateX(${offset}px)` }}
              >
                <PathNode
                  ref={(el) => {
                    nodeRefs.current[level.level_id] = el
                  }}
                  level={level}
                  status={status}
                  isCurrent={isCurrent}
                  onSelect={onSelect}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UnitBanner({ stage }) {
  return (
    <div className="mt-10 mb-5 first:mt-0">
      <div className="bg-stone-800/80 border border-stone-700 rounded-2xl px-5 py-3 text-center">
        <p className="text-stone-500 text-[11px] uppercase tracking-[0.2em]">Path of the</p>
        <p className="font-display text-amber-400 text-lg tracking-wide">{stage}</p>
      </div>
    </div>
  )
}

function PathNode({ ref, level, status, isCurrent, onSelect }) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'
  const clickable = !isLocked

  let ring, face, content
  if (isCompleted) {
    ring = 'border-green-500'
    face = 'bg-green-600 text-stone-900 shadow-[0_5px_0_0] shadow-green-800'
    content = <CheckIcon />
  } else if (isLocked) {
    ring = 'border-stone-700'
    face = 'bg-stone-800 text-stone-600 shadow-[0_5px_0_0] shadow-stone-950'
    content = <LockIcon />
  } else {
    ring = 'border-amber-400'
    face = 'bg-amber-500 text-stone-900 shadow-[0_5px_0_0] shadow-amber-700'
    content = <span className="text-2xl font-extrabold">{level.level_number}</span>
  }

  return (
    <div className="relative flex flex-col items-center" ref={ref}>
      {isCurrent && (
        <div className="absolute -top-9 animate-bounce z-10">
          <div className="relative bg-white text-stone-900 text-xs font-extrabold px-3 py-1 rounded-lg uppercase tracking-wide">
            Start
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white rotate-45" />
          </div>
        </div>
      )}

      <button
        onClick={() => clickable && onSelect(level.level_id)}
        disabled={!clickable}
        aria-label={`Level ${level.level_number}: ${level.title}${isLocked ? ' (locked)' : ''}`}
        className={`w-[76px] h-[76px] rounded-full border-4 ${ring} ${face}
          flex items-center justify-center transition active:translate-y-1 active:shadow-none
          ${clickable ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed'}
          ${isCurrent ? 'animate-glow' : ''}`}
      >
        {content}
      </button>

      <p
        className={`mt-2 text-xs text-center max-w-[150px] leading-tight font-medium
          ${isLocked ? 'text-stone-600' : 'text-stone-300'}`}
      >
        {level.title}
      </p>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}
