# AGENTS.md — IRIS Project

Cross-tool agent instructions for GitHub Copilot, Claude Code, Cursor, and other AI coding agents.

---

## Project Overview

**IRIS** ("I Rise, I Shine") is an AI-powered sobriety companion built with:

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| Language | TypeScript 5 (strict mode) |
| Database / Auth | Supabase (`@supabase/ssr`) |
| AI | Vercel AI SDK v6 · GPT-4o via `@ai-sdk/openai` |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Package Manager | pnpm |

### Source Layout
```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Login, onboarding (unauthenticated layout)
│   ├── (app)/            # Authenticated app shell
│   └── api/
│       ├── chat/         # Streaming AI route
│       └── webhooks/     # Stripe webhook handlers
├── components/           # Shared UI components
├── hooks/                # Client-side React hooks
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Browser Supabase client
│   │   └── server.ts     # Server Supabase client
│   └── crisis-detection.ts
├── types/
│   ├── database.ts       # Generated Supabase types
│   └── index.ts          # App-level types and Zod schemas
└── middleware.ts          # Auth session refresh
```

---

## Build & Dev Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Production build
pnpm typecheck        # TypeScript check (zero errors required)
pnpm lint             # ESLint check
pnpm test             # Run test suite
```

**Always run `pnpm typecheck` after making code changes.**

---

## Architecture Decisions

### Authentication Flow
- Users start as anonymous (`supabase.auth.signInAnonymously()`)
- Anonymous users have `is_anonymous: true` in their JWT
- All data is keyed to `user_id = auth.uid()` — preserved when they convert to a permanent account
- Conversion: `updateUser({ email })` → verify email → `updateUser({ password })`
- The user ID **never changes** through this flow — zero data loss

### AI Chat
- Streaming via `streamText` + `toUIMessageStreamResponse` (AI SDK v6)
- Client uses `useChat` from `@ai-sdk/react` with `sendMessage` (not `handleSubmit`)
- Crisis detection runs client-side before each message is sent
- All crisis responses are scripted — never AI-generated
- Messages persisted in `onFinish` callback server-side

### Database
Phase 1 tables (all with `ON DELETE CASCADE` back to `auth.users`):
- `user_profiles` — sobriety date, goals, preferences
- `sessions` — coaching conversation records
- `messages` — individual chat messages (with `flagged_crisis`, `crisis_tier`)
- `check_ins` — daily mood and sobriety check-ins
- `assessments` — structured self-assessments
- `crisis_events` — safety event log (never deleted)
- `feedback` — in-app NPS and beta feedback

---

## Security Boundaries

### Hard Rules — Never Violate

| Rule | Detail |
|------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` server-only | Never import into client components or expose to browser |
| Always `getUser()` for server auth | Never use `getSession()` for server-side auth checks — it can be spoofed |
| RLS on every table | All tables must have Row Level Security enabled with explicit policies |
| No `any` types | Use `unknown` + Zod narrowing instead |
| Scripted crisis responses | Never let GPT-4o generate tier-1 crisis responses — use pre-written scripts |
| No deprecated auth package | Never use `@supabase/auth-helpers-nextjs` — use `@supabase/ssr` exclusively |

### Environment Variables
```
# Public (safe to expose to browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Private (server-only — never in client bundle)
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Boundaries: Ask Before Doing

These actions require explicit human approval before proceeding:

- **Database schema changes** — any `ALTER TABLE`, `DROP`, new table, or RLS policy change
- **New npm dependencies** — check the GitHub Advisory Database for CVEs first
- **Middleware changes** — auth flow is critical path; errors lock users out
- **Environment variable changes** — never add/modify `.env` values without confirmation
- **Public API contract changes** — any breaking change to route handler request/response shapes
- **Crisis detection logic** — changes to keyword patterns or crisis response scripts require clinical review

---

## Code Conventions

- **Named exports only** (except `page.tsx`, `layout.tsx`, `route.ts` — Next.js requires defaults)
- **`@/` path aliases** — never use relative `../../` imports
- **Functional components** — no class components
- **Server Components by default** — add `'use client'` only when required
- **Zod validation** at every API boundary and user input
- **Discriminated union results**: `{ success: true; data: T } | { success: false; error: string }`

---

## Design System

- **Background**: `#0A0A0F` (near-black with blue-violet undertone)
- **Primary accent**: `#6B4CE6` (iris purple)
- **Gold highlight**: `#D4A843` (sacred gold)
- **Primary text**: `#F0ECF9` (warm off-white — ~15:1 contrast ratio)
- **Fonts**: Cormorant Garamond (headings) + DM Sans (body)

Full token reference in `.cursor/rules/tailwind.mdc`.

---

## Safety & Compliance

- IRIS is a **wellness companion**, not a therapist, treatment provider, or medical device.
- Never use the words "therapy", "treatment", "diagnosis", or "prescription" in the app or marketing.
- Crisis detection must achieve ≥95% accuracy on the 50-scenario test suite before any real users access the app.
- Crisis events are logged permanently to `crisis_events` — this table is never pruned.
- See `.cursor/rules/vercel-ai.mdc` for the complete crisis detection implementation.

---

## Useful References

- `.cursor/rules/base.mdc` — core stack conventions
- `.cursor/rules/nextjs.mdc` — App Router patterns
- `.cursor/rules/supabase.mdc` — Supabase SSR patterns (complete middleware implementation)
- `.cursor/rules/typescript.mdc` — strict TypeScript conventions
- `.cursor/rules/tailwind.mdc` — design tokens and component patterns
- `.cursor/rules/vercel-ai.mdc` — AI SDK v6 chat patterns and crisis detection
- `.cursor/rules/agent-workflow.mdc` — task discipline and quality gates
