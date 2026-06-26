'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useT } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'

export default function SignupPage() {
  const router = useRouter()
  const t = useT()

  const [mode, setMode] = useState('signup') // 'signup' | 'login'
  const isLogin = mode === 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  // Password strength (enforced on sign up; "123456" fails — no letter).
  const pw = {
    len: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const pwValid = pw.len && pw.letter && pw.number

  function switchMode(next) {
    setMode(next)
    setError('')
    setNotice('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!isLogin && !pwValid) {
      setError(t('signup.pwWeak'))
      return
    }
    setLoading(true)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      // With "Confirm email" on, there's no session yet — guide them to confirm.
      if (!data.session) {
        setNotice(t('signup.confirmNotice'))
        setMode('login')
        setLoading(false)
        return
      }
    }

    router.push('/learn')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm bg-stone-800 rounded-2xl p-7 shadow-xl">
        <div className="flex justify-end mb-2"><LanguageToggle /></div>
        <h1 className="text-2xl font-bold text-amber-400 mb-1 text-center font-display">
          {t('signup.title')}
        </h1>
        <p className="text-stone-400 text-sm text-center mb-5">
          {isLogin ? t('signup.subtitleLogin') : t('signup.subtitleSignup')}
        </p>

        {/* Distinct mode switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-stone-900 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              !isLogin ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {t('signup.tabSignup')}
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 rounded-lg text-sm font-semibold transition ${
              isLogin ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {t('signup.tabLogin')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('signup.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-lg bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder={t('signup.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full px-4 py-2.5 pe-16 rounded-lg bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 end-3 my-auto text-stone-400 hover:text-amber-400 text-xs font-semibold"
            >
              {showPw ? t('signup.hidePw') : t('signup.showPw')}
            </button>
          </div>

          {/* Live password requirements (sign up only) */}
          {!isLogin && password.length > 0 && (
            <ul className="space-y-1 -mt-1">
              <Req ok={pw.len} label={t('signup.pwLen')} />
              <Req ok={pw.letter} label={t('signup.pwLetter')} />
              <Req ok={pw.number} label={t('signup.pwNumber')} />
            </ul>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {notice && <p className="text-amber-400 text-sm">{notice}</p>}

          <button
            type="submit"
            disabled={loading || (!isLogin && !pwValid)}
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? t('signup.wait') : isLogin ? t('signup.login') : t('signup.start')}
          </button>
        </form>
      </div>
    </div>
  )
}

function Req({ ok, label }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${ok ? 'text-green-400' : 'text-stone-500'}`}>
      <span className="inline-block w-3.5">{ok ? '✓' : '○'}</span>
      {label}
    </li>
  )
}
