-- King Within — Phase 3 content: the full Initiate archetype (6 courses).
-- Run AFTER 01_schema.sql, in the Supabase SQL Editor.
-- Re-runnable: it clears existing Initiate content first.
--
-- NOTE: this seeds explicit level_id values 1..6. If your `levels.level_id` is
-- defined as "generated ALWAYS as identity", the INSERT will error — tell me and
-- I'll add `overriding system value`. Plain integer / "by default as identity"
-- columns work as-is.

begin;

-- Full curriculum reset so this script is re-runnable and the level ids are
-- predictable (1..6). This wipes ALL existing levels/questions and the progress
-- that points at them — fine at this stage where the only content is Initiate.
-- First null the self-referencing unlock chain so the delete doesn't violate
-- levels_unlock_requirement_fkey.
update levels set unlock_requirement = null;
delete from user_progress;
delete from questions;
delete from levels;

-- ---------------------------------------------------------------------------
-- Levels
-- ---------------------------------------------------------------------------
insert into levels (level_id, level_number, archetype_stage, title, content_body, xp_reward, reading_text, critical_thinking_prompt) values
(1, 1, 'Initiate', 'The Drift',
 $kw$Most men live on autopilot. The first move is to notice.$kw$, 40,
 $kw$Most men do not choose their lives — they inherit them. They take the job that appeared, the habits that were easy, the opinions that surrounded them. Days blur into weeks, weeks into years, and one morning a man wakes up in a life he never actually decided on.

This is the drift. It is not dramatic. No single bad choice causes it. It is the slow accumulation of defaults — of letting the current carry you because steering takes effort.

The drift feels like comfort, but it is quietly expensive. Every year spent drifting is a year of your one life handed to momentum instead of intention. The Initiate's first task is not to fix everything. It is simply to see the drift clearly — to admit, without flinching, where you have been carried rather than where you have walked.

Awareness is not the whole journey. But nothing changes until a man can name the current he has been floating on.$kw$,
 $kw$Name one area of your life (work, health, a relationship, your time) where you have been drifting rather than deciding. Be specific about how the drift started.$kw$),

(2, 2, 'Initiate', 'Radical Responsibility',
 $kw$You may not be at fault for everything — but you are responsible for your response.$kw$, 40,
 $kw$There is a difference between fault and responsibility. Fault looks backward and asks, "Who caused this?" Responsibility looks forward and asks, "Who will deal with it?"

Many things in your life are not your fault. How you were raised, what was done to you, the circumstances you were born into — you did not choose these. But here is the hard truth the Initiate must accept: no matter whose fault it is, the responsibility for your life is yours alone. No one is coming to live it for you.

This is not about blame or shame. It is about power. The moment you say "this is mine to handle," you reclaim authorship. A man who blames is always waiting — for an apology, for fairness, for someone else to move first. A man who takes responsibility can act today.

Radical responsibility is the refusal to outsource your life to other people, to the past, or to luck. It is the foundation everything else is built on.$kw$,
 $kw$Think of a problem in your life you have been blaming on someone or something else. Without excusing what happened, write the first action that is yours to take.$kw$),

(3, 3, 'Initiate', 'The Inner Witness',
 $kw$You are not your thoughts. Learn to watch them.$kw$, 40,
 $kw$Inside every man is a constant stream of thought — judgments, fears, urges, commentary. Most men are so fused with this stream that they mistake it for themselves. When anger says "destroy this," they destroy. When fear says "hide," they hide.

But there is another part of you: the witness. The part that can notice a thought without obeying it. The instant you observe "I am feeling angry," you are no longer only the anger — you are the one watching it. That small gap is where freedom lives.

The Initiate trains this witness deliberately. Through pausing, through breath, through naming what is happening inside, he widens the gap between stimulus and response. In that gap, choice becomes possible.

A man ruled by his impulses is not free, no matter how powerful he looks. Mastery begins on the inside — with the quiet ability to see your own reactions before they see you.$kw$,
 $kw$Recall a recent moment you reacted on impulse and regretted it. Replay it slowly: what was the thought or feeling, and where could the witness have created a pause?$kw$),

