-- Minimalist Toolkit: shared user-owned document store.
-- Used by the Quotes tool and the Prioritizer tool.
--
-- One generic table keeps migrations small: each row is a user-owned JSON
-- document tagged with the tool that owns it. Row level security guarantees
-- that a user can only ever read and write their own documents.

create extension if not exists pgcrypto;

create table if not exists public.tool_documents (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  tool        text        not null check (char_length(tool) between 1 and 50),
  title       text        not null default '' check (char_length(title) <= 300),
  data        jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint tool_documents_data_is_object check (jsonb_typeof(data) = 'object')
);

create index if not exists tool_documents_user_id_tool_updated_at_idx
  on public.tool_documents (user_id, tool, updated_at desc);

alter table public.tool_documents enable row level security;
alter table public.tool_documents force row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tool_documents'
      and policyname = 'Tool documents select own'
  ) then
    create policy "Tool documents select own"
      on public.tool_documents for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tool_documents'
      and policyname = 'Tool documents insert own'
  ) then
    create policy "Tool documents insert own"
      on public.tool_documents for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tool_documents'
      and policyname = 'Tool documents update own'
  ) then
    create policy "Tool documents update own"
      on public.tool_documents for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tool_documents'
      and policyname = 'Tool documents delete own'
  ) then
    create policy "Tool documents delete own"
      on public.tool_documents for delete
      using (auth.uid() = user_id);
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

drop trigger if exists tool_documents_updated_at on public.tool_documents;
create trigger tool_documents_updated_at
  before update on public.tool_documents
  for each row
  execute function public.handle_updated_at();
