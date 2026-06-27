'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { marked } from 'marked'
import { supabase } from '../lib/supabaseClient'
import { awardXp } from '../lib/xp'
import { useLang } from '../lib/i18n'
import { videoEmbed, audioEmbed } from '../lib/media'
import BreathingIntro from '../components/BreathingIntro'
import Paywall from '../components/Paywall'

const GRADED = new Set(['quiz', 'fill_blank', 'true_false', 'match'])
const norm = (s) => String(s ?? '').trim().toLowerCase()
// Minimum fraction of graded parts the user must get right to pass a course.
const PASS_RATIO = 0.7

export default function CoursePage() {
  return (
    <Suspense fallback={<CenterMessage>…</CenterMessage>}>
      <CoursePlayer />
    </Suspense>
  )
}

// Per-field localization for a block (Persian with English fallback).
function bf(block, field, locale) {
  if (locale === 'fa' && block.content_fa && block.content_fa[field] != null && block.content_fa[field] !== '') {
    return block.content_fa[field]
  }
  return block.content?.[field]
}

function CoursePlayer() {
  const router = useRouter()
  const { t, locale } = useLang()
  const params = useSearchParams()
  const levelId = params.get('id') != null ? Number(params.get('id')) : null

  const [level, setLevel] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [wasCompleted, setWasCompleted] = useState(false)
  const [gated, setGated] = useState(false) // hit the free/Pro daily limit
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  const [started, setStarted] = useState(false) // breathing intro gate
  const [stepIndex, setStepIndex] = useState(0)
  const [stepState, setStepState] = useState({}) // index -> { value, hasAnswer, checked, correct }
  const [submitting, setSubmitting] = useState(false)
  const [finished, setFinished] = useState(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/signup'); return }

    const [{ data: levelData }, { data: blockData }, { data: existing }] = await Promise.all([
      supabase.from('levels').select('*').eq('level_id', levelId).single(),
      supabase.from('course_blocks').select('*').eq('level_id', levelId).order('sort_order', { ascending: true }),
      supabase.from('user_progress').select('status').eq('user_id', user.id).eq('level_id', levelId).maybeSingle(),
    ])
    setLevel(levelData)
    setBlocks(blockData || [])
    const alreadyDone = existing?.status === 'completed'
    if (alreadyDone) setWasCompleted(true)

    // Daily limit: free = 1 course/day, Pro = 3 (a full level). Re-opening an
    // already-completed course is always allowed; only NEW courses are gated.
    if (!alreadyDone) {
      const startOfToday = new Date(new Date().toISOString().slice(0, 10)).toISOString()
      const [{ data: prof }, { count }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('xp_events').select('id', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('source', 'course').gte('created_at', startOfToday),
      ])
      const pro = !!prof?.is_pro
      setIsPro(pro)
      if ((count ?? 0) >= (pro ? 3 : 1)) setGated(true)
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

  const setS = (idx, patch) => setStepState((s) => ({ ...s, [idx]: { ...s[idx], ...patch } }))

  const titleLoc = useMemo(
    () => (level ? (locale === 'fa' ? level.title_fa || level.title : level.title) : ''),
    [level, locale]
  )

  if (loading) return <CenterMessage>{t('course.loading')}</CenterMessage>
  if (!level) {
    return (
      <CenterMessage>
        {t('course.notFound')}
        <button onClick={() => router.push('/learn')} className="mt-4 text-amber-400 underline">{t('course.back')}</button>
      </CenterMessage>
    )
  }
  if (blocks.length === 0) {
    return (
      <CenterMessage>
        {t('course.noParts')}
        <button onClick={() => router.push('/learn')} className="mt-4 text-amber-400 underline">{t('course.back')}</button>
      </CenterMessage>
    )
  }

  // Hit the daily course limit on a not-yet-completed course → upsell.
  if (gated && !wasCompleted && !finished) {
    return <Paywall t={t} isPro={isPro} onBack={() => router.push('/learn')} onGetPro={() => router.push('/pro')} />
  }

  // Breathing ritual before the lesson begins (shown once per visit).
  if (!started && !finished) {
    return <BreathingIntro onDone={() => setStarted(true)} t={t} />
  }

  const block = blocks[stepIndex]
  const st = stepState[stepIndex] || {}
  const isGraded = GRADED.has(block.type)
  const isLast = stepIndex === blocks.length - 1

  // Footer button state
  let canPrimary = true
  let primaryMode = 'continue' // 'continue' | 'check'
  if (block.type === 'writing') canPrimary = !!norm(st.value)
  else if (block.type === 'match') canPrimary = !!st.checked // auto-grades when all matched
  else if (isGraded) {
    if (!st.checked) { primaryMode = 'check'; canPrimary = !!st.hasAnswer }
  }

  function grade() {
    let correct = false
    if (block.type === 'quiz') correct = st.value === bf(block, 'correct_index', locale)
    else if (block.type === 'true_false') correct = st.value === !!bf(block, 'answer', locale)
    else if (block.type === 'fill_blank') {
      const accepted = String(bf(block, 'answer', locale) ?? '').split('|').map(norm)
      correct = accepted.includes(norm(st.value))
    }
    setS(stepIndex, { checked: true, correct })
  }

  async function advance() {
    if (!isLast) { setStepIndex(stepIndex + 1); return }
    // finish
    if (submitting) return
    setSubmitting(true)

    const gradedSteps = blocks.map((b, i) => ({ b, s: stepState[i] || {} })).filter((x) => GRADED.has(x.b.type))
    const total = gradedSteps.length
    const score = gradedSteps.filter((x) => x.s.correct).length
    const passed = total === 0 || score / total >= PASS_RATIO
    const writing = blocks
      .map((b, i) => (b.type === 'writing' ? (stepState[i]?.value || '') : ''))
      .filter(Boolean)
      .join('\n\n')

    const { data: { user } } = await supabase.auth.getUser()
    if (wasCompleted) {
      setFinished({ passed: true, xpGained: 0, score, total, evolvedTo: null })
      setSubmitting(false)
      return
    }
    // Didn't reach the passing score — no completion, no XP; let them retry.
    if (!passed) {
      setFinished({ passed: false, xpGained: 0, score, total, evolvedTo: null })
      setSubmitting(false)
      return
    }
    await supabase.from('user_progress').upsert(
      {
        user_id: user.id, level_id: level.level_id, status: 'completed',
        submission_content: writing, quiz_score: score, quiz_total: total,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,level_id' }
    )

    // Capture each individual answer (for the future AI personality analysis).
    const answerRows = blocks
      .map((b, i) => ({ b, s: stepState[i] || {} }))
      .filter(({ b, s }) => (b.type === 'writing' ? !!norm(s.value) : GRADED.has(b.type)))
      .map(({ b, s }) => ({
        user_id: user.id,
        level_id: level.level_id,
        block_id: b.id,
        type: b.type,
        answer: { value: s.value ?? null },
        is_correct: GRADED.has(b.type) ? !!s.correct : null,
      }))
    if (answerRows.length) await supabase.from('user_answers').insert(answerRows)

    const { evolvedTo } = await awardXp({
      userId: user.id, source: 'course', sourceRef: level.level_id, amount: level.xp_reward,
      profilePatch: { current_level: level.level_number + 1 },
    })
    setFinished({ passed: true, xpGained: level.xp_reward, score, total, evolvedTo })
    setSubmitting(false)
  }

  function onPrimary() {
    if (primaryMode === 'check') grade()
    else advance()
  }

  function retry() {
    setFinished(null)
    setStepIndex(0)
    setStepState({})
  }

  if (finished) {
    return <CompletionScreen title={titleLoc} result={finished} onDone={() => router.push('/learn')} onRetry={retry} t={t} />
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <header className="pt-safe sticky top-0 bg-stone-950/95 backdrop-blur z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/learn')} aria-label="Exit" className="text-stone-500 hover:text-stone-300 transition shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex-1 flex gap-1.5">
            {blocks.map((b, i) => (
              <div key={b.id} className="flex-1 h-2.5 rounded-full bg-stone-800 overflow-hidden">
                <div className={`h-full bg-amber-500 transition-all ${i <= stepIndex ? 'w-full' : 'w-0'}`} />
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6">
        <div key={block.id} className="animate-pop">
          <BlockView block={block} locale={locale} t={t} state={st} setState={(p) => setS(stepIndex, p)} />
        </div>
      </main>

      <footer className="sticky bottom-0 bg-stone-950/95 backdrop-blur pb-safe">
        <div className="max-w-xl mx-auto px-4 py-4">
          {isGraded && st.checked && (
            <p className={`text-sm mb-2 font-medium ${st.correct ? 'text-green-400' : 'text-red-400'}`}>
              {st.correct ? t('course.correct') : t('course.incorrect')}
            </p>
          )}
          <PrimaryButton onClick={onPrimary} disabled={!canPrimary || submitting}>
            {submitting ? t('course.saving')
              : primaryMode === 'check' ? t('course.check')
              : isLast ? t('course.finish') : t('course.continue')}
          </PrimaryButton>
        </div>
      </footer>
    </div>
  )
}

// ---- Block renderer ----
function BlockView({ block, locale, t, state, setState }) {
  switch (block.type) {
    case 'reading':
      return <ReadingBlock html={marked.parse(bf(block, 'body', locale) || '')} />
    case 'image':
      return <ImageBlock url={bf(block, 'url', locale)} caption={bf(block, 'caption', locale)} />
    case 'video':
      return <MediaBlock embed={videoEmbed(bf(block, 'url', locale))} caption={bf(block, 'caption', locale)} label={t('course.watch')} />
    case 'audio':
      return <MediaBlock embed={audioEmbed(bf(block, 'url', locale))} caption={bf(block, 'caption', locale)} label={t('course.listen')} />
    case 'writing':
      return <WritingBlock prompt={bf(block, 'prompt', locale)} value={state.value || ''} onChange={(v) => setState({ value: v })} t={t} />
    case 'quiz':
      return <QuizBlock block={block} locale={locale} state={state} setState={setState} />
    case 'true_false':
      return <TrueFalseBlock block={block} locale={locale} state={state} setState={setState} t={t} />
    case 'fill_blank':
      return <FillBlankBlock block={block} locale={locale} state={state} setState={setState} t={t} />
    case 'match':
      return <MatchBlock block={block} locale={locale} state={state} setState={setState} t={t} />
    default:
      return <p className="text-stone-500">Unsupported part.</p>
  }
}

function ReadingBlock({ html }) {
  return <article className="prose-kw" dangerouslySetInnerHTML={{ __html: html }} />
}

function ImageBlock({ url, caption }) {
  return (
    <figure className="text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={caption || ''} className="w-full rounded-2xl border border-stone-800" />
      {caption && <figcaption className="text-stone-400 text-sm mt-3">{caption}</figcaption>}
    </figure>
  )
}

function MediaBlock({ embed, caption, label }) {
  if (!embed) return <p className="text-stone-500">{label}</p>
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">{label}</p>
      {embed.kind === 'iframe' && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-stone-800" style={{ aspectRatio: '16 / 9' }}>
          <iframe src={embed.src} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={caption || label} />
        </div>
      )}
      {embed.kind === 'video' && <video src={embed.src} controls className="w-full rounded-2xl border border-stone-800" />}
      {embed.kind === 'audio' && <audio src={embed.src} controls className="w-full" />}
      {caption && <p className="text-stone-400 text-sm mt-3">{caption}</p>}
    </div>
  )
}

function WritingBlock({ prompt, value, onChange, t }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">✍️ {t('course.thinking')}</p>
      <h2 className="text-xl font-semibold text-white mb-4 leading-snug">{prompt}</h2>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)} rows={7}
        placeholder={t('course.thinkingPlaceholder')}
        className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white placeholder-stone-600 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
      />
      <p className="text-stone-600 text-xs mt-2">{t('course.thinkingHint')}</p>
    </div>
  )
}

function Choice({ children, onClick, disabled, tone }) {
  const cls =
    tone === 'correct' ? 'border-green-500 bg-green-500/15 text-green-300'
      : tone === 'wrong' ? 'border-red-500 bg-red-500/15 text-red-300'
      : tone === 'selected' ? 'border-amber-500 bg-amber-500/15 text-white'
      : 'border-stone-700 bg-stone-900 text-stone-200 hover:border-stone-500'
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full text-start px-4 py-3 rounded-xl border transition ${cls} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
      {children}
    </button>
  )
}

