// The Lion — King Within's AI agent (Supabase Edge Function, runs on Deno).
//
// This is the "network of prompts", not one prompt:
//   PERSONA  — the Lion's constant identity
//   CONTEXT  — live user data, fetched and stitched in at runtime (lean: only
//              high-signal reflections; quizzes collapsed to a score)
//   SKILLS   — a registry of focused task-prompts; the router picks one
//   OUTPUT   — saved to lion_insights and returned to the app
//
// Provider-agnostic: if GROQ_API_KEY is set it uses Groq (free tier works in
// regions where Gemini's free tier is blocked); otherwise it falls back to
// Gemini. The API key lives in a Supabase secret, never the client.
//
// Deploy:  supabase functions deploy lion
// Secret:  supabase secrets set GROQ_API_KEY=<key>     (recommended)
//      or: supabase secrets set GEMINI_API_KEY=<key>

import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · PERSONA — written once, shared by every skill. The character of the site.
// ─────────────────────────────────────────────────────────────────────────────
const PERSONA = `You are the Lion of King Within — the guiding spirit of a self-development app built on four archetypes: Initiate, Warrior, Magician, King.

Voice: wise, fierce, warm, and direct. You speak like a mentor who believes in the person but will not flatter them. You are concise. You never use corporate or therapy clichés.

Rules:
- LANGUAGE IS CRITICAL: write your ENTIRE response in the ONE language requested below — either English or Persian (فارسی) — using only that language's script. NEVER mix in Russian, Chinese, or any other language or alphabet. If Persian is requested, write natural, fluent Persian in Arabic script. If English is requested, write only in English.
- Ground every observation in the user's actual data below. Never invent facts about them.
- Be specific and personal, not generic horoscope-speak.
- Speak directly to the user as "you".`

// ─────────────────────────────────────────────────────────────────────────────
// 3 · SKILLS — the network. Each is a focused task-prompt + the context it reads.
//     Add a new capability by adding one entry here.
// ─────────────────────────────────────────────────────────────────────────────
const SKILLS: Record<
  string,
  {
    instruction: (locale: string) => string
    context: (supabase: any, userId: string) => Promise<string>
  }
