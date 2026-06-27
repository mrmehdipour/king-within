'use client'

import LionAvatar from './LionAvatar'

// Shown when a free member tries to start a course beyond their daily allowance.
export default function Paywall({ t, isPro, onBack, onGetPro }) {
  return (
    <div className="min-h-[100dvh] bg-stone-950 text-white flex flex-col items-center justify-center px-6 text-center">
      <LionAvatar size={84} className="mb-5" />
      <h1 className="font-display text-2xl text-amber-400 mb-3">{t('paywall.title')}</h1>
      <p className="text-stone-300 leading-relaxed max-w-sm mb-8">
        {isPro ? t('paywall.bodyPro') : t('paywall.body')}
      </p>
      {!isPro && (
        <button
          onClick={onGetPro}
          className="bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold px-8 py-3 rounded-xl transition mb-3 w-full max-w-xs"
        >
          {t('paywall.getPro')}
        </button>
      )}
      <button onClick={onBack} className="text-stone-400 hover:text-amber-400 text-sm">
        {t('paywall.back')}
      </button>
    </div>
  )
}
