import Link from 'next/link'
import { supabasePublic } from '../lib/supabasePublic'
import { Bi, T2 } from '../components/Bi'
import LanguageToggle from '../components/LanguageToggle'
import TrackRoadmap from '../components/TrackRoadmap'

// Re-generate at most once a minute so new categories/posts from the CMS appear
// automatically (no redeploy needed).
export const revalidate = 60

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
          <div className="flex items-center gap-5">
            <LanguageToggle />
            <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg transition text-sm">
              <T2 k="nav.login" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-amber-500 text-sm uppercase tracking-wide mb-2"><T2 k="blog.library" /></p>
          <h1 className="font-display text-4xl md:text-5xl mb-3"><T2 k="blog.heading" /></h1>
          <p className="text-stone-400 text-lg"><T2 k="blog.subtitle" /></p>
        </header>

        {/* Standalone / latest posts */}
        {standalone.length > 0 && (
          <section className="mb-12">
            <h2 className="text-stone-400 text-sm font-semibold mb-3 uppercase tracking-wide"><T2 k="blog.latest" /></h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {standalone.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="block group bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-700 transition">
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    {p.category && <span className="text-amber-500 font-medium">{p.category}</span>}
                    <span className="text-stone-600">· {p.reading_minutes} <T2 k="common.min" /></span>
                  </div>
                  <h3 className="font-display text-xl mb-1 group-hover:text-amber-400 transition leading-snug">
                    <Bi en={p.title} fa={p.title_fa} />
                  </h3>
                  <p className="text-stone-400 text-sm"><Bi en={p.excerpt} fa={p.excerpt_fa} /></p>
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
              <h2 className="font-display text-2xl text-amber-400 mb-1"><Bi en={track.title} fa={track.title_fa} /></h2>
              {track.description && <p className="text-stone-400 text-sm mb-5"><Bi en={track.description} fa={track.description_fa} /></p>}
              <TrackRoadmap posts={items} />
            </section>
          )
        })}

        {allPosts.length === 0 && (
          <p className="text-stone-500"><T2 k="blog.empty" /></p>
        )}
      </main>
    </div>
  )
}
