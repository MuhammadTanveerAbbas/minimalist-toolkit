# Toolkit Implementation Plan (Phase 1 Audit + Execution Plan)

## Verified stack
- **Framework:** Next.js `16.0.10` (App Router), React `19.2.3`, TypeScript `^5` (strict). `next.config.mjs` sets `typescript.ignoreBuildErrors: false`.
- **Package manager:** `pnpm` (`pnpm-lock.yaml`, `pnpm-workspace.yaml`).
- **Styling/UI:** Tailwind CSS `^4.1.9` + `@tailwindcss/postcss`, `tw-animate-css`, Radix primitives (`dialog`, `select`, `tabs`, `sheet`, etc.), `lucide-react`, `class-variance-authority`, `clsx`/`tailwind-merge` (`cn`).
- **Editor:** CodeMirror 6 + `@uiw/react-codemirror` (snippet manager).
- **Auth/DB:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`). Browser/server clients in `lib/supabase/*`. Google OAuth via `signInWithOAuth`.
- **Scripts:** `pnpm dev|build|start|lint|typecheck`.

## Current architecture
- **Routes:** `/` (main snippet manager UI, client-heavy), `/login` (+ `_login.tsx`), `/auth/callback` (OAuth code exchange), `/api/keep-alive` (cron, bearer `CRON_SECRET`), OG/twitter image routes, error/loading/not-found.
- **Route protection:** `proxy.ts` exports `proxy(request)` + `config.matcher`; uses Supabase SSR cookies and `auth.getUser()`. Unauthenticated users are redirected to `/login` except `/login`, `/auth`, `/api/cron` (note: keep-alive is `/api/keep-alive` but matcher allows `/api/cron` prefix only; preserve behavior and fix safely if needed).
- **Data:** `public.snippets` table with owner-only RLS (select/insert/update/delete by `auth.uid() = user_id`), `updated_at` trigger, index on `(user_id, created_at desc)`. Schema is maintained in `supabase/migrations/002_snippet_manager.sql`.
- **Snippet features (inventory, preserve):** auth-gated create (prompts sign-in modal when unauthenticated), list/search/filter (language/category/tags/visibility/regex per hooks/lib), create/edit/view/duplicate/delete, version history in JSONB, categories/tags, visibility public/private field (UI/filtering; RLS currently owner-only reads), import/export JSON and Gist export, keyboard shortcuts, theme toggle (dark-first, localStorage), responsive sidebar (sheet on mobile), CodeMirror editor with language support.
- **Theme:** `ThemeInit` + `useTheme` (`snippet-manager-theme` localStorage key, dark default). CSS tokens in `app/globals.css`; existing dark primary accent is orange (`#FF3C00`) in dark theme. I will keep semantic tokens and improve cohesion without breaking existing UI.

## XML reference audit
- **Files found:** `mockify.xml`, `Promptcraft.xml` (Repomix merged codebases). `mockify.xml`/`Promptcraft.xml` naming differs from prompt text; both are present and used as source.
- **Mockify (from XML):** AI image generator (Pollinations.ai), no auth/DB in source app. Core: prompt form with example chips, model/quality/size selectors, generation via `/api/generate` proxy to Pollinations (avoids browser Origin blocking), result display with download/copy/fullscreen/zoom, localStorage history/settings (`mockify_*`), loading/error/retry states, empty state. Key files: `app/page.tsx`, `components/prompt-form.tsx`, `components/mockup-result.tsx`, `components/prompt-history.tsx`, `components/wave-loader.tsx`, `components/empty-state.tsx`, `lib/generateImage.ts`, `lib/use-local-storage.ts`, `app/api/generate/route.ts`.
- **PromptCraft (from XML):** Prompt generator/enhancer/scraper using Groq (Llama 3.3). Core: topic/tone/category/platform/context inputs, URL scrape into context (`/api/scrape`), generate (`/api/generate`, streaming/app data stream) and enhance (`/api/enhance`), output with copy/download/regenerate, local history. Server lib `lib/groq.ts` handles model discovery/fallback/retries. Requires `GROQ_API_KEY`; optional `GROQ_MODEL`. Key files: `app/page.tsx`, `components/prompt-form.tsx`, `components/prompt-output.tsx`, `components/prompt-history.tsx`, `app/api/{generate,enhance,scrape}/route.ts`, `lib/groq.ts`.
- **Namespace conflicts:** both XML apps use `/api/generate`. In unified app: `app/api/mockify/generate/route.ts`, `app/api/promptcraft/{generate,enhance,scrape}/route.ts`; update client fetch paths.

## Proposed route mapping
- **Public:** `/` (landing), `/features` (optional anchor/section or route; keep simple), `/login`, `/signup` (can share Supabase OAuth entry; label clearly), `/forgot-password` (explain Google OAuth / provider-managed recovery honestly if email-password not implemented), `/auth/callback`.
- **Authenticated (`/app/*`, protected):** `/app` (workspace overview), `/app/snippets` (existing snippet manager preserved), `/app/mockify`, `/app/promptcraft`, `/app/settings`, `/app/profile` (settings/profile may share page if minimal). Preserve snippet functionality; redirect `/` authenticated users to `/app/snippets` or `/app` as safe default? I will use `/app` overview and keep snippet access obvious; add compatibility handling only where safe.
- **APIs:** existing `/api/keep-alive`; add namespaced Mockify/PromptCraft routes. No secrets to browser.

## Data model & ownership strategy
- **Canonical identity:** Supabase `auth.users.id` (`auth.uid()`). No module-specific user tables.
- **Core:** reuse existing auth; add `supabase/migrations/001_core.sql` only if a truly shared extension is needed (profile/preferences) using additive, non-destructive SQL compatible with project workflow. Keep `supabase/schema.sql` intact for now; document migration order.
- **Snippets:** preserve `public.snippets` (treat as snippet module). `002_snippet_manager.sql` is idempotent/preservation-oriented; do **not** drop/rename existing table/data. Migrations in `supabase/migrations/` are the maintained schema source.
- **Mockify:** `003_mockify.sql` - user-owned history/settings if persistence is added (e.g. `mockify_generations` with `user_id`, prompt, model, size, image metadata/URL handling; be careful: Pollinations image URLs may be transient and data URLs are large. Prefer storing metadata + source URL/blob strategy only if practical; otherwise persist prompt/history metadata and keep image in client storage with clear behavior). I will implement useful persistence with safe limits and explicit ownership/RLS.
- **PromptCraft:** `004_promptcraft.sql` - `promptcraft_history` (user_id, topic, category, tone, platform, context summary optional, output, created_at) with RLS. Scrape/generate inputs validated server-side; no API keys in client.
- **RLS:** enable on all user-owned tables; policies for select/insert/update/delete using `auth.uid()`; indexes on `user_id`, `created_at`.

## UI/design system strategy
- Reuse existing Tailwind tokens, Radix components, `cn`, Geist Mono. Keep dark-first; maintain light theme tokens. No gradients/glow (remove decorative gradient bars where not system-consistent? existing auth modal has a subtle top gradient - will normalize to flat token-based styling if it conflicts with rules).
- Shared workspace shell: responsive sidebar + header, tool navigation (Overview, Snippets, Mockify, PromptCraft, Settings), account menu/sign out, theme toggle.
- Public landing: hero, bento tool overview, per-tool showcase grounded in real features, how-it-works, FAQ/CTA/footer. No fabricated testimonials/metrics/logos.
- Accessibility: labels, focus states, keyboard support, `prefers-reduced-motion`, semantic landmarks.

## Risks, ambiguities, assumptions
- **DB migration application:** I cannot apply migrations to the live Supabase project without credentials/access; SQL files and instructions will be provided and verified syntactically where possible.
- **PromptCraft env:** requires `GROQ_API_KEY` server-side. Feature works only when configured; UI must show actionable error state.
- **Mockify images:** Pollinations returns images; storing large blobs in Postgres is not ideal. I will store history metadata in DB when table exists and fall back/also support client behavior; avoid persisting secrets.
- **Route/auth change:** moving public landing to `/` changes previous behavior (unauthenticated saw redirect to login; authenticated saw snippets). I will preserve safe access: landing public, authenticated users can enter `/app/*`; keep `/login` and snippet workflows intact. Document any intentional behavior changes.
- **Git:** untracked XML/plan files exist; I will not overwrite user changes.

## Phased implementation sequence
1. Plan (this file).
2. Platform foundation: workspace routes, protected `/app/*`, shared shell, theme/header consistency.
3. Snippet Manager: move/adapt to `/app/snippets`, preserve all behavior/data.
4. Mockify module: port UI/lib, namespace API route, integrate page, add migration SQL.
5. PromptCraft module: port UI/lib/server routes, namespace APIs, streaming handling, migration SQL.
6. Landing + auth UX: public marketing page, improved login/signup/recovery messaging.
7. QA: `pnpm lint`, `pnpm typecheck`, `pnpm build`; targeted manual verification notes; security checklist.

## Test/acceptance plan
- Run configured static checks and production build.
- Verify snippet CRUD/search/filter/navigation still works with existing Supabase schema.
- Verify `/app/*` requires auth; public routes accessible.
- Verify Mockify generate flow (network-dependent; handle errors) and PromptCraft flows with/without API key.
- Two-user isolation: enforced by existing/new RLS; document test procedure if live DB unavailable.
- Final handoff report with honest verification status.
