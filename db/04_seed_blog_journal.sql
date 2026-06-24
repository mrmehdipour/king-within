-- King Within — Expansion 2 seed: starter blog (track + posts) and journal bank.
-- Run after 03_cms_schema.sql. Re-runnable (clears the seeded slugs first).

begin;

-- ---- Blog ----------------------------------------------------------------
delete from blog_posts where slug in ('king-within-roadmap', 'why-most-men-drift', 'the-daily-standard');
delete from blog_tracks where slug = 'foundations';

insert into blog_tracks (slug, title, description, sort_order, published) values
('foundations', 'Foundations', 'Start here. The core ideas every man needs before the work begins.', 1, true);

-- Two essays form the "Foundations" reading roadmap (numbered, connected).
insert into blog_posts (slug, track_id, order_in_track, title, excerpt, category, reading_minutes, published, published_at, body) values
('why-most-men-drift',
 (select id from blog_tracks where slug='foundations'), 1,
 'Why Most Men Drift',
 'Drift is rarely caused by one bad decision. It is the slow cost of letting the current carry you.',
 'Initiate', 3, true, '2026-06-18',
 $md$Most men do not choose their lives — they inherit them. They take the job that appeared, the habits that were easy, the opinions that surrounded them. Days blur into weeks, weeks into years.

This is the drift. It is not dramatic. No single bad choice causes it. It is the slow accumulation of defaults — of letting the current carry you because steering takes effort.

> Every year spent drifting is a year of your one life handed to momentum instead of intention.

The first move is not to fix everything. It is to see the drift clearly — to admit, without flinching, where you have been carried rather than where you have walked. Nothing changes until a man can name the current he has been floating on.$md$),

('the-daily-standard',
 (select id from blog_tracks where slug='foundations'), 2,
 'Discipline Is a Standard, Not a Feeling',
 'Motivation is weather. A standard is something you keep regardless of how you feel.',
 'Discipline', 3, true, '2026-06-10',
 $md$Motivation is a feeling, and feelings are weather — they come and go. A man who only acts when motivated is at the mercy of his moods.

Discipline is different. Discipline is a standard you hold regardless of how you feel. The move is to lower the drama and raise the floor: instead of asking "Do I feel like it?", ask "Is this the standard I keep?"

> Each time you keep the standard despite your mood, you cast a vote for the man you are becoming.

Greatness is not built in bursts of inspiration. It is built in the unglamorous repetition of a standard kept on the ordinary days.$md$);

-- The roadmap post is meta/announcement: standalone (no track), featured.
insert into blog_posts (slug, track_id, order_in_track, title, excerpt, category, reading_minutes, published, published_at, body) values
('king-within-roadmap', null, 0,
 'The King Within Roadmap',
 'Where King Within is today, and exactly what we are building next — from the learning path to a full Android app.',
 'Product', 4, true, '2026-06-24',
 $md$King Within is a path, not a course. The aim is simple and serious: take a man from drifting through life to leading it on purpose, one deliberate step at a time. This post lays out where the product stands today and where it is going — a public roadmap you can hold us to.

## The vision

Growth should feel like a game you actually want to play. So King Within borrows the best of that world — a visible path, clear next steps, real progress — and points it at something that matters: becoming the Initiate, then the Warrior, then the Magician, and finally the King within you.

> Most men drift. Few ever decide to lead themselves. The whole product exists to make that decision easier to keep.

## Where we are now

The core experience is built: a winding learning map of connected steps, and a course player where every step is taught through three activities — Reading Comprehension, Critical Thinking, and a Quiz drawn from what you just read.

## What we are building next

- Real accounts and saved progress across devices.
- The full Initiate curriculum, start to finish.
- A daily journal that gives you one prompt a day.
- A richer profile and live analytics — streaks, quiz accuracy, archetype progress.
- The Warrior, Magician, and King stages.
- A native Android app alongside the web.

We will keep this page honest as things ship. If you are reading this early — welcome. You are at the start of the path.$md$);

-- ---- Journal question bank (starter set) ---------------------------------
delete from journal_questions where category = 'starter';
insert into journal_questions (prompt, category, sort_order, published) values
('What is one thing you have been avoiding, and what is it costing you?', 'starter', 1, true),
('Where in your life are you drifting rather than deciding?', 'starter', 2, true),
('What would the man you respect most do in your current situation?', 'starter', 3, true),
('What did you do today that your future self will thank you for?', 'starter', 4, true),
('What standard did you keep today, even though you did not feel like it?', 'starter', 5, true),
('Who do you need to forgive — including yourself — to move forward?', 'starter', 6, true),
('What is one truth about yourself you have been refusing to face?', 'starter', 7, true),
('If fear were not a factor, what would you do this week?', 'starter', 8, true),
('What are you grateful for right now that you usually overlook?', 'starter', 9, true),
('Where did your words and your actions disagree this week?', 'starter', 10, true),
('What is the smallest next step toward the thing you keep postponing?', 'starter', 11, true),
('What drained your energy today, and what gave it back?', 'starter', 12, true),
('What would you attempt if you knew you could not fail?', 'starter', 13, true),
('Who in your life deserves more of your attention?', 'starter', 14, true),
('What does "a good day" actually look like for you?', 'starter', 15, true),
('What habit, repeated for a year, would change your life most?', 'starter', 16, true),
('What are you pretending not to know?', 'starter', 17, true),
('When did you last feel fully alive, and why?', 'starter', 18, true),
('What is one boundary you need to set, and with whom?', 'starter', 19, true),
('If today were repeated for 30 days, where would it take you?', 'starter', 20, true);

commit;
