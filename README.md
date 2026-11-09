# Minimalist Toolkit

Minimalist Toolkit is a clean, responsive workspace that brings everyday tools into one place:

- **Dashboard** (`/app`): quick overview and recent activity
- **Snippet Manager** (`/app/snippets`): save, search, and organize reusable code
- **Categories** (`/app/categories`): browse snippet categories
- **Mockify** (`/app/mockify`): create visual mockups from text prompts
- **PromptCraft** (`/app/promptcraft`): draft and improve prompts
- **AI chat** (`/app/chat`): get quick help inside the workspace

## Features

- One account across the workspace
- Grouped sidebar navigation (Workspace, Tools, Account)
- Light and dark theme support
- Responsive layout for mobile, tablet, and desktop
- Flat, minimal interface with clear hierarchy

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
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

Environment variables are documented in `.env.example`. Add the values required for the features you want to run locally.

If this repository is linked to a Vercel project, you can pull configured values:

```bash
vercel link
vercel env pull .env.local
```

Do not commit `.env.local` or share secret values.

## Routes

- Public: `/`, `/login`, `/signup`, `/forgot-password`, `/auth/callback`
- Workspace: `/app`, `/app/categories`, `/app/chat`, `/app/snippets`, `/app/mockify`, `/app/promptcraft`, `/app/settings`, `/app/profile`

## Database

SQL migrations are in `supabase/migrations/`:

1. `001_core.sql` - shared setup (idempotent)
2. `002_snippet_manager.sql` - `public.snippets` schema and RLS (preservation-oriented; do not drop/rename existing data)
3. `003_mockify.sql` - `public.mockify_generations` (owner-only RLS)
4. `004_promptcraft.sql` - `public.promptcraft_history` (owner-only RLS)

Apply migrations with your Supabase workflow and review them against the target project before running.

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
