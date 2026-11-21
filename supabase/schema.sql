create extension if not exists pgcrypto;

-- Shared updated_at helper (snippets + tool_documents)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
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

-- -----------------------------------------------------------------------------
-- playground_runs (AI Playground comparisons, private to the owner)
-- -----------------------------------------------------------------------------
create table if not exists public.playground_runs (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users(id) on delete cascade,
  left_provider      text        not null check (char_length(left_provider) between 1 and 40),
  left_model         text        not null check (char_length(left_model) between 1 and 200),
  right_provider     text        not null check (char_length(right_provider) between 1 and 40),
  right_model        text        not null check (char_length(right_model) between 1 and 200),
  left_prompt        text        not null check (char_length(left_prompt) between 1 and 8000),
  right_prompt       text        not null check (char_length(right_prompt) between 1 and 8000),
  left_output        text,
  right_output       text,
  left_error         text,
  right_error        text,
  left_latency_ms    integer     check (left_latency_ms is null or left_latency_ms >= 0),
  right_latency_ms   integer     check (right_latency_ms is null or right_latency_ms >= 0),
  left_total_tokens  integer     check (left_total_tokens is null or left_total_tokens >= 0),
  right_total_tokens integer     check (right_total_tokens is null or right_total_tokens >= 0),
  left_cost_usd      numeric(14, 8) check (left_cost_usd is null or left_cost_usd >= 0),
  right_cost_usd     numeric(14, 8) check (right_cost_usd is null or right_cost_usd >= 0),
  created_at         timestamptz not null default now()
);

create index if not exists playground_runs_user_id_created_at_idx
  on public.playground_runs (user_id, created_at desc);

alter table public.playground_runs enable row level security;
alter table public.playground_runs force row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='playground_runs' and policyname='Playground runs select own') then
    create policy "Playground runs select own"
      on public.playground_runs for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='playground_runs' and policyname='Playground runs insert own') then
    create policy "Playground runs insert own"
      on public.playground_runs for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='playground_runs' and policyname='Playground runs delete own') then
    create policy "Playground runs delete own"
      on public.playground_runs for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- news_items (daily AI digest, written by the cron job, readable by users)
-- -----------------------------------------------------------------------------
create table if not exists public.news_items (
  id           text        primary key,
  source       text        not null check (source in ('hacker-news', 'arxiv', 'github', 'huggingface')),
  title        text        not null check (char_length(title) between 1 and 500),
  url          text        not null check (char_length(url) between 1 and 2048),
  summary      text        not null default '' check (char_length(summary) <= 4000),
  author       text        check (author is null or char_length(author) <= 200),
  published_at timestamptz not null,
  score        integer     check (score is null or score >= 0),
  tags         text[]      not null default '{}',
  created_at   timestamptz not null default now()
);

create index if not exists news_items_published_at_idx
  on public.news_items (published_at desc);

create index if not exists news_items_source_published_at_idx
  on public.news_items (source, published_at desc);

alter table public.news_items enable row level security;
alter table public.news_items force row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='news_items' and policyname='News items readable by signed in users') then
    create policy "News items readable by signed in users"
      on public.news_items for select
      to authenticated
      using (true);
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- vault_items (skills, prompts and plugin notes, private to the owner)
-- -----------------------------------------------------------------------------
create table if not exists public.vault_items (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  kind        text        not null check (kind in ('skill', 'prompt', 'plugin')),
  title       text        not null check (char_length(title) between 1 and 200),
  description text        not null default '' check (char_length(description) <= 2000),
  content     text        not null default '' check (char_length(content) <= 20000),
  category    text        not null default '' check (char_length(category) <= 100),
  tags        text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists vault_items_user_id_created_at_idx
  on public.vault_items (user_id, created_at desc);

alter table public.vault_items enable row level security;
alter table public.vault_items force row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vault_items' and policyname='Vault items select own') then
    create policy "Vault items select own"
      on public.vault_items for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vault_items' and policyname='Vault items insert own') then
    create policy "Vault items insert own"
      on public.vault_items for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vault_items' and policyname='Vault items update own') then
    create policy "Vault items update own"
      on public.vault_items for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vault_items' and policyname='Vault items delete own') then
    create policy "Vault items delete own"
      on public.vault_items for delete
      using (auth.uid() = user_id);
  end if;
end $$;

drop trigger if exists vault_items_updated_at on public.vault_items;
create trigger vault_items_updated_at
  before update on public.vault_items
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- Privilege hardening
-- Row level security is the primary control. These grants remove privileges
-- from anonymous visitors as a second layer, then restore only what signed-in
-- users need. The service role bypasses RLS and is used only by server routes.
-- -----------------------------------------------------------------------------
revoke all on public.snippets,
  public.mockify_generations,
  public.promptcraft_history,
  public.tool_documents,
  public.playground_runs,
  public.vault_items
  from anon;

grant select, insert, update, delete on public.snippets,
  public.mockify_generations,
  public.promptcraft_history,
  public.tool_documents,
  public.playground_runs,
  public.vault_items
  to authenticated;

revoke all on public.news_items from anon;
grant select on public.news_items to authenticated;

-- Note: snippets.visibility is reserved for a future public-sharing feature.
-- There is intentionally no public select policy, so every snippet stays
-- private even when that flag reads 'public'.
