import Link from 'next/link'

// This is a SERVER component (no 'use client') — it doesn't need useState or
// onClick handlers, just static content, so it loads faster and needs no JS logic.

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-900 text-white">

      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-amber-400 font-bold text-lg">King Within</span>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-stone-300 hover:text-amber-400 transition text-sm">
            Blog
          </Link>
          <Link
            href="/signup"
            className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold text-sm px-4 py-2 rounded transition"
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-20">
        <p className="text-amber-500 text-sm uppercase tracking-wide mb-4">
          A path for modern men
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Most men drift.<br />Few ever decide to lead themselves.
        </h1>
        <p className="text-stone-300 text-lg mb-8 leading-relaxed">
          Awaken the King Within is a step-by-step path built on the archetypes
          of Initiate, Warrior, Magician, and King — moving you out of
          directionless living and into a life you actually built on purpose.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold px-8 py-3 rounded-lg transition"
        >
          Start your journey
        </Link>
      </section>

      {/* Archetype path preview */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-center text-stone-400 text-sm uppercase tracking-wide mb-8">
          The path
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Initiate', desc: 'See clearly' },
            { name: 'Warrior', desc: 'Hold the line' },
            { name: 'Magician', desc: 'Shape your world' },
            { name: 'King', desc: 'Lead yourself' },
          ].map((stage) => (
            <div
              key={stage.name}
              className="bg-stone-800 rounded-lg p-5 text-center border border-stone-700"
            >
              <p className="text-amber-400 font-semibold mb-1">{stage.name}</p>
              <p className="text-stone-400 text-xs">{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-center text-stone-400 text-sm uppercase tracking-wide mb-8">
          How it works
        </h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Learn', desc: 'Each level teaches one real concept — short, direct, no fluff.' },
            { step: '2', title: 'Apply', desc: 'Complete a real challenge tied to your own life, not theory.' },
            { step: '3', title: 'Evolve', desc: 'Progress unlocks new levels and moves you toward the next archetype.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-stone-900 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {item.step}
              </div>
              <div>
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-stone-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center pb-20 px-6">
        <Link
          href="/signup"
          className="inline-block bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold px-8 py-3 rounded-lg transition"
        >
          Begin as an Initiate
        </Link>
      </section>
    </div>
  )
}