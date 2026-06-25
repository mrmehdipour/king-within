'use client'

import { useLang } from '../lib/i18n'

// Shows the language you can switch TO (en dict → "فارسی", fa dict → "English").
export default function LanguageToggle({ className = '' }) {
  const { locale, t, setLocale } = useLang()
  return (
    <button
      onClick={() => setLocale(locale === 'fa' ? 'en' : 'fa')}
      className={`text-sm text-stone-300 hover:text-amber-400 transition ${className}`}
      aria-label="Change language"
    >
      {t('lang.toggle')}
    </button>
  )
}
