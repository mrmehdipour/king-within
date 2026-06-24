'use client'

import { useAppData } from '../../lib/appData'
import { getArchetypeProgress } from '../../lib/archetypes'

// Mock 7-day activity (XP earned per day) for the shell visualization.
const WEEK_XP = [
  { day: 'M', xp: 40 },
  { day: 'T', xp: 0 },
  { day: 'W', xp: 80 },
  { day: 'T', xp: 40 },
  { day: 'F', xp: 0 },
  { day: 'S', xp: 60 },
  { day: 'S', xp: 40 },
]

export default function StatsPage() {
  const { profile, levels, progress, loading } = useAppData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </div>
    )
  }

  const completed = progress.filter((p) => p.status === 'completed').length
  const totalXp = profile?.total_xp ?? 0
  const arch = getArchetypeProgress(totalXp)
  const completionPct = levels.length ? Math.round((completed / levels.length) * 100) : 0

  // Quiz accuracy across completed courses.
  const quizzed = progress.filter((p) => typeof p.quiz_total === 'number' && p.quiz_total > 0)
  const quizCorrect = quizzed.reduce((s, p) => s + (p.quiz_score ?? 0), 0)
  const quizTotal = quizzed.reduce((s, p) => s + (p.quiz_total ?? 0), 0)
  const accuracy = quizTotal ? Math.round((quizCorrect / quizTotal) * 100) : 0

  const maxXp = Math.max(...WEEK_XP.map((d) => d.xp), 1)

  return (
    <div className="text-white max-w-xl mx-auto px-4">
      <header className="pt-safe pt-8 pb-4">
        <h1 className="font-display text-2xl text-amber-400">Analytics</h1>
        <p className="text-stone-400 text-sm">Your progress at a glance</p>
      </header>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard label="Courses completed" value={completed} sub={`of ${levels.length}`} />
        <MetricCard label="Total XP" value={totalXp} sub={arch.next ? `→ ${arch.next}` : 'Max'} />
        <MetricCard label="Current streak" value="3" sub="days 🔥" />
        <MetricCard label="Quiz accuracy" value={`${accuracy}%`} sub={`${quizCorrect}/${quizTotal} correct`} />
      </div>

      {/* Weekly activity bar chart */}
      <SectionTitle>This week</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <div className="flex items-end justify-between gap-2 h-36">
          {WEEK_XP.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className={`w-full rounded-t-md ${d.xp ? 'bg-amber-500' : 'bg-stone-800'}`}
                style={{ height: `${Math.max((d.xp / maxXp) * 100, 4)}%` }}
                title={`${d.xp} XP`}
              />
              <span className="text-[11px] text-stone-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall completion */}
      <SectionTitle>Path completion</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-stone-300">{completed} of {levels.length} courses</span>
          <span className="text-amber-400 font-semibold">{completionPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-stone-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Activity breakdown */}
      <SectionTitle>Activity breakdown</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl divide-y divide-stone-800 mb-6 overflow-hidden">
        <BreakdownRow label="Reading comprehension" value={completed} />
        <BreakdownRow label="Critical thinking" value={completed} />
        <BreakdownRow label="Quizzes passed" value={completed} />
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
      <p className="text-3xl font-bold text-amber-400 leading-none">{value}</p>
      <p className="text-stone-300 text-sm mt-2">{label}</p>
      {sub && <p className="text-stone-500 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-stone-400 text-sm font-semibold mb-2">{children}</h2>
}

function BreakdownRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-stone-200">{label}</span>
      <span className="text-sm font-semibold text-amber-400">{value}</span>
    </div>
  )
}
