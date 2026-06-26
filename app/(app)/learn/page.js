'use client'

import { useRouter } from 'next/navigation'
import { useAppData } from '../../lib/appData'
import { getArchetypeProgress } from '../../lib/archetypes'
import { useT } from '../../lib/i18n'
import PathMap from '../../components/PathMap'
import LionCoach from '../../components/LionCoach'

export default function LearnPage() {
  const router = useRouter()
  const t = useT()
  const { profile, levels, loading, getLevelStatus } = useAppData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-400">{t('learn.loading')}</p>
      </div>
    )
  }

  // Current node = first available (unlocked, not yet completed) level.
  const currentLevel = levels.find((l) => getLevelStatus(l) === 'available')
  const archProgress = getArchetypeProgress(profile?.total_xp ?? 0)
  const archName = (a) => {
    const k = t('arch.' + a)
    return k === 'arch.' + a ? a : k
  }

  return (
    <div className="text-white">
      {/* Sticky header: archetype + XP + progress to next archetype */}
      <header className="sticky top-0 z-10 bg-stone-950/90 backdrop-blur border-b border-stone-800/80 pt-safe">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-stone-400 text-xs uppercase tracking-wide">{t('learn.currentArchetype')}</p>
              <h1 className="font-display text-2xl text-amber-400 leading-tight">
                {archName(profile?.current_archetype)}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-full px-3 py-1.5">
              <BoltIcon />
              <span className="text-amber-400 font-bold">{profile?.total_xp ?? 0}</span>
              <span className="text-stone-500 text-xs">{t('common.xp')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                style={{ width: `${archProgress.percent}%` }}
              />
            </div>
            <p className="text-stone-400 text-xs whitespace-nowrap">
              {archProgress.next ? t('learn.toNext', { next: archName(archProgress.next) }) : t('learn.max')}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6">
        <LionCoach />
        {levels.length === 0 ? (
          <p className="text-center text-stone-500 py-24">{t('learn.empty')}</p>
        ) : (
          <PathMap
            levels={levels}
            getLevelStatus={getLevelStatus}
            currentLevelId={currentLevel?.level_id}
            onSelect={(id) => router.push(`/course?id=${id}`)}
          />
        )}
      </main>
    </div>
  )
}

function BoltIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400" aria-hidden="true">
      <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
    </svg>
  )
}
