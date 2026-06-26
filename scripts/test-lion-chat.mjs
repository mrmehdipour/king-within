// End-to-end smoke test for the Lion chat (3rd skill) against the live function.
// Signs up a throwaway user, pings, holds a short 2-turn conversation (tests
// memory), tries Persian (language guard), and checks lion_messages persistence.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync('.env.local', 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
  const i = line.indexOf('=')
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})

const hasCJKorCyrillic = (s) => /[Ѐ-ӿ　-鿿]/.test(s)
const hasPersian = (s) => /[؀-ۿ]/.test(s)

async function main() {
  const email = `kw.lionchat.${Date.now()}@gmail.com`
  const { data: su, error: suErr } = await sb.auth.signUp({ email, password: 'Test123456!' })
  if (suErr) return console.log('✗ signup failed:', suErr.message)
  if (!su.session) {
    console.log('ℹ️  Email confirmation is ON (good for prod) — no session from a fresh signup,')
    console.log('   so I can\'t drive the authenticated chat from a throwaway account.')
    console.log('   Verifying the function is at least deployed + reachable instead…')
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/lion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      body: JSON.stringify({ skill: 'ping' }),
    })
    console.log(`   function responded HTTP ${res.status}:`, (await res.text()).slice(0, 200))
    return
  }
  console.log(`User: ${email}\n`)

  // 1) ping
  const { data: ping } = await sb.functions.invoke('lion', { body: { skill: 'ping' } })
  console.log('PING →', JSON.stringify(ping))

  // 2) first turn (English)
  const { data: c1, error: e1 } = await sb.functions.invoke('lion', {
    body: { skill: 'chat', message: 'I keep procrastinating on my goals. Where do I start?', locale: 'en' },
  })
  if (e1) { console.log('✗ chat error:', e1.message); return }
  console.log('\nLION (1):', c1?.reply)
  console.log('  language ok (no CJK/Cyrillic):', !hasCJKorCyrillic(c1?.reply || ''))

  // 3) follow-up that requires remembering turn 1
  const { data: c2 } = await sb.functions.invoke('lion', {
    body: { skill: 'chat', message: 'Okay. Give me just the very first step, in one line.', locale: 'en' },
  })
  console.log('\nLION (2):', c2?.reply)

  // 4) Persian turn (language guard)
  const { data: c3 } = await sb.functions.invoke('lion', {
    body: { skill: 'chat', message: 'حالم خوب نیست و انگیزه ندارم', locale: 'fa' },
  })
  console.log('\nLION (fa):', c3?.reply)
  console.log('  is Persian:', hasPersian(c3?.reply || ''), '| no CJK/Cyrillic:', !hasCJKorCyrillic(c3?.reply || ''))

  // 5) persistence
  const { data: msgs } = await sb.from('lion_messages').select('role, content').order('created_at')
  console.log(`\nPERSISTED ${msgs?.length ?? 0} messages (expect 6: 3 user + 3 assistant)`)
  console.log('Throwaway user to delete:', email)
}

main().catch((e) => console.log('✗ aborted:', e.message))