(4, 4, 'Initiate', 'Your Daily Standard',
 $kw$Discipline is not motivation. It is a standard you keep when no one is watching.$kw$, 50,
 $kw$Motivation is a feeling, and feelings are weather — they come and go. A man who only acts when motivated is at the mercy of his moods. Discipline is different. Discipline is a standard you hold regardless of how you feel.

The Initiate learns to lower the drama and raise the floor. Instead of asking "Do I feel like it?", he asks "Is this the standard I keep?" The standard is not heroic. It is small, clear, and repeatable: make the bed, train the body, keep your word, do the work before the reward.

What makes a standard powerful is that it is non-negotiable. The moment you allow exceptions "just for today," the standard becomes a suggestion, and suggestions do not build men. Each time you keep the standard despite your mood, you cast a vote for the man you are becoming.

Greatness is not built in bursts of inspiration. It is built in the unglamorous repetition of a standard kept on the ordinary days.$kw$,
 $kw$Define ONE small, non-negotiable daily standard you will keep regardless of mood. Make it concrete enough that you will know each night whether you kept it.$kw$),

(5, 5, 'Initiate', 'Guard Your Morning',
 $kw$How you start the day sets the terms for the day.$kw$, 50,
 $kw$The first hour of the day is a keystone — a small thing that holds the larger structure in place. Win the morning and you walk into the day already standing. Lose it, and you spend the rest of the day trying to catch up to yourself.

Most men hand their mornings away before they are even awake. The phone is the first thing they touch, and within minutes their attention is scattered across other people's opinions, demands, and noise. They begin the day reacting instead of leading.

The Initiate guards the morning. He claims the first block of time for himself — to move his body, to set his intention, to do one important thing before the world starts asking for him. It does not need to be long. It needs to be his.

A morning on purpose is a quiet declaration: I lead my day; my day does not lead me. That single habit ripples outward into everything else.$kw$,
 $kw$Describe your current first 30 minutes after waking. Then design the morning you would keep if you were leading your day on purpose.$kw$),

(6, 6, 'Initiate', 'Facing the Mirror',
 $kw$An honest self-assessment is the gate to the Warrior.$kw$, 60,
 $kw$Every man carries a story about himself, and most of these stories are gently edited. We round our efforts up and our failures down. We compare our intentions to other men's actions. This flattery feels kind, but it keeps us asleep.

The final task of the Initiate is to face the mirror without the edits. To ask, honestly: Where am I lying to myself? Where do my words and my actions disagree? What would the man I respect most say if he watched my last week on film?

This is not an exercise in self-attack. Shame makes men hide; honesty makes them grow. The goal is clear sight, not cruelty — to see exactly where you stand so you can choose your next step from reality instead of fantasy.

A man who can look at himself plainly has earned something rare. He no longer needs to defend an image. From that honest ground, the Warrior can finally be summoned — because you cannot build on a foundation you refuse to inspect.$kw$,
 $kw$Where do your words and your actions currently disagree? Name one specific gap between who you say you are and how you actually behaved this week.$kw$);

-- ---------------------------------------------------------------------------
-- Unlock chain: each Initiate level requires the previous one (level 1 is open)
-- ---------------------------------------------------------------------------
update levels l
set unlock_requirement = prev.level_id
from levels prev
where l.archetype_stage = 'Initiate'
  and prev.archetype_stage = 'Initiate'
  and prev.level_number = l.level_number - 1;

-- ---------------------------------------------------------------------------
-- Quiz questions (correct_index is 0-based)
-- ---------------------------------------------------------------------------
insert into questions (level_id, prompt, options, correct_index, sort_order) values
-- Level 1: The Drift
(1, $kw$According to the reading, how does "the drift" usually begin?$kw$,
 jsonb_build_array($kw$Through one dramatic bad decision$kw$, $kw$Through the slow accumulation of defaults and easy choices$kw$, $kw$Through bad luck outside your control$kw$, $kw$Through a lack of intelligence$kw$), 1, 1),
(1, $kw$Why does the passage call drifting "quietly expensive"?$kw$,
 jsonb_build_array($kw$It costs a lot of money$kw$, $kw$It trades years of your life to momentum instead of intention$kw$, $kw$It makes you physically tired$kw$, $kw$It damages your reputation$kw$), 1, 2),
(1, $kw$What is the Initiate's first task?$kw$,
 jsonb_build_array($kw$To fix every problem at once$kw$, $kw$To find a mentor$kw$, $kw$To see the drift clearly and admit where it exists$kw$, $kw$To set ambitious goals$kw$), 2, 3),

-- Level 2: Radical Responsibility
(2, $kw$How does the passage distinguish fault from responsibility?$kw$,
 jsonb_build_array($kw$They are the same thing$kw$, $kw$Fault looks backward at cause; responsibility looks forward at who will act$kw$, $kw$Fault is worse than responsibility$kw$, $kw$Responsibility is only about money$kw$), 1, 1),
