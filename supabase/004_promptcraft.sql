-- 004_promptcraft.sql
-- PromptCraft: user-owned prompt history.

create extension if not exists pgcrypto;

create table if not exists public.promptcraft_history (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  topic       text        not null check (char_length(topic) between 1 and 500),
  category    text        not null default '' check (char_length(category) <= 100),
  tone        text        not null default '' check (char_length(tone) <= 100),
  platform    text        not null default '' check (char_length(platform) <= 100),
  output      text        not null check (char_length(output) between 1 and 50000),
  created_at  timestamptz not null default now()
);

create index if not exists promptcraft_history_user_id_created_at_idx
  on public.promptcraft_history (user_id, created_at desc);

alter table public.promptcraft_history enable row level security;
alter table public.promptcraft_history force row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promptcraft_history' and policyname='PromptCraft history select own') then
    create policy "PromptCraft history select own"
      on public.promptcraft_history for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promptcraft_history' and policyname='PromptCraft history insert own') then
    create policy "PromptCraft history insert own"
      on public.promptcraft_history for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='promptcraft_history' and policyname='PromptCraft history delete own') then
    create policy "PromptCraft history delete own"
      on public.promptcraft_history for delete
      using (auth.uid() = user_id);
  end if;
end $$;
