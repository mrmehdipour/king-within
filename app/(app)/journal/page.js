'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAppData } from '../../lib/appData'
import { awardXp, JOURNAL_XP } from '../../lib/xp'
import { useLang } from '../../lib/i18n'

const today = () => new Date().toISOString().slice(0, 10)

function calcStreak(history) {
  const days = new Set(history.filter((h) => h.completed).map((h) => h.entry_date))
  let streak = 0
  const d = new Date()
  for (;;) {
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return streak
}

export default function JournalPage() {
  const { t, locale } = useLang()
  const dateLocale = locale === 'fa' ? 'fa-IR' : undefined
  const { refresh } = useAppData()
  const [loading, setLoading] = useState(true)
  const [entry, setEntry] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [free, setFree] = useState('')
  const [done, setDone] = useState(false)
  const [noQuestions, setNoQuestions] = useState(false)
  const [history, setHistory] = useState([])
  const [saving, setSaving] = useState(false)
  const [justXp, setJustXp] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let { data: existing } = await supabase
      .from('journal_entries')
      .select('*, journal_questions(prompt)')
      .eq('user_id', user.id)
      .eq('entry_date', today())
      .maybeSingle()

    if (!existing) {
      // Pick a random question this user hasn't seen, then open today's draft.
      const { data: q } = await supabase.rpc('next_journal_question', { uid: user.id })
      const question = Array.isArray(q) ? q[0] : q
      if (!question) {
        setNoQuestions(true)
        setLoading(false)
        return
      }
      const { data: created } = await supabase
        .from('journal_entries')
        .insert({ user_id: user.id, question_id: question.id, entry_date: today() })
        .select('*, journal_questions(prompt)')
        .single()
      existing = created
    }

    setEntry(existing)
    setPrompt(existing.journal_questions?.prompt || '')
    setAnswer(existing.answer_text || '')
    setFree(existing.free_text || '')
    setDone(!!existing.completed)

    const { data: hist } = await supabase
      .from('journal_entries')
      .select('id, entry_date, answer_text, completed, journal_questions(prompt)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(30)
    setHistory(hist || [])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function submit() {
    if (saving || !answer.trim() || !entry) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const wasCompleted = entry.completed

    await supabase
      .from('journal_entries')
      .update({ answer_text: answer, free_text: free, completed: true })
      .eq('id', entry.id)

    if (!wasCompleted) {
      await awardXp({ userId: user.id, source: 'journal', sourceRef: entry.id, amount: JOURNAL_XP })
      setJustXp(true)
      await refresh() // live XP/stats update across the app
    }
    setEntry({ ...entry, completed: true, answer_text: answer, free_text: free })
    setDone(true)
    setSaving(false)
    load()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400">{t('journal.loading')}</div>
  }

  const streak = calcStreak(history)

  return (
    <div className="text-white max-w-xl mx-auto px-4">
      <header className="pt-safe pt-8 pb-4 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-amber-400">{t('journal.title')}</h1>
          <p className="text-stone-400 text-sm">
            {new Date().toLocaleDateString(dateLocale, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-400 leading-none">{streak}🔥</p>
          <p className="text-stone-500 text-xs">{t('journal.streak')}</p>
        </div>
      </header>

      {noQuestions ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center text-stone-400">
          {t('journal.exhausted')}
        </div>
      ) : (
        <>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-2">{t('journal.todays')}</p>
            <p className="text-lg text-white font-medium leading-snug">{prompt}</p>
          </div>

          <label className="block text-stone-400 text-sm mb-1">{t('journal.yourAnswer')}</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder={t('journal.answerPlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white placeholder-stone-600 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
          />

          <label className="block text-stone-400 text-sm mb-1">{t('journal.open')} <span className="text-stone-600">{t('journal.optional')}</span></label>
          <textarea
            value={free}
            onChange={(e) => setFree(e.target.value)}
            rows={4}
            placeholder={t('journal.openPlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white placeholder-stone-600 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
          />

          <button
            onClick={submit}
            disabled={saving || !answer.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 rounded-xl transition disabled:opacity-40"
          >
            {saving ? t('course.saving') : done ? t('journal.update') : t('journal.save', { xp: JOURNAL_XP })}
          </button>
          {done && (
            <p className="text-green-400 text-sm text-center mt-3">
              {justXp ? t('journal.doneTodayXp', { xp: JOURNAL_XP }) : t('journal.doneToday')}
            </p>
          )}
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="text-stone-400 text-sm font-semibold mb-2">{t('journal.past')}</h2>
          <div className="space-y-2">
            {history.filter((h) => h.completed && h.entry_date !== today()).map((h) => (
              <div key={h.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3">
                <p className="text-stone-500 text-xs mb-1">
                  {new Date(h.entry_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-stone-300 text-sm">{h.journal_questions?.prompt}</p>
                {h.answer_text && <p className="text-stone-500 text-sm mt-1 line-clamp-2">{h.answer_text}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
