-- King Within — db/12: Pro plan flag + first-time archetype evaluation result.
-- Run in the Supabase SQL editor. Safe to re-run.

alter table profiles add column if not exists is_pro       boolean not null default false;
alter table profiles add column if not exists eval_archetype text;     -- result of the first-time quiz
alter table profiles add column if not exists evaluated_at timestamptz; -- set on complete OR skip

-- Re-define the profiles column guard from db/10 to ALSO pin is_pro, so a user
-- can't flip their own profiles.is_pro=true to get Pro for free. (eval_archetype
-- / evaluated_at stay client-writable — the user records their own quiz result.)
-- Pro is granted server-side / by an admin (and by the payment flow, later).
create or replace function public.protect_profile_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    new.is_admin := old.is_admin;  -- never client-settable
    new.is_pro   := old.is_pro;    -- never client-settable
    if current_setting('app.kw_award_xp', true) is distinct from 'on' then
      new.total_xp          := old.total_xp;
      new.current_archetype := old.current_archetype;
      new.current_level     := old.current_level;
    end if;
  end if;
  return new;
end $$;

-- Grant yourself / a beta tester Pro for testing (replace the email):
-- update profiles set is_pro = true where email = 'you@example.com';
