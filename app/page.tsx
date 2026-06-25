'use client'

import Link from 'next/link'
import { useT } from './lib/i18n'
import LanguageToggle from './components/LanguageToggle'

export default function HomePage() {
  const t = useT()

  const stages = [
    { key: 'Initiate', desc: 'landing.arch.initiate.desc' },
    { key: 'Warrior', desc: 'landing.arch.warrior.desc' },
    { key: 'Magician', desc: 'landing.arch.magician.desc' },
    { key: 'King', desc: 'landing.arch.king.desc' },
  ]
  const steps = [
    { step: '1', title: 'landing.step.learn.title', desc: 'landing.step.learn.desc' },
    { step: '2', title: 'landing.step.apply.title', desc: 'landing.step.apply.desc' },
    { step: '3', title: 'landing.step.evolve.title', desc: 'landing.step.evolve.desc' },
  ]

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-amber-400 font-display font-bold text-lg">King Within</span>
        <div className="flex items-center gap-6">
          <LanguageToggle />
          <Link href="/blog" className="text-stone-300 hover:text-amber-400 transition text-sm">
            {t('nav.blog')}
          </Link>
          <Link
            href="/signup"
            className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold text-sm px-4 py-2 rounded transition"
          >
            {t('nav.login')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-20">
        <p className="text-amber-500 text-sm uppercase tracking-wide mb-4">{t('landing.kicker')}</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {t('landing.title')}
        </h1>
        <p className="text-stone-300 text-lg mb-8 leading-relaxed">{t('landing.subtitle')}</p>
        <Link
          href="/signup"
          className="inline-block bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold px-8 py-3 rounded-lg transition"
        >
          {t('landing.cta')}
        </Link>
      </section>

      {/* Archetype path preview */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-center text-stone-400 text-sm uppercase tracking-wide mb-8">
          {t('landing.pathTitle')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className="bg-stone-800 rounded-lg p-5 text-center border border-stone-700"
            >
              <p className="text-amber-400 font-semibold mb-1">{t('arch.' + stage.key)}</p>
              <p className="text-stone-400 text-xs">{t(stage.desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-center text-stone-400 text-sm uppercase tracking-wide mb-8">
          {t('landing.howTitle')}
        </h2>
        <div className="space-y-6">
          {steps.map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-stone-900 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {item.step}
              </div>
              <div>
                <p className="text-white font-medium">{t(item.title)}</p>
                <p className="text-stone-400 text-sm">{t(item.desc)}</p>
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
          {t('landing.finalCta')}
        </Link>
      </section>
    </div>
  )
}
