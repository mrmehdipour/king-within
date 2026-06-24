'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { useAppData } from '../../lib/appData'
import { getArchetypeProgress, ARCHETYPE_THRESHOLDS } from '../../lib/archetypes'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, progress, loading } = useAppData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-400">Loading…</p>
      </div>
    )
  }

  const completed = progress.filter((p) => p.status === 'completed').length
  const archProgress = getArchetypeProgress(profile?.total_xp ?? 0)
  const initials = (profile?.email?.[0] ?? 'K').toUpperCase()
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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
        <h1 className="mt-4 font-display text-2xl text-amber-400">{profile?.current_archetype}</h1>
        <p className="text-stone-400 text-sm">{profile?.email}</p>
        <p className="text-stone-600 text-xs mt-1">Member since {memberSince}</p>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatTile label="Level" value={profile?.current_level ?? 0} />
        <StatTile label="Total XP" value={profile?.total_xp ?? 0} />
        <StatTile label="Completed" value={completed} />
      </div>

      {/* Archetype progression ladder */}
      <SectionTitle>Archetype path</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-amber-400 font-semibold">{archProgress.current}</span>
          <span className="text-stone-500">
            {archProgress.next ? `${archProgress.percent}% → ${archProgress.next}` : 'Max archetype'}
          </span>
        </div>
        <div className="flex gap-1.5">
          {ARCHETYPE_THRESHOLDS.map((tier) => {
            const reached = (profile?.total_xp ?? 0) >= tier.minXp
            return (
              <div key={tier.archetype} className="flex-1 text-center">
                <div className={`h-1.5 rounded-full ${reached ? 'bg-amber-500' : 'bg-stone-800'}`} />
                <p className={`mt-1.5 text-[11px] ${reached ? 'text-stone-300' : 'text-stone-600'}`}>
                  {tier.archetype}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges (placeholder) */}
      <SectionTitle>Badges</SectionTitle>
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
      <SectionTitle>Settings</SectionTitle>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl divide-y divide-stone-800 mb-6 overflow-hidden">
        <SettingRow label="Edit account" onClick={() => {}} />
        <SettingRow label="Notifications" onClick={() => {}} />
        <SettingRow label="Sign out" danger onClick={handleSignOut} />
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-600" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  )
}
