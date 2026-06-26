// King Within — comprehensive pre-launch security audit.
// Creates throwaway users and probes the live RLS rules the way an attacker would:
//   - cross-user read/write isolation
//   - privilege escalation (can a user make itself admin?)
//   - XP tampering (can a user set arbitrary total_xp?)
//   - anonymous access to private tables
//   - the xp_events 'coach' source (regression for the daily-quest feature)
//
// Run: node scripts/security-audit.mjs   (needs email confirmation OFF to sign up)

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const mk = () => createClient(URL, KEY, { auth: { persistSession: false } })

let pass = 0, fail = 0
const crit = []
const ok = (label, cond, extra = '', critical = false) => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? '  — ' + extra : ''}`)
  if (cond) pass++
  else { fail++; if (critical) crit.push(label) }
}

async function signUp(client, tag) {
  const email = `kw.sec.${tag}.${Date.now()}@gmail.com`
  const { data, error } = await client.auth.signUp({ email, password: 'Test123456!' })
  if (error) throw new Error(`${tag} signup: ${error.message}`)
  if (!data.session) throw new Error('No session — email confirmation is ON. Turn it OFF to run this audit.')
  return { id: data.user.id, email }
}

async function main() {
  const A = mk(), B = mk(), anon = mk()
  const userA = await signUp(A, 'a')
  const userB = await signUp(B, 'b')
  console.log(`\nUser A: ${userA.email}\nUser B: ${userB.email}\n`)

  // Seed A with protected data.
  const { data: levels } = await A.from('levels').select('*').order('level_number').limit(1)
  const l1 = levels?.[0]
  if (l1) {
    await A.from('user_progress').upsert({
      user_id: userA.id, level_id: l1.level_id, status: 'completed',
      submission_content: "A's private reflection", quiz_score: 3, quiz_total: 3,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,level_id' })
  }
  console.log('── Cross-user isolation ──')
  const { data: aProfByB } = await B.from('profiles').select('*').eq('id', userA.id)
  ok("B cannot read A's profile", (aProfByB?.length ?? 0) === 0, `saw ${aProfByB?.length}`, true)
  const { data: aProgByB } = await B.from('user_progress').select('*').eq('user_id', userA.id)
  ok("B cannot read A's progress", (aProgByB?.length ?? 0) === 0, `saw ${aProgByB?.length}`, true)
  const { data: aBefore } = await A.from('profiles').select('total_xp').eq('id', userA.id).single()
  await B.from('profiles').update({ total_xp: 0 }).eq('id', userA.id)
  const { data: aAfter } = await A.from('profiles').select('total_xp').eq('id', userA.id).single()
  ok("B cannot overwrite A's XP", aAfter?.total_xp === aBefore?.total_xp, `A.total_xp=${aAfter?.total_xp}`, true)

  console.log('\n── Privilege escalation ──')
  await A.from('profiles').update({ is_admin: true }).eq('id', userA.id)
  const { data: aSelf } = await A.from('profiles').select('is_admin').eq('id', userA.id).single()
  ok('A CANNOT self-grant admin', aSelf?.is_admin !== true, `is_admin=${aSelf?.is_admin}`, true)

  console.log('\n── XP / data integrity ──')
  await A.from('profiles').update({ total_xp: 999999 }).eq('id', userA.id)
  const { data: aXp } = await A.from('profiles').select('total_xp').eq('id', userA.id).single()
  ok('A cannot set arbitrary total_xp from client', aXp?.total_xp !== 999999, `total_xp=${aXp?.total_xp}`, true)

  console.log('\n── Anonymous (logged-out) access ──')
  const { data: anonProf } = await anon.from('profiles').select('id').limit(5)
  ok('anon cannot read profiles', (anonProf?.length ?? 0) === 0, `saw ${anonProf?.length}`, true)
  const { data: anonXp } = await anon.from('xp_events').select('id').limit(5)
  ok('anon cannot read xp_events', (anonXp?.length ?? 0) === 0, `saw ${anonXp?.length}`, true)
  const { data: anonJ } = await anon.from('journal_entries').select('id').limit(5)
  ok('anon cannot read journal_entries', (anonJ?.length ?? 0) === 0, `saw ${anonJ?.length}`, true)
  const { data: anonAns } = await anon.from('user_answers').select('id').limit(5)
  ok('anon cannot read user_answers', (anonAns?.length ?? 0) === 0, `saw ${anonAns?.length}`, true)

  console.log('\n── XP integrity: server-only ledger + award_xp RPC ──')
  const today = new Date().toISOString().slice(0, 10)
  const { error: directErr } = await A.from('xp_events').insert({ user_id: userA.id, source: 'coach', source_ref: today, amount: 5 })
  ok('direct xp_events insert is blocked', !!directErr, directErr ? 'rejected' : 'INSERTED (bad)', true)

  const { data: rpc1, error: rpcErr } = await A.rpc('award_xp', { p_source: 'coach', p_source_ref: today })
  ok('award_xp(coach) grants XP', !rpcErr && !!rpc1, rpcErr?.message || `+${rpc1?.amount} → ${rpc1?.new_xp}`)
  const { data: rpc2 } = await A.rpc('award_xp', { p_source: 'coach', p_source_ref: today })
  ok('award_xp(coach) is idempotent (no double XP)', rpc2?.duplicate === true, `duplicate=${rpc2?.duplicate}`, true)

  const { error: fakeErr } = await A.rpc('award_xp', { p_source: 'course', p_source_ref: '999999' })
  ok('award_xp(course) rejects an uncompleted course', !!fakeErr, fakeErr ? 'rejected' : 'AWARDED (bad)', true)

  console.log(`\nThrowaway users to delete: ${userA.email}, ${userB.email}`)
}

try {
  await main()
} catch (e) {
  console.log('✗ audit aborted:', e.message)
  fail++
}
console.log(`\n${fail === 0 ? '✅ ALL CHECKS PASSED' : '❌ ' + fail + ' issue(s)'}  (${pass} passed, ${fail} failed)`)
if (crit.length) console.log(`🚨 CRITICAL: ${crit.join('; ')}`)
process.exitCode = fail === 0 ? 0 : 1
