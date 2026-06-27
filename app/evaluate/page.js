'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../lib/i18n'
import { EVAL_QUESTIONS, scoreEvaluation, ARCH_RESULT } from '../lib/evaluation'
import LionAvatar from '../components/LionAvatar'

const L = (obj, locale) => (locale === 'fa' ? obj.fa : obj.en)

export default function EvaluatePage() {
  const router = useRouter()
  const { t, locale } = useLang()
  const [userId, setUserId] = useState(null)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/signup')
      else setUserId(user.id)
    })
  }, [router])

  async function pick(archetype) {
    const next = [...answers, archetype]
    setAnswers(next)
    if (step + 1 < EVAL_QUESTIONS.length) {
      setStep(step + 1)
    } else {
      const winner = scoreEvaluation(next)
      setResult(winner)
      setSaving(true)
      if (userId) {
        await supabase.from('profiles')
          .update({ eval_archetype: winner, evaluated_at: new Date().toISOString() })
          .eq('id', userId)
      }
      setSaving(false)
    }
  }

  async function skip() {
    if (userId) {
      await supabase.from('profiles')
        .update({ evaluated_at: new Date().toISOString() })
        .eq('id', userId)
    }
    router.replace('/learn')
  }

  // ── Result ──
  if (result) {
    const r = L(ARCH_RESULT[result], locale)
    return (
      <div className="min-h-[100dvh] bg-stone-950 text-white flex flex-col items-center justify-center px-6 text-center">
        <LionAvatar size={96} className="mb-5" />
        <p className="text-stone-400 text-sm uppercase tracking-[0.2em] mb-2">{t('evaluate.resultLead')}</p>
        <h1 className="font-display text-3xl text-amber-400 mb-4">{r.title}</h1>
        <p className="text-stone-300 leading-relaxed max-w-sm mb-8">{r.desc}</p>
        <button
          onClick={() => router.replace('/learn')}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-xl transition disabled:opacity-50"
        >
          {saving ? t('course.saving') : t('evaluate.begin')}
        </button>
      </div>
    )
  }

  // ── Quiz ──
  const question = EVAL_QUESTIONS[step]
  const pct = Math.round((step / EVAL_QUESTIONS.length) * 100)

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-white flex flex-col px-5 pt-safe">
      <header className="pt-6 pb-4 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-amber-400">{t('evaluate.title')}</p>
          <button onClick={skip} className="text-stone-500 hover:text-stone-300 text-sm">{t('evaluate.skip')}</button>
        </div>
        <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-stone-500 text-xs mt-2">{t('evaluate.progress', { n: step + 1, total: EVAL_QUESTIONS.length })}</p>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center pb-10">
        <h2 className="text-xl font-medium leading-snug mb-6">{L(question.q, locale)}</h2>
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(opt.a)}
              className="w-full text-start bg-stone-900 border border-stone-700 hover:border-amber-500 hover:bg-stone-800/60 rounded-xl px-4 py-3.5 transition"
            >
              {L(opt, locale)}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
