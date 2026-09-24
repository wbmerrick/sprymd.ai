-- Guest cash-pay patients (no auth.users yet) + payment ledger + provider insert RLS.
-- Apply AFTER 20260921_telehealth_clinical.sql and 20260921_intake_and_visits.sql.

-- ---------------------------------------------------------------------------
-- Guests may check out with email only (user_id filled when they sign up later)
-- ---------------------------------------------------------------------------

alter table public.patients
  alter column user_id drop not null;

create unique index if not exists patients_email_lower_uidx
  on public.patients (lower(email));

-- ---------------------------------------------------------------------------
-- Providers may insert their own row (seed / self-serve onboarding)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'providers'
      and policyname = 'Providers insert own row'
  ) then
    create policy "Providers insert own row"
      on public.providers for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Payment ledger (receipts / refunds / failures)
-- ---------------------------------------------------------------------------

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  appointment_id uuid references public.appointments (id) on delete set null,
  patient_id uuid references public.patients (id) on delete set null,
  event_type text not null,
  amount_cents int,
  currency text not null default 'usd',
  status text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_appointment_id_idx
  on public.payment_events (appointment_id);

create index if not exists payment_events_patient_id_idx
  on public.payment_events (patient_id);

create index if not exists payment_events_session_id_idx
  on public.payment_events (stripe_checkout_session_id);

create index if not exists payment_events_created_at_idx
  on public.payment_events (created_at desc);

alter table public.payment_events enable row level security;

-- Patients see ledger rows for their own appointments
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_events'
      and policyname = 'Patients select own payment events'
  ) then
    create policy "Patients select own payment events"
      on public.payment_events for select
      using (
        patient_id = public.current_patient_id()
        or appointment_id in (
          select id from public.appointments
          where patient_id = public.current_patient_id()
        )
      );
  end if;
end $$;

grant select on public.payment_events to authenticated;
grant all on public.payment_events to service_role;

-- ---------------------------------------------------------------------------
-- Visit reminder bookkeeping (cron/worker fills these later)
-- ---------------------------------------------------------------------------

alter table public.appointments
  add column if not exists reminder_sent_at timestamptz;

alter table public.appointments
  add column if not exists reminder_due_at timestamptz;
