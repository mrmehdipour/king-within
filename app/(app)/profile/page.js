'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { useAppData } from '../../lib/appData'
import { getArchetypeProgress, ARCHETYPE_THRESHOLDS } from '../../lib/archetypes'
import { useLang } from '../../lib/i18n'
import LanguageToggle from '../../components/LanguageToggle'
import LionAvatar from '../../components/LionAvatar'
import { askLion, latestInsight, pingLion } from '../../lib/lion'

export default function ProfilePage() {
  const router = useRouter()
  const { t, locale } = useLang()
  const { profile, progress, loading } = useAppData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-400">{t('common.loading')}</p>
      </div>
    )
  }

  const archName = (a) => {
    const k = t('arch.' + a)
    return k === 'arch.' + a ? a : k
  }
  const completed = progress.filter((p) => p.status === 'completed').length
  const archProgress = getArchetypeProgress(profile?.total_xp ?? 0)
  const initials = (profile?.email?.[0] ?? 'K').toUpperCase()
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : undefined, { month: 'long', year: 'numeric' })
    : '—'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/signup')
  }

  return (
    <div className="text-white max-w-xl mx-auto px-4">
      <header className="pt-safe pt-8 pb-6 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 text-4xl font-display font-bold border-4 border-stone-800">
          {initials}
        </div>
        <h1 className="mt-4 font-display text-2xl text-amber-400">{archName(profile?.current_archetype)}</h1>
        <p className="text-stone-400 text-sm">{profile?.email}</p>
        <p className="text-stone-600 text-xs mt-1">{t('profile.memberSince', { date: memberSince })}</p>
        <div className="mt-3"><LanguageToggle /></div>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label={t('profile.level')} value={profile?.current_level ?? 0} />
        <StatTile label={t('stats.totalXp')} value={profile?.total_xp ?? 0} />
        <StatTile label={t('profile.completed')} value={completed} />
      </div>

      {/* The Lion — AI agent */}
      <SectionTitle>{t('lion.title')}</SectionTitle>
      <LionCard t={t} locale={locale} isAdmin={profile?.is_admin} />

      {/* Archetype progression ladder */}
      <SectionTitle>{t('profile.archPath')}</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-amber-400 font-semibold">{archName(archProgress.current)}</span>
          <span className="text-stone-500">
            {archProgress.next ? t('profile.toNextPct', { pct: archProgress.percent, next: archName(archProgress.next) }) : t('profile.maxArchetype')}
          </span>
        </div>
        <div className="flex gap-1.5">
          {ARCHETYPE_THRESHOLDS.map((tier) => {
            const reached = (profile?.total_xp ?? 0) >= tier.minXp
            return (
              <div key={tier.archetype} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full ${reached ? 'bg-amber-500' : 'bg-stone-800'}`} />
                <p className={`mt-1.5 text-[11px] ${reached ? 'text-stone-300' : 'text-stone-600'}`}>
                  {archName(tier.archetype)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges (placeholder) */}
      <SectionTitle>{t('profile.badges')}</SectionTitle>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {['First step', '3-day streak', 'Initiate', 'Quiz ace'].map((b, i) => (
          <div key={b} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${
                i < completed
                  ? 'bg-amber-500/15 border-amber-500/40'
                  : 'bg-stone-900 border-stone-800 opacity-40'
              }`}
            >
              {i < completed ? '🏅' : '🔒'}
            </div>
            <span className="text-[10px] text-stone-500 text-center leading-tight">{b}</span>
          </div>
        ))}
      </div>

      {/* Settings */}
      <SectionTitle>{t('profile.settings')}</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl divide-y divide-stone-800 mb-6 overflow-hidden">
        {profile?.is_admin && (
          <SettingRow label={t('profile.admin')} onClick={() => router.push('/admin')} />
        )}
        <SettingRow label={t('profile.editAccount')} onClick={() => {}} />
        <SettingRow label={t('profile.notifications')} onClick={() => {}} />
        <SettingRow label={t('profile.signOut')} danger onClick={handleSignOut} />
      </div>
    </div>
  )
}

function LionCard({ t, locale, isAdmin }) {
  const [insight, setInsight] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [conn, setConn] = useState(null) // null | 'testing' | 'live' | 'down'

  async function loadLatest() {
    const latest = await latestInsight('personality')
    setInsight(latest)
    setLoaded(true)
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLatest()
  }, [])

  async function generate() {
    setBusy(true)
    setError(null)
    setDetail(null)
    try {
      const res = await askLion({ skill: 'personality', locale })
      setInsight({ content: res.content, locale: res.locale, created_at: new Date().toISOString() })
    } catch (e) {
      setError(e.code === 'rate_limit' ? t('lion.rateLimit') : (e.message || t('lion.error')))
      if (e.detail) setDetail(e.detail)
    } finally {
      setBusy(false)
    }
  }

  async function testConnection() {
    setConn('testing')
    const ok = await pingLion()
    setConn(ok ? 'live' : 'down')
  }

  const dateStr = insight?.created_at
    ? new Date(insight.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-4">
        <LionAvatar size={64} thinking={busy} />
        <div className="min-w-0">
          <p className="font-display text-lg text-amber-400">{t('lion.title')}</p>
          <p className="text-stone-500 text-xs">{t('lion.subtitle')}</p>
        </div>
      </div>

      <div className="mt-4">
        {busy ? (
          <p className="text-stone-400 text-sm">{t('lion.thinking')}</p>
        ) : insight ? (
          <>
            <p className="text-stone-200 text-sm whitespace-pre-wrap leading-relaxed">{insight.content}</p>
            {dateStr && <p className="text-stone-600 text-xs mt-3">{t('lion.generatedAt', { date: dateStr })}</p>}
          </>
        ) : (
          <p className="text-stone-400 text-sm">{loaded ? t('lion.empty') : t('common.loading')}</p>
        )}

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        {isAdmin && detail && (
          <pre className="text-stone-500 text-[10px] mt-2 whitespace-pre-wrap break-words bg-stone-950 rounded-lg p-2 max-h-32 overflow-auto">{detail}</pre>
        )}

        <button
          onClick={generate}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-semibold text-sm py-3 transition"
        >
          {busy ? t('lion.thinking') : insight ? t('lion.regenerate') : t('lion.analyzeCta')}
        </button>

        {isAdmin && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <button
              onClick={testConnection}
              disabled={conn === 'testing'}
              className="text-stone-400 hover:text-amber-400 underline disabled:opacity-50"
            >
              {conn === 'testing' ? t('lion.testing') : t('lion.testConnection')}
            </button>
            {conn === 'live' && <span className="text-green-400">✓ {t('lion.live')}</span>}
            {conn === 'down' && <span className="text-red-400">✗ {t('lion.notLive')}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl py-4 text-center">
      <p className="text-2xl font-bold text-amber-400">{value}</p>
      <p className="text-stone-500 text-[11px] uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-stone-400 text-sm font-semibold mb-2">{children}</h2>
}

function SettingRow({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition hover:bg-stone-800/60 ${
        danger ? 'text-red-400' : 'text-stone-200'
      }`}
    >
      <span className="text-sm">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600 rtl-flip" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  )
}
