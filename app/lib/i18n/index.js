'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import en from './en'
import fa from './fa'

const DICTS = { en, fa }
const LangContext = createContext(null)

// Locale rule: ?lang= (testing) → localStorage → hostname ends with .ir ? fa : en
export function getInitialLocale() {
  if (typeof window === 'undefined') return 'en'
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q === 'fa' || q === 'en') return q
    const saved = localStorage.getItem('kw_locale')
    if (saved === 'fa' || saved === 'en') return saved
    if (window.location.hostname.endsWith('.ir')) return 'fa'
  } catch {
    /* ignore */
  }
  return 'en'
}

function applyDir(locale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale
  document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'
}

export function LanguageProvider({ children }) {
  // SSR/first paint default is 'en' (matches server HTML); corrected on mount.
  const [locale, setLocaleState] = useState('en')

  useEffect(() => {
    const l = getInitialLocale()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(l)
    applyDir(l)
  }, [])

  function setLocale(l) {
    try {
      localStorage.setItem('kw_locale', l)
    } catch {
      /* ignore */
    }
    setLocaleState(l)
    applyDir(l)
  }

  function t(key, vars) {
    const dict = DICTS[locale] || en
    let s = dict[key] ?? en[key] ?? key
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]))
    return s
  }

  const dir = locale === 'fa' ? 'rtl' : 'ltr'
  return <LangContext.Provider value={{ locale, dir, t, setLocale }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within <LanguageProvider>')
  return ctx
}

export function useT() {
  return useLang().t
}
