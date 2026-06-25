'use client'

import { useEffect, useState } from 'react'
import {
  listLevels, upsertLevel, deleteLevel,
  listBlocks, upsertBlock, deleteBlock,
} from '../../../lib/adminData'

const INPUT = 'w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
const STAGES = ['Initiate', 'Warrior', 'Magician', 'King']
const TYPES = ['reading', 'image', 'video', 'audio', 'writing', 'quiz', 'fill_blank', 'true_false', 'match']
const TYPE_LABEL = {
  reading: 'Reading', image: 'Image', video: 'Video', audio: 'Audio/Podcast', writing: 'Writing',
  quiz: 'Quiz', fill_blank: 'Complete sentence', true_false: 'True/False', match: 'Match pairs',
}

const blankLevel = () => ({
  archetype_stage: 'Initiate', level_number: 1, title: '', content_body: '',
  xp_reward: 40, unlock_requirement: null,
})

function defaultContent(type) {
  switch (type) {
    case 'image': case 'video': case 'audio': return { url: '', caption: '' }
    case 'writing': return { prompt: '' }
    case 'quiz': return { prompt: '', options: ['', '', '', ''], correct_index: 0 }
    case 'true_false': return { statement: '', answer: true }
    case 'fill_blank': return { sentence: '', answer: '' }
    case 'match': return { pairs: [{ left: '', right: '' }, { left: '', right: '' }] }
    default: return { body: '' }
  }
}

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
    setEditing(data)
    await load()
    setMsg('Saved.')
  }

  async function remove(id) {
    if (!confirm('Delete this course and all its parts?')) return
    const { error } = await deleteLevel(id)
    if (error) { setMsg(error.message); return }
    if (editing?.level_id === id) setEditing(null)
    await load()
  }

  const byStage = STAGES.map((s) => ({ stage: s, items: levels.filter((l) => l.archetype_stage === s) }))

  return (
    <div className="grid md:grid-cols-[1fr_1.4fr] gap-6">
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
            <div className="border-t border-stone-800 pt-3 space-y-3">
              <p className="text-amber-400 text-xs">🇮🇷 فارسی</p>
              <Field label="عنوان (Title)"><input dir="rtl" className={INPUT} value={editing.title_fa || ''} onChange={(e) => setEditing({ ...editing, title_fa: e.target.value })} /></Field>
              <Field label="خلاصه (Summary)"><input dir="rtl" className={INPUT} value={editing.content_body_fa || ''} onChange={(e) => setEditing({ ...editing, content_body_fa: e.target.value })} /></Field>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={save} className="bg-amber-500 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm">Save course</button>
              {msg && <span className="text-stone-400 text-sm">{msg}</span>}
            </div>

            {editing.level_id ? (
              <BlocksEditor levelId={editing.level_id} />
            ) : (
              <p className="text-stone-600 text-xs">Save the course first to add parts.</p>
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

function BlocksEditor({ levelId }) {
  const [blocks, setBlocks] = useState([])
  const [newType, setNewType] = useState('reading')

  async function load() {
    const { data } = await listBlocks(levelId)
    setBlocks(data || [])
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId])

  async function add() {
    const sort = blocks.length ? Math.max(...blocks.map((b) => b.sort_order)) + 1 : 1
    await upsertBlock({ level_id: levelId, sort_order: sort, type: newType, content: defaultContent(newType), content_fa: null })
    await load()
  }
  async function move(block, dir) {
    const i = blocks.findIndex((b) => b.id === block.id)
    const j = i + dir
    if (j < 0 || j >= blocks.length) return
    const other = blocks[j]
    await upsertBlock({ id: block.id, level_id: levelId, sort_order: other.sort_order, type: block.type, content: block.content, content_fa: block.content_fa })
    await upsertBlock({ id: other.id, level_id: levelId, sort_order: block.sort_order, type: other.type, content: other.content, content_fa: other.content_fa })
    await load()
  }
  async function removeBlock(id) {
    await deleteBlock(id)
    await load()
  }

  return (
    <div className="mt-6 border-t border-stone-800 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-stone-300 font-semibold">Parts ({blocks.length})</h3>
        <div className="flex items-center gap-2">
          <select className={INPUT + ' w-auto'} value={newType} onChange={(e) => setNewType(e.target.value)}>
            {TYPES.map((tp) => <option key={tp} value={tp}>{TYPE_LABEL[tp]}</option>)}
          </select>
          <button onClick={add} className="text-sm bg-amber-500 text-stone-900 font-semibold px-3 py-1.5 rounded-lg shrink-0">+ Add</button>
        </div>
      </div>
      <div className="space-y-3">
        {blocks.map((b, i) => (
          <BlockEditor
            key={b.id} block={b} index={i} total={blocks.length}
            onMove={(dir) => move(b, dir)} onDelete={() => removeBlock(b.id)} onSaved={load}
          />
        ))}
        {blocks.length === 0 && <p className="text-stone-600 text-sm">No parts yet. Add one above.</p>}
      </div>
    </div>
  )
}

function BlockEditor({ block, index, total, onMove, onDelete, onSaved }) {
  const [content, setContent] = useState(block.content || {})
  const [fa, setFa] = useState(block.content_fa || {})
  const [saved, setSaved] = useState(false)

  const setC = (patch) => setContent((c) => ({ ...c, ...patch }))
  const setF = (patch) => setFa((c) => ({ ...c, ...patch }))

  async function save() {
    await upsertBlock({ id: block.id, level_id: block.level_id, sort_order: block.sort_order, type: block.type, content, content_fa: fa })
    setSaved(true)
    setTimeout(() => setSaved(false), 1000)
    onSaved()
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">{index + 1}. {TYPE_LABEL[block.type] || block.type}</span>
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => onMove(-1)} disabled={index === 0} className="text-stone-500 hover:text-stone-200 disabled:opacity-30">↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} className="text-stone-500 hover:text-stone-200 disabled:opacity-30">↓</button>
          <button onClick={onDelete} className="text-stone-600 hover:text-red-400">Delete</button>
        </div>
      </div>

      <BlockFields blockId={block.id} type={block.type} content={content} fa={fa} setC={setC} setF={setF} />

      <div className="flex items-center gap-3 mt-2">
        <button onClick={save} className="text-sm bg-stone-700 hover:bg-stone-600 px-3 py-1 rounded">Save part</button>
        {saved && <span className="text-green-400 text-xs">✓ saved</span>}
      </div>
    </div>
  )
}

