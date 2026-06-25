import Link from 'next/link'
import { Bi } from './Bi'

// A simple, auto-growing roadmap: a numbered, connected list of a track's posts.
// Pass `currentSlug` to highlight the post you're on (used on article pages).
export default function TrackRoadmap({ posts, currentSlug }) {
  if (!posts || posts.length === 0) return null
  return (
    <ol className="relative border-s border-dashed border-stone-700 ms-3">
      {posts.map((p, i) => {
        const active = p.slug === currentSlug
        return (
          <li key={p.slug} className="relative ps-7 pb-5 last:pb-0">
            <span
              className={`absolute -start-[11px] top-0 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                active ? 'bg-amber-400 text-stone-900 ring-4 ring-amber-400/25' : 'bg-amber-500 text-stone-900'
              }`}
            >
              {i + 1}
            </span>
            {active ? (
              <span className="text-white font-medium"><Bi en={p.title} fa={p.title_fa} /></span>
            ) : (
              <Link href={`/blog/${p.slug}`} className="text-stone-300 hover:text-amber-400 transition">
                <Bi en={p.title} fa={p.title_fa} />
              </Link>
            )}
          </li>
        )
      })}
    </ol>
  )
}
