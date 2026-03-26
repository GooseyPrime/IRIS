# IRIS — Repo Audit & Agent To-Do List
_Full source audit against spec. March 25, 2026._

---

## Audit Method

Every file in the repo was read in full and cross-referenced against the
project plan. Gaps are confirmed by absence — not inferred. Each item states
exactly what file is missing or what code is wrong, and what the agent must do.

---

## 🔴 CRITICAL — Blocking Core Features

---

### TODO-01 · `/donate` page does not exist

**Gap:** `src/app/donate/page.tsx` is completely absent. The `.env.local.example`
references `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, proving intent —
but no implementation exists.

**Impact:** The entire "Guiding Light" funding model is missing. No visitor can donate.

**Agent task:**

Create `src/app/donate/page.tsx` as a **public page** (no auth required).

```
SECTION 1 — Hero
  Gold overline: "BECOME A GUIDING LIGHT"
  Serif headline: "Your $10/month gives one person a full year of recovery support."
  Sub-copy: brief statement about sponsoring access to AI-guided recovery for people
  who need it — keep it mission-focused, no personal names or origin story

SECTION 2 — Impact calculator
  Input: donor enters monthly amount
  Live output: "Your $X/month sponsors Y users per year"
  Formula: users = Math.floor((amount * 12) / 7.43)  ← $7.43/user/year from spec

SECTION 3 — Tier cards (5 cards)
  Spark       $10/mo   → 1 user/year    (recurring, mode: 'subscription')
  Ember       $25/mo   → 3 users/year   (recurring)
  Flame       $50/mo   → 6 users/year   (recurring)
  Beacon      $100/mo  → 13 users/year  (recurring)
  Lighthouse  $1,200   → 1 full year    (one-time, mode: 'payment')
  Each card: tier name, amount, impact line, CTA → POST /api/donate/checkout

SECTION 4 — How it works
  3 steps: You give → We match a user → They get IRIS free

Footer: "IRIS is a wellness companion, not a medical device."
```

Use existing design tokens. Gold (`#D4A843`) for tier highlights.
`'use client'` for the calculator interaction.

---

### TODO-02 · Stripe package not installed + zero API routes

**Gap:** `package.json` has no `stripe` dependency. No
`src/app/api/donate/checkout/route.ts`. No
`src/app/api/webhooks/stripe/route.ts` (README lists it in structure but
the file was never created).

**Agent task — REQUIRES APPROVAL (new npm dependency):**

```bash
pnpm add stripe
```

**Create `src/app/api/donate/checkout/route.ts`:**
```typescript
// POST — creates Stripe Checkout session
// Body: { tier: 'spark'|'ember'|'flame'|'beacon'|'lighthouse' }
// Returns: { url: string }
// Auth: NOT required (public)
// Server-only — uses STRIPE_SECRET_KEY

// Tier → Stripe price config map:
// spark:      { mode: 'subscription', amount: 1000,  interval: 'month' }
// ember:      { mode: 'subscription', amount: 2500,  interval: 'month' }
// flame:      { mode: 'subscription', amount: 5000,  interval: 'month' }
// beacon:     { mode: 'subscription', amount: 10000, interval: 'month' }
// lighthouse: { mode: 'payment',      amount: 120000 }

// success_url: /donate/thank-you?session_id={CHECKOUT_SESSION_ID}
// cancel_url:  /donate
```

**Create `src/app/api/webhooks/stripe/route.ts`:**
```typescript
// POST — Stripe webhook handler
// Verify signature with STRIPE_WEBHOOK_SECRET
// Handle: checkout.session.completed, invoice.paid, customer.subscription.deleted
// For Phase 1: log to console + return 200. Persist donations table in Phase 2.
// Auth: NOT required (Stripe calls this directly)
// Must use raw body — set config: { api: { bodyParser: false } }
```

---

### TODO-03 · `/donate` not whitelisted as public in middleware

**Gap:** `src/middleware.ts` `isPublicRoute` check:
```typescript
const isPublicRoute =
  pathname === '/' ||
  pathname.startsWith('/login') ||
  pathname.startsWith('/onboarding') ||
  pathname.startsWith('/api/webhooks')
```

`/donate` is absent. Any unauthenticated donor visiting `/donate` will be
redirected to `/login`, breaking the donor funnel entirely.

**Agent task — REQUIRES APPROVAL (middleware change):**

