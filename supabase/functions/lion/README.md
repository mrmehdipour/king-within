# The Lion — AI agent setup

The Lion is a Supabase Edge Function that reads a user's data and asks Google
Gemini Flash for a personality reflection. The Gemini key lives **only** in a
Supabase secret — never in the app/client.

## One-time setup

### 1. Database
Run `db/09_lion_agent.sql` in the Supabase SQL editor (creates `lion_insights`
+ RLS). Safe to re-run.

### 2. Get a free Gemini API key
- Go to https://aistudio.google.com/apikey (sign in with Google).
- Click **Create API key**. Copy it. No credit card needed.
- Free tier is plenty: ~15 requests/min, ~1M tokens/day.

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

### 5. Store the Gemini key as a secret
```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```
(`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically — no need to set them.)

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
