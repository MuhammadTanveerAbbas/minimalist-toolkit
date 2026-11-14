# Minimalist Toolkit

Minimalist Toolkit is a workspace that brings focused tools under one account:

- **Dashboard** (`/app/dashboard`): workspace analytics and quick access to every tool
- **Snippet Manager** (`/app/snippets`): save, search, and organise reusable code
- **Categories** (`/app/categories`): browse and compare snippet categories
- **PromptCraft** (`/app/promptcraft`): draft and improve prompts for a specific model
- **AI Chat** (`/app/chat`): chat and image generation (Mockify) in one workspace

`/app/mockify` redirects into the Chat images tab.

## Features

- One account across the workspace, with server-side route protection (`proxy.ts`)
- Email/password and Google sign-in, password reset, and email confirmation via Supabase Auth
- Row-level security so every saved record is owned by its creator
- Snippets and the dashboard are deterministic and need no AI key
- Light and dark theme, responsive from 360px up
- Snippet exports: JSON download and GitHub Gist

## Tech stack

- Next.js 16 (App Router, `proxy.ts` for server-side route guards)
- React 19
- TypeScript (strict)
- Tailwind CSS 4 with a custom token system
- Supabase (Auth + Postgres with RLS)
- pnpm

## Local development

```bash
pnpm install
cp .env.example .env.local
# Add required environment values to .env.local
# Or, if linked to Vercel (production vars):
#   vercel link --yes --project minimalist-toolkit
#   vercel env pull .env.local --environment=production --yes
pnpm dev
```

Open `http://localhost:3000`.

## Environment setup

Environment variables are documented in `.env.example`. Required for full local use:

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `GROQ_API_KEY` | PromptCraft + AI Chat |
| `CRON_SECRET` | Bearer token for `/api/keep-alive` (Vercel Cron) |

Never commit `.env.local` or share secret values. Never put a service-role key in the Next.js app.

## Routes

- Public: `/`, `/login`, `/signup`, `/forgot-password`, `/update-password`, `/auth/callback`
- Workspace (protected): `/app/dashboard`, `/app/categories`, `/app/chat`, `/app/snippets`,
  `/app/promptcraft`, `/app/settings`, `/app/profile`

`/app` redirects to `/app/dashboard`.

## Authentication behaviour

- Email/password registration and login, plus Google OAuth
- Password reset: `/forgot-password` → email link → `/auth/callback` → `/update-password`
- A signed-in visitor who opens `/`, `/login`, or `/signup` is redirected to `/app/dashboard`
- An unauthenticated visitor who opens a protected route is redirected to `/login` with `next` preserved
- Redirect targets are validated and can only resolve to a path inside this app
- Auth endpoints are rate limited per client

## Database

**Source of truth:** `supabase/schema.sql` (idempotent, non-destructive).

Numbered scripts remain for stepwise applies on existing projects:

1. `001_core.sql` – shared setup
2. `002_snippet_manager.sql` – `snippets` + RLS + `handle_updated_at`
3. `003_mockify.sql` – `mockify_generations`
4. `004_promptcraft.sql` – `promptcraft_history`
5. `005_tool_documents.sql` – `tool_documents` (reserved; Chat history is still browser-local)

### Safe apply strategy

1. Snapshot/backup the Supabase project.
2. Prefer re-applying `schema.sql` or `001`→`005` in order (all use `IF NOT EXISTS` / policy guards).
3. Do not `DROP TABLE`, truncate, or rename columns in production without an explicit plan.
4. Smoke-test signed-in CRUD for snippets, Mockify history, and PromptCraft history.

```bash
# After linking (asks for confirmation; do not push blindly):
supabase link --project-ref <your-project-ref>
# Inspect only, or apply via SQL editor /:
# supabase db query --file supabase/schema.sql
```

## Scripts

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Notes

- PromptCraft and AI Chat need `GROQ_API_KEY`. Image generation proxies Pollinations server-side.
- Chat conversation history is local to the browser; snippets and tool history tables sync when signed in.
- Set `CRON_SECRET` in Vercel (Production + Preview) so `/api/keep-alive` can authenticate cron jobs.

## Made by

Made by [Tanveer](https://muhammadtanveerabbas.vercel.app).
