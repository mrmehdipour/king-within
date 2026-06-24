import Link from 'next/link'
import { getAllPosts } from './posts'

export const metadata = {
  title: 'The Journal — King Within',
  description:
    'Essays on drift, discipline, and self-leadership — and the King Within product roadmap.',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const featured = posts.find((p) => p.featured) ?? posts[0]
  const rest = posts.filter((p) => p.slug !== featured.slug)

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Top nav */}
      <nav className="border-b border-stone-800/80">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-amber-400 text-lg">King Within</Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/blog" className="text-amber-400">Journal</Link>
            <Link href="/signup" className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg transition">
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-amber-500 text-sm uppercase tracking-wide mb-2">The Journal</p>
          <h1 className="font-display text-4xl md:text-5xl mb-3">Notes from the path</h1>
          <p className="text-stone-400 text-lg">
            Short, direct essays on drift, discipline, and leading yourself — plus where the app is headed.
          </p>
        </header>

        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="block group bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 mb-10 hover:border-amber-700 transition"
        >
          <div className="flex items-center gap-3 mb-3 text-xs">
            <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full font-medium">{featured.category}</span>
            <span className="text-stone-500">{formatDate(featured.date)} · {featured.readingMinutes} min read</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl mb-2 group-hover:text-amber-400 transition">
            {featured.title}
          </h2>
          <p className="text-stone-400">{featured.excerpt}</p>
          <span className="inline-block mt-4 text-amber-400 text-sm font-medium">Read the roadmap →</span>
        </Link>

        {/* Other posts */}
        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group bg-stone-900 border border-stone-800 rounded-2xl p-6 hover:border-amber-700 transition"
            >
              <div className="flex items-center gap-2 mb-2 text-xs">
                <span className="text-amber-500 font-medium">{post.category}</span>
                <span className="text-stone-600">· {post.readingMinutes} min</span>
              </div>
              <h3 className="font-display text-xl mb-2 group-hover:text-amber-400 transition leading-snug">
                {post.title}
              </h3>
              <p className="text-stone-400 text-sm">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
