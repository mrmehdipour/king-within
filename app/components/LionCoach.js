'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../lib/i18n'
import { useAppData } from '../lib/appData'
import { askLion, latestInsight } from '../lib/lion'
import { awardXp, COACH_XP, coachQuestDoneToday } from '../lib/xp'
import LionAvatar from './LionAvatar'

// The Lion's "Daily Audience" — King Within's signature feature. Once a day the
// Lion grants the user a short, personal coaching moment shaped by their own
// journey: a greeting, a focus for the day, a message, and one quest worth XP.
//
// The coach skill returns a JSON object { greeting, focus, message, quest }.
// We parse defensively so a plain-text insight (old rows / un-redeployed fn)
// still renders as a message. Generates at most once/day to respect API quota.

const todayStr = () => new Date().toISOString().slice(0, 10)

function parseAudience(content) {
  if (!content) return null
  const tryParse = (s) => {
    try { return JSON.parse(s) } catch { return null }
  }
  let obj = tryParse(content)
  if (!obj) {
    const m = content.match(/\{[\s\S]*\}/) // JSON possibly wrapped in stray text
    if (m) obj = tryParse(m[0])
  }
  if (obj && (obj.message || obj.greeting || obj.quest)) return obj
  return { message: content } // fall back to plain text
}

export default function LionCoach() {
  const { t, locale } = useLang()
  const { refresh } = useAppData()
  const [insight, setInsight] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [questDone, setQuestDone] = useState(false)
  const [claiming, setClaiming] = useState(false)

  async function load() {
    const latest = await latestInsight('coach')
    setInsight(latest)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setQuestDone(await coachQuestDoneToday(user.id))
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

  async function completeQuest() {
    if (claiming || questDone) return
    setClaiming(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      // Re-check server-side so a refresh/second device can't double-claim.
      if (user && !(await coachQuestDoneToday(user.id))) {
        await awardXp({ userId: user.id, source: 'coach', sourceRef: todayStr(), amount: COACH_XP })
        await refresh()
      }
      setQuestDone(true)
    } finally {
      setClaiming(false)
    }
  }

  if (!loaded) return null // stay quiet until we know today's state

  const isToday =
    insight?.created_at &&
    new Date(insight.created_at).toDateString() === new Date().toDateString()

  // ── The invitation (no audience granted yet today) ──
  if (!isToday) {
    return (
      <div className="relative overflow-hidden rounded-2xl mb-6 p-5 bg-gradient-to-br from-amber-500/10 to-stone-900 border border-amber-500/25">
        <div className="flex items-center gap-4">
          <LionAvatar size={56} thinking={busy} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-amber-500/80 mb-0.5">{t('lion.coachTitle')}</p>
            <p className="text-stone-200 text-sm leading-snug">
              {busy ? t('lion.coachThinking') : t('lion.coachInvite')}
            </p>
            {!busy && <p className="text-stone-500 text-xs mt-1">{t('lion.coachInviteSub')}</p>}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-bold text-sm py-3 transition"
        >
          {busy ? t('lion.coachThinking') : t('lion.coachBegin')}
        </button>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    )
  }

  // ── Today's audience ──
  const a = parseAudience(insight.content) || {}
  return (
    <div className="lion-reveal relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-900 border border-amber-500/30">
      <div className="flex items-center gap-3 px-5 pt-5">
        <LionAvatar size={48} className="shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-amber-500/80">{t('lion.coachTitle')}</p>
          {a.greeting && <p className="text-amber-200 text-sm font-medium leading-snug">{a.greeting}</p>}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 space-y-4">
        {a.focus && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 mb-1">{t('lion.coachFocus')}</p>
            <p className="font-display text-amber-400 text-xl leading-tight">{a.focus}</p>
          </div>
        )}

        {a.message && (
          <p className="text-stone-200 text-sm leading-relaxed whitespace-pre-wrap">{a.message}</p>
        )}

        {a.quest && (
          <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-amber-500/80 mb-1.5 flex items-center gap-1.5">
              <QuestIcon /> {t('lion.coachQuest')}
            </p>
            <p className="text-stone-100 text-sm leading-snug mb-3">{a.quest}</p>
            {questDone ? (
              <p className="text-green-400 text-sm font-semibold flex items-center gap-1.5">
                <CheckIcon /> {t('lion.coachCompleted')}
              </p>
            ) : (
              <button
                onClick={completeQuest}
                disabled={claiming}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-bold text-sm px-4 py-2 transition"
              >
                {t('lion.coachComplete')} · +{COACH_XP} {t('common.xp')}
              </button>
            )}
          </div>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    </div>
  )
}

function QuestIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
