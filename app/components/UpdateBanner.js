'use client'

import { useEffect, useState } from 'react'
import { useT } from '../lib/i18n'
import { checkForUpdate, isNative } from '../lib/version'

// Shown only inside the installed Android app: when a newer version is published,
// a bottom banner invites the user to download + install the new APK. Web users
// see nothing (a page reload already serves the latest deploy).
export default function UpdateBanner() {
  const t = useT()
  const [update, setUpdate] = useState(null)

  useEffect(() => {
    if (!isNative()) return // web auto-updates; only native needs a nudge
    if (sessionStorage.getItem('kw_update_dismissed')) return
    checkForUpdate().then((u) => u && setUpdate(u))
  }, [])

  if (!update) return null

  function dismiss() {
    sessionStorage.setItem('kw_update_dismissed', '1')
    setUpdate(null)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 pb-safe">
      <div className="max-w-xl mx-auto bg-stone-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3">
          <DownloadIcon />
          <div className="min-w-0 flex-1">
            <p className="text-amber-400 font-semibold text-sm">{t('update.title')}</p>
            <p className="text-stone-300 text-xs mt-0.5">
              {t('update.body', { version: update.version })}
            </p>
            {update.notes && <p className="text-stone-500 text-xs mt-1">{update.notes}</p>}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <a
            href={update.apkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="flex-1 text-center rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-sm py-2.5 transition"
          >
            {t('update.now')}
          </a>
          <button
            onClick={dismiss}
            className="rounded-xl border border-stone-700 hover:border-stone-600 text-stone-300 text-sm px-4 py-2.5 transition"
          >
            {t('update.later')}
          </button>
        </div>
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  )
}