Edit `src/middleware.ts`:
```typescript
const isPublicRoute =
  pathname === '/' ||
  pathname.startsWith('/login') ||
  pathname.startsWith('/onboarding') ||
  pathname.startsWith('/donate') ||         // ← ADD
  pathname.startsWith('/api/donate') ||     // ← ADD
  pathname.startsWith('/api/webhooks')
```

---

### TODO-04 · `/settings` page does not exist — two broken production links

**Gap:** `src/app/(app)/settings/page.tsx` is completely absent. Two
production components link to it and will 404 for every user:

1. `src/components/dashboard/DashboardShell.tsx`:
   ```tsx
   <a href="/settings" ...>Settings</a>
   ```
2. `src/components/dashboard/SobrietyCounter.tsx` (NoDateState):
   ```tsx
   <a href="/settings" ...>Add sobriety date →</a>
   ```

The `nextjs.mdc` rule lists `(app)/settings/page.tsx` in the intended
structure. The `user_profiles` table has `sobriety_date`, `display_name`,
`tone_preference`, `triggers` — all editable fields.

**Agent task:**

Create `src/app/(app)/settings/page.tsx` + `loading.tsx` + `error.tsx`:
- Display name (text input → `user_profiles.display_name`)
- Sobriety date (date input → `user_profiles.sobriety_date`)
- Tone preference (reuse `StepTone.tsx` options)
- Triggers editor (reuse pattern from `StepTriggers.tsx`)
- Save via Server Action → `supabase.from('user_profiles').update(...)`
- "Back to dashboard" link

---

## 🟠 HIGH — Spec Requirements Not Implemented

---

### TODO-05 · Landing page is a stub — no Donate CTA, no brand story

**Gap:** `src/app/page.tsx` is 65 lines. It renders a title + 2 buttons.

**Missing per spec:**
- No `<nav>` with a **Donate** link (spec: gold color, top-level, prominent)
- No "How IRIS Works" section
- No "Become a Guiding Light" CTA linking to `/donate`
- No footer with legal disclaimer + links
- `TherapistFooter` exists but only renders inside `(app)/layout.tsx` —
  unauthenticated landing page visitors never see a disclaimer

**Agent task:**

Expand `src/app/page.tsx`:

```
NAV (sticky)
  Left: IRIS wordmark (serif)
  Right: Donate (gold, /donate) | Sign In

HERO (keep existing glass card, expand)
  Headline: "I Rise, I Shine" (existing)
  Sub-copy: concise mission statement about AI-guided sobriety support —
  no brand history, no personal names
  CTAs: "Begin Your Journey" + "Become a Guiding Light" (gold → /donate)

SECTION — How IRIS Works
  3 columns: Arrive → Be Heard → Rise, brief copy each

SECTION — Guiding Light CTA
  Dark card: "Sponsor someone's recovery for $0.62/month"
  Button → /donate

FOOTER
  Links: Donate | Sign In | Begin Journey
  Legal: "IRIS is a wellness companion, not a therapist or treatment provider."
  © 2026 InTellMe AI / The IRIS Project
```

---

### TODO-06 · GSAP not installed — vine animation cannot be built

**Gap:** `package.json` has no `gsap` dependency. The project plan
explicitly requires GSAP `DrawSVGPlugin` for the botanical vine animation
on the landing page. Without it, the signature visual that defines IRIS
cannot be implemented.

**Agent task — REQUIRES APPROVAL (new npm dependency):**

```bash
pnpm add gsap
```

Then in the landing page hero:
- SVG with `<path>` elements representing vine stems from the bottom-left
- GSAP timeline: `DrawSVGPlugin` draws paths from 0%→100% over ~4s
- After vines complete, text fades in word-by-word using staggered spans
- Use `@gsap/react` `useGSAP()` hook with proper cleanup
- Keep vine SVG abstract/botanical for Phase 1 — portrait composite in Phase 2
- Dynamic import with `ssr: false` to avoid hydration issues

---

### TODO-07 · Beta feedback form + NPS survey missing

**Gap:** Phase 3 Session 18 in README specifies a feedback form + NPS
micro-survey. The `feedback` table exists in `src/types/database.ts`.
`FeedbackSchema` exists in `src/types/index.ts`. But:

- No `src/app/(app)/feedback/page.tsx`
- No `src/app/api/feedback/route.ts`
- No link to it from the dashboard

**Agent task:**

Create `src/app/(app)/feedback/page.tsx`:
- NPS: "How likely are you to recommend IRIS to a friend in recovery?" (0–10 tap scale)
- Category selector: Bug | Suggestion | Praise | Other
- Comment textarea (max 2000 chars)
- Submit → POST `/api/feedback`
- Success state: "Thank you — your feedback shapes IRIS."
- `loading.tsx` sibling

