# Minimalist Toolkit

Minimalist Toolkit is a workspace that brings focused AI and developer tools under one account:

- **Analytics** (`/app/dashboard`): workspace analytics and quick access to every tool
- **AI Chat** (`/app/chat`): streaming chat and image generation in one workspace
- **Snippet Manager** (`/app/snippets`): save, search, and organise reusable code
- **PromptCraft** (`/app/promptcraft`): draft and improve prompts for a specific model
- **Mockify** (`/app/mockify`): generate images from a written prompt
- **AI Playground** (`/app/playground`): run two prompts against two models and compare answers, latency, tokens and cost
- **AI News** (`/app/news`): a daily digest of AI stories, papers, repositories and models
- **Vault** (`/app/categories`): a private library of skills, prompts and plugin notes with categories and tags
- **Settings** and **Profile** (`/app/settings`, `/app/profile`)

The workspace uses a shadcn sidebar with collapsible groups, keyboard toggle (`Ctrl/Cmd+B`), and a mobile sheet.

## Features

- One account across the workspace, with server-side route protection (`middleware.ts`)
- Email/password and Google sign-in, password reset, and email confirmation via Supabase Auth
- Row-level security so every saved record is owned by its creator
- Snippets and the dashboard are deterministic and need no AI key
- Strict monochrome light and dark themes: pure white and pure black with neutral steps between them. Light is the default, responsive from 360px up
- Brand mark from `Logo.png`, rendered in theme-adaptive variants everywhere: sidebar, navigation, footer, auth screens and favicon
- Type: Lato and Open Sans for all text, BBH Bogle for display headings (`font-display`)
- Snippet exports: JSON download and GitHub Gist
- Playground runs are saved per user, with owner-only RLS
- News is collected from four keyless open APIs and refreshed once a day

## Tech stack

- Next.js 16 (App Router, `middleware.ts` for server-side route guards)
- React 19
- TypeScript (strict)
- Tailwind CSS 4 with a custom token system
- Supabase (Auth + Postgres with RLS)
- OpenRouter and Groq for model access
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
| `GROQ_API_KEY` | AI Chat, PromptCraft and the Groq side of the Playground |
| `OPENROUTER_API_KEY` | OpenRouter models and the OpenRouter side of the Playground |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only write access for the news cron route |
| `GITHUB_TOKEN` | Optional. Raises the GitHub search limit from 60 to 5,000 per hour |
| `CRON_SECRET` | Bearer token for `/api/keep-alive` and `/api/cron/news` |

Never commit `.env.local` or share secret values. The service-role key is read only by the news cron route on the server and must never be exposed to the browser.

## Routes

- Public: `/`, `/login`, `/signup`, `/forgot-password`, `/update-password`, `/auth/callback`
- Workspace (protected): `/app/dashboard`, `/app/categories`, `/app/chat`, `/app/snippets`,
  `/app/promptcraft`, `/app/mockify`, `/app/playground`, `/app/news`, `/app/settings`, `/app/profile`
- API: `/api/chat`, `/api/mockify/generate`, `/api/promptcraft/*`, `/api/providers/models`,
  `/api/playground/run`, `/api/playground/runs`, `/api/cron/news`, `/api/keep-alive`

`/app` redirects to `/app/dashboard`.

## AI Playground

1. Add `OPENROUTER_API_KEY` and/or `GROQ_API_KEY` to `.env.local`.
2. Open `/app/playground`.
3. Pick a provider and model on each side, write a prompt for each side, and run the comparison.
4. The results show the answer, latency, total tokens and cost. Cost is shown only when the
   provider publishes per-token pricing in its models endpoint. Groq does not, so its cost is
   shown as "Not published".
5. By default, OpenRouter is filtered to open-weight model families. Turn on "Show all
   OpenRouter models" to see every text model.

Runs are saved to `public.playground_runs` for the signed-in user. If the table has not been
created yet, the comparison still works and the page shows no saved runs.

## AI News

The feed reads `public.news_items`. A cron job fills it from:

| Source | Endpoint | Key |
|--------|----------|-----|
| Hacker News | Algolia Search API | None |
| arXiv | Export API (`cs.AI`, `cs.LG`) | None |
| GitHub | Search API, repositories created in the last 7 days | Optional `GITHUB_TOKEN` |
| Hugging Face | Models API, newest models | None |

`vercel.json` schedules `/api/cron/news` once a day at 07:00 UTC. Vercel Hobby plans allow one
run per day, so the time is a target within the hour.

To fill the feed manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://minimalist-toolkit.vercel.app/api/cron/news
```

The route rejects requests without the secret and deletes items older than 30 days.

## Database

**Source of truth:** `supabase/schema.sql` (idempotent, non-destructive).

Tables:

1. `snippets` + RLS + `handle_updated_at`
2. `mockify_generations`
3. `promptcraft_history`
4. `tool_documents` (reserved; Chat history is still browser-local)
5. `playground_runs` (Playground comparisons, owner-only)
6. `news_items` (shared read for signed-in users, written by the cron job)
7. `vault_items` (skills, prompts and plugin notes, owner-only)

### Safe apply strategy

1. Snapshot/backup the Supabase project.
2. Re-apply `supabase/schema.sql`. Every statement is guarded with `IF NOT EXISTS` or a policy check.
3. Do not `DROP TABLE`, truncate, or rename columns in production without an explicit plan.
4. Smoke-test signed-in CRUD for snippets, Mockify history, PromptCraft history and Playground runs.

```bash
# After linking (asks for confirmation; do not push blindly):
supabase link --project-ref <your-project-ref>
# Inspect only, or apply via SQL editor:
# supabase db query --file supabase/schema.sql
```

## Scripts

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm check:calculations
```

## Notes

- AI Chat, PromptCraft and the Groq side of the Playground need `GROQ_API_KEY`.
- The OpenRouter side of the Playground needs `OPENROUTER_API_KEY`.
- Image generation proxies Pollinations server-side.
- Chat conversation history is local to the browser; snippets and tool history tables sync when signed in.
- Set `CRON_SECRET` in Vercel (Production + Preview) so both cron routes can authenticate.
- Route guards live in `proxy.ts` (the Next.js 16 replacement for `middleware.ts`).

## Ideas for the next phase

These are not built. They are the highest-value additions for a complete AI workspace:

1. **Workspace search with embeddings**: index snippets, prompts and chat messages, then answer
   questions with citations to your own records.
2. **Prompt library**: save PromptCraft outputs with variables, versions and a one-click run in
   the Playground.
3. **Usage dashboard**: tokens and spend per provider per day, with a monthly budget alert.
4. **Chat sync**: move browser-local conversations into `tool_documents` and add search.
5. **Model notes**: attach your own benchmark notes and preferred use case to each model.
6. **Export bundles**: download a workspace as Markdown or JSON for backup and sharing.

## Made by

Made by [Tanveer](https://muhammadtanveerabbas.vercel.app).
