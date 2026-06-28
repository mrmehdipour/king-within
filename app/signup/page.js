'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'
import CrownLogo from '../components/CrownLogo'

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
  const { t } = useLang()

  // Public launch: login is SMS-only. Email is hidden for everyone except the
  // owner/admin, who can reach it at /signup?email=1.
  const [mode, setMode] = useState('phone')
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('email') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode('email')
    }
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [phoneInput, setPhoneInput] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [code, setCode] = useState('')

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() { setError(''); setNotice('') }

  // Email: one button that signs in, or creates the account if it doesn't exist.
  async function submitEmail(e) {
    e.preventDefault(); reset(); setLoading(true)
    const { error: inErr } = await supabase.auth.signInWithPassword({ email, password })
    if (!inErr) { router.push('/learn'); return }

    const { data, error: upErr } = await supabase.auth.signUp({ email, password })
    if (upErr) {
      setError(/already|registered|exists/i.test(upErr.message) ? t('signup.wrongPassword') : upErr.message)
      setLoading(false); return
    }
    if (!data.session) { setNotice(t('signup.confirmNotice')); setLoading(false); return }
    router.push('/learn')
  }

  // Phone OTP unifies sign-in and sign-up (creates the user if new).
  async function sendCode(e) {
    e.preventDefault(); reset()
    const phone = normalizeIranPhone(phoneInput)
    if (!phone) { setError(t('signup.phoneInvalid')); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) { setError(error.message); setLoading(false); return }
    setOtpSent(true); setNotice(t('signup.otpSent')); setLoading(false)
  }

  async function verifyCode(e) {
    e.preventDefault(); reset()
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
        <div className="flex justify-center mb-2"><CrownLogo size={44} className="text-amber-400" /></div>
        <h1 className="text-2xl font-bold text-amber-400 mb-1 text-center font-display">
          {t('signup.title')}
        </h1>
        <p className="text-stone-400 text-sm text-center mb-6">{t('signup.subtitle')}</p>

        {mode === 'phone' ? (
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
        ) : (
          <form onSubmit={submitEmail} className="space-y-4">
            <input
              type="email" placeholder={t('signup.email')} value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
              className="w-full px-4 py-2.5 rounded-lg bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} placeholder={t('signup.password')} value={password}
                onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                className="w-full px-4 py-2.5 pe-16 rounded-lg bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 end-3 my-auto text-stone-400 hover:text-amber-400 text-xs font-semibold">
                {showPw ? t('signup.hidePw') : t('signup.showPw')}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {notice && <p className="text-amber-400 text-sm">{notice}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
              {loading ? t('signup.wait') : t('signup.continue')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
