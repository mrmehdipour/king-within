# The Lion — AI agent setup

The Lion is a Supabase Edge Function that reads a user's data and asks an LLM for
a personality reflection. It's **provider-agnostic**: set `GROQ_API_KEY` to use
Groq (recommended), or `GEMINI_API_KEY` to use Gemini. The key lives **only** in
a Supabase secret — never in the app/client.

> ⚠️ **Gemini's free tier is region-gated** and returns `limit: 0` for accounts in
> unsupported countries (e.g. Iran). If you saw a 429 "RESOURCE_EXHAUSTED … limit: 0",
> use **Groq** instead — its free tier works.

## One-time setup

### 1. Database
Run `db/09_lion_agent.sql` in the Supabase SQL editor (creates `lion_insights`
+ RLS). Safe to re-run.

### 2. Get a free Groq API key (recommended)
- Go to https://console.groq.com/keys (sign in — Google/GitHub/email).
- **Create API Key**, copy it. No credit card needed.
- Free tier is generous (thousands of requests/day) and fast. Default model
  `llama-3.3-70b-versatile` handles Persian + English well.

*(Alternative: a Gemini key from https://aistudio.google.com/apikey — only if your
account's region supports the free tier.)*

### 3. Install the Supabase CLI (once)
```bash
npm install -g supabase
supabase login           # opens a browser to authorize
```

### 4. Link this project (once)
Find your project ref in the Supabase dashboard URL
(`https://supabase.com/dashboard/project/<REF>`):
```bash
supabase link --project-ref <REF>
```

### 5. Store the model key as a secret
```bash
supabase secrets set GROQ_API_KEY=your_groq_key_here
# or, if using Gemini instead:
# supabase secrets set GEMINI_API_KEY=your_gemini_key_here
```
If both are set, Groq wins. (`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected
automatically — no need to set them.) You can also set the dashboard UI's
**Edge Functions → Secrets** instead of the CLI.

### 6. Deploy the function
```bash
supabase functions deploy lion
```

That's it. Open the app → **Profile** → tap **"Ask the Lion to read you"**.

## How it works (the prompt network)
- **Persona** (`PERSONA`) — the Lion's constant identity, sent as `systemInstruction`.
- **Context** (`buildPersonalityContext`) — pulls the user's profile, `user_answers`,
  and `journal_entries` (scoped to that user by RLS via their JWT).
- **Skills** (`SKILLS`) — a registry of task-prompts. Add a new capability by adding
  one entry: an `instruction(locale)` and a `context(supabase, userId)` fetcher.
- **Router** — currently `body.skill` (defaults to `personality`); can grow into its
  own model call later.
- **Output** — saved to `lion_insights` and returned to the Profile screen.

## Cost / safety notes
- The key is server-side only; the client calls the function with the user's JWT.
- RLS means the function can only ever read/write the calling user's rows.
- To add languages or skills, edit `index.ts` and re-run `supabase functions deploy lion`.
