'use client'

import { useAppData } from '../../lib/appData'
import { getArchetypeProgress } from '../../lib/archetypes'
import { useT } from '../../lib/i18n'

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function last7Days(xpEvents) {
  const byDay = {}
  for (const e of xpEvents) {
    const k = (e.created_at || '').slice(0, 10)
    byDay[k] = (byDay[k] || 0) + (e.amount || 0)
  }
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ label: DOW[d.getDay()], xp: byDay[key] || 0 })
  }
  return days
}

function calcStreak(journalEntries) {
  const days = new Set(journalEntries.filter((h) => h.completed).map((h) => h.entry_date))
  let streak = 0
  const d = new Date()
  for (;;) {
    if (days.has(d.toISOString().slice(0, 10))) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

export default function StatsPage() {
  const t = useT()
  const { profile, levels, progress, xpEvents, journalEntries, loading } = useAppData()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400">{t('common.loading')}</div>
  }
  const archName = (a) => {
    const k = t('arch.' + a)
    return k === 'arch.' + a ? a : k
  }

  const totalXp = profile?.total_xp ?? 0
  const arch = getArchetypeProgress(totalXp)
  const completedRows = progress.filter((p) => p.status === 'completed')
  const completed = completedRows.length
  const completionPct = levels.length ? Math.round((completed / levels.length) * 100) : 0

  const quizzed = progress.filter((p) => typeof p.quiz_total === 'number' && p.quiz_total > 0)
  const quizCorrect = quizzed.reduce((s, p) => s + (p.quiz_score ?? 0), 0)
  const quizTotal = quizzed.reduce((s, p) => s + (p.quiz_total ?? 0), 0)
  const accuracy = quizTotal ? Math.round((quizCorrect / quizTotal) * 100) : 0

  const journalsDone = journalEntries.filter((j) => j.completed).length
  const streak = calcStreak(journalEntries)

  const week = last7Days(xpEvents)
  const maxXp = Math.max(...week.map((d) => d.xp), 1)
  const weekTotal = week.reduce((s, d) => s + d.xp, 0)

  return (
    <div className="text-white max-w-xl mx-auto px-4">
      <header className="pt-safe pt-8 pb-4">
        <h1 className="font-display text-2xl text-amber-400">{t('stats.title')}</h1>
        <p className="text-stone-400 text-sm">{t('stats.subtitle')}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <MetricCard label={t('stats.totalXp')} value={totalXp} sub={arch.next ? t('learn.toNext', { next: archName(arch.next) }) : t('stats.maxArchetype')} />
        <MetricCard label={t('stats.coursesCompleted')} value={completed} sub={t('stats.ofN', { n: levels.length })} />
        <MetricCard label={t('stats.journalStreak')} value={`${streak}🔥`} sub={t('stats.entries', { n: journalsDone })} />
        <MetricCard label={t('stats.quizAccuracy')} value={`${accuracy}%`} sub={t('stats.correct', { a: quizCorrect, b: quizTotal })} />
      </div>

      <SectionTitle>{t('stats.thisWeek', { n: weekTotal })}</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <div className="flex items-end justify-between gap-2 h-36">
          {week.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className={`w-full rounded-t-md ${d.xp ? 'bg-amber-500' : 'bg-stone-800'}`}
                style={{ height: `${Math.max((d.xp / maxXp) * 100, 4)}%` }}
                title={`${d.xp} XP`}
              />
              <span className="text-[11px] text-stone-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>{t('stats.pathCompletion')}</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-stone-300">{t('stats.ofCourses', { a: completed, b: levels.length })}</span>
          <span className="text-amber-400 font-semibold">{completionPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-stone-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      <SectionTitle>{t('stats.breakdown')}</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl divide-y divide-stone-800 mb-6 overflow-hidden">
        <BreakdownRow label={t('stats.coursesCompleted')} value={completed} />
        <BreakdownRow label={t('stats.journalEntries')} value={journalsDone} />
        <BreakdownRow label={t('stats.xpEvents')} value={xpEvents.length} />
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