(2, $kw$According to the reading, taking responsibility is mainly about:$kw$,
 jsonb_build_array($kw$Blame$kw$, $kw$Shame$kw$, $kw$Power and authorship$kw$, $kw$Punishment$kw$), 2, 2),
(2, $kw$What does a man who blames always end up doing?$kw$,
 jsonb_build_array($kw$Acting immediately$kw$, $kw$Waiting for someone else to move first$kw$, $kw$Forgiving easily$kw$, $kw$Succeeding faster$kw$), 1, 3),

-- Level 3: The Inner Witness
(3, $kw$What does the passage mean by "the witness"?$kw$,
 jsonb_build_array($kw$A person who watches you$kw$, $kw$The part of you that can notice a thought without obeying it$kw$, $kw$Your conscience telling you right from wrong$kw$, $kw$A memory of the past$kw$), 1, 1),
(3, $kw$Where does the reading say freedom lives?$kw$,
 jsonb_build_array($kw$In never feeling anger$kw$, $kw$In the gap between stimulus and response$kw$, $kw$In always acting quickly$kw$, $kw$In ignoring your feelings$kw$), 1, 2),
(3, $kw$A man ruled by his impulses is described as:$kw$,
 jsonb_build_array($kw$Free and powerful$kw$, $kw$Not free, no matter how powerful he looks$kw$, $kw$Wise$kw$, $kw$Calm$kw$), 1, 3),

-- Level 4: Your Daily Standard
(4, $kw$How does the passage describe motivation?$kw$,
 jsonb_build_array($kw$A reliable foundation$kw$, $kw$A feeling, like weather, that comes and goes$kw$, $kw$The same as discipline$kw$, $kw$Something you can summon at will$kw$), 1, 1),
(4, $kw$What makes a standard powerful, according to the reading?$kw$,
 jsonb_build_array($kw$That it is heroic and impressive$kw$, $kw$That it is non-negotiable, with no "just for today" exceptions$kw$, $kw$That it changes often$kw$, $kw$That other people see it$kw$), 1, 2),
(4, $kw$The passage says greatness is built through:$kw$,
 jsonb_build_array($kw$Bursts of inspiration$kw$, $kw$Unglamorous repetition on ordinary days$kw$, $kw$Big dramatic decisions$kw$, $kw$Natural talent$kw$), 1, 3),

-- Level 5: Guard Your Morning
(5, $kw$Why does the passage call the first hour a "keystone"?$kw$,
 jsonb_build_array($kw$It is the hardest hour$kw$, $kw$It is a small thing that holds the larger structure of the day in place$kw$, $kw$It is when you have the most energy$kw$, $kw$It is the only hour that matters$kw$), 1, 1),
(5, $kw$What do most men do that hands their morning away?$kw$,
 jsonb_build_array($kw$Sleep too long$kw$, $kw$Reach for the phone first and scatter their attention$kw$, $kw$Eat breakfast$kw$, $kw$Exercise too hard$kw$), 1, 2),
(5, $kw$A morning on purpose is described as a declaration that:$kw$,
 jsonb_build_array($kw$You are better than others$kw$, $kw$You lead your day; your day does not lead you$kw$, $kw$You need more sleep$kw$, $kw$Mornings do not matter$kw$), 1, 3),

-- Level 6: Facing the Mirror
(6, $kw$How does the passage say most men edit their self-story?$kw$,
 jsonb_build_array($kw$They round efforts up and failures down$kw$, $kw$They are brutally honest$kw$, $kw$They forget everything$kw$, $kw$They focus only on failures$kw$), 0, 1),
(6, $kw$What is the difference between shame and honesty, per the reading?$kw$,
 jsonb_build_array($kw$They are the same$kw$, $kw$Shame makes men hide; honesty makes them grow$kw$, $kw$Honesty is cruel; shame is kind$kw$, $kw$Neither matters$kw$), 1, 2),
(6, $kw$Why must a man inspect his foundation honestly?$kw$,
 jsonb_build_array($kw$To impress others$kw$, $kw$Because you cannot build on a foundation you refuse to inspect$kw$, $kw$To feel ashamed$kw$, $kw$It is not actually necessary$kw$), 1, 3);

-- Keep any identity sequence ahead of our explicit ids so future auto-inserts
-- don't collide with 1..6.
do $$
declare seqname text;
begin
  seqname := pg_get_serial_sequence('levels', 'level_id');
  if seqname is not null then
    perform setval(seqname, (select coalesce(max(level_id), 1) from levels));
  end if;
end $$;

commit;
