// Mock blog content. Server-rendered for SEO. Body is an array of simple blocks
// the post renderer understands: { type: 'p' | 'h2' | 'quote' | 'list', ... }.
//
// Phase 2+ can swap this for a `posts` table or a CMS without touching the
// blog page components — they only read from getAllPosts() / getPost().

export const POSTS = [
  {
    slug: 'king-within-roadmap',
    title: 'The King Within Roadmap',
    excerpt:
      'Where King Within is today, and exactly what we are building next — from the learning path to a full Android app.',
    category: 'Product',
    date: '2026-06-24',
    readingMinutes: 4,
    featured: true,
    body: [
      { type: 'p', text: 'King Within is a path, not a course. The aim is simple and serious: take a man from drifting through life to leading it on purpose, one deliberate step at a time. This post lays out where the product stands today and where it is going — a public roadmap you can hold us to.' },
      { type: 'h2', text: 'The vision' },
      { type: 'p', text: 'Growth should feel like a game you actually want to play. So King Within borrows the best of that world — a visible path, clear next steps, real progress — and points it at something that matters: becoming the Initiate, then the Warrior, then the Magician, and finally the King within you.' },
      { type: 'quote', text: 'Most men drift. Few ever decide to lead themselves. The whole product exists to make that decision easier to keep.' },
      { type: 'h2', text: 'Where we are now' },
      { type: 'p', text: 'The core experience is built: a winding learning map of connected steps, and a course player where every step is taught through three activities — Reading Comprehension, Critical Thinking, and a Quiz drawn from what you just read. Finish a step to unlock the next.' },
      { type: 'h2', text: 'What we are building next' },
      { type: 'list', items: [
        'Real accounts and saved progress — your XP, archetype, and completed steps follow you across devices.',
        'The full Initiate curriculum — the complete first stage, start to finish.',
        'A richer profile and analytics view — streaks, quiz accuracy, and your archetype progression at a glance.',
        'The Warrior, Magician, and King stages — the rest of the path.',
        'A native Android app — the same experience, installable from your phone, alongside the web.',
      ] },
      { type: 'h2', text: 'The four archetypes' },
      { type: 'p', text: 'Initiate is about seeing clearly — ending the drift and taking responsibility. Warrior is about holding the line under discomfort. Magician is about shaping your world with skill and strategy. King is about leading yourself, and others, from a settled center. Each stage unlocks as you earn it.' },
      { type: 'p', text: 'We will keep this page honest as things ship. If you are reading this early — welcome. You are at the start of the path.' },
    ],
  },
  {
    slug: 'why-most-men-drift',
    title: 'Why Most Men Drift',
    excerpt:
      'Drift is rarely caused by one bad decision. It is the slow cost of letting the current carry you.',
    category: 'Initiate',
    date: '2026-06-18',
    readingMinutes: 3,
    featured: false,
    body: [
      { type: 'p', text: 'Most men do not choose their lives — they inherit them. They take the job that appeared, the habits that were easy, the opinions that surrounded them. Days blur into weeks, weeks into years.' },
      { type: 'p', text: 'This is the drift. It is not dramatic. No single bad choice causes it. It is the slow accumulation of defaults — of letting the current carry you because steering takes effort.' },
      { type: 'quote', text: 'Every year spent drifting is a year of your one life handed to momentum instead of intention.' },
      { type: 'p', text: 'The first move is not to fix everything. It is to see the drift clearly — to admit, without flinching, where you have been carried rather than where you have walked. Nothing changes until a man can name the current he has been floating on.' },
    ],
  },
  {
    slug: 'the-daily-standard',
    title: 'Discipline Is a Standard, Not a Feeling',
    excerpt:
      'Motivation is weather. A standard is something you keep regardless of how you feel.',
    category: 'Discipline',
    date: '2026-06-10',
    readingMinutes: 3,
    featured: false,
    body: [
      { type: 'p', text: 'Motivation is a feeling, and feelings are weather — they come and go. A man who only acts when motivated is at the mercy of his moods.' },
      { type: 'p', text: 'Discipline is different. Discipline is a standard you hold regardless of how you feel. The move is to lower the drama and raise the floor: instead of asking "Do I feel like it?", ask "Is this the standard I keep?"' },
      { type: 'quote', text: 'Each time you keep the standard despite your mood, you cast a vote for the man you are becoming.' },
      { type: 'p', text: 'Greatness is not built in bursts of inspiration. It is built in the unglamorous repetition of a standard kept on the ordinary days.' },
    ],
  },
]

export function getAllPosts() {
  // Newest first.
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null
}
