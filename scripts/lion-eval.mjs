// King Within — Lion golden-set eval (Wave 2). The minimum eval-as-QA harness:
// a small labeled set of representative inputs + deterministic pass/fail checks,
// so a model swap or prompt edit can't silently regress the mentor (esp. the
// Russian/Chinese language drift we hit before).
//
// Run:  GROQ_API_KEY=xxxxx node scripts/lion-eval.mjs
//   (optional GROQ_MODEL=llama-3.3-70b-versatile)
//
// ⚠️ The PERSONA + skill instructions below MIRROR supabase/functions/lion/index.ts.
// If you change the prompts there, update them here too (and add new failure
// cases as you find them in real lion_insights / lion_messages traces).

const API_KEY = process.env.GROQ_API_KEY
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
if (!API_KEY) { console.log('Set GROQ_API_KEY to run. (It is a Supabase secret, not in .env.local.)'); process.exit(1) }

// ── prompts mirrored from the Edge Function ─────────────────────────────────
const PERSONA = `You are the Lion of King Within — the guiding spirit of a self-development app built on four archetypes: Initiate, Warrior, Magician, King.
Voice: wise, fierce, warm, and direct. Concise. No corporate or therapy clichés.
Rules:
- LANGUAGE IS CRITICAL: write your ENTIRE response in the ONE language requested — English or Persian (فارسی) — using only that language's script. NEVER mix in Russian, Chinese, or any other language or alphabet.
- Ground every observation in the user's actual data. Never invent facts. Speak directly to the user as "you".`

const personalityInstr = (l) => `Write a short personality reflection (4 brief sections). Under ~250 words. Language: ${l === 'fa' ? 'Persian (فارسی)' : 'English'}.`
const coachInstr = (l) => `Grant a DAILY AUDIENCE. Return ONLY a JSON object with keys greeting, focus, message, quest. Text values in ${l === 'fa' ? 'Persian (فارسی)' : 'English'}; keys in English. No markdown fences.`
const chatInstr = (l) => `You are in a live coaching CONVERSATION. 1-4 sentences, warm, direct. Reply ONLY in ${l === 'fa' ? 'Persian (فارسی)' : 'English'}.`

const CTX_EN = `PROFILE: archetype=Initiate, level=3, total_xp=140
WRITTEN REFLECTIONS: "I skip the gym when I don't feel like it." "I avoid hard conversations with my brother."
JOURNAL: "Today I felt scattered and reactive."`
const CTX_FA = `PROFILE: archetype=Initiate, level=3, total_xp=140
WRITTEN REFLECTIONS: «وقتی حسش نیست باشگاه را می‌پیچانم.» «از گفتگوی سخت با برادرم فرار می‌کنم.»
JOURNAL: «امروز پراکنده و واکنشی بودم.»`

// ── golden cases ────────────────────────────────────────────────────────────
const langLine = (l) => `\n\n--- OUTPUT LANGUAGE ---\nWrite your entire response in ${l === 'fa' ? 'Persian (فارسی), Arabic script only' : 'English only'}. No Russian, Chinese, or any other language.`
const cases = []
for (const l of ['en', 'fa']) {
  const ctx = l === 'fa' ? CTX_FA : CTX_EN
  cases.push({ name: `personality/${l}`, l, system: PERSONA, user: personalityInstr(l) + '\n\n--- DATA ---\n' + ctx + langLine(l) })
  cases.push({ name: `coach/${l}`, l, json: true, system: PERSONA, user: coachInstr(l) + '\n\n--- DATA ---\n' + ctx + langLine(l) })
  cases.push({ name: `chat/${l}`, l, system: `${PERSONA}\n\n${chatInstr(l)}\n\n--- ABOUT THEM ---\n${ctx}`,
    user: l === 'fa' ? 'احساس می‌کنم گیر کرده‌ام، از کجا شروع کنم؟' : 'I keep procrastinating. Where do I start?' })
}

// ── checks ───────────────────────────────────────────────────────────────────
const foreignScript = (s) => /[Ѐ-ӿ]/.test(s) || /[一-鿿가-힣ぁ-ヿ]/.test(s)
const persianCount = (s) => (s.match(/[؀-ۿ]/g) || []).length
const refusal = (s) => /as an (ai|artificial)|language model|i (cannot|can't) (help|assist|do that)/i.test(s)

function check(c, out) {
  const fails = []
  if (!out || !out.trim()) fails.push('empty')
  if (foreignScript(out)) fails.push('foreign-script (RU/CJK)')
  if (c.l === 'fa' && persianCount(out) < 10) fails.push('expected Persian, got little/none')
  if (c.l === 'en' && persianCount(out) > 25) fails.push('expected English, got Persian')
  if (refusal(out)) fails.push('refusal/AI-disclaimer')
  if (out.length > 2000) fails.push('too long (>2000 chars)')
  if (c.name.startsWith('chat') && out.length > 700) fails.push('chat reply too long (>700)')
  if (c.json) {
    let o; try { o = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] ?? out) } catch { /* */ }
    if (!o) fails.push('coach: not valid JSON')
    else for (const k of ['greeting', 'focus', 'message', 'quest']) if (!o[k]) fails.push(`coach: missing "${k}"`)
  }
  return fails
}

async function callGroq(system, user, json) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      temperature: 0.5, max_tokens: 800,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })
  if (!res.ok) return { err: `${res.status} ${await res.text()}` }
  const data = await res.json()
  return { out: data?.choices?.[0]?.message?.content ?? '' }
}

let pass = 0, fail = 0
for (const c of cases) {
  const { out, err } = await callGroq(c.system, c.user, c.json)
  if (err) { console.log(`✗ ${c.name} — API error: ${err.slice(0, 120)}`); fail++; continue }
  const fails = check(c, out)
  if (fails.length) { console.log(`✗ ${c.name} — ${fails.join('; ')}`); fail++ }
  else { console.log(`✓ ${c.name}`); pass++ }
}
console.log(`\n${fail === 0 ? '✅ all good' : '❌ ' + fail + ' failed'}  (${pass} passed, ${fail} failed) · model=${MODEL}`)
process.exitCode = fail === 0 ? 0 : 1
