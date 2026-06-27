'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useT } from '../lib/i18n'

export default function ProPage() {
  const router = useRouter()
  const t = useT()
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('kw_pro_waitlist')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJoined(true)
    }
  }, [])
  function joinWaitlist() {
    try { localStorage.setItem('kw_pro_waitlist', '1') } catch { /* ignore */ }
    setJoined(true)
  }

  return (
    <div className="min-h-[100dvh] bg-stone-950 text-white px-5 pt-safe">
      <div className="max-w-xl mx-auto pt-8 pb-12">
        <button onClick={() => router.back()} className="text-stone-400 hover:text-amber-400 text-sm mb-6">← {t('pro.back')}</button>

        <h1 className="font-display text-3xl text-amber-400 mb-1">{t('pro.title')}</h1>
        <p className="text-stone-400 mb-8">{t('pro.subtitle')}</p>

        <div className="grid gap-4">
          {/* Free */}
          <div className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
            <p className="font-semibold text-stone-200 mb-3">{t('pro.freeTitle')}</p>
            <ul className="space-y-2 text-stone-400 text-sm">
              <li>• {t('pro.free1')}</li>
              <li>• {t('pro.free2')}</li>
              <li>• {t('pro.free3')}</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-br from-amber-500/10 to-stone-900 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-amber-400">{t('pro.proTitle')}</p>
              <span className="text-[11px] uppercase tracking-wide bg-amber-500/15 text-amber-300 px-2.5 py-1 rounded-full">{t('pro.comingSoon')}</span>
            </div>
            <ul className="space-y-2 text-stone-200 text-sm">
              <li>★ {t('pro.pro1')}</li>
              <li>★ {t('pro.pro2')}</li>
              <li>★ {t('pro.pro3')}</li>
            </ul>
            {joined ? (
              <p className="mt-5 text-center text-green-400 text-sm font-semibold">{t('pro.waitlistJoined')}</p>
            ) : (
              <button
                onClick={joinWaitlist}
                className="mt-5 w-full bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold py-3 rounded-xl transition"
              >
                {t('pro.waitlist')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
