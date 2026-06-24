// Security audit: verify Row Level Security isolates users from each other.
// Creates two throwaway users (A, B), gives A some data, then confirms B
// cannot READ or WRITE A's profile / progress.
//
// Run: node scripts/rls-audit.mjs   (requires email confirmation OFF)

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Two independent clients = two independent sessions.
const mk = () => createClient(URL, KEY, { auth: { persistSession: false } })

let pass = 0, fail = 0
const ok = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗'} ${label}${extra ? '  — ' + extra : ''}`)
  cond ? pass++ : fail++
}

async function signUp(client, tag) {
  const email = `kw.${tag}.${Date.now()}@gmail.com`
  const { data, error } = await client.auth.signUp({ email, password: 'Test123456!' })
  if (error) throw new Error(`${tag} signup: ${error.message}`)
  if (!data.session) throw new Error('No session — email confirmation is still ON. Turn it off to run this audit.')
  return { id: data.user.id, email }
}

async function main() {
  const A = mk(), B = mk()
  const userA = await signUp(A, 'a')
  const userB = await signUp(B, 'b')
  console.log(`\nUser A: ${userA.email}\nUser B: ${userB.email}\n`)

  // A completes level 1 so there is data to protect.
  const { data: levels } = await A.from('levels').select('*').order('level_number').limit(1)
  const l1 = levels?.[0]
  await A.from('user_progress').upsert({
    user_id: userA.id, level_id: l1.level_id, status: 'completed',
    submission_content: "A's private reflection", quiz_score: 3, quiz_total: 3,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,level_id' })
  await A.from('profiles').update({ total_xp: 999 }).eq('id', userA.id)

  // --- B tries to READ A's data ---
  const { data: aProfileSeenByB } = await B.from('profiles').select('*').eq('id', userA.id)
  ok("B cannot read A's profile", (aProfileSeenByB?.length ?? 0) === 0, `saw ${aProfileSeenByB?.length} rows`)

  const { data: aProgressSeenByB } = await B.from('user_progress').select('*').eq('user_id', userA.id)
  ok("B cannot read A's progress", (aProgressSeenByB?.length ?? 0) === 0, `saw ${aProgressSeenByB?.length} rows`)

  // B's own view should only contain B's rows (none yet).
  const { data: allProfilesByB } = await B.from('profiles').select('id')
  const onlyOwn = (allProfilesByB ?? []).every((p) => p.id === userB.id)
  ok('B only sees its own profile row(s)', onlyOwn, `saw ${allProfilesByB?.length} profile rows`)

  // --- B tries to WRITE A's data ---
  await B.from('profiles').update({ total_xp: 0 }).eq('id', userA.id)
  const { data: aAfter } = await A.from('profiles').select('total_xp').eq('id', userA.id).single()
  ok("B cannot overwrite A's XP", aAfter?.total_xp === 999, `A.total_xp is now ${aAfter?.total_xp}`)

  // --- Content (levels/questions) should be readable by any signed-in user ---
  const { data: lvlByB } = await B.from('levels').select('level_id')
  ok('B can read course content (levels)', (lvlByB?.length ?? 0) > 0, `${lvlByB?.length} levels`)

  console.log(`\nThrowaway users to delete later: ${userA.email}, ${userB.email}`)
}

try {
  await main()
} catch (e) {
  console.log('✗ audit aborted:', e.message)
  fail++
}
console.log(`\n${fail === 0 ? '✅ SECURE — all isolation checks passed' : '❌ ' + fail + ' ISSUE(S) FOUND'}  (${pass} passed, ${fail} failed)`)
process.exitCode = fail === 0 ? 0 : 1
