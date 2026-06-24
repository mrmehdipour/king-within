'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getContentCounts } from '../../lib/adminData'

// The "content map": a single overview of everything in the system, with counts
// and links into each manager. Grows with the product so you always know where
// content lives.
export default function AdminHome() {
  const [counts, setCounts] = useState(null)

  async function load() {
    setCounts(await getContentCounts())
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl text-amber-400 mb-1">Content map</h1>
      <p className="text-stone-400 mb-6">Everything in King Within, in one place.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <MapCard
          href="/admin/courses"
          title="Courses"
          icon="🗺️"
          lines={[
            `${counts?.levels ?? '—'} levels`,
            `${counts?.questions ?? '—'} quiz questions`,
          ]}
          blurb="The learning path: reading, critical thinking, and quizzes by archetype."
        />
        <MapCard
          href="/admin/blog"
          title="Blog library"
          icon="📚"
          lines={[
            `${counts?.tracks ?? '—'} tracks`,
            `${counts?.posts ?? '—'} posts`,
          ]}
          blurb="Themed reading roadmaps. Your SEO library."
        />
        <MapCard
          href="/admin/journal"
          title="Journal bank"
          icon="✍️"
          lines={[`${counts?.journal ?? '—'} questions`]}
          blurb="The daily-question pool that pulls users back each day."
        />
      </div>

      <div className="mt-8 bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <h2 className="text-stone-300 font-semibold mb-2">How content reaches users</h2>
        <ul className="text-stone-400 text-sm space-y-1.5 list-disc pl-5">
          <li><b className="text-stone-200">Courses & journal</b> go live instantly — the app reads them straight from the database.</li>
          <li><b className="text-stone-200">Blog posts</b> appear on the next web deploy (built for SEO).</li>
          <li>Mark items <b className="text-stone-200">published</b> to show them; unpublished stays a draft.</li>
        </ul>
      </div>
    </div>
  )
}

function MapCard({ href, title, icon, lines, blurb }) {
  return (
    <Link href={href} className="block bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-700 transition">
      <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
      <h2 className="font-display text-xl text-white mb-1">{title}</h2>
      {lines.map((l) => (
        <p key={l} className="text-amber-400 font-semibold text-sm">{l}</p>
      ))}
      <p className="text-stone-500 text-xs mt-2">{blurb}</p>
    </Link>
  )
}
