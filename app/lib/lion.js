'use client'

// Client helper for talking to the Lion agent (the `lion` Supabase Edge Function).
// supabase.functions.invoke automatically attaches the user's JWT, so the function
// can read/write only this user's data via RLS — and the Gemini key stays server-side.

import { supabase } from './supabaseClient'

// Ask the Lion to run a skill (default: personality analysis).
export async function askLion({ skill = 'personality', locale = 'en' } = {}) {
  const { data, error } = await supabase.functions.invoke('lion', {
    body: { skill, locale },
  })
  if (error) {
    // Edge errors come back with the response body in error.context when available.
    let body
    try { body = await error.context?.json?.() } catch { /* ignore */ }
    const err = new Error(body?.error || error.message || 'The Lion could not respond.')
    err.code = body?.code // 'rate_limit' | 'upstream' | 'auth' | 'empty' | ...
    throw err
  }
  if (data?.error) {
    const err = new Error(data.error)
    err.code = data.code
    throw err
  }
  return data // { content, skill, locale }
}

// Health check — confirms the function is deployed and the Gemini key is set,
// without spending any Gemini quota. Returns true if the Lion is reachable.
export async function pingLion() {
  const { data, error } = await supabase.functions.invoke('lion', {
    body: { skill: 'ping' },
  })
  if (error || !data?.ok) return false
  return true
}

// Latest saved insight for the signed-in user (to show without re-generating).
export async function latestInsight(skill = 'personality') {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('lion_insights')
    .select('content, locale, created_at')
    .eq('user_id', user.id)
    .eq('skill', skill)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}
