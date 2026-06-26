-- King Within — db/10: pre-launch security hardening.
-- Fixes the issues found by scripts/security-audit.mjs:
--   1. PRIVILEGE ESCALATION — any user could UPDATE their own profiles.is_admin = true.
--   2. XP TAMPERING        — any user could UPDATE their own profiles.total_xp to anything.
--   3. BUG                 — xp_events CHECK rejected source='coach' (broke the daily quest).
--
-- After this, XP is granted ONLY by the server-side award_xp() RPC, which decides
-- the amount itself (the client can no longer choose it) and proves the action
-- really happened; and is_admin / total_xp / archetype / level can no longer be
-- written directly from the client.
-- Run in the Supabase SQL editor. Safe to re-run.

-- 1) xp_events: allow the sources the app actually uses ----------------------
alter table xp_events drop constraint if exists xp_events_source_check;
alter table xp_events add constraint xp_events_source_check
  check (source in ('course','journal','coach','bonus'));

-- 2) Archetype tier for a given XP (mirror of app/lib/archetypes.js) ---------
create or replace function public.archetype_for_xp(p_xp int)
returns text language sql immutable as $$
  select case
    when p_xp >= 1200 then 'King'
    when p_xp >=  600 then 'Magician'
    when p_xp >=  250 then 'Warrior'
    else 'Initiate'
  end
$$;

-- 3) Lock down profiles. A normal client UPDATE may never change is_admin,
--    total_xp, current_archetype or current_level. Those move only through the
--    award_xp() RPC below, which sets a transaction-local flag the trigger trusts.
create or replace function public.protect_profile_columns()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    new.is_admin := old.is_admin;  -- never client-settable
    if current_setting('app.kw_award_xp', true) is distinct from 'on' then
      new.total_xp          := old.total_xp;
      new.current_archetype := old.current_archetype;
      new.current_level     := old.current_level;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_profile on profiles;
create trigger trg_protect_profile before update on profiles
  for each row execute function public.protect_profile_columns();

-- 4) Only the RPC may write the ledger; clients lose direct insert. (select stays)
drop policy if exists "xp_events own insert" on xp_events;

-- 5) The ONLY way to earn XP. The server decides the amount per source and is
--    idempotent on (user, source, source_ref), so XP can't be farmed. ---------
create or replace function public.award_xp(
  p_source     text,
  p_source_ref text default null,
  p_amount     int  default null,   -- accepted for client compat, but IGNORED
  p_set_level  int  default null    -- accepted for client compat, but IGNORED
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid      uuid := auth.uid();
  v_amount   int  := 0;
  v_set_level int;
  v_old_arch text;
  v_new_xp   int;
  v_new_arch text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_source_ref is null or p_source_ref = '' then raise exception 'missing_source_ref'; end if;

  -- Idempotent: this exact (user, source, ref) was already rewarded.
  if exists (select 1 from xp_events
             where user_id = v_uid and source = p_source and source_ref = p_source_ref) then
    select total_xp, current_archetype into v_new_xp, v_new_arch from profiles where id = v_uid;
    return jsonb_build_object('new_xp', v_new_xp, 'archetype', v_new_arch, 'evolved', false, 'duplicate', true);
  end if;

  -- Server-authoritative amount + proof the action actually happened.
  if p_source = 'course' then
    if not exists (select 1 from user_progress
                   where user_id = v_uid and level_id = p_source_ref::int and status = 'completed') then
      raise exception 'course_not_completed';
    end if;
    select coalesce(xp_reward, 0), level_number + 1
      into v_amount, v_set_level
      from levels where level_id = p_source_ref::int;
  elsif p_source = 'journal' then
    if not exists (select 1 from journal_entries
                   where id = p_source_ref::bigint and user_id = v_uid and completed) then
      raise exception 'journal_not_completed';
    end if;
    v_amount := 10;  -- JOURNAL_XP (keep in sync with app/lib/xp.js)
  elsif p_source = 'coach' then
    if p_source_ref <> to_char(current_date, 'YYYY-MM-DD') then
      raise exception 'coach_bad_date';
    end if;
    v_amount := 5;   -- COACH_XP (keep in sync with app/lib/xp.js)
  else
    raise exception 'bad_source: %', p_source;
  end if;

  select current_archetype into v_old_arch from profiles where id = v_uid;

  insert into xp_events(user_id, source, source_ref, amount)
  values (v_uid, p_source, p_source_ref, v_amount);

  perform set_config('app.kw_award_xp', 'on', true);
  update profiles
     set total_xp          = coalesce(total_xp,0) + v_amount,
         current_archetype = public.archetype_for_xp(coalesce(total_xp,0) + v_amount),
         current_level     = coalesce(v_set_level, current_level)
   where id = v_uid
   returning total_xp, current_archetype into v_new_xp, v_new_arch;

  return jsonb_build_object(
    'new_xp', v_new_xp, 'archetype', v_new_arch,
    'evolved', (v_new_arch is distinct from v_old_arch), 'duplicate', false, 'amount', v_amount
  );
end $$;

revoke all on function public.award_xp(text,text,int,int) from public;
grant execute on function public.award_xp(text,text,int,int) to authenticated;
