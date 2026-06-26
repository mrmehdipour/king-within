'use client'

import { supabase } from './supabaseClient'
import { getArchetypeForXp } from './archetypes'

// Single place that grants XP: writes a row to the xp_events ledger (which powers
// the live stats) AND bumps profiles.total_xp + recomputes the archetype.
// `profilePatch` lets the caller set extra profile fields in the same update
// (e.g. current_level after a course). Returns { newXp, evolvedTo }.
export async function awardXp({ userId, source, sourceRef, amount, profilePatch = {} }) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, current_archetype')
    .eq('id', userId)
    .single()

  const prevXp = profile?.total_xp ?? 0
  const newXp = prevXp + amount
  const newArchetype = getArchetypeForXp(newXp)
  const evolvedTo = profile && newArchetype !== profile.current_archetype ? newArchetype : null

  await supabase.from('xp_events').insert({
    user_id: userId,
    source,
    source_ref: sourceRef != null ? String(sourceRef) : null,
    amount,
  })
  await supabase
    .from('profiles')
    .update({ total_xp: newXp, current_archetype: newArchetype, ...profilePatch })
    .eq('id', userId)

  return { newXp, evolvedTo }
}

export const JOURNAL_XP = 10
export const COACH_XP = 5

// Has the user already claimed today's Lion-coach quest XP? (one per calendar day)
export async function coachQuestDoneToday(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await supabase
    .from('xp_events')
    .select('id')
    .eq('user_id', userId)
    .eq('source', 'coach')
    .eq('source_ref', today)
    .limit(1)
    .maybeSingle()
  return !!data
}
