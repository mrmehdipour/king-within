'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import AdminNav from '../components/AdminNav'

// Gate the whole /admin area on profiles.is_admin. Non-admins are turned away;
// the DB RLS policies enforce this too, this is just the UI guard.
export default function AdminLayout({ children }) {
  const router = useRouter()
  const [state, setState] = useState('checking') // 'checking' | 'ok' | 'denied'

  async function check() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/signup')
      return
    }
    const { data: profile } = await supabase
      .from('profiles').select('is_admin').eq('id', user.id).single()
    setState(profile?.is_admin ? 'ok' : 'denied')
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'checking') {
    return <div className="min-h-screen flex items-center justify-center text-stone-400">Checking access…</div>
  }
  if (state === 'denied') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-stone-400 gap-3">
        <p>This area is for admins only.</p>
        <a href="/learn" className="text-amber-400 underline">Go to the app</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
