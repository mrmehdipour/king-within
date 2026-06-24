'use client'

// Central client-side data store for the authenticated app shell.
// Reads profile / levels (+ embedded quiz questions) / progress from Supabase.
// Everything that consumes this context (learn/profile/stats) is unchanged.

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [levels, setLevels] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    // Auth gate: no session -> back to signup.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/signup')
      return
    }

    const [{ data: profileData }, { data: levelsData }, { data: progressData }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('levels')
          .select('*, questions(*)')
          .order('level_number', { ascending: true })
          .order('sort_order', { referencedTable: 'questions', ascending: true }),
        supabase.from('user_progress').select('*').eq('user_id', user.id),
      ])

    setProfile(profileData)
    setLevels(levelsData || [])
    setProgress(progressData || [])
    setLoading(false)
  }

  useEffect(() => {
    // loadData resolves async; setState runs after awaits, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unlock logic: a level's status for THIS user.
  function getLevelStatus(level) {
    const existing = progress.find((p) => p.level_id === level.level_id)
    if (existing) return existing.status // 'in_progress' | 'completed'

    if (!level.unlock_requirement) return 'available'

    const requiredProgress = progress.find(
      (p) => p.level_id === level.unlock_requirement
    )
    if (requiredProgress?.status === 'completed') return 'available'

    return 'locked'
  }

  const value = { profile, levels, progress, loading, getLevelStatus, refresh: loadData }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>')
  return ctx
}
