-- ============================================================================
-- King Within — beta analytics (READ-ONLY). Phase 1 of instrumentation.
-- Run any block in the Supabase SQL editor. No schema changes; nothing is written.
--
-- Definitions used throughout:
--   signup time  = auth.users.created_at
--   "active day" = a day the user completed a course (xp_events.source='course'),
--                  earned any XP, OR completed a journal entry.
--   Beta success metric (OEC) = W2 retention (active in days 8-14 after signup).
--   Leading indicator         = activation (first course completed within 48h).
--
-- Cohort note: retention is only measured for users who signed up long enough
-- ago to have had the chance (e.g. W2 needs signup >= 14 days ago). Early in the
-- beta those cohorts may be tiny — that's expected; watch them fill over 2 weeks.
-- ============================================================================


-- 1) HEADLINE FUNNEL — how far users get -------------------------------------
with s as (select id as user_id from auth.users)
select
  (select count(*) from s)                                                  as signups,
  (select count(distinct user_id) from xp_events where source = 'course')   as completed_a_course,
  (select count(distinct user_id) from journal_entries where completed)     as journaled,
  (select count(distinct user_id) from lion_insights)                       as used_lion,
  (select count(distinct user_id) from lion_messages)                       as chatted_with_lion;


-- 2) ACTIVATION — % who finished their FIRST course within 48h of signup -----
with signups as (select id as user_id, created_at from auth.users),
first_course as (
  select user_id, min(created_at) as first_course_at
  from xp_events where source = 'course' group by user_id
)
select
  count(*)                                                                              as total_users,
  count(fc.user_id)                                                                     as ever_completed_course,
  count(*) filter (where fc.first_course_at <= s.created_at + interval '48 hours')      as activated_48h,
  round(100.0 * count(*) filter (where fc.first_course_at <= s.created_at + interval '48 hours')
        / nullif(count(*), 0), 1)                                                       as activation_pct
from signups s
left join first_course fc on fc.user_id = s.user_id;


-- 3) RETENTION — D1 / D7 / W2 (the OEC). Divide retained by cohort for the % --
with signups as (select id as user_id, created_at::date as signup_day from auth.users),
activity as (
  select user_id, created_at::date as day from xp_events
  union
  select user_id, entry_date      as day from journal_entries where completed
)
select
  count(*) filter (where signup_day <= current_date - 1)  as d1_cohort,
  count(*) filter (where signup_day <= current_date - 1
    and exists (select 1 from activity a where a.user_id = s.user_id and a.day = s.signup_day + 1)) as d1_retained,

  count(*) filter (where signup_day <= current_date - 7)  as d7_cohort,
  count(*) filter (where signup_day <= current_date - 7
    and exists (select 1 from activity a where a.user_id = s.user_id and a.day = s.signup_day + 7)) as d7_retained,

  count(*) filter (where signup_day <= current_date - 14) as w2_cohort,
  count(*) filter (where signup_day <= current_date - 14
    and exists (select 1 from activity a where a.user_id = s.user_id
                and a.day between s.signup_day + 8 and s.signup_day + 14)) as w2_retained
from signups s;
-- Read: w2_retention_pct = 100 * w2_retained / w2_cohort. Healthy beta target: 30%+.


-- 4) DAU — distinct active users per day, last 14 days ------------------------
select day, count(distinct user_id) as dau
from (
  select user_id, created_at::date as day from xp_events
  union
  select user_id, entry_date      as day from journal_entries where completed
) act
where day >= current_date - 14
group by day
order by day;


-- 5) ENGAGEMENT DEPTH — courses completed per user (distribution) ------------
select courses_completed, count(*) as users
from (
  select user_id, count(*) as courses_completed
  from xp_events where source = 'course' group by user_id
) t
group by courses_completed
order by courses_completed;


-- 6) JOURNAL STREAK — consecutive-day engagement (top journalers) ------------
select user_id, count(*) as days_journaled, min(entry_date) as first, max(entry_date) as last
from journal_entries where completed
group by user_id
order by days_journaled desc
limit 25;


-- 7) NEW SIGNUPS PER DAY — acquisition pulse (your real n=100 risk) ----------
select created_at::date as day, count(*) as new_signups
from auth.users
where created_at >= current_date - 14
group by day
order by day;
