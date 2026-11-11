# Minimalist Toolkit

Minimalist Toolkit is a workspace that brings six focused tools under one account:

- **Dashboard** (`/app/dashboard`): workspace analytics and quick access to every tool
- **Snippet Manager** (`/app/snippets`): save, search, and organise reusable code
- **Categories** (`/app/categories`): browse and compare snippet categories
- **Mockify** (`/app/mockify`): create visual mockups from text prompts
- **PromptCraft** (`/app/promptcraft`): draft and improve prompts for a specific model
- **Quotes** (`/app/quotes`): build client quotes and convert them into invoices
- **Prioritizer** (`/app/prioritizer`): score features and test how fragile the ranking is
- **AI Chat** (`/app/chat`): short answers on code, prompts, and product decisions

## Features

- One account across the workspace, with server-side route protection
- Row-level security so every saved record is owned by its creator
- Snippets, Quotes, and Prioritizer are deterministic and need no AI key
- Light and dark theme, responsive from 360px up
- Exports for everything: JSON, Gist, CSV, Markdown, and print to PDF

## Tech stack

- Next.js 16 (App Router, `proxy.ts` for server-side route guards)
- React 19
- TypeScript (strict)
- Tailwind CSS 4 with a custom token system
- Supabase (Google OAuth, Postgres with RLS)
- pnpm

## Local development

```bash
pnpm install
cp .env.example .env.local
# Add required environment values to .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment setup

Environment variables are documented in `.env.example`. Add the values required for the features you
want to run locally.

If this repository is linked to a Vercel project, you can pull configured values:

```bash
vercel link
vercel env pull .env.local
```

Do not commit `.env.local` or share secret values.

## Routes

- Public: `/`, `/login`, `/signup`, `/forgot-password`, `/auth/callback`
- Workspace (protected): `/app/dashboard`, `/app/categories`, `/app/chat`, `/app/snippets`,
  `/app/mockify`, `/app/promptcraft`, `/app/quotes`, `/app/prioritizer`, `/app/settings`,
  `/app/profile`

`/app` redirects to `/app/dashboard`.

## Authentication behaviour

- A signed-in visitor who opens `/`, `/login`, or `/signup` is redirected to `/app/dashboard`
- An unauthenticated visitor who opens a protected route is redirected to `/login` with the
  originally requested path preserved in `next`, and returns there after signing in
- Redirect targets are validated on the server and can only ever resolve to a path inside this app
- Sign-in and callback endpoints are rate limited per client

## Database

SQL migrations are in `supabase/`:

1. `001_core.sql` - shared setup (idempotent)
2. `002_snippet_manager.sql` - `public.snippets` schema and RLS (preservation-oriented; do not drop/rename existing data)
3. `003_mockify.sql` - `public.mockify_generations` (owner-only RLS)
4. `004_promptcraft.sql` - `public.promptcraft_history` (owner-only RLS)
5. `005_tool_documents.sql` - `public.tool_documents`, the shared store behind Quotes and Prioritizer

Apply migrations with your Supabase workflow and review them against the target project before running.

The Quotes and Prioritizer tools fall back to browser storage when the database is unreachable, so they
remain usable before a migration has been applied.

## Scripts

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Notes

- Some features depend on environment configuration and available services.
- AI-powered features require the appropriate server configuration.
- Keep user data private and verify behavior in your target environment before release.

## Made by

Made by [Tanveer](https://muhammadtanveerabbas.vercel.app).
