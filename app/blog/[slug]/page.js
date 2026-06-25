import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { supabasePublic } from '../../lib/supabasePublic'
import { Bi, T2 } from '../../components/Bi'
import LanguageToggle from '../../components/LanguageToggle'

// Only prebuilt slugs exist; unknown ones 404 (required for static export).
export const dynamicParams = false

export async function generateStaticParams() {
  const { data } = await supabasePublic.from('blog_posts').select('slug').eq('published', true)
  return (data || []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const { data: post } = await supabasePublic
    .from('blog_posts').select('title, excerpt').eq('slug', slug).eq('published', true).maybeSingle()
  if (!post) return { title: 'Not found — King Within' }
  return {
    title: `${post.title} — King Within`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const { data: post } = await supabasePublic
    .from('blog_posts')
    .select('*, blog_tracks(title, title_fa, slug)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!post) notFound()

  let prev = null
  let next = null
  if (post.track_id) {
    const { data: siblings } = await supabasePublic
      .from('blog_posts')
      .select('slug, title, title_fa, order_in_track')
      .eq('track_id', post.track_id)
      .eq('published', true)
      .order('order_in_track')
    const idx = (siblings || []).findIndex((s) => s.slug === slug)
    prev = idx > 0 ? siblings[idx - 1] : null
    next = idx >= 0 && idx < (siblings?.length ?? 0) - 1 ? siblings[idx + 1] : null
  }

  const htmlEn = marked.parse(post.body || '')
  const htmlFa = marked.parse(post.body_fa || post.body || '')

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <nav className="border-b border-stone-800/80">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-display text-amber-400 text-lg">King Within</Link>
          <div className="flex items-center gap-5">
            <LanguageToggle />
            <Link href="/blog" className="text-stone-300 hover:text-amber-400 transition text-sm">
              <span className="rtl-flip inline-block">←</span> <T2 k="blog.allPosts" />
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-4 text-xs">
          {post.category && <span className="bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full font-medium">{post.category}</span>}
          {post.blog_tracks && (
            <span className="text-stone-500">
              <span className="lang-en">in {post.blog_tracks.title}</span>
              <span className="lang-fa">در {post.blog_tracks.title_fa || post.blog_tracks.title}</span>
            </span>
          )}
          <span className="text-stone-600">{fmt(post.published_at)} · {post.reading_minutes} <T2 k="common.min" /></span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl leading-tight mb-8">
          <Bi en={post.title} fa={post.title_fa} />
        </h1>

        <div className="prose-kw lang-en" dangerouslySetInnerHTML={{ __html: htmlEn }} />
        <div className="prose-kw lang-fa" dangerouslySetInnerHTML={{ __html: htmlFa }} />

        {(prev || next) && (
          <div className="mt-12 pt-6 border-t border-stone-800 flex justify-between gap-4 text-sm">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="text-stone-400 hover:text-amber-400 transition max-w-[45%]">
                <span className="rtl-flip inline-block">←</span> <Bi en={prev.title} fa={prev.title_fa} />
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="text-stone-400 hover:text-amber-400 transition text-end max-w-[45%] ms-auto">
                <Bi en={next.title} fa={next.title_fa} /> <span className="rtl-flip inline-block">→</span>
              </Link>
            ) : <span />}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-stone-800 text-center">
          <p className="text-stone-400 mb-4"><T2 k="blog.ctaQuestion" /></p>
          <Link href="/signup" className="inline-block bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-8 py-3 rounded-lg transition">
            <T2 k="landing.finalCta" />
          </Link>
        </div>
      </article>
    </div>
  )
}
