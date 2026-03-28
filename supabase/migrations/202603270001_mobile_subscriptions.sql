create extension if not exists pgcrypto;

create table if not exists public.mobile_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('stripe', 'apple', 'google')),
  platform text not null check (platform in ('ios', 'android')),
  product_id text not null,
  external_customer_id text,
  external_subscription_id text not null,
  status text not null check (status in ('active', 'trialing', 'grace_period', 'past_due', 'canceled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  latest_event_at timestamptz not null default timezone('utc'::text, now()),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists mobile_subscriptions_provider_external_subscription_idx
  on public.mobile_subscriptions (provider, external_subscription_id);

create index if not exists mobile_subscriptions_user_id_idx
  on public.mobile_subscriptions (user_id);

create index if not exists mobile_subscriptions_user_status_end_idx
  on public.mobile_subscriptions (user_id, status, current_period_end desc);

alter table public.mobile_subscriptions enable row level security;

drop policy if exists "mobile_subscriptions_select_own" on public.mobile_subscriptions;
create policy "mobile_subscriptions_select_own"
  on public.mobile_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.mobile_subscription_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  provider text not null check (provider in ('stripe', 'apple', 'google')),
  platform text not null check (platform in ('ios', 'android')),
  event_type text not null,
  external_subscription_id text,
  status text check (status in ('active', 'trialing', 'grace_period', 'past_due', 'canceled', 'expired')),
  event_at timestamptz not null default timezone('utc'::text, now()),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists mobile_subscription_events_user_id_idx
  on public.mobile_subscription_events (user_id, event_at desc);

create index if not exists mobile_subscription_events_provider_external_subscription_idx
  on public.mobile_subscription_events (provider, external_subscription_id, event_at desc);

alter table public.mobile_subscription_events enable row level security;

drop policy if exists "mobile_subscription_events_select_own" on public.mobile_subscription_events;
create policy "mobile_subscription_events_select_own"
  on public.mobile_subscription_events
  for select
  to authenticated
  using (auth.uid() = user_id);
