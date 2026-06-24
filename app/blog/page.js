import Link from 'next/link'
import { supabasePublic } from '../lib/supabasePublic'

export const metadata = {
  title: 'The Journal — King Within',
  description:
    'Reading roadmaps on drift, discipline, and self-leadership — the King Within library.',
}

export default async function BlogIndex() {
  const [{ data: tracks }, { data: posts }] = await Promise.all([
    supabasePublic.from('blog_tracks').select('*').eq('published', true).order('sort_order'),
    supabasePublic.from('blog_posts').select('*').eq('published', true).order('order_in_track'),
  ])

  const allPosts = posts || []
  const standalone = allPosts
    .filter((p) => !p.track_id)
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1))

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <nav className="border-b border-stone-800/80">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-amber-400 text-lg">King Within</Link>
          <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg transition text-sm">Log in</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-amber-500 text-sm uppercase tracking-wide mb-2">The Library</p>
          <h1 className="font-display text-4xl md:text-5xl mb-3">Reading roadmaps</h1>
          <p className="text-stone-400 text-lg">Follow a track from the first step to the last — or dip into the latest below.</p>
        </header>

        {/* Standalone / latest posts */}
        {standalone.length > 0 && (
          <section className="mb-12">
            <h2 className="text-stone-400 text-sm font-semibold mb-3 uppercase tracking-wide">Latest</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {standalone.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="block group bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-700 transition">
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    {p.category && <span className="text-amber-500 font-medium">{p.category}</span>}
                    <span className="text-stone-600">· {p.reading_minutes} min</span>
                  </div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-amber-400 transition leading-snug">{p.title}</h3>
                  <p className="text-stone-400 text-sm">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tracks as numbered, connected roadmaps */}
        {(tracks || []).map((track) => {
          const items = allPosts.filter((p) => p.track_id === track.id)
          if (items.length === 0) return null
          return (
            <section key={track.id} className="mb-12">
              <h2 className="font-display text-2xl text-amber-400 mb-1">{track.title}</h2>
              {track.description && <p className="text-stone-400 text-sm mb-5">{track.description}</p>}
              <ol className="relative border-l border-dashed border-stone-700 ml-4">
                {items.map((p, i) => (
                  <li key={p.id} className="relative pl-8 pb-6 last:pb-0">
                    <span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-amber-500 text-stone-900 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <Link href={`/blog/${p.slug}`} className="block group">
                      <h3 className="text-white font-medium group-hover:text-amber-400 transition leading-snug">{p.title}</h3>
                      <p className="text-stone-500 text-sm">{p.excerpt}</p>
                      <span className="text-stone-600 text-xs">{p.reading_minutes} min read</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )
        })}

        {allPosts.length === 0 && (
          <p className="text-stone-500">No posts published yet.</p>
        )}
      </main>
    </div>
  )
}
