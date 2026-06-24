import { createClient } from '@supabase/supabase-js'

// Read-only Supabase client for server components / build-time (blog SEO).
// No auth session — RLS lets anyone read PUBLISHED blog rows.
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
