# IRIS — I Rise, I Shine

> An AI-powered sobriety companion. Built with Next.js 15, Supabase anonymous auth, Vercel AI SDK v6, GPT-4o, and a premium dark-mode aesthetic in iris purples and sacred golds.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites & First-Time Setup](#prerequisites--first-time-setup)
3. [Working with Cursor Agents](#working-with-cursor-agents)
   - [How the rules system works](#how-the-rules-system-works)
   - [Initiating instruction set](#initiating-instruction-set)
   - [Starting every new session](#starting-every-new-session)
4. [Development Workflow](#development-workflow)
   - [Phase 1 — Foundations](#phase-1--foundations)
   - [Phase 2 — Core Loop](#phase-2--core-loop)
   - [Phase 3 — Safety & Polish](#phase-3--safety--polish)
5. [Quality Gates](#quality-gates)
6. [Project Structure](#project-structure)
7. [Environment Variables](#environment-variables)
8. [Design System Quick Reference](#design-system-quick-reference)
9. [Rule Files Reference](#rule-files-reference)

---

## Project Overview

IRIS ("I Rise, I Shine") is a wellness companion app for people in recovery. It is **not** a therapist, medical device, or treatment platform.

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| Language | TypeScript 5 (strict mode) |
| Database / Auth | Supabase (`@supabase/ssr`) |
| AI | Vercel AI SDK v6 · GPT-4o via `@ai-sdk/openai` |
| Styling | Tailwind CSS v4 |
| Validation | Zod |
| Package Manager | pnpm |

---

## Prerequisites & First-Time Setup

```bash
# 1. Install pnpm if you don't have it
npm install -g pnpm

# 2. Install dependencies
pnpm install

# 3. Copy the env template and fill in your keys
cp .env.example .env.local

# 4. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Required environment variables** — see [Environment Variables](#environment-variables) for the full list. You need Supabase and OpenAI keys before anything renders.

---

## Working with Cursor Agents

IRIS uses a structured `.cursor/rules/` directory instead of the legacy `.cursorrules` file. Each rule file activates automatically based on which files you have open, keeping the agent context focused and accurate.

### How the rules system works

| File | Activates when… | Purpose |
|------|----------------|---------|
| `base.mdc` | Always (every session) | Stack non-negotiables: no `any`, named exports, `@/` aliases, Zod, banned deprecated packages |
| `typescript.mdc` | Always (every session) | Strict mode, discriminated union results, Zod at all boundaries |
| `agent-workflow.mdc` | Always (every session) | Task discipline, build order, quality gates, commit format |
| `nextjs.mdc` | When `src/app/**` files are open | App Router conventions, route handlers, Server Actions |
| `supabase.mdc` | When `src/lib/supabase/**` or `src/middleware.ts` are open | Complete `@supabase/ssr` patterns, anonymous auth, RLS |
| `tailwind.mdc` | When `src/components/**` files are open | IRIS design tokens, component patterns, accessibility |
| `vercel-ai.mdc` | When `src/app/api/chat/**` or `src/hooks/useChat*` are open | AI SDK v6 API, route handler, scripted crisis detection |

> The three `alwaysApply` rules (`base`, `typescript`, `agent-workflow`) inject into **every** Cursor request automatically. You never need to `@`-mention them.

---

### Initiating instruction set

When you open a **brand-new Cursor chat session**, paste this block as your first message. It orients the agent, confirms which rules are active, and establishes the working contract for the session.

```
You are working on IRIS — an AI sobriety companion built with Next.js 15 App Router,
Supabase (@supabase/ssr), Vercel AI SDK v6, GPT-4o, Tailwind CSS v4, and pnpm.

Before we start:
1. Read src/types/index.ts and src/types/database.ts for the current type surface.
2. Confirm you are using @supabase/ssr (NOT @supabase/auth-helpers-nextjs).
3. Confirm you will use sendMessage (NOT handleSubmit/append) for AI SDK v6.
4. Confirm no `any` types — use `unknown` + Zod narrowing.
5. Confirm all auth checks use supabase.auth.getUser() (NOT getSession()).

Active rules: base.mdc, typescript.mdc, agent-workflow.mdc are always on.
Open the relevant file to activate: nextjs.mdc, supabase.mdc, tailwind.mdc, or vercel-ai.mdc.

This session's single task: [DESCRIBE YOUR TASK HERE]

Use Plan Mode first — show me the files you'll touch and your approach before writing any code.
```

Replace `[DESCRIBE YOUR TASK HERE]` with one specific task (e.g. "Build the morning check-in form and Server Action").

> **One task per session.** Long Cursor sessions degrade output quality. Start a new chat for every distinct task.

---

### Starting every new session

Follow this ritual for every Cursor session, no matter how small the task:

1. **Open the relevant files first** so the correct `.mdc` rules auto-attach (e.g. open `src/app/api/chat/route.ts` before asking about the chat route).
2. **Paste the initiating instruction** above with your specific task filled in.
3. **Use Plan Mode** (`Cmd+Shift+P → "Cursor: Plan"` or the Plan button) to review the agent's approach before it writes code.
4. **Approve the plan**, then switch to Execute.
5. **Run quality gates** immediately after the agent finishes (see [Quality Gates](#quality-gates)).
6. **Open a new chat** for the next task.

---

## Development Workflow

Build features in this order within each phase to avoid type errors and circular dependencies:

```
Types → Database migration → Server logic → Client hooks → UI components → Loading/Error states
```

### Phase 1 — Foundations

Complete these before writing any feature code. Each is a single Cursor session.

| Session | Task | Rule files that will activate |
|---------|------|-------------------------------|
| 1 | Scaffold Next.js project with `pnpm create next-app` and configure `tsconfig`, ESLint, Tailwind v4, and path aliases | `base`, `typescript` |
| 2 | Create Supabase browser + server clients and middleware with anonymous sign-in | `supabase` |
| 3 | Write Phase 1 database migration SQL (7 tables + RLS policies) | `supabase` |
| 4 | Define all Zod schemas and TypeScript types in `src/types/index.ts` | `typescript` |
| 5 | Set up `src/app/layout.tsx` with Cormorant Garamond + DM Sans fonts and global CSS tokens | `nextjs`, `tailwind` |

### Phase 2 — Core Loop

The daily engagement cycle: check-in → AI chat → reflection.

| Session | Task | Rule files |
|---------|------|-----------|
| 6 | Onboarding flow — 5-screen wizard (substance, sobriety date, goals, triggers, tone) | `nextjs`, `tailwind`, `supabase` |
| 7 | Sobriety counter — real-time days/hours/minutes from sobriety date | `nextjs`, `tailwind` |
| 8 | Morning check-in — mood 1–5, emotion tags, pledge, Server Action to persist | `nextjs`, `supabase`, `typescript` |
| 9 | GPT-4o streaming chat route + `useChat` hook | `vercel-ai`, `supabase` |
| 10 | Chat UI component — message list with `message.parts`, input, status-driven send button | `vercel-ai`, `tailwind` |
| 11 | Evening reflection — sobriety confirmation, activities, optional journal, AI summary | `nextjs`, `supabase`, `vercel-ai` |
| 12 | Conversation history — paginated list of past sessions | `nextjs`, `supabase`, `tailwind` |

### Phase 3 — Safety & Polish

Build these **before** any real user touches the app.

| Session | Task | Rule files |
|---------|------|-----------|
| 13 | Three-tier crisis detection — keyword scan + scripted responses for tiers 1–3 | `vercel-ai`, `typescript` |
| 14 | Crisis resource card component (988, SAMHSA, Crisis Text Line, 911) | `tailwind` |
| 15 | Crisis event logging to `crisis_events` table | `supabase` |
| 16 | Legal disclaimer consent screen + persistent "not a therapist" footer | `nextjs`, `tailwind` |
| 17 | Push notification scheduling (morning + evening reminders) | `nextjs` |
| 18 | Beta feedback form + NPS micro-survey | `nextjs`, `supabase`, `tailwind` |
| 19 | Lightweight admin view (activity log, crisis events, flagged messages) | `nextjs`, `supabase` |
| 20 | Run 50-scenario crisis detection test suite — must reach ≥95% accuracy | `vercel-ai` |

> **Go/No-Go for real users:** zero safety incidents, crisis accuracy ≥95%, 7-day retention ≥40%, NPS ≥30, legal review complete.

---

## Quality Gates

Run these after **every** Cursor session before closing the chat:

```bash
pnpm typecheck    # Must be zero errors
pnpm lint         # Must be zero errors
pnpm build        # Must succeed
pnpm test         # Must pass
```

Never commit code that fails `pnpm typecheck`. If the agent produces type errors, paste them back into the same session and ask it to fix them before moving on.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Unauthenticated pages (login, onboarding)
│   ├── (app)/            # Authenticated app shell
│   └── api/
│       ├── chat/         # Streaming GPT-4o route
│       └── webhooks/     # Stripe webhook handlers
├── components/           # Shared UI components
├── hooks/                # Client-side React hooks (useChat session, etc.)
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Browser Supabase client
│   │   └── server.ts     # Server Supabase client
│   └── crisis-detection.ts
├── types/
│   ├── database.ts       # Supabase-generated types
│   └── index.ts          # App-level Zod schemas + TypeScript types
└── middleware.ts          # Auth session refresh (cookie forwarding)
```

---

## Environment Variables

```bash
# .env.local

# Public — safe to expose to the browser
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Private — server-only, never in the client bundle
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> `SUPABASE_SERVICE_ROLE_KEY` must **never** be imported in any file that runs client-side. The Cursor agent rules enforce this, but double-check on every PR.

---

## Design System Quick Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0A0A0F` | Page background |
| Surface 1 | `#121218` | Cards, panels |
| Surface 2 | `#1A1A24` | Inputs, hover |
| Iris 500 | `#6B4CE6` | Primary accent |
| Iris 600 | `#5A3FD3` | Buttons, links |
| Gold 500 | `#D4A843` | Sacred gold highlight |
| Gold 400 | `#F5C542` | Warm gold |
| Text primary | `#F0ECF9` | Body copy (~15:1 contrast) |
| Text secondary | `#A8A3B8` | Supporting text |
| Text muted | `#6B6780` | Captions, timestamps |

**Fonts:** Cormorant Garamond (headings, `var(--font-serif)`) + DM Sans (body, `var(--font-sans)`)

Full token reference and component patterns: [`.cursor/rules/tailwind.mdc`](.cursor/rules/tailwind.mdc)

---

## Rule Files Reference

| File | When it applies | Read it for… |
|------|----------------|-------------|
| [`.cursor/rules/base.mdc`](.cursor/rules/base.mdc) | Always | Stack overview, banned patterns, error handling shape |
| [`.cursor/rules/typescript.mdc`](.cursor/rules/typescript.mdc) | Always | `tsconfig` settings, Zod patterns, type utilities |
| [`.cursor/rules/agent-workflow.mdc`](.cursor/rules/agent-workflow.mdc) | Always | Build order, checklists, commit format, session discipline |
| [`.cursor/rules/nextjs.mdc`](.cursor/rules/nextjs.mdc) | `src/app/**` open | Route handler boilerplate, Server Actions, metadata |
| [`.cursor/rules/supabase.mdc`](.cursor/rules/supabase.mdc) | `src/lib/supabase/**` or `src/middleware.ts` open | Complete SSR client code, middleware, anonymous auth, RLS |
| [`.cursor/rules/tailwind.mdc`](.cursor/rules/tailwind.mdc) | `src/components/**` open | All color tokens, typography scale, button/card/input patterns |
| [`.cursor/rules/vercel-ai.mdc`](.cursor/rules/vercel-ai.mdc) | `src/app/api/chat/**` or `src/hooks/useChat*` open | AI SDK v6 API changes, route handler, crisis detection |
| [`AGENTS.md`](AGENTS.md) | All AI tools | Architecture decisions, security boundaries, "ask before doing" |

---

## Safety & Compliance

IRIS is a **wellness companion** — not a therapist, treatment provider, or medical device.

- Never use "therapy", "treatment", "diagnosis", or "prescription" in the app or marketing copy.
- Crisis detection accuracy must reach **≥95%** on the 50-scenario test suite before any real user accesses the app.
- Crisis events are logged permanently to `crisis_events` and are **never pruned**.
- Tier-1 crisis responses are always scripted — GPT-4o never generates them.

See [`AGENTS.md`](AGENTS.md) for the full security boundary table.
