-- Akute EHR linkage + patient-chosen pharmacy + webhook idempotency + med status.
-- Apply after existing telehealth / intake migrations.

alter table public.patients
  add column if not exists akute_patient_id text,
  add column if not exists preferred_pharmacy jsonb,
  add column if not exists stripe_customer_id text;

create unique index if not exists patients_akute_patient_id_uidx
  on public.patients (akute_patient_id)
  where akute_patient_id is not null;

-- Idempotent Akute webhook deliveries
create table if not exists public.akute_webhook_events (
  event_id text primary key,
  resource text,
  event text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);

create index if not exists akute_webhook_events_processed_at_idx
  on public.akute_webhook_events (processed_at desc);

alter table public.akute_webhook_events enable row level security;

-- Patient-facing Rx status from Akute medication webhooks only (not billing)
create table if not exists public.akute_medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  akute_medication_id text not null,
  status text,
  drug_summary text,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (akute_medication_id)
);

create index if not exists akute_medications_patient_id_idx
  on public.akute_medications (patient_id);

alter table public.akute_medications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'akute_medications'
      and policyname = 'Patients select own akute medications'
  ) then
    create policy "Patients select own akute medications"
      on public.akute_medications for select
      using (patient_id = public.current_patient_id());
  end if;
end $$;
