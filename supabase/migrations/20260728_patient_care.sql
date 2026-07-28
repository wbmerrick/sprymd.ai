-- Patient care schema for SpryMD
-- Apply in Supabase SQL editor (or `supabase db push`) when ready.
-- Enables multi-device persistence with RLS once Auth users exist.

create extension if not exists "pgcrypto";

create table if not exists public.patient_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  dob date,
  phone text default '',
  address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  medication_name text not null,
  dosage text not null default '',
  goal text not null default '',
  category text not null default 'Protocol',
  start_date date not null default current_date,
  refill_through_date date,
  status text not null default 'pending'
    check (status in ('active', 'pending', 'expiring_soon', 'inactive')),
  refills_remaining int not null default 0,
  dosing_instructions text,
  storage text,
  how_it_works text,
  side_effects jsonb not null default '[]'::jsonb,
  troubleshooting text,
  warnings text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  treatment_id uuid references public.treatments (id) on delete set null,
  label text not null,
  mode text not null check (mode in ('subscription', 'cart', 'refill')),
  total numeric(10,2) not null default 0,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'payment_pending', 'paid', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  treatment_id uuid not null references public.treatments (id) on delete cascade,
  price numeric(10,2) not null,
  billing_cadence text not null default 'Monthly',
  next_charge_date date,
  autoship_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  treatment_id uuid references public.treatments (id) on delete set null,
  medication_name text not null,
  next_shipment_date date,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'processing', 'shipped', 'delivered')),
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  icon text not null default 'pill',
  title text not null,
  description text not null default '',
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  treatment_id uuid references public.treatments (id) on delete set null,
  condition_id text,
  intake jsonb not null default '{}'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'needs_info', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.patient_profiles (id) on delete cascade,
  subject text not null,
  preview text not null default '',
  status text not null default 'no_action'
    check (status in ('no_action', 'action_required')),
  updated_at timestamptz not null default now()
);

alter table public.patient_profiles enable row level security;
alter table public.treatments enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.shipments enable row level security;
alter table public.notifications enable row level security;
alter table public.clinical_cases enable row level security;
alter table public.message_threads enable row level security;

create policy "Patients read own profile" on public.patient_profiles
  for select using (auth.uid() = id);
create policy "Patients update own profile" on public.patient_profiles
  for update using (auth.uid() = id);
create policy "Patients insert own profile" on public.patient_profiles
  for insert with check (auth.uid() = id);

create policy "Patients own treatments" on public.treatments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Patients own orders" on public.orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Patients own subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Patients own shipments" on public.shipments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Patients own notifications" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Patients own clinical cases" on public.clinical_cases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Patients own messages" on public.message_threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
