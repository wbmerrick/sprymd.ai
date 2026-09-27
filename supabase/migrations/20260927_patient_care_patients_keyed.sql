-- Patient care domains keyed to public.patients (launch/ops identity).
-- Replaces localStorage sprymd_patient_care_v1 as source of truth.
-- Poll/refresh only — no realtime required.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Care tables
-- ---------------------------------------------------------------------------

create table if not exists public.care_treatments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
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

create table if not exists public.care_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  treatment_id uuid references public.care_treatments (id) on delete set null,
  label text not null,
  mode text not null check (mode in ('subscription', 'cart', 'refill')),
  total numeric(10,2) not null default 0,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'payment_pending', 'paid', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.care_subscriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  treatment_id uuid references public.care_treatments (id) on delete cascade,
  price numeric(10,2) not null,
  billing_cadence text not null default 'Monthly',
  next_charge_date date,
  autoship_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.care_shipments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  treatment_id uuid references public.care_treatments (id) on delete set null,
  medication_name text not null,
  next_shipment_date date,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'processing', 'shipped', 'delivered')),
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.care_notifications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  icon text not null default 'pill',
  title text not null,
  description text not null default '',
  dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.care_clinical_cases (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  patient_email text not null default '',
  treatment_id uuid references public.care_treatments (id) on delete set null,
  condition_id text,
  plan_name text,
  intake jsonb not null default '{}'::jsonb,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'needs_info', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.care_wearable_devices (
  id text not null,
  patient_id uuid not null references public.patients (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (patient_id, id)
);

create table if not exists public.care_wearable_readings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  device_id text not null,
  metric text not null,
  value double precision,
  unit text,
  recorded_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.care_body_profiles (
  patient_id uuid primary key references public.patients (id) on delete cascade,
  height_cm numeric,
  weight_lb numeric,
  target_weight_lb numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.care_body_goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  title text not null,
  metric text not null,
  target_value numeric,
  unit text,
  current_value numeric,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.care_patient_preferences (
  patient_id uuid primary key references public.patients (id) on delete cascade,
  dashboard_layout jsonb not null default '{}'::jsonb,
  oauth_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists care_treatments_patient_idx on public.care_treatments (patient_id);
create index if not exists care_orders_patient_idx on public.care_orders (patient_id);
create index if not exists care_subscriptions_patient_idx on public.care_subscriptions (patient_id);
create index if not exists care_shipments_patient_idx on public.care_shipments (patient_id);
create index if not exists care_notifications_patient_idx on public.care_notifications (patient_id);
create index if not exists care_clinical_cases_patient_idx on public.care_clinical_cases (patient_id);
create index if not exists care_clinical_cases_status_idx on public.care_clinical_cases (status);
create index if not exists care_wearable_readings_patient_idx on public.care_wearable_readings (patient_id, recorded_at desc);
create index if not exists care_body_goals_patient_idx on public.care_body_goals (patient_id);

-- ---------------------------------------------------------------------------
-- RLS helpers (reuse patients.user_id = auth.uid())
-- ---------------------------------------------------------------------------

create or replace function public.care_is_own_patient(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.patients p
    where p.id = p_patient_id and p.user_id = auth.uid()
  );
$$;

create or replace function public.care_is_active_provider()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.providers pr
    where pr.user_id = auth.uid() and pr.active = true
  );
$$;

alter table public.care_treatments enable row level security;
alter table public.care_orders enable row level security;
alter table public.care_subscriptions enable row level security;
alter table public.care_shipments enable row level security;
alter table public.care_notifications enable row level security;
alter table public.care_clinical_cases enable row level security;
alter table public.care_wearable_devices enable row level security;
alter table public.care_wearable_readings enable row level security;
alter table public.care_body_profiles enable row level security;
alter table public.care_body_goals enable row level security;
alter table public.care_patient_preferences enable row level security;

-- Patient own-row policies + provider read for clinical queues
do $$
declare
  t text;
begin
  foreach t in array array[
    'care_treatments',
    'care_orders',
    'care_subscriptions',
    'care_shipments',
    'care_notifications',
    'care_wearable_devices',
    'care_wearable_readings',
    'care_body_profiles',
    'care_body_goals',
    'care_patient_preferences'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select using (public.care_is_own_patient(patient_id) or public.care_is_active_provider())',
      t || '_select', t
    );
    execute format(
      'create policy %I on public.%I for insert with check (public.care_is_own_patient(patient_id) or public.care_is_active_provider())',
      t || '_insert', t
    );
    execute format(
      'create policy %I on public.%I for update using (public.care_is_own_patient(patient_id) or public.care_is_active_provider())',
      t || '_update', t
    );
    execute format(
      'create policy %I on public.%I for delete using (public.care_is_own_patient(patient_id) or public.care_is_active_provider())',
      t || '_delete', t
    );
  end loop;
end $$;

create policy care_clinical_cases_select on public.care_clinical_cases
  for select using (public.care_is_own_patient(patient_id) or public.care_is_active_provider());
create policy care_clinical_cases_insert on public.care_clinical_cases
  for insert with check (public.care_is_own_patient(patient_id) or public.care_is_active_provider());
create policy care_clinical_cases_update on public.care_clinical_cases
  for update using (public.care_is_own_patient(patient_id) or public.care_is_active_provider());
create policy care_clinical_cases_delete on public.care_clinical_cases
  for delete using (public.care_is_own_patient(patient_id) or public.care_is_active_provider());

-- Cap wearable readings retention helper (called from app after insert)
create or replace function public.care_prune_wearable_readings(p_patient_id uuid, p_keep int default 500)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.care_wearable_readings
  where id in (
    select id from public.care_wearable_readings
    where patient_id = p_patient_id
    order by recorded_at desc
    offset greatest(p_keep, 0)
  );
end;
$$;