function QuizBlock({ block, locale, state, setState }) {
  const prompt = bf(block, 'prompt', locale)
  const options = bf(block, 'options', locale) || []
  const correct = bf(block, 'correct_index', locale)
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">✅ {bfLabel(block)}</p>
      <h2 className="text-xl font-semibold text-white mb-5">{prompt}</h2>
      <div className="space-y-2">
        {options.map((opt, i) => {
          let tone = state.value === i ? 'selected' : null
          if (state.checked) tone = i === correct ? 'correct' : state.value === i ? 'wrong' : null
          return (
            <Choice key={i} disabled={state.checked} tone={tone} onClick={() => setState({ value: i, hasAnswer: true })}>
              {opt}
            </Choice>
          )
        })}
      </div>
    </div>
  )
}

function TrueFalseBlock({ block, locale, state, setState, t }) {
  const statement = bf(block, 'statement', locale)
  const answer = !!bf(block, 'answer', locale)
  const opts = [{ v: true, label: t('course.true') }, { v: false, label: t('course.false') }]
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">⚖️ {t('course.trueFalse')}</p>
      <h2 className="text-xl font-semibold text-white mb-5">{statement}</h2>
      <div className="grid grid-cols-2 gap-3">
        {opts.map((o) => {
          let tone = state.value === o.v ? 'selected' : null
          if (state.checked) tone = o.v === answer ? 'correct' : state.value === o.v ? 'wrong' : null
          return (
            <Choice key={String(o.v)} disabled={state.checked} tone={tone} onClick={() => setState({ value: o.v, hasAnswer: true })}>
              <span className="block text-center font-medium">{o.label}</span>
            </Choice>
          )
        })}
      </div>
    </div>
  )
}

