'use client'

import { useEffect, useState } from 'react'
import {
  listTracks, upsertTrack, deleteTrack,
  listPosts, upsertPost, deletePost,
} from '../../../lib/adminData'

const INPUT = 'w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500'
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export default function BlogAdmin() {
  const [tab, setTab] = useState('posts')
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <h1 className="font-display text-2xl text-amber-400 mr-2">Blog</h1>
        {['posts', 'tracks'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-sm px-3 py-1.5 rounded-lg capitalize ${tab === t ? 'bg-amber-500/15 text-amber-400' : 'text-stone-400'}`}>{t}</button>
        ))}
      </div>
      {tab === 'tracks' ? <Tracks /> : <Posts />}
    </div>
  )
}

function Field({ label, children }) {
  return <label className="block"><span className="block text-stone-400 text-xs mb-1">{label}</span>{children}</label>
}

function Tracks() {
  const [tracks, setTracks] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  async function load() { const { data } = await listTracks(); setTracks(data || []) }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function save() {
    const row = { ...editing, slug: editing.slug || slugify(editing.title || '') }
    if (!row.title) { setMsg('Title required'); return }
    row.sort_order = Number(row.sort_order) || 0
    const { data, error } = await upsertTrack(row)
    if (error) { setMsg(error.message); return }
    setEditing(data); await load(); setMsg('Saved.')
  }
  async function remove(id) { if (!confirm('Delete track? Posts keep but lose their track.')) return; await deleteTrack(id); setEditing(null); load() }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <button onClick={() => { setEditing({ title: '', slug: '', description: '', sort_order: tracks.length + 1, published: true }); setMsg('') }} className="text-sm bg-amber-500 text-stone-900 font-semibold px-3 py-1.5 rounded-lg mb-3">+ New track</button>
        {tracks.map((t) => (
          <div key={t.id} className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 mb-1">
            <button onClick={() => setEditing(t)} className="text-sm text-stone-200 text-left flex-1">{t.title} {!t.published && <span className="text-stone-600">(draft)</span>}</button>
            <button onClick={() => remove(t.id)} className="text-xs text-stone-600 hover:text-red-400">Delete</button>
          </div>
        ))}
      </div>
      {editing && (
        <div className="space-y-3">
          <Field label="Title"><input className={INPUT} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
          <Field label="Slug (auto if blank)"><input className={INPUT} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={2} className={INPUT} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Sort order"><input type="number" className={INPUT} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></Field>
            <label className="flex items-end gap-2 text-sm text-stone-300 pb-2"><input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
          </div>
          <div className="flex items-center gap-3"><button onClick={save} className="bg-amber-500 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm">Save</button>{msg && <span className="text-stone-400 text-sm">{msg}</span>}</div>
        </div>
      )}
    </div>
  )
}

function Posts() {
  const [posts, setPosts] = useState([])
  const [tracks, setTracks] = useState([])
  const [editing, setEditing] = useState(null)
  const [msg, setMsg] = useState('')

  async function load() {
    const [{ data: p }, { data: t }] = await Promise.all([listPosts(), listTracks()])
    setPosts(p || []); setTracks(t || [])
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  function blank() {
    return { title: '', slug: '', track_id: null, order_in_track: 1, excerpt: '', category: '', reading_minutes: 3, body: '', published: false }
  }
  async function save() {
    const row = { ...editing, slug: editing.slug || slugify(editing.title || '') }
    if (!row.title) { setMsg('Title required'); return }
    row.order_in_track = Number(row.order_in_track) || 0
    row.reading_minutes = Number(row.reading_minutes) || 3
    row.track_id = row.track_id ? Number(row.track_id) : null
    if (row.published && !row.published_at) row.published_at = new Date().toISOString()
    const { data, error } = await upsertPost(row)
    if (error) { setMsg(error.message); return }
    setEditing(data); await load(); setMsg('Saved.')
  }
  async function remove(id) { if (!confirm('Delete post?')) return; await deletePost(id); setEditing(null); load() }

  return (
    <div className="grid md:grid-cols-[1fr_1.4fr] gap-6">
      <div>
        <button onClick={() => { setEditing(blank()); setMsg('') }} className="text-sm bg-amber-500 text-stone-900 font-semibold px-3 py-1.5 rounded-lg mb-3">+ New post</button>
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-lg px-3 py-2 mb-1">
            <button onClick={() => setEditing(p)} className="text-sm text-stone-200 text-left flex-1">{p.title} {!p.published && <span className="text-stone-600">(draft)</span>}</button>
            <button onClick={() => remove(p.id)} className="text-xs text-stone-600 hover:text-red-400">Delete</button>
          </div>
        ))}
      </div>
      {editing && (
        <div className="space-y-3">
          <Field label="Title"><input className={INPUT} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Slug (auto if blank)"><input className={INPUT} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
            <Field label="Category"><input className={INPUT} value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Track">
              <select className={INPUT} value={editing.track_id ?? ''} onChange={(e) => setEditing({ ...editing, track_id: e.target.value || null })}>
                <option value="">None (standalone)</option>
                {tracks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </Field>
            <Field label="Order in track"><input type="number" className={INPUT} value={editing.order_in_track} onChange={(e) => setEditing({ ...editing, order_in_track: e.target.value })} /></Field>
            <Field label="Read mins"><input type="number" className={INPUT} value={editing.reading_minutes} onChange={(e) => setEditing({ ...editing, reading_minutes: e.target.value })} /></Field>
          </div>
          <Field label="Excerpt"><textarea rows={2} className={INPUT} value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field>
          <Field label="Body (Markdown — ## heading, > quote, - list)"><textarea rows={12} className={INPUT + ' font-mono'} value={editing.body || ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm text-stone-300"><input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
          <div className="flex items-center gap-3"><button onClick={save} className="bg-amber-500 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm">Save post</button>{msg && <span className="text-stone-400 text-sm">{msg}</span>}</div>
          <p className="text-stone-600 text-xs">Published posts appear on the next web deploy.</p>
        </div>
      )}
    </div>
  )
}
