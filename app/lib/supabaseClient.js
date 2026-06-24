import { createClient } from '@supabase/supabase-js'

// These two values come from .env.local — never hardcode real keys directly in code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This single 'supabase' object is what every page will import
// to talk to your database — sign up users, fetch levels, save progress, etc.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)