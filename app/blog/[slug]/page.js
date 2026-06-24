import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllPosts, getPost } from '../posts'

// Prerender one static HTML page per post (great for SEO + Capacitor export).
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }))
}

// Per-post SEO metadata.
export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Not found — King Within' }
  return {
    title: `${post.title} — King Within`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <nav className="border-b border-stone-800/80">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-amber-400 text-lg">King Within</Link>
          <Link href="/blog" className="text-stone-300 hover:text-amber-400 transition text-sm">
            ← All posts
          </Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-4 text-xs">
          <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full font-medium">{post.category}</span>
          <span className="text-stone-500">{formatDate(post.date)} · {post.readingMinutes} min read</span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl leading-tight mb-8">{post.title}</h1>

        <div className="space-y-5">
          {post.body.map((block, i) => {
            if (block.type === 'h2') {
              return <h2 key={i} className="font-display text-2xl text-amber-400 pt-4">{block.text}</h2>
            }
            if (block.type === 'quote') {
              return (
                <blockquote key={i} className="border-l-2 border-amber-500 pl-5 py-1 text-xl text-stone-200 italic">
                  {block.text}
                </blockquote>
              )
            }
            if (block.type === 'list') {
              return (
                <ul key={i} className="space-y-2.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="flex gap-3 text-stone-300 leading-relaxed">
                      <span className="text-amber-500 mt-1.5 shrink-0">◆</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )
            }
            return <p key={i} className="text-stone-300 leading-relaxed text-[17px]">{block.text}</p>
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-stone-800 text-center">
          <p className="text-stone-400 mb-4">Ready to stop drifting?</p>
          <Link
            href="/signup"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-8 py-3 rounded-lg transition"
          >
            Begin as an Initiate
          </Link>
        </div>
      </article>
    </div>
  )
}
