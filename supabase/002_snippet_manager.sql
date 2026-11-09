-- 002_snippet_manager.sql
-- Snippet Manager schema (idempotent / preservation-oriented).
-- IMPORTANT: public.snippets may already exist. Do not drop or rename existing tables/data.

create extension if not exists pgcrypto;

create table if not exists public.snippets (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  description text        not null default '',
  code        text        not null,
  language    text        not null,
  tags        text[]      not null default '{}',
  category    text        not null default '',
  visibility  text        not null default 'private' check (visibility in ('public', 'private')),
  versions    jsonb       not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint snippets_versions_is_array check (jsonb_typeof(versions) = 'array')
);

create index if not exists snippets_user_id_created_at_idx
  on public.snippets (user_id, created_at desc);

alter table public.snippets enable row level security;
alter table public.snippets force row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'snippets' and policyname = 'Snippets select own'
  ) then
    create policy "Snippets select own"
      on public.snippets for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'snippets' and policyname = 'Snippets insert own'
  ) then
    create policy "Snippets insert own"
      on public.snippets for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'snippets' and policyname = 'Snippets update own'
  ) then
    create policy "Snippets update own"
      on public.snippets for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'snippets' and policyname = 'Snippets delete own'
  ) then
    create policy "Snippets delete own"
      on public.snippets for delete
      using (auth.uid() = user_id);
  end if;

  -- Drop legacy policy names if they exist (keeps policy set clean on fresh applies).
  if exists (select 1 from pg_policies where schemaname='public' and tablename='snippets' and policyname='Users can select own snippets') then
    drop policy "Users can select own snippets" on public.snippets;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='snippets' and policyname='Users can insert own snippets') then
    drop policy "Users can insert own snippets" on public.snippets;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='snippets' and policyname='Users can update own snippets') then
    drop policy "Users can update own snippets" on public.snippets;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='snippets' and policyname='Users can delete own snippets') then
    drop policy "Users can delete own snippets" on public.snippets;
  end if;
end $$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists snippets_updated_at on public.snippets;
create trigger snippets_updated_at
  before update on public.snippets
  for each row
  execute function public.handle_updated_at();
