// Shared archetype/XP logic — pure functions, no React. Reused by the app-data
// context, the learn header, the stats tab, and the course completion flow.

export const ARCHETYPE_THRESHOLDS = [
  { minXp: 0, archetype: 'Initiate' },
  { minXp: 250, archetype: 'Warrior' },
  { minXp: 600, archetype: 'Magician' },
  { minXp: 1200, archetype: 'King' },
]

// The archetype a given total XP qualifies for (highest tier reached).
export function getArchetypeForXp(xp) {
  let result = 'Initiate'
  for (const tier of ARCHETYPE_THRESHOLDS) {
    if (xp >= tier.minXp) result = tier.archetype
  }
  return result
}

// Where the user sits between their current archetype and the next one.
// Returns { current, next, xpIntoTier, xpForTier, percent }.
export function getArchetypeProgress(xp) {
  let currentIndex = 0
  for (let i = 0; i < ARCHETYPE_THRESHOLDS.length; i++) {
    if (xp >= ARCHETYPE_THRESHOLDS[i].minXp) currentIndex = i
  }
  const current = ARCHETYPE_THRESHOLDS[currentIndex]
  const next = ARCHETYPE_THRESHOLDS[currentIndex + 1] // undefined if King

  if (!next) {
    return { current: current.archetype, next: null, xpIntoTier: 0, xpForTier: 0, percent: 100 }
  }
  const xpIntoTier = xp - current.minXp
  const xpForTier = next.minXp - current.minXp
  return {
    current: current.archetype,
    next: next.archetype,
    xpIntoTier,
    xpForTier,
    percent: Math.min(100, Math.round((xpIntoTier / xpForTier) * 100)),
  }
}
