'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { awardXp } from '../lib/xp'

// Three sequential activities per course. Order is fixed and you cannot skip.
const STEPS = ['reading', 'thinking', 'quiz']

export default function CoursePage() {
  return (
    <Suspense fallback={<CenterMessage>Loading course…</CenterMessage>}>
      <CoursePlayer />
    </Suspense>
  )
}

function CoursePlayer() {
  const router = useRouter()
  const params = useSearchParams()
  const levelId = params.get('id') != null ? Number(params.get('id')) : null

  const [level, setLevel] = useState(null)
  const [wasCompleted, setWasCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  const [stepIndex, setStepIndex] = useState(0)
  const [reflection, setReflection] = useState('')
  const [answers, setAnswers] = useState({}) // questionId -> selected option index
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(null) // { xpGained, score, total, evolvedTo }

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/signup')
      return
    }

    const [{ data: levelData }, { data: existing }] = await Promise.all([
      supabase
        .from('levels')
        .select('*, questions(*)')
        .order('sort_order', { referencedTable: 'questions', ascending: true })
        .eq('level_id', levelId)
        .single(),
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('level_id', levelId)
        .maybeSingle(),
    ])

    setLevel(levelData)
    if (existing?.status === 'completed') {
      setWasCompleted(true)
      setReflection(existing.submission_content || '')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (levelId == null || Number.isNaN(levelId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId])

  if (loading) return <CenterMessage>Loading course…</CenterMessage>

  if (!level) {
    return (
      <CenterMessage>
        Course not found.
        <button onClick={() => router.push('/learn')} className="mt-4 text-amber-400 underline">
          Back to the path
        </button>
      </CenterMessage>
    )
  }

  const questions = level.questions ?? []
  const step = STEPS[stepIndex]

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1)
  }

  async function finish() {
    if (submitting) return
    setSubmitting(true)

    const score = questions.reduce(
      (s, q) => s + (answers[q.id] === q.correct_index ? 1 : 0),
      0
    )

    // Already completed before? Show the result but don't award XP again.
    if (wasCompleted) {
      setFinished({ xpGained: 0, score, total: questions.length, evolvedTo: null })
      setSubmitting(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    // 1) Mark this course complete (insert or update).
    await supabase.from('user_progress').upsert(
      {
        user_id: user.id,
        level_id: level.level_id,
        status: 'completed',
        submission_content: reflection,
        quiz_score: score,
        quiz_total: questions.length,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,level_id' }
    )

    // 2) Award XP through the ledger (also advances current_level + archetype).
    const { evolvedTo } = await awardXp({
      userId: user.id,
      source: 'course',
      sourceRef: level.level_id,
      amount: level.xp_reward,
      profilePatch: { current_level: level.level_number + 1 },
    })

    setFinished({ xpGained: level.xp_reward, score, total: questions.length, evolvedTo })
    setSubmitting(false)
  }

  if (finished) {
    return <CompletionScreen level={level} result={finished} onDone={() => router.push('/learn')} />
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] != null)

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Top bar: close + segmented progress */}
      <header className="pt-safe sticky top-0 bg-stone-950/95 backdrop-blur z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push('/learn')}
            aria-label="Exit course"
            className="text-stone-500 hover:text-stone-300 transition shrink-0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1 flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 h-2.5 rounded-full bg-stone-800 overflow-hidden">
                <div className={`h-full bg-amber-500 transition-all ${i <= stepIndex ? 'w-full' : 'w-0'}`} />
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
        {step === 'reading' && <ReadingStep key="r" level={level} onContinue={next} />}
        {step === 'thinking' && (
          <ThinkingStep key="t" level={level} value={reflection} onChange={setReflection} onContinue={next} />
        )}
        {step === 'quiz' && (
          <QuizStep
            key="q"
            questions={questions}
            answers={answers}
            onAnswer={(qid, idx) => setAnswers((a) => (a[qid] != null ? a : { ...a, [qid]: idx }))}
            allAnswered={allAnswered}
            submitting={submitting}
            onFinish={finish}
          />
        )}
      </main>
    </div>
  )
}

function ActivityLabel({ icon, children }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">
      <span aria-hidden="true">{icon}</span>
      {children}
    </p>
  )
}

