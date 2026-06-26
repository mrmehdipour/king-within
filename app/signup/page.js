'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'

// Iran mobile → E.164 (+989xxxxxxxxx). Accepts 0912…, 912…, 0098…, +98….
function normalizeIranPhone(raw) {
  let d = String(raw).replace(/\D/g, '')
  if (d.startsWith('0098')) d = d.slice(4)
  else if (d.startsWith('98')) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  if (d.length !== 10 || !d.startsWith('9')) return null
  return '+98' + d
}

export default function SignupPage() {
  const router = useRouter()
  const { t, locale } = useLang()

  // Iranian visitors default to phone; everyone else to email.
  const [method, setMethod] = useState(locale === 'fa' ? 'phone' : 'email')
  const [mode, setMode] = useState('signup') // email flow: 'signup' | 'login'
  const isLogin = mode === 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [phoneInput, setPhoneInput] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [code, setCode] = useState('')

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const pw = {
    len: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const pwValid = pw.len && pw.letter && pw.number

  function reset() {
    setError(''); setNotice('')
  }
  function switchMethod(m) { setMethod(m); reset(); setOtpSent(false); setCode('') }
  function switchMode(m) { setMode(m); reset() }

  // ── Email / password ──
  async function handleEmail(e) {
    e.preventDefault()
    reset()
    if (!isLogin && !pwValid) { setError(t('signup.pwWeak')); return }
    setLoading(true)
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (!data.session) { setNotice(t('signup.confirmNotice')); setMode('login'); setLoading(false); return }
    }
    router.push('/learn')
  }

  // ── Phone OTP (signInWithOtp creates the user if new → unifies signup+login) ──
  async function sendCode(e) {
    e.preventDefault()
    reset()
    const phone = normalizeIranPhone(phoneInput)
    if (!phone) { setError(t('signup.phoneInvalid')); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) { setError(error.message); setLoading(false); return }
    setOtpSent(true); setNotice(t('signup.otpSent')); setLoading(false)
  }

  async function verifyCode(e) {
    e.preventDefault()
    reset()
    const phone = normalizeIranPhone(phoneInput)
    if (!phone) { setError(t('signup.phoneInvalid')); return }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ phone, token: code.trim(), type: 'sms' })
    if (error) { setError(error.message); setLoading(false); return }
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
          {method === 'phone' ? t('signup.subtitleSignup') : isLogin ? t('signup.subtitleLogin') : t('signup.subtitleSignup')}
        </p>

        {/* Method: Email / Phone */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-stone-900 rounded-xl mb-4">
          <MethodBtn active={method === 'phone'} onClick={() => switchMethod('phone')} label={t('signup.methodPhone')} />
          <MethodBtn active={method === 'email'} onClick={() => switchMethod('email')} label={t('signup.methodEmail')} />
        </div>

        {method === 'email' ? (
          <>
            {/* Sign up / Log in (email only) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-900 rounded-xl mb-5">
              <MethodBtn active={!isLogin} onClick={() => switchMode('signup')} label={t('signup.tabSignup')} />
              <MethodBtn active={isLogin} onClick={() => switchMode('login')} label={t('signup.tabLogin')} />
            </div>

            <form onSubmit={handleEmail} className="space-y-4">
              <input
                type="email" placeholder={t('signup.email')} value={email}
                onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} placeholder={t('signup.password')} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-2.5 pe-16 rounded-lg bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 end-3 my-auto text-stone-400 hover:text-amber-400 text-xs font-semibold">
                  {showPw ? t('signup.hidePw') : t('signup.showPw')}
                </button>
              </div>
              {!isLogin && password.length > 0 && (
                <ul className="space-y-1 -mt-1">
                  <Req ok={pw.len} label={t('signup.pwLen')} />
                  <Req ok={pw.letter} label={t('signup.pwLetter')} />
                  <Req ok={pw.number} label={t('signup.pwNumber')} />
                </ul>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {notice && <p className="text-amber-400 text-sm">{notice}</p>}
              <button type="submit" disabled={loading || (!isLogin && !pwValid)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
                {loading ? t('signup.wait') : isLogin ? t('signup.login') : t('signup.start')}
              </button>
            </form>
          </>
        ) : (
          /* ── Phone OTP ── */
          <form onSubmit={otpSent ? verifyCode : sendCode} className="space-y-4">
            <div dir="ltr">
              <label className="block text-stone-400 text-sm mb-1 text-start">{t('signup.phone')}</label>
              <div className="flex items-stretch rounded-lg bg-stone-700 border border-transparent focus-within:ring-2 focus-within:ring-amber-500 overflow-hidden">
                <span className="px-3 flex items-center text-stone-400 bg-stone-900/60 text-sm">+98</span>
                <input
                  type="tel" inputMode="numeric" placeholder={t('signup.phonePlaceholder')} value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)} disabled={otpSent} required
                  className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder-stone-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-stone-400 text-sm mb-1">{t('signup.code')}</label>
                <input
                  type="text" inputMode="numeric" placeholder={t('signup.codePlaceholder')} value={code}
                  onChange={(e) => setCode(e.target.value)} required autoComplete="one-time-code"
                  className="w-full px-4 py-2.5 rounded-lg bg-stone-700 text-white placeholder-stone-500 tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {notice && <p className="text-amber-400 text-sm">{notice}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
              {loading ? t('signup.wait') : otpSent ? t('signup.verify') : t('signup.sendCode')}
            </button>

            {otpSent ? (
              <div className="flex justify-between text-xs">
                <button type="button" onClick={sendCode} className="text-stone-400 hover:text-amber-400">{t('signup.resend')}</button>
                <button type="button" onClick={() => { setOtpSent(false); setCode(''); reset() }} className="text-stone-400 hover:text-amber-400">{t('signup.changeNumber')}</button>
              </div>
            ) : (
              <p className="text-stone-500 text-xs text-center">{t('signup.phoneHint')}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

function MethodBtn({ active, onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      className={`py-2 rounded-lg text-sm font-semibold transition ${active ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-stone-200'}`}>
      {label}
    </button>
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
