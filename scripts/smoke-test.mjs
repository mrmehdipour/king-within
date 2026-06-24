// One-off smoke test of the live Supabase integration. Mirrors exactly what the
// app does: read levels -> sign up -> read profile (trigger) -> complete a
// course (write progress + profile) -> verify persistence + unlock.
//
// Run: node scripts/smoke-test.mjs
// Creates a throwaway auth user (kw.smoke.*@gmail.com) you can delete later.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
const raw = readFileSync('.env.local', 'utf8').replace(/^﻿/, '')
for (const line of raw.split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

let pass = 0
let fail = 0
const ok = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? '  — ' + extra : ''}`)
  cond ? pass++ : fail++
}

async function main() {
  // 0) Can an unauthenticated client read levels? (tells us the RLS posture)
  const { data: anonLevels } = await supabase.from('levels').select('level_id')
  console.log(`\n(anon can read levels: ${anonLevels?.length ? 'yes, ' + anonLevels.length + ' rows' : 'no / blocked by RLS'})`)

  const email = `kw.smoke.${Date.now()}@gmail.com`
  const password = 'Test123456!'

  console.log(`\n— Signing up ${email} —`)
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({ email, password })
  if (signUpErr) {
    ok('sign up', false, signUpErr.message)
    return
  }
  if (!signUp.session) {
    console.log('\n⚠  Sign-up succeeded but NO session was returned.')
    console.log('   => "Confirm email" is ON in Supabase Auth settings. The app sends')
    console.log('      new users straight to /learn, so they will bounce back to /signup')
    console.log('      until confirmed. Disable email confirmation, or add a confirm step.')
    return
  }
  ok('sign up returns an active session', true)
  const userId = signUp.user.id

  // 1) profile auto-created by trigger
  const { data: profile, error: profErr } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
  ok('profile row auto-created (trigger)', !profErr && !!profile, profErr?.message)
  if (profile) ok('  starts as Initiate', profile.current_archetype === 'Initiate', `got ${profile.current_archetype}`)

  // 2) levels + embedded questions (as the authed app reads them)
  const { data: levels, error: lvlErr } = await supabase
    .from('levels').select('*, questions(*)')
    .order('level_number', { ascending: true })
    .order('sort_order', { referencedTable: 'questions', ascending: true })
  ok('can read levels (authed)', !lvlErr, lvlErr?.message)
  ok('6 Initiate levels seeded', (levels?.length ?? 0) === 6, `got ${levels?.length}`)
  const l1 = levels?.find((l) => l.level_number === 1)
  const l2 = levels?.find((l) => l.level_number === 2)
  ok('level 1 has questions', (l1?.questions?.length ?? 0) > 0, `${l1?.questions?.length} questions`)
  ok('level 1 has reading text', !!l1?.reading_text)
  ok('level 1 is open (no unlock req)', l1?.unlock_requirement == null)
  ok('level 2 is gated by level 1', l2?.unlock_requirement === l1?.level_id)

  if (!l1) return

  // 3) complete level 1: write progress (tests upsert constraint + RLS)
  const reward = l1.xp_reward ?? 0
  const { error: upErr } = await supabase.from('user_progress').upsert({
    user_id: userId, level_id: l1.level_id, status: 'completed',
    submission_content: 'smoke test reflection', quiz_score: 3, quiz_total: 3,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,level_id' })
  ok('write user_progress (upsert on user_id,level_id)', !upErr, upErr?.message)

  // 4) update profile XP/archetype (tests RLS on profiles update)
  const { error: updErr } = await supabase.from('profiles').update({
    total_xp: (profile?.total_xp ?? 0) + reward, current_archetype: 'Initiate', current_level: 2,
  }).eq('id', userId)
  ok('update profile XP', !updErr, updErr?.message)

  // 5) verify persistence
  const { data: prog } = await supabase.from('user_progress').select('*').eq('user_id', userId)
  ok('progress persisted as completed', prog?.some((p) => p.level_id === l1.level_id && p.status === 'completed'))
  const { data: profile2 } = await supabase.from('profiles').select('total_xp').eq('id', userId).single()
  ok('XP persisted', profile2?.total_xp === (profile?.total_xp ?? 0) + reward, `total_xp=${profile2?.total_xp}`)

  // --- Expansion 2: XP ledger -----------------------------------------------
  const { error: xpErr } = await supabase.from('xp_events').insert({
    user_id: userId, source: 'course', source_ref: String(l1.level_id), amount: reward,
  })
  ok('write xp_events (ledger)', !xpErr, xpErr?.message)
  const { data: xp } = await supabase.from('xp_events').select('id').eq('user_id', userId)
  ok('xp event persisted', (xp?.length ?? 0) > 0, `${xp?.length} events`)

  // --- Expansion 2: daily journal -------------------------------------------
  const today = new Date().toISOString().slice(0, 10)
  const { data: q, error: qErr } = await supabase.rpc('next_journal_question', { uid: userId })
  const question = Array.isArray(q) ? q[0] : q
  ok('journal RPC returns an unseen question', !qErr && !!question, qErr?.message)
  if (question) {
    const { data: entry, error: eErr } = await supabase.from('journal_entries')
      .insert({ user_id: userId, question_id: question.id, entry_date: today, answer_text: 'smoke', completed: true })
      .select().single()
    ok('create journal entry', !eErr && !!entry, eErr?.message)
    const { error: dupErr } = await supabase.from('journal_entries')
      .insert({ user_id: userId, question_id: question.id, entry_date: today })
    ok('one entry per day enforced', !!dupErr, dupErr ? '' : 'duplicate was allowed!')
  }

  console.log(`\n(throwaway user: ${email})`)
}

await main()
console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ ' + fail + ' FAILED'}  (${pass} passed, ${fail} failed)`)
process.exitCode = fail === 0 ? 0 : 1
