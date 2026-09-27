-- Intake drafts, SOAP draft status, and visit session duration.
-- Apply after 20260921_telehealth_clinical.sql.

alter table public.consultation_notes
  add column if not exists status text not null default 'draft';

alter table public.consultation_notes
  drop constraint if exists consultation_notes_status_check;

alter table public.consultation_notes
  add constraint consultation_notes_status_check
  check (status in ('draft', 'signed'));

create table if not exists public.patient_intakes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  chief_complaints text[] not null default '{}',
  chief_complaint_detail text not null default '',
  past_medical_history text[] not null default '{}',
  past_medical_history_notes text not null default '',
  allergy_status text not null default 'unknown'
    check (allergy_status in ('unknown', 'none', 'has_allergies')),
  allergy_disclosure text not null default '',
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'submitted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visit_sessions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments (id) on delete cascade,
  patient_joined_at timestamptz,
  provider_joined_at timestamptz,
  both_joined_at timestamptz,
  ended_at timestamptz,
  duration_seconds int not null default 0 check (duration_seconds >= 0),
  video_vendor text not null default 'local-preview',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patient_intakes_patient_id_idx
  on public.patient_intakes (patient_id);

create index if not exists patient_intakes_appointment_id_idx
  on public.patient_intakes (appointment_id);

create or replace function public.can_access_appointment(p_appointment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.appointments a
    where a.id = p_appointment_id
      and (
        a.patient_id = public.current_patient_id()
        or a.provider_id = public.current_provider_id()
        or public.provider_has_patient(a.patient_id)
      )
  );
$$;

grant execute on function public.can_access_appointment(uuid) to authenticated;

alter table public.patient_intakes enable row level security;
alter table public.visit_sessions enable row level security;

drop policy if exists "Patients select own intakes" on public.patient_intakes;
create policy "Patients select own intakes"
  on public.patient_intakes for select
  using (patient_id = public.current_patient_id());

drop policy if exists "Patients insert own intakes" on public.patient_intakes;
create policy "Patients insert own intakes"
  on public.patient_intakes for insert
  with check (patient_id = public.current_patient_id());

drop policy if exists "Patients update own intakes" on public.patient_intakes;
create policy "Patients update own intakes"
  on public.patient_intakes for update
  using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

drop policy if exists "Providers select assigned intakes" on public.patient_intakes;
create policy "Providers select assigned intakes"
  on public.patient_intakes for select
  using (public.provider_has_patient(patient_id));

drop policy if exists "Participants select visit sessions" on public.visit_sessions;
create policy "Participants select visit sessions"
  on public.visit_sessions for select
  using (public.can_access_appointment(appointment_id));

drop policy if exists "Participants insert visit sessions" on public.visit_sessions;
create policy "Participants insert visit sessions"
  on public.visit_sessions for insert
  with check (public.can_access_appointment(appointment_id));

drop policy if exists "Participants update visit sessions" on public.visit_sessions;
create policy "Participants update visit sessions"
  on public.visit_sessions for update
  using (public.can_access_appointment(appointment_id))
  with check (public.can_access_appointment(appointment_id));

grant select, insert, update on public.patient_intakes to authenticated;
grant select, insert, update on public.visit_sessions to authenticated;
grant all on public.patient_intakes to service_role;
grant all on public.visit_sessions to service_role;
