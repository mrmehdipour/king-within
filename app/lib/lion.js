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
    err.detail = body?.detail // raw upstream message (shown to admins for debugging)
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

// 3rd skill — send one message in the ongoing conversation. Returns { reply }.
export async function lionChat(message, { locale = 'en' } = {}) {
  const { data, error } = await supabase.functions.invoke('lion', {
    body: { skill: 'chat', message, locale },
  })
  if (error) {
    let body
    try { body = await error.context?.json?.() } catch { /* ignore */ }
    const err = new Error(body?.error || error.message || 'The Lion could not respond.')
    err.code = body?.code
    throw err
  }
  if (data?.error) {
    const err = new Error(data.error)
    err.code = data.code
    throw err
  }
  return data // { reply }
}

// Ask the Lion to judge a critical-thinking answer (complete + honest?).
// Returns { pass, feedback }. NEVER blocks on failure — if the Lion is
// unreachable, it passes the user through (we don't punish them for our outage).
export async function checkWriting(prompt, answer, locale = 'en') {
  if (!String(answer ?? '').trim()) return { pass: false, feedback: '' }
  try {
    const { data, error } = await supabase.functions.invoke('lion', {
      body: { skill: 'check_writing', prompt, answer, locale },
    })
    if (error || !data || data.error) return { pass: true, feedback: '' }
    return { pass: data.pass !== false, feedback: data.feedback || '' }
  } catch {
    return { pass: true, feedback: '' }
  }
}

// Full conversation history (oldest→newest) for the signed-in user.
export async function lionHistory(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from('lion_messages')
    .select('role, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(limit)
  return data ?? []
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
