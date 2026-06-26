'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useT, useLang } from '../lib/i18n'
import { localized } from '../lib/localized'

// Side-to-side offsets within a level card (3 nodes): centre → right → left,
// so the straight connectors form a clean zigzag.
const WAVE = [0, 80, -80]
const PER_LEVEL = 3

// Very-light background tint per level (subtle on the dark theme); cycles.
const LEVEL_TINTS = [
  'rgba(245, 158, 11, 0.06)', // amber
  'rgba(56, 189, 248, 0.06)', // sky
  'rgba(52, 211, 153, 0.06)', // emerald
  'rgba(167, 139, 250, 0.07)', // violet
]

// The learning path: courses grouped into "levels" of three. Each level is its
// own faintly-tinted card with a zigzag of nodes; levels are split by a light
// dotted divider.
export default function PathMap({ levels, getLevelStatus, currentLevelId, onSelect }) {
  const scrolledRef = useRef(false)

  // Group consecutive courses into levels of three (in display order).
  const groups = []
  levels.forEach((level, i) => {
    const g = Math.floor(i / PER_LEVEL)
    if (!groups[g]) groups[g] = []
    groups[g].push({ level, offset: WAVE[groups[g].length % WAVE.length] })
  })

  // Glide the current node into view once, after layout settles.
  useEffect(() => {
    if (scrolledRef.current || !currentLevelId) return
    const id = setTimeout(() => {
      const el = document.getElementById('kw-current-node')
      if (el) { scrolledRef.current = true; el.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
    }, 300)
    return () => clearTimeout(id)
  }, [currentLevelId, levels])

  return (
    <div className="pb-8">
      {groups.map((items, gi) => (
        <div key={gi}>
          {gi > 0 && <LevelDivider />}
          <LevelCard
            levelNumber={gi + 1}
            items={items}
            tint={LEVEL_TINTS[gi % LEVEL_TINTS.length]}
            getLevelStatus={getLevelStatus}
            currentLevelId={currentLevelId}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  )
}

function LevelDivider() {
  return <div className="mx-10 my-2 border-t-2 border-dotted border-stone-600/30" aria-hidden="true" />
}

function LevelCard({ levelNumber, items, tint, getLevelStatus, currentLevelId, onSelect }) {
  const t = useT()
  const cardRef = useRef(null)
  const nodeRefs = useRef({})
  const [points, setPoints] = useState([])

  useLayoutEffect(() => {
    function measure() {
      const base = cardRef.current?.getBoundingClientRect()
      if (!base) return
      setPoints(items.map((it) => {
        const el = nodeRefs.current[it.level.level_id]
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 }
      }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (cardRef.current) ro.observe(cardRef.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [items])

  // Straight connectors between consecutive nodes in this level.
  const connectors = []
  for (let i = 0; i < items.length - 1; i++) {
    const a = points[i], b = points[i + 1]
    if (!a || !b) continue
    connectors.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`)
  }

  const levelLabel = t('learn.level', { n: levelNumber })

  return (
    <div ref={cardRef} className="relative rounded-3xl px-2 py-5" style={{ background: tint }}>
      <p className="text-center text-[11px] uppercase tracking-[0.22em] text-stone-400 mb-2">
        {levelLabel === 'learn.level' ? `Level ${levelNumber}` : levelLabel}
      </p>

      {/* Dotted connector layer (behind the nodes, above the tint) */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" aria-hidden="true">
        {connectors.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#78716c" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 16" />
        ))}
      </svg>

      <div className="relative">
        {items.map(({ level, offset }) => {
          const status = getLevelStatus(level)
          const isCurrent = level.level_id === currentLevelId
          return (
            <div key={level.level_id} className="flex justify-center my-4" style={{ transform: `translateX(${offset}px)` }}>
              <PathNode
                ref={(el) => { nodeRefs.current[level.level_id] = el }}
                level={level}
                status={status}
                isCurrent={isCurrent}
                onSelect={onSelect}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PathNode({ ref, level, status, isCurrent, onSelect }) {
  const { t, locale } = useLang()
  const title = localized(level, 'title', locale)
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
            {t('learn.start')}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white rotate-45" />
          </div>
        </div>
      )}

      <button
        id={isCurrent ? 'kw-current-node' : undefined}
        onClick={() => clickable && onSelect(level.level_id)}
        disabled={!clickable}
        aria-label={`Level ${level.level_number}: ${title}${isLocked ? ' (locked)' : ''}`}
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
        {title}
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
