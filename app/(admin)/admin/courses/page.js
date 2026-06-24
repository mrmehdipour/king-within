'use client'

import { useEffect, useState } from 'react'
import {
  listLevels, upsertLevel, deleteLevel,
  listQuestions, upsertQuestion, deleteQuestion,
} from '../../../lib/adminData'

const INPUT = 'w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
const STAGES = ['Initiate', 'Warrior', 'Magician', 'King']

const blankLevel = () => ({
  archetype_stage: 'Initiate', level_number: 1, title: '', content_body: '',
  reading_text: '', critical_thinking_prompt: '', xp_reward: 40, unlock_requirement: null,
})

export default function CoursesAdmin() {
  const [levels, setLevels] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data } = await listLevels()
    setLevels(data || [])
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function save() {
    setMsg('')
    const row = { ...editing }
    if (!row.title || !row.archetype_stage) { setMsg('Title and stage are required.'); return }
    row.level_number = Number(row.level_number) || 1
    row.xp_reward = Number(row.xp_reward) || 0
    row.unlock_requirement = row.unlock_requirement ? Number(row.unlock_requirement) : null
    const { data, error } = await upsertLevel(row)
    if (error) { setMsg(error.message); return }
    setEditing(data) // now has level_id → questions can be attached
    await load()
    setMsg('Saved.')
  }

  async function remove(id) {
    if (!confirm('Delete this course and its questions?')) return
    const { error } = await deleteLevel(id)
    if (error) { setMsg(error.message); return }
    if (editing?.level_id === id) setEditing(null)
    await load()
  }

  const byStage = STAGES.map((s) => ({ stage: s, items: levels.filter((l) => l.archetype_stage === s) }))

  return (
    <div className="grid md:grid-cols-[1fr_1.4fr] gap-6">
      {/* List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl text-amber-400">Courses</h1>
          <button onClick={() => { setEditing(blankLevel()); setMsg('') }} className="text-sm bg-amber-500 text-stone-900 font-semibold px-3 py-1.5 rounded-lg">+ New</button>
        </div>
        {byStage.map(({ stage, items }) => (
          <div key={stage} className="mb-4">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-1">{stage}</p>
            {items.length === 0 && <p className="text-stone-700 text-sm">—</p>}
            {items.map((l) => (
              <div key={l.level_id} className={`flex items-center justify-between rounded-lg px-3 py-2 mb-1 border ${editing?.level_id === l.level_id ? 'border-amber-600 bg-stone-900' : 'border-stone-800 bg-stone-900/50'}`}>
                <button onClick={() => setEditing(l)} className="text-left text-sm text-stone-200 flex-1">
                  <span className="text-stone-500">#{l.level_number}</span> {l.title}
                </button>
                <button onClick={() => remove(l.level_id)} className="text-stone-600 hover:text-red-400 text-xs ml-2">Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div>
        {!editing ? (
          <p className="text-stone-500 text-sm">Select a course to edit, or create a new one.</p>
        ) : (
          <div className="space-y-3">
            <h2 className="text-stone-300 font-semibold">{editing.level_id ? 'Edit course' : 'New course'}</h2>
            <Field label="Title"><input className={INPUT} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Stage">
                <select className={INPUT} value={editing.archetype_stage} onChange={(e) => setEditing({ ...editing, archetype_stage: e.target.value })}>
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Order #"><input type="number" className={INPUT} value={editing.level_number} onChange={(e) => setEditing({ ...editing, level_number: e.target.value })} /></Field>
              <Field label="XP"><input type="number" className={INPUT} value={editing.xp_reward} onChange={(e) => setEditing({ ...editing, xp_reward: e.target.value })} /></Field>
            </div>
            <Field label="Unlocked by (prerequisite)">
              <select className={INPUT} value={editing.unlock_requirement ?? ''} onChange={(e) => setEditing({ ...editing, unlock_requirement: e.target.value || null })}>
                <option value="">None (open from start)</option>
                {levels.filter((l) => l.level_id !== editing.level_id).map((l) => (
                  <option key={l.level_id} value={l.level_id}>#{l.level_number} {l.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Summary (one line under the title)"><input className={INPUT} value={editing.content_body || ''} onChange={(e) => setEditing({ ...editing, content_body: e.target.value })} /></Field>
            <Field label="Reading passage (blank line between paragraphs)"><textarea rows={7} className={INPUT} value={editing.reading_text || ''} onChange={(e) => setEditing({ ...editing, reading_text: e.target.value })} /></Field>
            <Field label="Critical-thinking prompt"><textarea rows={2} className={INPUT} value={editing.critical_thinking_prompt || ''} onChange={(e) => setEditing({ ...editing, critical_thinking_prompt: e.target.value })} /></Field>

            <div className="flex items-center gap-3">
              <button onClick={save} className="bg-amber-500 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm">Save course</button>
              {msg && <span className="text-stone-400 text-sm">{msg}</span>}
            </div>

            {editing.level_id ? (
              <QuestionsEditor levelId={editing.level_id} />
            ) : (
              <p className="text-stone-600 text-xs">Save the course first to add quiz questions.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-stone-400 text-xs mb-1">{label}</span>
      {children}
    </label>
  )
}

function QuestionsEditor({ levelId }) {
  const [questions, setQuestions] = useState([])

  async function load() {
    const { data } = await listQuestions(levelId)
    setQuestions(data || [])
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId])

  async function addBlank() {
    await upsertQuestion({
      level_id: levelId, prompt: 'New question',
      options: ['', '', '', ''], correct_index: 0, sort_order: questions.length + 1,
    })
    await load()
  }
  async function removeQ(id) {
    await deleteQuestion(id)
    await load()
  }

  return (
    <div className="mt-6 border-t border-stone-800 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-stone-300 font-semibold">Quiz questions ({questions.length})</h3>
        <button onClick={addBlank} className="text-sm text-amber-400">+ Add question</button>
      </div>
      <div className="space-y-4">
        {questions.map((q) => <QuestionRow key={q.id} q={q} onSaved={load} onDelete={() => removeQ(q.id)} />)}
      </div>
    </div>
  )
}

function QuestionRow({ q, onSaved, onDelete }) {
  const [prompt, setPrompt] = useState(q.prompt)
  const [options, setOptions] = useState(Array.isArray(q.options) ? q.options : ['', '', '', ''])
  const [correct, setCorrect] = useState(q.correct_index ?? 0)
  const [saved, setSaved] = useState(false)

  async function save() {
    await upsertQuestion({ id: q.id, level_id: q.level_id, prompt, options, correct_index: Number(correct), sort_order: q.sort_order })
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
    onSaved()
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-3">
      <input className={INPUT + ' mb-2'} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <input type="radio" name={`correct-${q.id}`} checked={Number(correct) === i} onChange={() => setCorrect(i)} title="Mark correct" />
          <input className={INPUT} value={opt} placeholder={`Option ${i + 1}`} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n) }} />
        </div>
      ))}
      <div className="flex items-center gap-3 mt-2">
        <button onClick={save} className="text-sm bg-stone-700 hover:bg-stone-600 px-3 py-1 rounded">Save</button>
        <button onClick={onDelete} className="text-xs text-stone-500 hover:text-red-400">Delete</button>
        {saved && <span className="text-green-400 text-xs">✓ saved</span>}
      </div>
    </div>
  )
}
