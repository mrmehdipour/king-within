'use client'

import { useEffect, useState } from 'react'
import { listAllAnswers, listProfilesForUsers } from '../../../lib/adminData'

const TYPE_COLORS = {
  quiz: 'bg-blue-500/15 text-blue-300',
  fill_blank: 'bg-purple-500/15 text-purple-300',
  true_false: 'bg-cyan-500/15 text-cyan-300',
  match: 'bg-orange-500/15 text-orange-300',
  writing: 'bg-green-500/15 text-green-300',
}

export default function AnswersPage() {
  const [userGroups, setUserGroups] = useState([])
  const [profiles, setProfiles] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await listAllAnswers()
    if (!data?.length) { setLoading(false); return }

    // group by user_id
    const byUser = {}
    for (const row of data) {
      if (!byUser[row.user_id]) byUser[row.user_id] = []
      byUser[row.user_id].push(row)
    }
    setUserGroups(Object.entries(byUser).sort((a, b) => b[1].length - a[1].length))

    const { data: profs } = await listProfilesForUsers(Object.keys(byUser))
    const profMap = {}
    for (const p of profs ?? []) profMap[p.id] = p
    setProfiles(profMap)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  if (loading) return <p className="text-stone-400">Loading…</p>
  if (!userGroups.length) return (
    <div>
      <h1 className="font-display text-3xl text-amber-400 mb-1">User answers</h1>
      <p className="text-stone-400 mt-4">No answers captured yet — users must complete a course first.</p>
    </div>
  )

  return (
    <div>
      <h1 className="font-display text-3xl text-amber-400 mb-1">User answers</h1>
      <p className="text-stone-400 mb-6">
        Read-only view of every captured answer. Data comes from <code className="text-amber-300 text-xs">user_answers</code> — useful for future AI personality analysis.
      </p>

      <div className="space-y-3">
        {userGroups.map(([userId, answers]) => {
          const profile = profiles[userId]
          const isOpen = expanded === userId
          const byLevel = {}
          for (const a of answers) {
            const key = a.levels?.title ?? 'Unknown level'
            if (!byLevel[key]) byLevel[key] = []
            byLevel[key].push(a)
          }
          const correctCount = answers.filter(a => a.is_correct === true).length
          const gradedCount = answers.filter(a => a.is_correct !== null).length

          return (
            <div key={userId} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : userId)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-800/50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {profile?.current_archetype?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-mono">{userId.slice(0, 8)}…</p>
                    <p className="text-stone-500 text-xs">{profile?.current_archetype ?? 'unknown'} · {profile?.total_xp ?? 0} XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-stone-400">{answers.length} answers</span>
                  {gradedCount > 0 && (
                    <span className={`font-semibold ${correctCount / gradedCount >= 0.7 ? 'text-green-400' : 'text-red-400'}`}>
                      {correctCount}/{gradedCount} correct
                    </span>
                  )}
                  <span className="text-stone-600">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-stone-800 px-5 py-4 space-y-5">
                  {Object.entries(byLevel).map(([levelTitle, levelAnswers]) => (
                    <div key={levelTitle}>
                      <p className="text-amber-400 font-semibold text-sm mb-2">{levelTitle}</p>
                      <div className="space-y-2">
                        {levelAnswers.map(a => (
                          <AnswerRow key={a.id} answer={a} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnswerRow({ answer }) {
  const color = TYPE_COLORS[answer.type] ?? 'bg-stone-700 text-stone-300'
  const value = answer.answer?.value

  let displayValue = null
  if (answer.type === 'match' && Array.isArray(value)) {
    displayValue = value.map(([l, r]) => `${l} → ${r}`).join(', ')
  } else if (value !== null && value !== undefined) {
    displayValue = String(value)
  }

  return (
    <div className="flex items-start gap-3 text-sm">
      <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${color}`}>{answer.type}</span>
      <span className="text-stone-300 flex-1 break-words">{displayValue ?? <span className="text-stone-600 italic">no value</span>}</span>
      {answer.is_correct !== null && (
        <span className={`shrink-0 text-xs font-semibold ${answer.is_correct ? 'text-green-400' : 'text-red-400'}`}>
          {answer.is_correct ? '✓' : '✗'}
        </span>
      )}
    </div>
  )
}
