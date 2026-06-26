'use client'

import { supabase } from './supabaseClient'

// Single place that grants XP. Delegates to the server-side `award_xp` RPC
// (db/10_security_hardening.sql): the SERVER decides the amount per source and
// verifies the action really happened, so XP can't be tampered with from the
// client. It also writes the xp_events ledger row and bumps profiles.total_xp /
// archetype / level atomically and idempotently. Returns { newXp, evolvedTo }.
//
// The legacy args (userId, amount, profilePatch) are accepted for caller
// compatibility but ignored — the server derives all of it from `source`+`sourceRef`.
export async function awardXp({ source, sourceRef }) {
  const { data, error } = await supabase.rpc('award_xp', {
    p_source: source,
    p_source_ref: sourceRef != null ? String(sourceRef) : null,
  })
  if (error) throw error
  return { newXp: data?.new_xp ?? null, evolvedTo: data?.evolved ? data.archetype : null }
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
