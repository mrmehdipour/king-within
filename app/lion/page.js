'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { useLang } from '../lib/i18n'
import { lionChat, lionHistory } from '../lib/lion'
import LionAvatar from '../components/LionAvatar'

export default function LionChatPage() {
  const router = useRouter()
  const { t, locale } = useLang()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/signup'); return }
    const hist = await lionHistory()
    setMessages(hist)
    setLoading(false)
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function send(text) {
    const msg = (text ?? input).trim()
    if (!msg || sending) return
    setInput('')
    setError('')
    setMessages((m) => [...m, { role: 'user', content: msg }])
    setSending(true)
    try {
      const res = await lionChat(msg, { locale })
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }])
    } catch (e) {
      setError(e.code === 'rate_limit' ? t('lion.rateLimit') : (e.message || t('lion.error')))
    } finally {
      setSending(false)
    }
  }

  const suggestions = [t('lion.chatSuggest1'), t('lion.chatSuggest2'), t('lion.chatSuggest3')]

  return (
    <div className="flex flex-col h-[100dvh] bg-stone-950 text-white">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-800 bg-stone-900/80 backdrop-blur pt-safe">
        <Link href="/learn" className="text-stone-400 hover:text-amber-400 text-sm" aria-label={t('lion.back')}>
          ←
        </Link>
        <LionAvatar size={34} thinking={sending} className="shrink-0" />
        <div>
          <p className="font-display text-amber-400 leading-tight">{t('lion.chatTitle')}</p>
          <p className="text-stone-500 text-[11px]">{sending ? t('lion.chatTyping') : t('lion.subtitle')}</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <p className="text-center text-stone-500 text-sm mt-10">{t('common.loading')}</p>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center mt-6 mb-2">
                <LionAvatar size={72} className="mx-auto mb-3" />
                <p className="text-stone-300 text-sm max-w-xs mx-auto leading-relaxed">{t('lion.chatIntro')}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && <Bubble role="assistant" content="…" muted />}
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-xs text-amber-300 border border-amber-500/30 rounded-full px-3 py-1.5 hover:bg-amber-500/10 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send() }}
        className="flex items-end gap-2 p-3 border-t border-stone-800 bg-stone-900 pb-safe"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          rows={1}
          placeholder={t('lion.chatPlaceholder')}
          className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-2xl bg-stone-800 text-white placeholder-stone-500 border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="shrink-0 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-bold w-11 h-11 flex items-center justify-center transition"
          aria-label={t('lion.chatSend')}
        >
          ↑
        </button>
      </form>
    </div>
  )
}

function Bubble({ role, content, muted }) {
  const isUser = role === 'user'
  return (
    <div
      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'ms-auto bg-amber-500 text-stone-900 rounded-br-md'
          : 'me-auto bg-stone-800 text-stone-100 rounded-bl-md'
      } ${muted ? 'opacity-60' : ''}`}
    >
      {content}
    </div>
  )
}