Create `src/app/api/feedback/route.ts`:
- POST, auth required, Zod-validate with `FeedbackSchema`
- Insert to `feedback` table

Add link in `DashboardShell.tsx` nav: "Feedback" alongside "Settings".

---

## 🟡 MEDIUM — UX Deviation from Spec (Defer Until Above Complete)

---

### TODO-08 · Onboarding UX is a form wizard, not the cinematic LLM-driven experience

**Gap:** The spec states questions should arrive one by one, fading in and
out, driven by the LLM (max 10 questions, adaptively chosen), on a "world
class prestigious website with a monumental purpose."

What was built: `OnboardingWizard.tsx` is a traditional 5-step multi-field
form wizard with a progress bar and Back/Continue buttons. The data model is
correct. The UX is functional. But it does not match the spec.

**Do not rebuild until TODO-01 through TODO-07 are complete.**

**When ready:**

Replace `OnboardingWizard.tsx` with a single-question cinematic flow:
- Full black screen, single question fades in (opacity 0→1, 1.2s)
- User responds (text or select)
- Response fades current question out, next fades in
- Max 10 questions; driven by `POST /api/onboarding/next-question`
- GPT-4o system prompt weaves in AUDIT/DAST/PHQ-9/GAD-7/ASRS-6 conversationally
- On LLM confidence, persist scores to `assessments` + profile update
- Subtle gold dot progress at bottom — no Back button

Create `src/app/api/onboarding/next-question/route.ts`.

---

## 🔵 MINOR

---

### TODO-09 · README has wrong env file copy command

**Gap:** `README.md` says:
```bash
cp .env.example .env.local
```
The file is actually named `.env.local.example`. Should be:
```bash
cp .env.local.example .env.local
```

One line fix.

---

### TODO-10 · `/donate/thank-you` page needed for Stripe redirect

**Gap:** Stripe Checkout `success_url` needs a destination. Without it,
a completed payment redirects to a 404.

**Agent task:** Create `src/app/donate/thank-you/page.tsx`:
- "Thank you, Guiding Light." serif headline
- "Your gift is now sponsoring someone's recovery journey."
- CTA → `/`
- Public route — add `/donate/thank-you` to middleware whitelist in TODO-03

---

---

## 🔴 CRITICAL — Auth & Routing Broken End-to-End

---

### TODO-11 · Authentication routing is broken — no user state detection

**Observed failures:**
- Selecting Sign In routes to a page offering email or Google OAuth.
  Google OAuth authenticates successfully, then forces the user into the
  onboarding questionnaire — even if they have already completed it before.
  At the end of the questionnaire, a "Cannot save your information." error
  is thrown and there is no navigation escape. The user is stuck.
- There is no logic anywhere that detects what kind of user has just
  authenticated and routes them appropriately.
- The dashboard has no links to core app activities (chat, check-in,
  reflection, history, reminders) or to the user's profile.
- The `/donate` flow has no way to target a donation toward a specific user
  by email, nor does it distinguish between targeted and general donations.

**Root cause analysis:**

The `completeOnboarding` Server Action in
`src/app/(auth)/onboarding/_actions.ts` calls
`supabase.from('user_profiles').upsert(...)`. If Google OAuth creates an
`auth.users` record whose UUID does not yet have a matching row in
`user_profiles`, the upsert should work — but if Row Level Security denies
the write (e.g. the anon session created during onboarding is a different
user than the one Google OAuth just created), the insert silently fails and
returns the "Cannot save your information." error.

The deeper problem is that the app has no concept of user state. It must
detect and route all of the following scenarios:

---

**Agent task — Session A: Fix the "Cannot save" error for OAuth users**

In `src/app/(auth)/onboarding/_actions.ts`, after Google OAuth the
`auth.users` record exists but the anonymous session may not match.

Fix:
1. Before the upsert, call `supabase.auth.getUser()` and assert `user` is
   non-null and is the correct authenticated user.