> = {
  personality: {
    instruction: (locale) =>
      `Write a personality reflection for this person based on what they wrote (their reflections carry the most signal; the quiz score is secondary).

Structure your reply with these short sections (translate the headings if writing in Persian):
1. Who you are right now — 2-3 sentences capturing their current character.
2. Your strengths — 2-3 concrete strengths you can see in their answers.
3. Your growth edges — 2-3 honest areas to work on, framed as a challenge, not a flaw.
4. Your archetype pull — which of Initiate/Warrior/Magician/King qualities show up most, and why.

Keep the whole thing under ~250 words. Language: ${locale === 'fa' ? 'Persian (فارسی)' : 'English'}.`,
    context: buildPersonalityContext,
  },

  coach: {
    instruction: (locale) =>
      `Give this person ONE short piece of guidance for today — like a coach who saw their recent journey.

- 2-3 sentences only. Warm, direct, a little fierce. No headings, no lists.
- Acknowledge something specific from their recent activity below.
- End with one concrete thing to do today (a small, doable action).
- Under ~70 words. Language: ${locale === 'fa' ? 'Persian (فارسی)' : 'English'}.`,
    context: buildCoachContext,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · CONTEXT builders — turn DB rows into LEAN, high-signal text for the prompt.
//     We DON'T dump every answer. Writing/journal reflections are the gold;
//     quizzes are collapsed to a score plus only the ones they got wrong.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_WRITING = 18   // richest signal — their own words
const MAX_JOURNAL = 14
const MAX_WRONG = 8      // a few misconceptions are useful; the rest is noise

async function buildPersonalityContext(supabase: any, userId: string): Promise<string> {
  const [{ data: profile }, { data: answers }, { data: journal }] = await Promise.all([
    supabase.from('profiles').select('current_archetype, current_level, total_xp').eq('id', userId).single(),
    supabase
      .from('user_answers')
      .select('type, answer, is_correct, course_blocks(content)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // most recent first
      .limit(120),
    supabase
      .from('journal_entries')
      .select('answer_text, free_text, journal_questions(prompt)')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('entry_date', { ascending: false })
      .limit(MAX_JOURNAL),
  ])

  const all = answers ?? []
  const writing = all.filter((a: any) => a.type === 'writing' && a.answer?.value).slice(0, MAX_WRITING)
  const graded = all.filter((a: any) => a.is_correct !== null)
  const correct = graded.filter((a: any) => a.is_correct === true).length
  const wrong = graded.filter((a: any) => a.is_correct === false).slice(0, MAX_WRONG)

  const lines: string[] = []
  lines.push(
    `PROFILE: archetype=${profile?.current_archetype ?? 'Initiate'}, level=${profile?.current_level ?? 0}, total_xp=${profile?.total_xp ?? 0}`,
  )

  // Quizzes: a single score line + only wrong ones (saves the bulk of the tokens).
  lines.push(`\nQUIZ PERFORMANCE: ${correct}/${graded.length} correct.`)
  if (wrong.length) {
    lines.push('Recently got wrong:')
    for (const a of wrong) {
      const c = a.course_blocks?.content ?? {}
      const q = c.prompt ?? c.statement ?? c.sentence ?? '(question)'
      lines.push(`- ${truncate(q, 90)} → "${truncate(formatAnswer(a.type, a.answer?.value), 90)}"`)
    }
  }

  // Writing reflections — their own words, the heart of the analysis.
  lines.push('\nWRITTEN REFLECTIONS (course):')
  if (writing.length) {
    for (const a of writing) {
      const c = a.course_blocks?.content ?? {}
      const q = c.prompt ?? '(prompt)'
      lines.push(`- ${truncate(q, 90)} → "${truncate(String(a.answer?.value ?? ''), 220)}"`)
    }
  } else {
    lines.push('(none yet)')
  }

  // Journal entries.
  lines.push('\nJOURNAL ENTRIES:')
  if (journal?.length) {
    for (const j of journal) {
      const prompt = j.journal_questions?.prompt ?? '(daily prompt)'
      const ans = [j.answer_text, j.free_text].filter(Boolean).join(' — ')
      if (ans) lines.push(`- ${truncate(prompt, 90)} → "${truncate(ans, 220)}"`)
    }
  } else {
    lines.push('(none yet)')
  }

  return lines.join('\n')
}

// Coach context — small and recent. Just enough for one timely nudge.
async function buildCoachContext(supabase: any, userId: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  const [{ data: profile }, { data: journal }, { count: completed }] = await Promise.all([
    supabase.from('profiles').select('current_archetype, current_level, total_xp').eq('id', userId).single(),
    supabase
      .from('journal_entries')
      .select('entry_date, answer_text, free_text, journal_questions(prompt)')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('entry_date', { ascending: false })
      .limit(5),
    supabase
      .from('user_progress')
      .select('level_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ])

  const lines: string[] = []
  lines.push(`TODAY: ${today}`)
  lines.push(
    `PROFILE: archetype=${profile?.current_archetype ?? 'Initiate'}, level=${profile?.current_level ?? 0}, total_xp=${profile?.total_xp ?? 0}, courses_completed=${completed ?? 0}`,
  )
  const lastDate = journal?.[0]?.entry_date
  lines.push(`JOURNALED TODAY: ${lastDate === today ? 'yes' : 'no'}`)

  lines.push('\nRECENT JOURNAL:')
  if (journal?.length) {
    for (const j of journal) {
      const prompt = j.journal_questions?.prompt ?? '(daily prompt)'
      const ans = [j.answer_text, j.free_text].filter(Boolean).join(' — ')
      if (ans) lines.push(`- (${j.entry_date}) ${truncate(prompt, 80)} → "${truncate(ans, 180)}"`)
    }
  } else {
    lines.push('(none yet — they have not started journaling)')
  }

  return lines.join('\n')
}

function formatAnswer(type: string, value: unknown): string {
  if (value == null) return '(no answer)'
  if (type === 'match' && Array.isArray(value)) {
    return value.map((p: any) => (Array.isArray(p) ? `${p[0]}→${p[1]}` : String(p))).join(', ')
  }
  return String(value)
}

function truncate(s: string, n: number): string {
  s = String(s ?? '')
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

// ─────────────────────────────────────────────────────────────────────────────
// Model providers. Each returns a normalized result. Retry on 429/503.
// ─────────────────────────────────────────────────────────────────────────────
type ModelResult = { ok: boolean; status: number; content?: string; detail?: string }

async function withRetry(fn: () => Promise<Response>, maxAttempts = 3): Promise<Response> {
  let res!: Response
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    res = await fn()
    if (res.ok || (res.status !== 429 && res.status !== 503)) return res
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1)))
  }
  return res
}

// Groq — OpenAI-compatible chat API. Free tier, fast, good multilingual (Persian).
async function callGroq(apiKey: string, persona: string, prompt: string): Promise<ModelResult> {
  const model = Deno.env.get('GROQ_MODEL') ?? 'llama-3.3-70b-versatile'
  const res = await withRetry(() =>
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: persona },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 800,
      }),
    }),
  )
  if (!res.ok) return { ok: false, status: res.status, detail: await res.text() }
  const data = await res.json()
  return { ok: true, status: 200, content: data?.choices?.[0]?.message?.content ?? '' }
}

// Gemini — fallback. (Free tier is region-gated; Iran etc. get limit 0.)
async function callGemini(apiKey: string, persona: string, prompt: string): Promise<ModelResult> {
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await withRetry(() =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: persona }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
      }),
    }),
  )
  if (!res.ok) return { ok: false, status: res.status, detail: await res.text() }
  const data = await res.json()
  const content = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? ''
  return { ok: true, status: 200, content }
}