function FillBlankBlock({ block, locale, state, setState, t }) {
  const sentence = bf(block, 'sentence', locale) || ''
  const [before, after] = sentence.split('___')
  const answer = bf(block, 'answer', locale)
  const isCorrect = state.checked && state.correct
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">✏️ {t('course.fillBlank')}</p>
      <p className="text-lg text-stone-200 leading-relaxed mb-5">
        {before}
        <input
          value={state.value || ''} disabled={state.checked}
          onChange={(e) => setState({ value: e.target.value, hasAnswer: !!e.target.value.trim() })}
          className={`mx-1 px-2 py-1 rounded-lg bg-stone-900 border text-white w-40 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            state.checked ? (isCorrect ? 'border-green-500' : 'border-red-500') : 'border-stone-600'
          }`}
        />
        {after}
      </p>
      {state.checked && !isCorrect && (
        <p className="text-stone-400 text-sm">{t('course.answerWas')} <span className="text-green-400">{String(answer).split('|')[0]}</span></p>
      )}
    </div>
  )
}

function strHash(s) {
  let h = 0
  const str = String(s ?? '')
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h
}

function MatchBlock({ block, locale, state, setState, t }) {
  const pairs = bf(block, 'pairs', locale) || []
  // Deterministic re-order of the right column (pure — no Math.random in render).
  const rights = useMemo(
    () => pairs.map((p, i) => ({ i, right: p.right })).sort((a, b) => strHash(a.right) - strHash(b.right)),
    [block.id, locale] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const matched = state.matched || {} // leftIndex -> true
  const selLeft = state.selLeft ?? null

  function tapLeft(i) {
    if (matched[i]) return
    setState({ selLeft: i })
  }
  function tapRight(ri) {
    if (selLeft == null) return
    if (ri === selLeft) {
      const nm = { ...matched, [selLeft]: true }
      const done = Object.keys(nm).length === pairs.length
      setState({ matched: nm, selLeft: null, hasAnswer: done, checked: done, correct: done })
    } else {
      setState({ selLeft: null }) // wrong, deselect
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-amber-500 mb-3">🔗 {t('course.match')}</p>
      <h2 className="text-base text-stone-300 mb-4">{t('course.matchHint')}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <Choice key={i} disabled={matched[i]} tone={matched[i] ? 'correct' : selLeft === i ? 'selected' : null} onClick={() => tapLeft(i)}>
              {p.left}
            </Choice>
          ))}
        </div>
        <div className="space-y-2">
          {rights.map((r) => (
            <Choice key={r.i} disabled={matched[r.i]} tone={matched[r.i] ? 'correct' : null} onClick={() => tapRight(r.i)}>
              {r.right}
            </Choice>
          ))}
        </div>
      </div>
    </div>
  )
}