function BlockFields({ blockId, type, content, fa, setC, setF }) {
  if (type === 'reading') {
    return (
      <>
        <textarea rows={6} className={INPUT} placeholder="Text (Markdown)" value={content.body || ''} onChange={(e) => setC({ body: e.target.value })} />
        <textarea dir="rtl" rows={6} className={INPUT + ' mt-2'} placeholder="متن (فارسی)" value={fa.body || ''} onChange={(e) => setF({ body: e.target.value })} />
      </>
    )
  }
  if (type === 'image' || type === 'video' || type === 'audio') {
    return (
      <>
        <input className={INPUT} placeholder={type === 'image' ? 'Image URL' : type === 'video' ? 'Video URL (Aparat / YouTube / .mp4)' : 'Audio URL (.mp3 or embed)'} value={content.url || ''} onChange={(e) => setC({ url: e.target.value })} />
        <input className={INPUT + ' mt-2'} placeholder="Caption (optional)" value={content.caption || ''} onChange={(e) => setC({ caption: e.target.value })} />
        <input dir="rtl" className={INPUT + ' mt-2'} placeholder="عنوان/توضیح (اختیاری)" value={fa.caption || ''} onChange={(e) => setF({ caption: e.target.value })} />
      </>
    )
  }
  if (type === 'writing') {
    return (
      <>
        <textarea rows={2} className={INPUT} placeholder="Prompt" value={content.prompt || ''} onChange={(e) => setC({ prompt: e.target.value })} />
        <textarea dir="rtl" rows={2} className={INPUT + ' mt-2'} placeholder="پرسش (فارسی)" value={fa.prompt || ''} onChange={(e) => setF({ prompt: e.target.value })} />
      </>
    )
  }
  if (type === 'quiz') {
    const opts = content.options || ['', '', '', '']
    const optsFa = fa.options || ['', '', '', '']
    return (
      <>
        <input className={INPUT} placeholder="Question" value={content.prompt || ''} onChange={(e) => setC({ prompt: e.target.value })} />
        {opts.map((o, i) => (
          <div key={i} className="flex items-center gap-2 mt-1.5">
            <input type="radio" name={`correct-${blockId}`} checked={Number(content.correct_index) === i} onChange={() => setC({ correct_index: i })} title="Correct" />
            <input className={INPUT} placeholder={`Option ${i + 1}`} value={o} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setC({ options: n }) }} />
          </div>
        ))}
        <input dir="rtl" className={INPUT + ' mt-2'} placeholder="پرسش (فارسی)" value={fa.prompt || ''} onChange={(e) => setF({ prompt: e.target.value })} />
        {optsFa.map((o, i) => (
          <input key={i} dir="rtl" className={INPUT + ' mt-1.5'} placeholder={`گزینه ${i + 1}`} value={o} onChange={(e) => { const n = [...optsFa]; n[i] = e.target.value; setF({ options: n }) }} />
        ))}
      </>
    )
  }
  if (type === 'true_false') {
    return (
      <>
        <input className={INPUT} placeholder="Statement" value={content.statement || ''} onChange={(e) => setC({ statement: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-stone-300 mt-2">
          <input type="checkbox" checked={!!content.answer} onChange={(e) => setC({ answer: e.target.checked })} /> Statement is TRUE
        </label>
        <input dir="rtl" className={INPUT + ' mt-2'} placeholder="گزاره (فارسی)" value={fa.statement || ''} onChange={(e) => setF({ statement: e.target.value })} />
      </>
    )
  }
  if (type === 'fill_blank') {
    return (
      <>
        <input className={INPUT} placeholder="Sentence with ___ for the blank" value={content.sentence || ''} onChange={(e) => setC({ sentence: e.target.value })} />
        <input className={INPUT + ' mt-1.5'} placeholder="Answer (use | for alternatives)" value={content.answer || ''} onChange={(e) => setC({ answer: e.target.value })} />
        <input dir="rtl" className={INPUT + ' mt-2'} placeholder="جمله با ___ (فارسی)" value={fa.sentence || ''} onChange={(e) => setF({ sentence: e.target.value })} />
        <input dir="rtl" className={INPUT + ' mt-1.5'} placeholder="پاسخ (فارسی)" value={fa.answer || ''} onChange={(e) => setF({ answer: e.target.value })} />
      </>
    )
  }
  if (type === 'match') {
    const pairs = content.pairs || []
    const pairsFa = fa.pairs || []
    const setPair = (i, key, val) => { const n = pairs.map((p) => ({ ...p })); n[i] = { ...n[i], [key]: val }; setC({ pairs: n }) }
    const setPairFa = (i, key, val) => { const n = (pairsFa.length ? pairsFa : pairs.map(() => ({}))).map((p) => ({ ...p })); n[i] = { ...n[i], [key]: val }; setF({ pairs: n }) }
    return (
      <>
        {pairs.map((p, i) => (
          <div key={i} className="grid grid-cols-2 gap-1.5 mt-1.5">
            <input className={INPUT} placeholder="Left" value={p.left || ''} onChange={(e) => setPair(i, 'left', e.target.value)} />
            <input className={INPUT} placeholder="Right" value={p.right || ''} onChange={(e) => setPair(i, 'right', e.target.value)} />
            <input dir="rtl" className={INPUT} placeholder="چپ (فارسی)" value={pairsFa[i]?.left || ''} onChange={(e) => setPairFa(i, 'left', e.target.value)} />
            <input dir="rtl" className={INPUT} placeholder="راست (فارسی)" value={pairsFa[i]?.right || ''} onChange={(e) => setPairFa(i, 'right', e.target.value)} />
          </div>
        ))}
        <button onClick={() => setC({ pairs: [...pairs, { left: '', right: '' }] })} className="text-amber-400 text-xs mt-2">+ Add pair</button>
      </>
    )
  }
  return null
}