2. Ensure the upsert `id` field is always set to `user.id` (the
   authenticated user's UUID — not an anonymous UUID from a prior session).
3. Add explicit error logging: log the full Supabase error object, not just
   a generic message. This will expose the real cause (likely an RLS
   violation or UUID mismatch).
4. After a successful upsert, call `redirect('/dashboard')` — currently
   this only fires if `result.success` is true, but if the redirect itself
   throws, the error is swallowed. Wrap the redirect outside the try/catch.

Also check `src/middleware.ts`: after Google OAuth callback, Supabase SSR
requires the middleware to refresh the session cookie. Confirm the
`getUser()` call in middleware is executing correctly for OAuth callbacks —
the OAuth exchange happens at `/auth/callback` which must be whitelisted:

```typescript
const isPublicRoute =
  pathname === '/' ||
  pathname.startsWith('/login') ||
  pathname.startsWith('/onboarding') ||
  pathname.startsWith('/donate') ||
  pathname.startsWith('/api/donate') ||
  pathname.startsWith('/api/webhooks') ||
  pathname.startsWith('/auth/callback')   // ← ADD if missing
```

Create `src/app/auth/callback/route.ts` if it does not exist:
```typescript
// GET handler — Supabase OAuth exchange
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/redirect'

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
```

---

**Agent task — Session B: Build the user state detection + routing layer**

Create `src/app/auth/redirect/route.ts` — a server-side routing handler
that runs immediately after login/OAuth and decides where to send the user:

```typescript
// GET /auth/redirect
// Reads the authenticated user's profile and routes based on state:
//
// CASE 1 — No user_profiles row OR onboarding_completed = false
//   → redirect('/onboarding')
//   This covers: brand new users, users who started onboarding but didn't finish
//
// CASE 2 — user_profiles row exists AND onboarding_completed = true
//   → redirect('/dashboard')
//   This covers: returning users who have already completed onboarding
//
// CASE 3 — No authenticated user
//   → redirect('/login')
```

Update `src/components/auth/LoginForm.tsx`:
- After successful `signInWithPassword`, redirect to `/auth/redirect`
  instead of hardcoded `/dashboard`
- Google OAuth `redirectTo` option must also point to `/auth/callback`
  which then routes to `/auth/redirect`

Update `src/app/(auth)/onboarding/_actions.ts`:
- `completeOnboarding` success path: `redirect('/dashboard')` — this is
  already present but confirm it fires after a verified successful upsert,
  not optimistically

---

**Agent task — Session C: Rebuild the dashboard with full navigation**

`src/app/(app)/dashboard/page.tsx` currently renders a sobriety counter
and two placeholder cards ("Evening Reflection" and "Talk to IRIS") plus
two more ("Past Sessions" and "Reminders"). These are `<a>` tags with
`href` values but no further context. The "Settings" link in
`DashboardShell.tsx` already exists but points to a 404 (TODO-04).

Replace `PlaceholderCard` instances with real navigation cards covering
all core app activities:

```
PRIMARY CARDS (2-column grid)
  Morning Check-in    → /check-in
  Talk to IRIS        → /chat

SECONDARY CARDS (2-column grid)
  Evening Reflection  → /reflection
  Past Sessions       → /history

TERTIARY CARDS (2-column grid)
  Reminders           → /reminders
  My Profile          → /settings   ← links to TODO-04 settings page

BOTTOM LINK (subtle)
  Give Feedback       → /feedback   ← links to TODO-07 feedback page
```

Each card must show title, one-line description, and be a real `<Link>`.
Remove `comingSoon` flag and placeholder styling — every route listed above
either exists or will exist by the time the session queue completes.

The nav bar in `DashboardShell.tsx` should show:
```
Left:  IRIS (wordmark)
Right: My Profile | Give Feedback | Settings
```

---

**Agent task — Session D: User profile page populated from onboarding data**

The settings page (TODO-04) doubles as the user profile. When the user
navigates to `/settings` after completing onboarding, all fields must be
**pre-populated** from `user_profiles` — not blank.

The Server Component in `src/app/(app)/settings/page.tsx` must:
1. Fetch the authenticated user's `user_profiles` row on load
2. Pass all existing values as props to the client form components
3. The form pre-fills: display name, sobriety date, substances, goals,
   triggers, tone preference
4. On save, update only the changed fields via Server Action

This is critical because the profile IS the onboarding data — the user
should feel continuity between what they entered during onboarding and
what they see in their profile. It must not appear blank.

---

**Agent task — Session E: Extend donate page for targeted vs general donations**

The donate page (TODO-01) must support two distinct donation intents, both
accessible without authentication:

**Path A — General donation (existing design in TODO-01)**
User visits `/donate`, picks a tier, completes Stripe Checkout.
Donation is logged to the general pool. IRIS matches any available user.

**Path B — Targeted donation (sponsor a specific person)**
Add a section to `/donate` below the tier cards:

```
SECTION — Sponsor Someone You Know
  Heading: "Know someone who could use IRIS?"
  Sub-copy: "Enter their email and we'll credit their account when they sign up."
  Email input (validated)
  Amount selector (same tier options)
  CTA: "Send a Guiding Light"
```

When submitted via `POST /api/donate/checkout`:
- Pass `{ tier, recipientEmail }` in the request body
- Store `recipientEmail` in Stripe Checkout `metadata`
- In the webhook handler (`checkout.session.completed`), if `recipientEmail`
  is present, look up the `user_profiles` row by matching against
  `auth.users.email`. If found, mark the user's `account_tier` as
  `'sponsor'`. If not found, store the email in a `pending_sponsorships`
  table so it can be applied when that email registers in future.

Add `pending_sponsorships` table to `src/types/database.ts` stub:
```typescript
pending_sponsorships: {
  Row: {
    id: string
    created_at: string
    recipient_email: string
    stripe_session_id: string
    tier: string
    applied: boolean
    applied_at: string | null
  }
  // Insert / Update shapes follow same pattern
}
```

RLS: service role only for writes (webhook handler uses service role key).
Reads: only if `auth.users.email = recipient_email` (allows the user to
see on login that a sponsorship is waiting for them).

Note: applying a pending sponsorship on new user registration requires
a Supabase auth hook or a check in `completeOnboarding` — look up
`pending_sponsorships` by the newly registered user's email and apply if found.

---

## Summary Table

| # | Severity | File(s) | Status |
|---|----------|---------|--------|
| 01 | 🔴 | `src/app/donate/page.tsx` | Missing entirely |
| 02 | 🔴 | `src/app/api/donate/checkout/route.ts` · `webhooks/stripe/route.ts` | Missing — `stripe` pkg not installed |
| 03 | 🔴 | `src/middleware.ts` | `/donate` not public — blocks donor funnel |
| 04 | 🔴 | `src/app/(app)/settings/page.tsx` | Missing — 2 broken links in production |
| 05 | 🟠 | `src/app/page.tsx` | Stub — no Donate CTA, no brand story |
| 06 | 🟠 | `package.json` | `gsap` not installed |
| 07 | 🟠 | `src/app/(app)/feedback/page.tsx` · `/api/feedback/route.ts` | Missing |
| 08 | 🟡 | `src/app/(auth)/onboarding/` | Works but wrong UX — defer |
| 09 | 🔵 | `README.md` | Wrong env copy command |
| 10 | 🔵 | `src/app/donate/thank-you/page.tsx` | Missing — Stripe redirect target |
| 11A | 🔴 | `src/app/(auth)/onboarding/_actions.ts` · `src/app/auth/callback/route.ts` | OAuth save error + missing callback route |
| 11B | 🔴 | `src/app/auth/redirect/route.ts` · `LoginForm.tsx` | No user state detection or routing |
| 11C | 🔴 | `src/app/(app)/dashboard/page.tsx` · `DashboardShell.tsx` | Dashboard missing all navigation links |
| 11D | 🔴 | `src/app/(app)/settings/page.tsx` | Profile not pre-populated from onboarding data |
| 11E | 🟠 | `src/app/donate/page.tsx` · `/api/donate/checkout/route.ts` · `database.ts` | Targeted donation path + `pending_sponsorships` table missing |

---

## Execution Order

```
TODO-09   (5 min — README typo, zero risk)
TODO-11A  (1 session — fix OAuth save error + callback route, REQUIRES APPROVAL: middleware)
TODO-11B  (1 session — user state detection + routing layer)
TODO-11C  (1 session — dashboard navigation rebuild)
TODO-04   (1 session — settings page, pre-populated per TODO-11D)
TODO-11D  (included in TODO-04 session — profile pre-population)
TODO-07   (1 session — feedback page + API)
TODO-10   (30 min — thank-you page)
TODO-03   (1 session — middleware public route additions, REQUIRES APPROVAL)
TODO-02   (1 session — stripe install + API routes, REQUIRES APPROVAL for new dep)
TODO-11E  (1 session — targeted donate path + pending_sponsorships, depends on 02)
TODO-01   (1 session — donate page UI, depends on 02 + 03 + 11E)
TODO-05   (1 session — landing page rebuild)
TODO-06   (1 session — gsap install + vine animation, REQUIRES APPROVAL for new dep)
TODO-08   (2–3 sessions — onboarding UX overhaul, AFTER ALL ABOVE)
```

_Each task runs in its own Cursor session per AGENTS.md discipline._
_Approval-gated items (11A middleware, 03, 02, 06) must be explicitly approved before execution._