function ReadingStep({ level, onContinue }) {
  return (
    <div className="animate-pop">
      <ActivityLabel icon="📖">Reading comprehension</ActivityLabel>
      <h1 className="font-display text-3xl text-white mb-2">{level.title}</h1>
      {level.content_body && <p className="text-stone-400 mb-6">{level.content_body}</p>}
      <article className="space-y-4 text-stone-200 leading-relaxed text-[17px]">
        {(level.reading_text || '').split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>
      <PrimaryButton onClick={onContinue} className="mt-8">Continue</PrimaryButton>
    </div>
  )
}

function ThinkingStep({ level, value, onChange, onContinue }) {
  return (
    <div className="animate-pop">
      <ActivityLabel icon="🧠">Critical thinking</ActivityLabel>
      <h2 className="text-xl font-semibold text-white mb-4 leading-snug">
        {level.critical_thinking_prompt}
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Think it through and write your honest answer…"
        className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white placeholder-stone-600 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
      />
      <p className="text-stone-600 text-xs mt-2">
        There are no wrong answers here — but an honest one moves you forward.
      </p>
      <PrimaryButton onClick={onContinue} disabled={!value.trim()} className="mt-6">
        Continue
      </PrimaryButton>
    </div>
  )
}

function QuizStep({ questions, answers, onAnswer, allAnswered, submitting, onFinish }) {
  if (questions.length === 0) {
    return (
      <div className="animate-pop">
        <ActivityLabel icon="✅">Quiz</ActivityLabel>
        <p className="text-stone-400 mb-6">No quiz for this course.</p>
        <PrimaryButton onClick={onFinish} disabled={submitting}>Finish course</PrimaryButton>
      </div>
    )
  }
  return (
    <div className="animate-pop">
      <ActivityLabel icon="✅">Quiz</ActivityLabel>
      <h2 className="text-xl font-semibold text-white mb-6">Test what you read</h2>
      <div className="space-y-6">
        {questions.map((q, qi) => {
          const selected = answers[q.id]
          const answered = selected != null
          return (
            <div key={q.id}>
              <p className="text-stone-200 font-medium mb-3">
                <span className="text-stone-500">{qi + 1}.</span> {q.prompt}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi
                  const isCorrect = oi === q.correct_index
                  let cls = 'border-stone-700 bg-stone-900 text-stone-200 hover:border-stone-500'
                  if (answered) {
                    if (isCorrect) cls = 'border-green-500 bg-green-500/15 text-green-300'
                    else if (isSelected) cls = 'border-red-500 bg-red-500/15 text-red-300'
                    else cls = 'border-stone-800 bg-stone-900 text-stone-500'
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => onAnswer(q.id, oi)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition ${cls} ${
                        answered ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      {opt}
                      {answered && isCorrect && <span className="float-right">✓</span>}
                      {answered && isSelected && !isCorrect && <span className="float-right">✗</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <PrimaryButton onClick={onFinish} disabled={!allAnswered || submitting} className="mt-8">
        {submitting ? 'Saving…' : 'Finish course'}
      </PrimaryButton>
    </div>
  )
}

function CompletionScreen({ level, result, onDone }) {
  const { xpGained, score, total, evolvedTo } = result
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="animate-pop max-w-sm">
        {evolvedTo ? (
          <>
            <p className="text-stone-400 mb-1">You have evolved</p>
            <h1 className="font-display text-5xl text-amber-400 mb-6">{evolvedTo}</h1>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">👑</div>
            <h1 className="font-display text-3xl text-amber-400 mb-2">Course complete</h1>
            <p className="text-stone-400 mb-6">{level.title}</p>
          </>
        )}

        <div className="flex gap-3 justify-center mb-8">
          <Pill label="XP earned" value={`+${xpGained}`} />
          {total > 0 && <Pill label="Quiz" value={`${score}/${total}`} />}
        </div>

        <PrimaryButton onClick={onDone}>Continue the path</PrimaryButton>
      </div>
    </div>
  )
}

function Pill({ label, value }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl px-5 py-3">
      <p className="text-2xl font-bold text-amber-400">{value}</p>
      <p className="text-stone-500 text-xs uppercase tracking-wide">{label}</p>
    </div>
  )
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

function CenterMessage({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-stone-400 px-4 text-center">
      {children}
    </div>
  )
}
