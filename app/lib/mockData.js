// Mock data for the Phase 1 UI shell. Shapes mirror the planned Supabase
// schema so swapping to real queries later only touches app/lib/appData.js.
//
//   levels[]   -> the `levels` table (+ embedded `questions` for convenience)
//   profile    -> a row from `profiles`
//   progress[] -> rows from `user_progress`
//
// The content below (passages, prompts, quizzes) is the real Initiate-stage
// curriculum and will be reused verbatim for the Phase 3 SQL seed.

export const MOCK_PROFILE = {
  id: 'mock-user',
  email: 'initiate@kingwithin.app',
  current_archetype: 'Initiate',
  current_level: 3,
  total_xp: 120,
  created_at: '2026-05-01T00:00:00.000Z',
}

export const MOCK_LEVELS = [
  {
    level_id: 'init-1',
    level_number: 1,
    archetype_stage: 'Initiate',
    title: 'The Drift',
    summary: 'Most men live on autopilot. The first move is to notice.',
    xp_reward: 40,
    unlock_requirement: null,
    reading_text: `Most men do not choose their lives — they inherit them. They take the job that appeared, the habits that were easy, the opinions that surrounded them. Days blur into weeks, weeks into years, and one morning a man wakes up in a life he never actually decided on.

This is the drift. It is not dramatic. No single bad choice causes it. It is the slow accumulation of defaults — of letting the current carry you because steering takes effort.

The drift feels like comfort, but it is quietly expensive. Every year spent drifting is a year of your one life handed to momentum instead of intention. The Initiate's first task is not to fix everything. It is simply to see the drift clearly — to admit, without flinching, where you have been carried rather than where you have walked.

Awareness is not the whole journey. But nothing changes until a man can name the current he has been floating on.`,
    critical_thinking_prompt:
      'Name one area of your life (work, health, a relationship, your time) where you have been drifting rather than deciding. Be specific about how the drift started.',
    questions: [
      {
        id: 'init-1-q1',
        prompt: 'According to the reading, how does "the drift" usually begin?',
        options: [
          'Through one dramatic bad decision',
          'Through the slow accumulation of defaults and easy choices',
          'Through bad luck outside your control',
          'Through a lack of intelligence',
        ],
        correct_index: 1,
      },
      {
        id: 'init-1-q2',
        prompt: 'Why does the passage call drifting "quietly expensive"?',
        options: [
          'It costs a lot of money',
          'It trades years of your life to momentum instead of intention',
          'It makes you physically tired',
          'It damages your reputation',
        ],
        correct_index: 1,
      },
      {
        id: 'init-1-q3',
        prompt: "What is the Initiate's first task?",
        options: [
          'To fix every problem at once',
          'To find a mentor',
          'To see the drift clearly and admit where it exists',
          'To set ambitious goals',
        ],
        correct_index: 2,
      },
    ],
  },
  {
    level_id: 'init-2',
    level_number: 2,
    archetype_stage: 'Initiate',
    title: 'Radical Responsibility',
    summary: 'You may not be at fault for everything — but you are responsible for your response.',
    xp_reward: 40,
    unlock_requirement: 'init-1',
    reading_text: `There is a difference between fault and responsibility. Fault looks backward and asks, "Who caused this?" Responsibility looks forward and asks, "Who will deal with it?"

Many things in your life are not your fault. How you were raised, what was done to you, the circumstances you were born into — you did not choose these. But here is the hard truth the Initiate must accept: no matter whose fault it is, the responsibility for your life is yours alone. No one is coming to live it for you.

This is not about blame or shame. It is about power. The moment you say "this is mine to handle," you reclaim authorship. A man who blames is always waiting — for an apology, for fairness, for someone else to move first. A man who takes responsibility can act today.

Radical responsibility is the refusal to outsource your life to other people, to the past, or to luck. It is the foundation everything else is built on.`,
    critical_thinking_prompt:
      'Think of a problem in your life you have been blaming on someone or something else. Without excusing what happened, write the first action that is yours to take.',
    questions: [
      {
        id: 'init-2-q1',
        prompt: 'How does the passage distinguish fault from responsibility?',
        options: [
          'They are the same thing',
          'Fault looks backward at cause; responsibility looks forward at who will act',
          'Fault is worse than responsibility',
          'Responsibility is only about money',
        ],
        correct_index: 1,
      },
      {
        id: 'init-2-q2',
        prompt: 'According to the reading, taking responsibility is mainly about:',
        options: ['Blame', 'Shame', 'Power and authorship', 'Punishment'],
        correct_index: 2,
      },
      {
        id: 'init-2-q3',
        prompt: 'What does a man who blames always end up doing?',
        options: [
          'Acting immediately',
          'Waiting for someone else to move first',
          'Forgiving easily',
          'Succeeding faster',
        ],
        correct_index: 1,
      },
    ],
  },
  {
    level_id: 'init-3',
    level_number: 3,
    archetype_stage: 'Initiate',
    title: 'The Inner Witness',
    summary: 'You are not your thoughts. Learn to watch them.',
    xp_reward: 40,
    unlock_requirement: 'init-2',
    reading_text: `Inside every man is a constant stream of thought — judgments, fears, urges, commentary. Most men are so fused with this stream that they mistake it for themselves. When anger says "destroy this," they destroy. When fear says "hide," they hide.

But there is another part of you: the witness. The part that can notice a thought without obeying it. The instant you observe "I am feeling angry," you are no longer only the anger — you are the one watching it. That small gap is where freedom lives.

The Initiate trains this witness deliberately. Through pausing, through breath, through naming what is happening inside, he widens the gap between stimulus and response. In that gap, choice becomes possible.

A man ruled by his impulses is not free, no matter how powerful he looks. Mastery begins on the inside — with the quiet ability to see your own reactions before they see you.`,
    critical_thinking_prompt:
      'Recall a recent moment you reacted on impulse and regretted it. Replay it slowly: what was the thought or feeling, and where could the witness have created a pause?',
    questions: [
      {
        id: 'init-3-q1',
        prompt: 'What does the passage mean by "the witness"?',
        options: [
          'A person who watches you',
          'The part of you that can notice a thought without obeying it',
          'Your conscience telling you right from wrong',
          'A memory of the past',
        ],
        correct_index: 1,
      },
      {
        id: 'init-3-q2',
        prompt: 'Where does the reading say freedom lives?',
        options: [
          'In never feeling anger',
          'In the gap between stimulus and response',
          'In always acting quickly',
          'In ignoring your feelings',
        ],
        correct_index: 1,
      },
      {
        id: 'init-3-q3',
        prompt: 'A man ruled by his impulses is described as:',
        options: [
          'Free and powerful',
          'Not free, no matter how powerful he looks',
          'Wise',
          'Calm',
        ],
        correct_index: 1,
      },
    ],
  },
  {
    level_id: 'init-4',
    level_number: 4,
    archetype_stage: 'Initiate',
    title: 'Your Daily Standard',
    summary: 'Discipline is not motivation. It is a standard you keep when no one is watching.',
    xp_reward: 50,
    unlock_requirement: 'init-3',
    reading_text: `Motivation is a feeling, and feelings are weather — they come and go. A man who only acts when motivated is at the mercy of his moods. Discipline is different. Discipline is a standard you hold regardless of how you feel.

The Initiate learns to lower the drama and raise the floor. Instead of asking "Do I feel like it?", he asks "Is this the standard I keep?" The standard is not heroic. It is small, clear, and repeatable: make the bed, train the body, keep your word, do the work before the reward.

What makes a standard powerful is that it is non-negotiable. The moment you allow exceptions "just for today," the standard becomes a suggestion, and suggestions do not build men. Each time you keep the standard despite your mood, you cast a vote for the man you are becoming.

Greatness is not built in bursts of inspiration. It is built in the unglamorous repetition of a standard kept on the ordinary days.`,
    critical_thinking_prompt:
      'Define ONE small, non-negotiable daily standard you will keep regardless of mood. Make it concrete enough that you will know each night whether you kept it.',
    questions: [
      {
        id: 'init-4-q1',
        prompt: 'How does the passage describe motivation?',
        options: [
          'A reliable foundation',
          'A feeling, like weather, that comes and goes',
          'The same as discipline',
          'Something you can summon at will',
        ],
        correct_index: 1,
      },
      {
        id: 'init-4-q2',
        prompt: 'What makes a standard powerful, according to the reading?',
        options: [
          'That it is heroic and impressive',
          'That it is non-negotiable, with no "just for today" exceptions',
          'That it changes often',
          'That other people see it',
        ],
        correct_index: 1,
      },
      {
        id: 'init-4-q3',
        prompt: 'The passage says greatness is built through:',
        options: [
          'Bursts of inspiration',
          'Unglamorous repetition on ordinary days',
          'Big dramatic decisions',
          'Natural talent',
        ],
        correct_index: 1,
      },
    ],
  },
  {
    level_id: 'init-5',
    level_number: 5,
    archetype_stage: 'Initiate',
    title: 'Guard Your Morning',
    summary: 'How you start the day sets the terms for the day.',
    xp_reward: 50,
    unlock_requirement: 'init-4',
    reading_text: `The first hour of the day is a keystone — a small thing that holds the larger structure in place. Win the morning and you walk into the day already standing. Lose it, and you spend the rest of the day trying to catch up to yourself.

Most men hand their mornings away before they are even awake. The phone is the first thing they touch, and within minutes their attention is scattered across other people's opinions, demands, and noise. They begin the day reacting instead of leading.

The Initiate guards the morning. He claims the first block of time for himself — to move his body, to set his intention, to do one important thing before the world starts asking for him. It does not need to be long. It needs to be his.

A morning on purpose is a quiet declaration: I lead my day; my day does not lead me. That single habit ripples outward into everything else.`,
    critical_thinking_prompt:
      'Describe your current first 30 minutes after waking. Then design the morning you would keep if you were leading your day on purpose.',
    questions: [
      {
        id: 'init-5-q1',
        prompt: 'Why does the passage call the first hour a "keystone"?',
        options: [
          'It is the hardest hour',
          'It is a small thing that holds the larger structure of the day in place',
          'It is when you have the most energy',
          'It is the only hour that matters',
        ],
        correct_index: 1,
      },
      {
        id: 'init-5-q2',
        prompt: 'What do most men do that hands their morning away?',
        options: [
          'Sleep too long',
          'Reach for the phone first and scatter their attention',
          'Eat breakfast',
          'Exercise too hard',
        ],
        correct_index: 1,
      },
      {
        id: 'init-5-q3',
        prompt: 'A morning on purpose is described as a declaration that:',
        options: [
          'You are better than others',
          'You lead your day; your day does not lead you',
          'You need more sleep',
          'Mornings do not matter',
        ],
        correct_index: 1,
      },
    ],
  },
  {
    level_id: 'init-6',
    level_number: 6,
    archetype_stage: 'Initiate',
    title: 'Facing the Mirror',
    summary: 'An honest self-assessment is the gate to the Warrior.',
    xp_reward: 60,
    unlock_requirement: 'init-5',
    reading_text: `Every man carries a story about himself, and most of these stories are gently edited. We round our efforts up and our failures down. We compare our intentions to other men's actions. This flattery feels kind, but it keeps us asleep.

The final task of the Initiate is to face the mirror without the edits. To ask, honestly: Where am I lying to myself? Where do my words and my actions disagree? What would the man I respect most say if he watched my last week on film?

This is not an exercise in self-attack. Shame makes men hide; honesty makes them grow. The goal is clear sight, not cruelty — to see exactly where you stand so you can choose your next step from reality instead of fantasy.

A man who can look at himself plainly has earned something rare. He no longer needs to defend an image. From that honest ground, the Warrior can finally be summoned — because you cannot build on a foundation you refuse to inspect.`,
    critical_thinking_prompt:
      'Where do your words and your actions currently disagree? Name one specific gap between who you say you are and how you actually behaved this week.',
    questions: [
      {
        id: 'init-6-q1',
        prompt: 'How does the passage say most men edit their self-story?',
        options: [
          'They round efforts up and failures down',
          'They are brutally honest',
          'They forget everything',
          'They focus only on failures',
        ],
        correct_index: 0,
      },
      {
        id: 'init-6-q2',
        prompt: 'What is the difference between shame and honesty, per the reading?',
        options: [
          'They are the same',
          'Shame makes men hide; honesty makes them grow',
          'Honesty is cruel; shame is kind',
          'Neither matters',
        ],
        correct_index: 1,
      },
      {
        id: 'init-6-q3',
        prompt: 'Why must a man inspect his foundation honestly?',
        options: [
          'To impress others',
          'Because you cannot build on a foundation you refuse to inspect',
          'To feel ashamed',
          'It is not actually necessary',
        ],
        correct_index: 1,
      },
    ],
  },
]

// A couple of completed levels so the path shows real states in the shell.
export const MOCK_PROGRESS = [
  { level_id: 'init-1', status: 'completed', quiz_score: 3, quiz_total: 3 },
  { level_id: 'init-2', status: 'completed', quiz_score: 2, quiz_total: 3 },
]