function bfLabel(block) {
  return block.type === 'quiz' ? 'Quiz' : block.type
}

function CompletionScreen({ title, result, onDone, onRetry, t }) {
  const { passed, xpGained, score, total, evolvedTo } = result

  if (passed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="animate-pop max-w-sm">
          <div className="text-6xl mb-4">🦁</div>
          <h1 className="font-display text-3xl text-amber-400 mb-2">{t('course.failed')}</h1>
          <p className="text-stone-400 mb-6">{t('course.failedMsg', { pct: Math.round(PASS_RATIO * 100) })}</p>
          <div className="flex gap-3 justify-center mb-8">
            <Pill label={t('course.quiz')} value={`${score}/${total}`} />
          </div>
          <PrimaryButton onClick={onRetry}>{t('course.tryAgain')}</PrimaryButton>
          <button onClick={onDone} className="mt-3 text-stone-500 underline text-sm">{t('course.back')}</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="animate-pop max-w-sm">
        {evolvedTo ? (
          <>
            <p className="text-stone-400 mb-1">{t('course.evolved')}</p>
            <h1 className="font-display text-5xl text-amber-400 mb-6">{evolvedTo}</h1>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">👑</div>
            <h1 className="font-display text-3xl text-amber-400 mb-2">{t('course.complete')}</h1>
            <p className="text-stone-400 mb-6">{title}</p>
          </>
        )}
        <div className="flex gap-3 justify-center mb-8">
          <Pill label={t('course.xpEarned')} value={`+${xpGained}`} />
          {total > 0 && <Pill label={t('course.quiz')} value={`${score}/${total}`} />}
        </div>
        <PrimaryButton onClick={onDone}>{t('course.continuePath')}</PrimaryButton>
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
    <button {...props} className={`w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3.5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  )
}

function CenterMessage({ children }) {
  return <div className="min-h-screen flex flex-col items-center justify-center text-stone-400 px-4 text-center">{children}</div>
}
