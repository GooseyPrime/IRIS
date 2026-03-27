# IRIS — I Rise, I Shine

> An AI-powered sobriety companion. Built with Next.js 15, Supabase anonymous auth, Google OAuth, Vercel AI SDK v6, GPT-4o, and a premium dark-mode aesthetic in iris purples and sacred golds.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites & First-Time Setup](#prerequisites--first-time-setup)
3. [Working with Cursor Agents](#working-with-cursor-agents)
   - [How the rules system works](#how-the-rules-system-works)
   - [Initiating instruction set](#initiating-instruction-set)
   - [Starting every new session](#starting-every-new-session)
   - [Orchestrating agent (autonomous task loop)](#orchestrating-agent-autonomous-task-loop)
   - [Critical checkpoints for the orchestrator](#critical-checkpoints-for-the-orchestrator)
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
cp .env.local.example .env.local

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
3. **Use Plan Mode** (`Cmd+Shift+P → "Cursor: Plan"` or the Plan button) to review the agent's proposed files + steps before it writes code.
4. **Approve the plan**, then switch to Execute.
5. **Run quality gates** immediately after the agent finishes (see [Quality Gates](#quality-gates)).
6. **Open a new chat** for the next task.

---

### Orchestrating agent (autonomous task loop)

Use a single **orchestrator** agent to coordinate the overall backlog and spin up focused Cursor sessions. The orchestrator does not write code directly — it manages the loop and ensures rules are followed.

**Orchestrator loop (repeat for each task):**

1. **Intake & scope** — define the task, acceptance criteria, and the single-owner session scope.
2. **Load ground truth** — read `AGENTS.md` + `.cursor/rules/agent-workflow.mdc` before planning.
3. **Pick rule context** — open the exact files that will activate the right `.mdc` rules.
4. **Spawn a focused session** — paste the [initiating instruction set](#initiating-instruction-set) with the task filled in.
5. **Plan → Execute** — require Plan Mode, then approve before any code changes.
6. **Verify & record** — run [Quality Gates](#quality-gates), capture results, update the task checklist in your issue tracker or PR description.
7. **Stop when blocked** — if a boundary is hit, pause and request explicit approval.

> The orchestrator may manage many tasks, but **each task still runs in its own Cursor session**.

---

### Critical checkpoints for the orchestrator

Before proceeding at any of these decision points, the orchestrator must consult the referenced guideline and obtain explicit approval if required:

| Checkpoint | Consult | Why it matters |
|-----------|---------|----------------|
| Schema/RLS changes | `AGENTS.md` → **Boundaries: Ask Before Doing** | Requires explicit approval before migrations or policy edits |
| Auth or middleware edits | `AGENTS.md` + `.cursor/rules/supabase.mdc` | Critical path; errors lock users out |
| New npm dependency | `AGENTS.md` + advisory check | Security review required before adding packages |
| Environment variable changes | `AGENTS.md` | No `.env` updates without confirmation |
| Public API contract change | `AGENTS.md` | Avoid breaking clients |
| Crisis detection or scripts | `AGENTS.md` + `.cursor/rules/vercel-ai.mdc` | Clinical review required |
| Server auth validation | `.cursor/rules/supabase.mdc` | Must use `getUser()` not `getSession()` |
| Service role key usage | `AGENTS.md` | Must stay server-only |

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
MOBILE_SUBSCRIPTION_WEBHOOK_SECRET=
```

> `SUPABASE_SERVICE_ROLE_KEY` must **never** be imported in any file that runs client-side. The Cursor agent rules enforce this, but double-check on every PR.

---

## Mobile Apps (iOS + Android) with Paid AI Access

The repository now includes an Expo mobile workspace at `mobile/` that builds both iOS and Android apps.

- **Mobile login** remains available without payment.
- **Mobile AI chat access** is gated by active paid subscription status.
- **Website donation flow** remains optional/public (`/donate`) so visitors can help keep web access free.
- **Mobile price** is **$2.99/month** using Stripe price ID:
  - `price_1TFiZiJF6bibA8neZPyI4H3c`
- Tax is **not included** in that list price (store/platform tax rules apply).
- Coupon codes are enabled in checkout (`allow_promotion_codes: true`).
- Zero-dollar invoice totals are supported without requiring payment method collection (`payment_method_collection: if_required`).

### What was added

1. **DB collections for mobile subscriptions**
   - `mobile_subscriptions`: current entitlement status per user/provider/subscription.
   - `mobile_subscription_events`: audit log of lifecycle events.
   - Migration file: `supabase/migrations/202603270001_mobile_subscriptions.sql`

2. **Mobile subscription + entitlement APIs**
   - `POST /api/mobile/subscription/checkout`
   - `GET /api/mobile/subscription/status`
- `POST /api/mobile/subscription/webhook` (shared-secret protected)
  - `POST /api/mobile/chat` (mobile JSON chat endpoint with server-side entitlement gate)
   - `POST /api/mobile/chat` (mobile JSON chat endpoint with server-side entitlement gate)

3. **Web and mobile logout coverage**
   - Web persistent nav now includes logout controls.
   - Mobile app header includes a logout button.

---

## Mobile Local Setup

### 1) Install dependencies

From repo root:

```bash
pnpm install
```

This installs both web and `mobile/` workspace packages.

### 2) Configure mobile app runtime values

Edit `mobile/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-web-domain.com",
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "your-anon-key"
    }
  }
}
```

For local development:
- `apiUrl` can be your local tunnel URL or local network URL where the Next.js app is reachable by device/emulator.

### 3) Run mobile app

```bash
pnpm --filter mobile start
```

Optional platform commands:

```bash
pnpm --filter mobile ios
pnpm --filter mobile android
```

---

## Server Setup for Mobile Billing

### 1) Apply database migration

Run your normal Supabase migration flow for:

`supabase/migrations/202603270001_mobile_subscriptions.sql`

### 2) Set required server env vars

In production runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MOBILE_SUBSCRIPTION_WEBHOOK_SECRET`
- `OPENAI_API_KEY`

### 3) Stripe product/price

Mobile checkout route is pinned to:

- `price_1TFiZiJF6bibA8neZPyI4H3c` (`$2.99/month`)

If you need to rotate price IDs later, update:
- `src/app/api/mobile/subscription/checkout/route.ts`
- fallback references in Stripe webhook route.

---

## Stripe Webhooks for Subscription Monitoring

Configure Stripe webhook endpoint to your deployed app:

- `POST https://<your-domain>/api/webhooks/stripe`

Recommended subscribed events:
- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Behavior:
- Donation sponsorship logic remains in webhook.
- Mobile subscription lifecycle events now update:
  - `mobile_subscriptions`
  - `mobile_subscription_events`

---

## Mobile Store Event Webhook (Apple/Google Normalized)

For provider-side server adapters (App Store Server Notifications / Google RTDN), normalize incoming payloads and forward to:

- `POST https://<your-domain>/api/mobile/subscription/webhook`

Required header:

- `x-mobile-webhook-secret: <MOBILE_SUBSCRIPTION_WEBHOOK_SECRET>`

Required JSON shape:

```json
{
  "provider": "apple",
  "platform": "ios",
  "eventType": "DID_RENEW",
  "userId": "uuid",
  "productId": "com.iris.mobile.monthly",
  "externalCustomerId": "optional-customer-id",
  "externalSubscriptionId": "provider-subscription-id",
  "status": "active",
  "currentPeriodStart": "2026-03-01T00:00:00.000Z",
  "currentPeriodEnd": "2026-04-01T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "eventAt": "2026-03-27T12:00:00.000Z",
  "payload": {}
}
```

Supported status values:
- `active`
- `trialing`
- `grace_period`
- `past_due`
- `canceled`
- `expired`

---

## AI Gating Behavior (Web vs Mobile)

- **Web chat (`/api/chat`)**: unchanged access model (authenticated access).
- **Mobile chat (`/api/mobile/chat`)**:
  - Authenticated users can log in.
  - AI responses are blocked unless entitlement is active.
  - On lapse/expiration/cancellation, user can still log in but chat is disabled.

This ensures account access remains available while premium AI functionality is paid on mobile.

---

## Play Store (Android) Release Instructions

### 1) Play Console setup

1. Create app in Google Play Console.
2. Configure package ID to match `mobile/app.json`:
   - `android.package` (currently `com.iris.sobriety`).
3. Complete app content, data safety, privacy policy, and store listing sections.

### 2) Subscription product configuration

In Play Console Monetization:

1. Create subscription product for monthly AI access.
2. Set base plan price to `2.99 USD` (tax handling per Play region settings).
3. Enable intro offers/coupons/promotions as needed.
4. Ensure product identifiers map to your provider adapter that posts entitlement updates to `/api/mobile/subscription/webhook`.

### 3) Build Android artifact

Use EAS Build (recommended):

```bash
pnpm --filter mobile exec npx eas build -p android --profile production
```

Upload generated AAB to Play Console release track (internal testing first).

### 4) Verify entitlement flow

Before production:
1. Install test build via internal track.
2. Purchase subscription in test account.
3. Confirm `mobile_subscriptions` row becomes active.
4. Confirm AI chat unlocks.
5. Cancel/lapse test subscription and verify AI is gated but login remains.

---

## App Store (iOS) Release Instructions

### 1) App Store Connect setup

1. Create app in App Store Connect.
2. Configure bundle identifier to match `mobile/app.json`:
   - `ios.bundleIdentifier` (currently `com.iris.sobriety`).
3. Complete app metadata, privacy nutrition labels, and compliance forms.

### 2) Subscription product configuration

In App Store Connect:

1. Create auto-renewable subscription for monthly AI access.
2. Set U.S. storefront price equivalent to `2.99 USD` tier.
3. Configure introductory offers and promo offers as desired.
4. Wire App Store Server Notification processing (your provider adapter) to forward normalized events to `/api/mobile/subscription/webhook`.

### 3) Build iOS artifact

Use EAS Build (recommended):

```bash
pnpm --filter mobile exec npx eas build -p ios --profile production
```

Submit resulting build to TestFlight first, then App Review.

### 4) Verify entitlement flow

In TestFlight sandbox:
1. Sign in.
2. Purchase subscription.
3. Verify server updates entitlement.
4. Verify chat unlocks.
5. Expire/cancel and verify login still works while chat is gated.

---

## Deployment Checklist for Mobile Sales

Before enabling public sales:

- [ ] Migration applied in production (`mobile_subscriptions`, `mobile_subscription_events`)
- [ ] Stripe webhook configured and receiving events
- [ ] Mobile webhook secret configured and validated
- [ ] Provider adapter(s) forwarding Apple/Google events to mobile webhook route
- [ ] Mobile app `extra.apiUrl` points to production web API domain
- [ ] Subscription purchase unlock test passed
- [ ] Lapsed subscription gating test passed
- [ ] Donation website path remains publicly available
- [ ] Logout available in web nav and mobile header

---

## Authentication & Onboarding

### Sign-in methods

IRIS supports three ways for users to authenticate:

| Method | Supported | Notes |
|--------|-----------|-------|
| **Google OAuth** | ✅ Required | Primary recommended method — zero friction, no password needed |
| **Email + Password** | ✅ Supported | Show/hide password toggle on all password fields |
| **Anonymous (explore)** | ✅ Supported | Users can explore the app before committing; data is preserved on account creation |

### Auth pages

| Route | Purpose |
|-------|---------|
| `/login` | Sign in with email/password or Google |
| `/signup` | Create account with email/password or Google |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password (after clicking reset email link) |
| `/auth/callback` | OAuth + email link callback handler |
| `/onboarding` | 5-step preference wizard (accessible before account creation) |

### Onboarding flow

Users can follow two paths:

1. **Account-first** — `/signup` → create account (email or Google) → `/onboarding` wizard → `/dashboard`
2. **Explore-first** — `/onboarding` wizard (anonymous session) → prompted to create account at completion

Anonymous users are assigned a Supabase `user_id` on first visit. That same ID is preserved when they convert to a permanent account — **zero data loss**.

### Google OAuth setup (Supabase Dashboard)

1. In the Supabase Dashboard go to **Authentication → Providers → Google**.
2. Enable Google and paste your **Client ID** and **Client Secret** from the [Google Cloud Console](https://console.cloud.google.com/).
3. Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud.
4. To allow anonymous → Google account linking, enable **Allow Manual Linking** under **Authentication → Settings**.

### Password reset flow

1. User visits `/forgot-password` and submits their email.
2. Supabase sends a password reset email with a link that includes a `code` param.
3. The link targets `/auth/callback?next=/reset-password`.
4. The callback route exchanges the code for a session and redirects to `/reset-password`.
5. User sets a new password via the `ResetPasswordForm` (calls `supabase.auth.updateUser({ password })`).

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
