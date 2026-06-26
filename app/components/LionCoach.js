'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../lib/i18n'
import { askLion, latestInsight } from '../lib/lion'
import LionAvatar from './LionAvatar'

// The Lion's "Daily coach" skill, shown on the Learn screen. One short, personal
// nudge per day. To respect the free API quota it generates at most once per day:
// if today's guidance already exists we just show it; otherwise we offer a button.
export default function LionCoach() {
  const { t, locale } = useLang()
  const [insight, setInsight] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)

  async function load() {
    const latest = await latestInsight('coach')
    setInsight(latest)
    setLoaded(true)
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function generate() {
    setBusy(true)
    setError(null)
    try {
      const res = await askLion({ skill: 'coach', locale })
      setInsight({ content: res.content, created_at: new Date().toISOString() })
    } catch (e) {
      setError(e.code === 'rate_limit' ? t('lion.rateLimit') : (e.message || t('lion.error')))
    } finally {
      setBusy(false)
    }
  }

  if (!loaded) return null // stay quiet until we know the state

  const isToday =
    insight?.created_at &&
    new Date(insight.created_at).toDateString() === new Date().toDateString()

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6 flex gap-3">
      <LionAvatar size={44} thinking={busy} className="shrink-0" />
      <div className="min-w-0 flex-1">
        {isToday ? (
          <>
            <p className="text-amber-400 text-xs font-semibold mb-1">{t('lion.coachDone')}</p>
            <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-wrap">{insight.content}</p>
          </>
        ) : (
          <>
            <p className="text-stone-300 text-sm mb-3">
              {busy ? t('lion.coachThinking') : (insight?.content ?? t('lion.subtitle'))}
            </p>
            <button
              onClick={generate}
              disabled={busy}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-semibold text-sm px-4 py-2 transition"
            >
              {busy ? t('lion.coachThinking') : t('lion.coachCta')}
            </button>
          </>
        )}
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  )
}
