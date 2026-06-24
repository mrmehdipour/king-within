'use client'

// Central client-side data store for the authenticated app shell.
// Reads profile / levels(+questions) / progress / xp ledger / journal from
// Supabase, and subscribes to realtime changes so XP and stats update live.

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [levels, setLevels] = useState([])
  const [progress, setProgress] = useState([])
  const [xpEvents, setXpEvents] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // Returns the user id (or null) so the caller can wire up realtime.
  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/signup')
      return null
    }

    const [
      { data: profileData },
      { data: levelsData },
      { data: progressData },
      { data: xpData },
      { data: journalData },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('levels')
        .select('*, questions(*)')
        .order('level_number', { ascending: true })
        .order('sort_order', { referencedTable: 'questions', ascending: true }),
      supabase.from('user_progress').select('*').eq('user_id', user.id),
      supabase.from('xp_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(500),
      supabase.from('journal_entries').select('id, entry_date, completed').eq('user_id', user.id),
    ])

    setProfile(profileData)
    setLevels(levelsData || [])
    setProgress(progressData || [])
    setXpEvents(xpData || [])
    setJournalEntries(journalData || [])
    setLoading(false)
    return user.id
  }

  useEffect(() => {
    let channel
    async function init() {
      const uid = await loadData()
      if (!uid) return
      // Live updates: refetch when this user's XP or profile changes. (No-op if
      // Realtime isn't enabled for these tables — explicit refresh() still works.)
      channel = supabase
        .channel('kw-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'xp_events', filter: `user_id=eq.${uid}` }, () => loadData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` }, () => loadData())
        .subscribe()
    }
    init()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unlock logic: a level's status for THIS user.
  function getLevelStatus(level) {
    const existing = progress.find((p) => p.level_id === level.level_id)
    if (existing) return existing.status

    if (!level.unlock_requirement) return 'available'
    const requiredProgress = progress.find((p) => p.level_id === level.unlock_requirement)
    if (requiredProgress?.status === 'completed') return 'available'
    return 'locked'
  }

  const value = {
    profile, levels, progress, xpEvents, journalEntries,
    loading, getLevelStatus, refresh: loadData,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>')
  return ctx
}
