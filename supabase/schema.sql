create extension if not exists pgcrypto;

-- Shared updated_at helper (snippets + tool_documents)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- snippets
-- -----------------------------------------------------------------------------
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

drop trigger if exists snippets_updated_at on public.snippets;
create trigger snippets_updated_at
  before update on public.snippets
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- mockify_generations (image bytes stay client-side / remote URL only)
-- -----------------------------------------------------------------------------
create table if not exists public.mockify_generations (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  prompt      text        not null check (char_length(prompt) between 1 and 4000),
  model       text        not null default 'auto' check (char_length(model) <= 100),
  size        text        not null default 'square' check (char_length(size) <= 50),
  image_url   text        check (image_url is null or char_length(image_url) <= 2048),
  created_at  timestamptz not null default now()
);

create index if not exists mockify_generations_user_id_created_at_idx
  on public.mockify_generations (user_id, created_at desc);

alter table public.mockify_generations enable row level security;
alter table public.mockify_generations force row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mockify_generations' and policyname='Mockify generations select own') then
    create policy "Mockify generations select own"
      on public.mockify_generations for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mockify_generations' and policyname='Mockify generations insert own') then
    create policy "Mockify generations insert own"
      on public.mockify_generations for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mockify_generations' and policyname='Mockify generations delete own') then
    create policy "Mockify generations delete own"
      on public.mockify_generations for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- promptcraft_history
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- tool_documents (generic JSON store; reserved for future Chat sync)
-- -----------------------------------------------------------------------------
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

drop trigger if exists tool_documents_updated_at on public.tool_documents;
create trigger tool_documents_updated_at
  before update on public.tool_documents
  for each row
  execute function public.handle_updated_at();
