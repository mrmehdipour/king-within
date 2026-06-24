'use client'
// 'use client' tells Next.js this page runs in the browser (not the server),
// because we need to use React state (useState) and handle button clicks.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function SignupPage() {
  const router = useRouter()

  // These hold whatever the user types into the form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(false) // toggles between Sign Up and Log In
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault() // stops the browser's default "reload the page" form behavior
    setError('')
    setLoading(true)

    if (isLogin) {
      // LOG IN an existing user
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    } else {
      // SIGN UP a new user
      // Remember: the database trigger we created automatically makes
      // their 'profiles' row (Initiate, Level 1, 0 XP) the instant this succeeds.
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
    }

    // Success in either case — send them into the app shell
    router.push('/learn')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      <div className="w-full max-w-sm bg-stone-800 rounded-lg p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-amber-400 mb-2 text-center">
          Awaken the King Within
        </h1>
        <p className="text-stone-400 text-sm text-center mb-6">
          {isLogin ? 'Return to your path.' : 'Begin your journey.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2 rounded bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900 font-semibold py-2 rounded transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Start the Journey'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-stone-400 text-sm mt-4 hover:text-amber-400 transition"
        >
          {isLogin ? "New here? Create an account" : 'Already on the path? Log in'}
        </button>
      </div>
    </div>
  )
}