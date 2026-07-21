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
