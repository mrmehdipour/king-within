'use client'

import { useEffect, useState } from 'react'

// A short Headspace-style breathing ritual shown before a course begins.
// 5 slow breaths (4s in / 4s out) with an expanding circle, then it calls onDone.
// Fully skippable.
const TOTAL = 5
const PHASE_MS = 4000

export default function BreathingIntro({ onDone, t }) {
  const [phase, setPhase] = useState('in') // 'in' | 'out'
  const [breath, setBreath] = useState(1)

  useEffect(() => {
    const id = setTimeout(() => {
      if (phase === 'in') {
        setPhase('out')
      } else if (breath >= TOTAL) {
        onDone()
      } else {
        setBreath((b) => b + 1)
        setPhase('in')
      }
    }, PHASE_MS)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, breath])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center text-white relative">
      <button
        onClick={onDone}
        className="absolute top-6 right-6 text-stone-500 hover:text-stone-300 text-sm transition pt-safe"
      >
        {t('course.skip')}
      </button>

      <p className="text-xs uppercase tracking-[0.2em] text-amber-500 mb-10">{t('course.breathTitle')}</p>

      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        {/* soft outer ring */}
        <div className="absolute inset-0 rounded-full border border-amber-500/20" />
        {/* breathing orb */}
        <div
          className="rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center"
          style={{
            width: 150,
            height: 150,
            transform: phase === 'in' ? 'scale(1.55)' : 'scale(1)',
            transition: `transform ${PHASE_MS}ms ease-in-out`,
          }}
        >
          <span className="text-amber-300 text-lg font-medium">
            {phase === 'in' ? t('course.breatheIn') : t('course.breatheOut')}
          </span>
        </div>
      </div>

      <p className="text-stone-500 text-sm mt-10">{t('course.breathOfN', { n: breath, total: TOTAL })}</p>
    </div>
  )
}
