// The Lion — King Within's AI agent (Supabase Edge Function, runs on Deno).
//
// This is the "network of prompts", not one prompt:
//   PERSONA  — the Lion's constant identity (systemInstruction)
//   CONTEXT  — live user data, fetched and stitched in at runtime
//   SKILLS   — a registry of focused task-prompts; the router picks one
//   OUTPUT   — saved to lion_insights and returned to the app
//
// The function runs with the CALLER'S JWT, so Supabase RLS lets it read/write
// only that user's rows. The Gemini key lives in a Supabase secret, never the client.
//
// Deploy:  supabase functions deploy lion
// Secret:  supabase secrets set GEMINI_API_KEY=<your key>

import { createClient } from 'jsr:@supabase/supabase-js@2'

const MODEL = 'gemini-1.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

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
- Reply ONLY in the requested language (English or Persian/فارسی). If Persian, write natural, fluent Persian.
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
      `Write a personality reflection for this person based on how they answered their course questions and what they wrote in their journal.

Structure your reply with these short sections (translate the headings if writing in Persian):
1. Who you are right now — 2-3 sentences capturing their current character.
2. Your strengths — 2-3 concrete strengths you can see in their answers.
3. Your growth edges — 2-3 honest areas to work on, framed as a challenge, not a flaw.
4. Your archetype pull — which of Initiate/Warrior/Magician/King qualities show up most, and why.

Keep the whole thing under ~250 words. Language: ${locale === 'fa' ? 'Persian (فارسی)' : 'English'}.`,
    context: buildPersonalityContext,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · CONTEXT builders — turn DB rows into readable text for the prompt.
// ─────────────────────────────────────────────────────────────────────────────
async function buildPersonalityContext(supabase: any, userId: string): Promise<string> {
  const [{ data: profile }, { data: answers }, { data: journal }] = await Promise.all([
    supabase.from('profiles').select('current_archetype, current_level, total_xp').eq('id', userId).single(),
    supabase
      .from('user_answers')
      .select('type, answer, is_correct, created_at, course_blocks(content), levels(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(80),
    supabase
      .from('journal_entries')
      .select('answer_text, free_text, entry_date, journal_questions(prompt)')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('entry_date', { ascending: true })
      .limit(40),
  ])

  const lines: string[] = []
  lines.push(
    `PROFILE: archetype=${profile?.current_archetype ?? 'Initiate'}, level=${profile?.current_level ?? 0}, total_xp=${profile?.total_xp ?? 0}`,
  )

  lines.push('\nCOURSE ANSWERS:')
  if (answers?.length) {
    for (const a of answers) {
      const c = a.course_blocks?.content ?? {}
      const question = c.prompt ?? c.statement ?? c.sentence ?? a.levels?.title ?? '(part)'
      const value = formatAnswer(a.type, a.answer?.value)
      const mark = a.is_correct === true ? ' ✓' : a.is_correct === false ? ' ✗' : ''
      lines.push(`- [${a.type}] ${truncate(question, 160)} → "${truncate(value, 200)}"${mark}`)
    }
  } else {
    lines.push('(none yet)')
  }

  lines.push('\nJOURNAL ENTRIES:')
  if (journal?.length) {
    for (const j of journal) {
      const prompt = j.journal_questions?.prompt ?? '(daily prompt)'
      const ans = [j.answer_text, j.free_text].filter(Boolean).join(' — ')
      if (ans) lines.push(`- ${truncate(prompt, 140)} → "${truncate(ans, 300)}"`)
    }
  } else {
    lines.push('(none yet)')
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

// Call Gemini, retrying on rate-limit (429) and overload (503) with exponential
// backoff. Returns the final Response (ok or not) for the handler to interpret.
async function callGeminiWithRetry(apiKey: string, payload: unknown, maxAttempts = 3): Promise<Response> {
  let res!: Response
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok || (res.status !== 429 && res.status !== 503)) return res
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1))) // 0.5s, 1s
    }
  }
  return res
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler — the router + model call + output.
// ─────────────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) return json({ error: 'Server is missing GEMINI_API_KEY.' }, 500)

    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader) return json({ error: 'Not signed in.' }, 401)

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

    // Lightweight health check — confirms the function is live and the key is set,
    // without spending Gemini quota.
    if (skillName === 'ping') return json({ ok: true, model: MODEL })

    const skill = SKILLS[skillName]
    if (!skill) return json({ error: `Unknown skill: ${skillName}`, code: 'bad_skill' }, 400)

    // Compose the prompt network: skill instruction + live context.
    const context = await skill.context(supabase, user.id)
    const prompt = `${skill.instruction(locale)}\n\n--- THIS PERSON'S DATA ---\n${context}`

    // Call Gemini Flash (with retry on rate-limit / transient errors).
    // Persona goes in systemInstruction (the constant identity).
    const payload = {
      systemInstruction: { parts: [{ text: PERSONA }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }

    const res = await callGeminiWithRetry(apiKey, payload)

    if (!res.ok) {
      const detail = await res.text()
      // 429 = rate limited, 503 = model overloaded — both are "try again" cases.
      if (res.status === 429) {
        return json({ error: 'The Lion is being asked too much right now. Try again in a few seconds.', code: 'rate_limit', detail }, 429)
      }
      return json({ error: 'The Lion could not respond right now.', code: 'upstream', detail }, 502)
    }

    const data = await res.json()
    const content: string =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? ''
    if (!content.trim()) return json({ error: 'The Lion returned nothing. Try again.', code: 'empty' }, 502)

    // Save the insight (RLS lets the user insert their own row).
    await supabase.from('lion_insights').insert({
      user_id: user.id,
      skill: skillName,
      locale,
      content,
      model: MODEL,
    })

    return json({ content, skill: skillName, locale })
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