// Router: pick whichever provider has a key (Groq preferred).
function activeProvider(): { name: string; key: string } | null {
  const groq = Deno.env.get('GROQ_API_KEY')
  if (groq) return { name: 'groq', key: groq }
  const gemini = Deno.env.get('GEMINI_API_KEY')
  if (gemini) return { name: 'gemini', key: gemini }
  return null
}

async function callModel(persona: string, prompt: string): Promise<ModelResult & { provider: string }> {
  const provider = activeProvider()
  if (!provider) return { ok: false, status: 500, detail: 'No model key set (GROQ_API_KEY or GEMINI_API_KEY).', provider: 'none' }
  const r = provider.name === 'groq'
    ? await callGroq(provider.key, persona, prompt)
    : await callGemini(provider.key, persona, prompt)
  return { ...r, provider: provider.name }
}

// Smaller models sometimes drift into the wrong language (we saw Russian/Chinese
// leak into Persian/English replies). Detect obvious wrong-script output so we
// can retry with a stronger instruction.
function looksWrongLanguage(text: string, locale: string): boolean {
  // These scripts are never expected in either English or Persian output.
  if (/[Ѐ-ӿ]/.test(text)) return true            // Cyrillic (Russian)
  if (/[　-ヿ㐀-鿿가-힯]/.test(text)) return true // CJK / Hangul / Kana
  const persianChars = (text.match(/[؀-ۿ]/g) || []).length
  if (locale === 'fa') {
    // A real Persian reply must be mostly Persian/Arabic script.
    return persianChars < 10
  }
  // English reply: a few Persian glyphs are fine, but not a wall of them.
  return persianChars > 25
}

// Call the model, and if it answers in the wrong language, retry once with a
// reinforced demand. Returns the best result we got.
async function callModelInLanguage(
  persona: string,
  prompt: string,
  locale: string,
): Promise<ModelResult & { provider: string }> {
  const first = await callModel(persona, prompt)
  if (!first.ok || !first.content || !looksWrongLanguage(first.content, locale)) return first

  const langName = locale === 'fa' ? 'Persian (فارسی), Arabic script only' : 'English only'
  const reinforced =
    `${prompt}\n\nYour previous attempt used the WRONG language. Rewrite it entirely in ${langName}. ` +
    `Do not include a single word of Russian, Chinese, or any other language.`
  const retry = await callModel(persona, reinforced)
  if (retry.ok && retry.content && !looksWrongLanguage(retry.content, locale)) return retry
  return retry.ok ? retry : first
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler — auth + router + model call + output.
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const provider = activeProvider()
    if (!provider) return json({ error: 'Server is missing a model key (GROQ_API_KEY or GEMINI_API_KEY).', code: 'no_key' }, 500)

    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader) return json({ error: 'Not signed in.', code: 'auth' }, 401)

    // Client bound to the caller's JWT → RLS scopes every query to this user.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return json({ error: 'Not signed in.', code: 'auth' }, 401)

    const body = await req.json().catch(() => ({}))
    const skillName: string = body.skill ?? 'personality'  // ← router (simple for now)
    const locale: string = body.locale === 'fa' ? 'fa' : 'en'

    // Lightweight health check — confirms the function is live and a key is set,
    // without spending any model quota.
    if (skillName === 'ping') return json({ ok: true, provider: provider.name })

    const skill = SKILLS[skillName]
    if (!skill) return json({ error: `Unknown skill: ${skillName}`, code: 'bad_skill' }, 400)

    // Compose the prompt network: skill instruction + lean live context.
    // The final line re-states the output language (recency helps small models
    // stay on-language instead of drifting into Russian/Chinese).
    const langName = locale === 'fa' ? 'Persian (فارسی), in Arabic script only' : 'English only'
    const context = await skill.context(supabase, user.id)
    const prompt =
      `${skill.instruction(locale)}\n\n--- THIS PERSON'S DATA ---\n${context}\n\n` +
      `--- OUTPUT LANGUAGE ---\nWrite your entire response in ${langName}. ` +
      `Do not use Russian, Chinese, or any other language or alphabet.`

    const result = await callModelInLanguage(PERSONA, prompt, locale)

    if (!result.ok) {
      console.error('Model error', result.provider, result.status, result.detail)
      if (result.status === 429) {
        return json({ error: 'The Lion is being asked too much right now. Try again in a few seconds.', code: 'rate_limit', detail: result.detail }, 429)
      }
      return json({ error: 'The Lion could not respond right now.', code: 'upstream', detail: result.detail }, 502)
    }

    const content = (result.content ?? '').trim()
    if (!content) return json({ error: 'The Lion returned nothing. Try again.', code: 'empty' }, 502)

    // Save the insight (RLS lets the user insert their own row).
    await supabase.from('lion_insights').insert({
      user_id: user.id,
      skill: skillName,
      locale,
      content,
      model: result.provider,
    })

    return json({ content, skill: skillName, locale, provider: result.provider })
  } catch (e) {
    return json({ error: 'Unexpected error.', detail: String(e) }, 500)
  }
})

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
