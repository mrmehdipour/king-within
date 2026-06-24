'use client'

import { useEffect, useMemo, useState } from 'react'
import { listJournalQuestions, bulkAddJournalQuestions, deleteJournalQuestion } from '../../../lib/adminData'

const INPUT = 'w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'

export default function JournalAdmin() {
  const [questions, setQuestions] = useState([])
  const [bulk, setBulk] = useState('')
  const [category, setCategory] = useState('custom')
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  async function load() { const { data } = await listJournalQuestions(); setQuestions(data || []) }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function addBulk() {
    const prompts = bulk.split('\n').map((s) => s.trim()).filter(Boolean)
    if (prompts.length === 0) { setMsg('Paste at least one question (one per line).'); return }
    const { error } = await bulkAddJournalQuestions(prompts, category || 'custom')
    if (error) { setMsg(error.message); return }
    setBulk(''); setMsg(`Added ${prompts.length} question${prompts.length > 1 ? 's' : ''}.`)
    await load()
  }
  async function remove(id) { await deleteJournalQuestion(id); load() }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? questions.filter((x) => x.prompt.toLowerCase().includes(q)) : questions
  }, [questions, search])

  return (
    <div>
      <h1 className="font-display text-2xl text-amber-400 mb-1">Journal questions</h1>
      <p className="text-stone-400 text-sm mb-5">The daily-question pool. Each user gets a random one they haven&apos;t seen.</p>

      {/* Bulk add */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <h2 className="text-stone-300 font-semibold mb-2">Bulk add</h2>
        <textarea rows={6} className={INPUT + ' mb-2'} placeholder={'One question per line…\nWhat are you avoiding today?\nWhere did you grow this week?'} value={bulk} onChange={(e) => setBulk(e.target.value)} />
        <div className="flex items-center gap-3">
          <input className={INPUT + ' max-w-[180px]'} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <button onClick={addBulk} className="bg-amber-500 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm">Add all</button>
          {msg && <span className="text-stone-400 text-sm">{msg}</span>}
        </div>
      </div>

      {/* List */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-stone-300 font-semibold">All questions ({questions.length})</h2>
        <input className={INPUT + ' max-w-[220px]'} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        {filtered.map((q) => (
          <div key={q.id} className="flex items-start justify-between bg-stone-900 border border-stone-800 rounded-lg px-3 py-2">
            <span className="text-sm text-stone-200">{q.prompt} {q.category && <span className="text-stone-600 text-xs">· {q.category}</span>}</span>
            <button onClick={() => remove(q.id)} className="text-xs text-stone-600 hover:text-red-400 ml-3 shrink-0">Delete</button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-stone-600 text-sm">No questions{search ? ' match your search' : ' yet'}.</p>}
      </div>
    </div>
  )
}
