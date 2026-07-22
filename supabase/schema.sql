-- ============================================================
-- Yapped — Supabase schema
-- Run this in your Supabase project's SQL editor (one time).
--
-- Design notes (PRD §6 / §9):
--  * There is deliberately NO table or column for raw chat text.
--    The data model makes chat retention structurally impossible.
--  * RLS is enabled with NO policies => deny-all for the anon key.
--    All access goes through the Next.js server using the
--    service-role key, which bypasses RLS. The browser never
--    talks to these tables directly.
-- ============================================================

create table if not exists public.quizzes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  relationship  text not null check (relationship in ('partner', 'friend', 'family', 'group')),
  language      text not null default 'en' check (language in ('he', 'en', 'mixed')),
  status        text not null default 'preview' check (status in ('preview', 'paid')),
  share_slug    text not null unique,
  admin_token   text not null unique,
  title         text not null,
  -- generated quiz object: [{question, options[4], correctIndex, spice}]
  questions     jsonb not null,
  -- non-sensitive fun stats for the results page:
  -- {totalMessages, firstDate, lastDate, topEmojis}
  stats         jsonb not null default '{}'::jsonb,
  price_agorot  integer not null default 1900
);

create table if not exists public.players (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  quiz_id       uuid not null references public.quizzes (id) on delete cascade,
  name          text not null,
  answers       jsonb,
  score         integer,
  completed_at  timestamptz
);

create index if not exists players_quiz_id_idx on public.players (quiz_id);
create index if not exists quizzes_share_slug_idx on public.quizzes (share_slug);
create index if not exists quizzes_admin_token_idx on public.quizzes (admin_token);

-- Deny-all RLS: enabled with zero policies. The anon/public key can read
-- nothing (quiz answers stay server-side); the service-role key used by the
-- Next.js API routes bypasses RLS.
alter table public.quizzes enable row level security;
alter table public.players enable row level security;

-- ============================================================
-- Rate limiting (quiz generation spends AI budget)
-- Fixed-window counters, one row per key. Keys hold a hashed IP
-- (never the raw IP) or the literal 'quiz:global'.
-- Rows go stale after their window passes; optional cleanup:
--   delete from public.rate_limits where window_start < now() - interval '2 days';
-- ============================================================

create table if not exists public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null default now(),
  count         integer not null default 1
);

alter table public.rate_limits enable row level security;

-- Atomically bump the counter for p_key and report whether it is still within
-- p_max for the current p_window_seconds window. The single upsert makes this
-- safe under concurrent serverless invocations.
create or replace function public.bump_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_max integer
) returns boolean
language plpgsql
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when rl.window_start <= now() - make_interval(secs => p_window_seconds) then 1
          else rl.count + 1
        end,
        window_start = case
          when rl.window_start <= now() - make_interval(secs => p_window_seconds) then now()
          else rl.window_start
        end
  returning rl.count into v_count;
  return v_count <= p_max;
end;
$$;

-- Only the server (service role) may call this — otherwise anyone with the
-- anon key could spam the counters and lock quiz creation for everyone.
revoke execute on function public.bump_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.bump_rate_limit(text, integer, integer) to service_role;

-- ============================================================
-- Product analytics (server-side, privacy-first)
-- One row per interesting action. No raw IPs (hashed only), no
-- chat content, no third-party scripts. Written by the API
-- routes via lib/track.ts.
--
-- Events: quiz_created, quiz_rate_limited, quiz_unlocked,
--         quiz_viewed, player_submitted
--
-- Handy queries (SQL editor):
--   Activity by day:
--     select created_at::date as day, event, count(*)
--     from events group by 1, 2 order by 1 desc, 2;
--   Funnel, last 7 days:
--     select event, count(*) from events
--     where created_at > now() - interval '7 days' group by 1;
--   Distinct visitors, last 7 days:
--     select count(distinct ip_hash) from events
--     where created_at > now() - interval '7 days';
-- ============================================================

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event       text not null,
  quiz_id     uuid,
  ip_hash     text,
  props       jsonb not null default '{}'::jsonb
);

create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_event_idx on public.events (event, created_at);
create index if not exists events_quiz_id_idx on public.events (quiz_id);

alter table public.events enable row level security;
