-- 003_mockify.sql
-- Mockify: user-owned generation history metadata.
-- Image binaries are not stored here; keep records lightweight and validated.

create extension if not exists pgcrypto;

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
