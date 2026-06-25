-- King Within — Expansion 3 / Phase B: per-language (_fa) content columns.
-- Run in Supabase after the earlier db files. Safe to re-run.
-- The app shows the _fa value when locale is Persian and it exists, else falls
-- back to the English column — so nothing breaks before translations are added.

alter table levels add column if not exists title_fa text;
alter table levels add column if not exists content_body_fa text;
alter table levels add column if not exists reading_text_fa text;
alter table levels add column if not exists critical_thinking_prompt_fa text;

alter table questions add column if not exists prompt_fa text;
alter table questions add column if not exists options_fa jsonb;

alter table blog_tracks add column if not exists title_fa text;
alter table blog_tracks add column if not exists description_fa text;

alter table blog_posts add column if not exists title_fa text;
alter table blog_posts add column if not exists excerpt_fa text;
alter table blog_posts add column if not exists body_fa text;

alter table journal_questions add column if not exists prompt_fa text;
