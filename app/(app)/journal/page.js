'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAppData } from '../../lib/appData'
import { awardXp, JOURNAL_XP } from '../../lib/xp'
import { useLang } from '../../lib/i18n'
import { localized } from '../../lib/localized'

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
  const [tab, setTab] = useState('daily') // 'daily' | 'free'
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
  const [freeSaving, setFreeSaving] = useState(false)
  const [freeSaved, setFreeSaved] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let { data: existing } = await supabase
      .from('journal_entries')
      .select('*, journal_questions(prompt, prompt_fa)')
      .eq('user_id', user.id)
      .eq('entry_date', today())
      .maybeSingle()

    if (!existing) {
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
        .select('*, journal_questions(prompt, prompt_fa)')
        .single()
      existing = created
    }

    setEntry(existing)
    setPrompt(localized(existing.journal_questions, 'prompt', locale) || '')
    setAnswer(existing.answer_text || '')
    setFree(existing.free_text || '')
    setDone(!!existing.completed)

    const { data: hist } = await supabase
      .from('journal_entries')
      .select('id, entry_date, answer_text, completed, journal_questions(prompt, prompt_fa)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(30)
    setHistory(hist || [])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Daily question → answer + complete + XP (once), then locks for the day.
  async function submitDaily() {
    if (saving || !answer.trim() || !entry) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const wasCompleted = entry.completed

    await supabase
      .from('journal_entries')
      .update({ answer_text: answer, completed: true })
      .eq('id', entry.id)

    if (!wasCompleted) {
      await awardXp({ userId: user.id, source: 'journal', sourceRef: entry.id, amount: JOURNAL_XP })
      setJustXp(true)
      await refresh()
    }
    setEntry({ ...entry, completed: true, answer_text: answer })
    setDone(true)
    setSaving(false)
    load()
  }

  // Free writing → saves free_text only; editable any time, no lock, no XP.
  async function saveFree() {
    if (freeSaving || !entry) return
    setFreeSaving(true)
    await supabase.from('journal_entries').update({ free_text: free }).eq('id', entry.id)
    setEntry({ ...entry, free_text: free })
    setFreeSaving(false)
    setFreeSaved(true)
    setTimeout(() => setFreeSaved(false), 2000)
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

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-stone-900 rounded-xl mb-5">
        <button
          onClick={() => setTab('daily')}
          className={`py-2 rounded-lg text-sm font-semibold transition ${tab === 'daily' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
        >
          {t('journal.tabDaily')}
        </button>
        <button
          onClick={() => setTab('free')}
          className={`py-2 rounded-lg text-sm font-semibold transition ${tab === 'free' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}
        >
          {t('journal.tabFree')}
        </button>
      </div>

      {tab === 'daily' ? (
        noQuestions ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center text-stone-400">
            {t('journal.exhausted')}
          </div>
        ) : (
          <>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-4">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-2">{t('journal.todays')}</p>
              <p className="text-lg text-white font-medium leading-snug">{prompt}</p>
            </div>

            {done ? (
              <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-5">
                <label className="block text-stone-400 text-sm mb-1">{t('journal.yourAnswer')}</label>
                <p className="text-white whitespace-pre-wrap mb-3">{answer}</p>
                <p className="text-green-400 text-sm">
                  {justXp ? t('journal.doneTodayXp', { xp: JOURNAL_XP }) : t('journal.doneToday')}
                </p>
                <p className="text-stone-500 text-sm mt-1">{t('journal.locked')}</p>
              </div>
            ) : (
              <>
                <label className="block text-stone-400 text-sm mb-1">{t('journal.yourAnswer')}</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={6}
                  placeholder={t('journal.answerPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white placeholder-stone-600 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
                />
                <button
                  onClick={submitDaily}
                  disabled={saving || !answer.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 rounded-xl transition disabled:opacity-40"
                >
                  {saving ? t('course.saving') : t('journal.save', { xp: JOURNAL_XP })}
                </button>
              </>
            )}

            {history.length > 0 && (
              <div className="mt-8">
                <h2 className="text-stone-400 text-sm font-semibold mb-2">{t('journal.past')}</h2>
                <div className="space-y-2">
                  {history.filter((h) => h.completed).map((h) => (
                    <div key={h.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3">
                      <p className="text-stone-500 text-xs mb-1">
                        {h.entry_date === today()
                          ? t('journal.todayLabel')
                          : new Date(h.entry_date).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-stone-300 text-sm">{localized(h.journal_questions, 'prompt', locale)}</p>
                      {h.answer_text && <p className="text-stone-500 text-sm mt-1 line-clamp-2">{h.answer_text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )
      ) : (
        /* Free writing — open space, editable any time */
        <div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-4">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-1">{t('journal.freeTitle')}</p>
            <p className="text-stone-400 text-sm">{t('journal.freeSubtitle')}</p>
          </div>
          <textarea
            value={free}
            onChange={(e) => setFree(e.target.value)}
            rows={12}
            placeholder={t('journal.freePlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white placeholder-stone-600 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-4"
          />
          <button
            onClick={saveFree}
            disabled={freeSaving}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 rounded-xl transition disabled:opacity-40"
          >
            {freeSaving ? t('course.saving') : t('journal.freeSave')}
          </button>
          {freeSaved && <p className="text-green-400 text-sm text-center mt-2">{t('journal.freeSaved')}</p>}
        </div>
      )}
    </div>
  )
}
