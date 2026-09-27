-- Telehealth clinical schema for SpryMD (cash-pay)
-- Apply in Supabase SQL editor (or `supabase db push`) when ready.
-- Adds patients / providers / appointments / notes with RLS.
-- Coexists with public.patient_profiles (do not drop or alter that table).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  date_of_birth date,
  phone text default '',
  state_of_residence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  npi text,
  license_states text[] not null default '{}',
  specialty text default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_patient_assignments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  active boolean not null default true,
  assigned_at timestamptz not null default now(),
  unique (provider_id, patient_id)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  provider_id uuid references public.providers (id) on delete set null,
  service_tier text not null,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'awaiting_payment', 'paid', 'completed', 'cancelled', 'no_show')),
  scheduled_at timestamptz,
  paid_at timestamptz,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultation_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete cascade,
  subjective text,
  objective text,
  assessment text,
  plan text,
  private_to_provider boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (FKs + appointment lookup columns)
-- ---------------------------------------------------------------------------

create index if not exists patients_user_id_idx
  on public.patients (user_id);

create index if not exists providers_user_id_idx
  on public.providers (user_id);

create index if not exists provider_patient_assignments_provider_id_idx
  on public.provider_patient_assignments (provider_id);

create index if not exists provider_patient_assignments_patient_id_idx
  on public.provider_patient_assignments (patient_id);

create index if not exists appointments_patient_id_idx
  on public.appointments (patient_id);

create index if not exists appointments_provider_id_idx
  on public.appointments (provider_id);

create index if not exists appointments_status_idx
  on public.appointments (status);

create index if not exists appointments_stripe_checkout_session_id_idx
  on public.appointments (stripe_checkout_session_id);

create index if not exists consultation_notes_appointment_id_idx
  on public.consultation_notes (appointment_id);

create index if not exists consultation_notes_patient_id_idx
  on public.consultation_notes (patient_id);

create index if not exists consultation_notes_provider_id_idx
  on public.consultation_notes (provider_id);

-- ---------------------------------------------------------------------------
-- SECURITY DEFINER helpers (search_path pinned to public)
-- ---------------------------------------------------------------------------

create or replace function public.current_patient_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.patients where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_provider_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.providers where user_id = auth.uid() limit 1;
$$;

create or replace function public.provider_has_patient(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.provider_patient_assignments
    where provider_id = public.current_provider_id()
      and patient_id = p_patient_id
      and active = true
  );
$$;

grant execute on function public.current_patient_id() to authenticated;
grant execute on function public.current_provider_id() to authenticated;
grant execute on function public.provider_has_patient(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.provider_patient_assignments enable row level security;
alter table public.appointments enable row level security;
alter table public.consultation_notes enable row level security;

-- Patients: own row
create policy "Patients select own row"
  on public.patients for select
  using (auth.uid() = user_id);

create policy "Patients update own row"
  on public.patients for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Patients insert own row"
  on public.patients for insert
  with check (auth.uid() = user_id);

-- Providers: SELECT assigned patients
create policy "Providers select assigned patients"
  on public.patients for select
  using (public.provider_has_patient(id));

-- Providers: own row
create policy "Providers select own row"
  on public.providers for select
  using (auth.uid() = user_id);

create policy "Providers update own row"
  on public.providers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Providers: ALL on own assignments
create policy "Providers manage own assignments"
  on public.provider_patient_assignments for all
  using (provider_id = public.current_provider_id())
  with check (provider_id = public.current_provider_id());

-- Patients: appointments
create policy "Patients select own appointments"
  on public.appointments for select
  using (patient_id = public.current_patient_id());

create policy "Patients insert own appointments"
  on public.appointments for insert
  with check (patient_id = public.current_patient_id());

create policy "Patients update own appointments"
  on public.appointments for update
  using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

-- Providers: appointments (assigned provider or active patient assignment)
create policy "Providers select appointments"
  on public.appointments for select
  using (
    provider_id = public.current_provider_id()
    or public.provider_has_patient(patient_id)
  );

create policy "Providers update appointments"
  on public.appointments for update
  using (
    provider_id = public.current_provider_id()
    or public.provider_has_patient(patient_id)
  )
  with check (
    provider_id = public.current_provider_id()
    or public.provider_has_patient(patient_id)
  );

-- Patients: non-private consultation notes
create policy "Patients select shared consultation notes"
  on public.consultation_notes for select
  using (
    patient_id = public.current_patient_id()
    and private_to_provider = false
  );

-- Providers: consultation notes for assigned patients
create policy "Providers select consultation notes"
  on public.consultation_notes for select
  using (
    provider_id = public.current_provider_id()
    and public.provider_has_patient(patient_id)
  );

create policy "Providers insert consultation notes"
  on public.consultation_notes for insert
  with check (
    provider_id = public.current_provider_id()
    and public.provider_has_patient(patient_id)
  );

create policy "Providers update consultation notes"
  on public.consultation_notes for update
  using (
    provider_id = public.current_provider_id()
    and public.provider_has_patient(patient_id)
  )
  with check (
    provider_id = public.current_provider_id()
    and public.provider_has_patient(patient_id)
  );

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant select, insert, update on public.patients to authenticated;
grant select, insert, update on public.providers to authenticated;
grant select, insert, update on public.provider_patient_assignments to authenticated;
grant select, insert, update on public.appointments to authenticated;
grant select, insert, update on public.consultation_notes to authenticated;

grant all on public.patients to service_role;
grant all on public.providers to service_role;
grant all on public.provider_patient_assignments to service_role;
grant all on public.appointments to service_role;
grant all on public.consultation_notes to service_role;
