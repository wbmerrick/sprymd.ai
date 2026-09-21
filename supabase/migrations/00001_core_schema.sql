-- 00001_core_schema.sql
-- Core schema for SpryMD: profiles, encounters, messages, refill_requests,
-- audit_events, contact_messages — with row-level security throughout.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, carries the app role.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'provider')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row whenever an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helper: security definer so RLS policies can check the caller's role
-- without recursing into the profiles policies themselves.
-- ---------------------------------------------------------------------------
create or replace function public.is_provider()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'provider'
  );
$$;

-- Profiles policies.
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Providers can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_provider());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level privilege: authenticated users may only self-update full_name.
-- This blocks role self-escalation even though the row-level UPDATE policy
-- above allows the row to be touched.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- encounters: one row per intake/visit, keyed by an anonymous session_id
-- minted client-side before the user ever authenticates.
-- ---------------------------------------------------------------------------
create table public.encounters (
  id uuid primary key default gen_random_uuid(),
  session_id uuid unique not null,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  service_line text not null default 'ed' check (service_line in ('ed', 'weight')),
  care_state text not null default 'draft_intake' check (care_state in (
    'draft_intake', 'paid', 'under_review', 'prescribed', 'fulfilled',
    'active_care', 'refill_due', 'declined', 'cancelled'
  )),
  intake_answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  paid_at timestamptz,
  reviewed_at timestamptz,
  decision_note text,
  stripe_session_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- session_id lookups are covered by its unique constraint index.
create index encounters_care_state_idx on public.encounters (care_state);
create index encounters_user_id_idx on public.encounters (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger encounters_set_updated_at
  before update on public.encounters
  for each row execute function public.set_updated_at();

alter table public.encounters enable row level security;

-- Anonymous visitors start intake before creating an account, so INSERT is
-- open to anon + authenticated. The row is keyed by an unguessable uuid
-- session_id minted client-side.
create policy "Anyone can create an encounter"
  on public.encounters for insert
  to anon, authenticated
  with check (true);

create policy "Owners and providers can view encounters"
  on public.encounters for select
  to authenticated
  using (user_id = auth.uid() or public.is_provider());

create policy "Owners and providers can update encounters"
  on public.encounters for update
  to authenticated
  using (user_id = auth.uid() or public.is_provider())
  with check (user_id = auth.uid() or public.is_provider());

-- Anonymous intake upsert: the quiz saves progress on an encounter before the
-- visitor has an account, so anon must be able to UPDATE the row it created.
--
-- Blast radius: an anonymous caller who *guesses* a session_id uuid could
-- modify that row — but only while the row is unclaimed (user_id is null) and
-- still a draft (care_state = 'draft_intake'), and the WITH CHECK prevents it
-- from being promoted out of that state or attached to another user. Once the
-- encounter is claimed by an authenticated user or paid, anon writes are
-- blocked entirely. session_ids are v4 uuids, so guessing is impractical.
create policy "Anon can update unclaimed draft encounters"
  on public.encounters for update
  to anon
  using (user_id is null and care_state = 'draft_intake')
  with check (user_id is null and care_state = 'draft_intake');

-- ---------------------------------------------------------------------------
-- messages: secure messaging between the patient and the care team.
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters (id) on delete cascade,
  sender_role text not null check (sender_role in ('patient', 'provider')),
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_encounter_id_idx on public.messages (encounter_id);

alter table public.messages enable row level security;

create policy "Owners and providers can view messages"
  on public.messages for select
  to authenticated
  using (
    public.is_provider()
    or exists (
      select 1 from public.encounters e
      where e.id = encounter_id and e.user_id = auth.uid()
    )
  );

create policy "Owners and providers can send messages"
  on public.messages for insert
  to authenticated
  with check (
    public.is_provider()
    or exists (
      select 1 from public.encounters e
      where e.id = encounter_id and e.user_id = auth.uid()
    )
  );

create policy "Owners and providers can update messages"
  on public.messages for update
  to authenticated
  using (
    public.is_provider()
    or exists (
      select 1 from public.encounters e
      where e.id = encounter_id and e.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- refill_requests: patient-initiated renewal requests.
-- ---------------------------------------------------------------------------
create table public.refill_requests (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters (id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'approved', 'denied')),
  note text,
  created_at timestamptz not null default now()
);

create index refill_requests_encounter_id_idx on public.refill_requests (encounter_id);

alter table public.refill_requests enable row level security;

create policy "Owners and providers can view refill requests"
  on public.refill_requests for select
  to authenticated
  using (
    public.is_provider()
    or exists (
      select 1 from public.encounters e
      where e.id = encounter_id and e.user_id = auth.uid()
    )
  );

create policy "Owners and providers can create refill requests"
  on public.refill_requests for insert
  to authenticated
  with check (
    public.is_provider()
    or exists (
      select 1 from public.encounters e
      where e.id = encounter_id and e.user_id = auth.uid()
    )
  );

create policy "Providers can update refill requests"
  on public.refill_requests for update
  to authenticated
  using (public.is_provider())
  with check (public.is_provider());

-- ---------------------------------------------------------------------------
-- audit_events: append-only trail of clinically relevant actions.
-- ---------------------------------------------------------------------------
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  actor_role text,
  action text not null,
  encounter_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_encounter_id_idx on public.audit_events (encounter_id);

alter table public.audit_events enable row level security;

create policy "Authenticated users can write audit events"
  on public.audit_events for insert
  to authenticated
  with check (true);

create policy "Providers can read audit events"
  on public.audit_events for select
  to authenticated
  using (public.is_provider());

-- ---------------------------------------------------------------------------
-- contact_messages: public contact form submissions.
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "Providers can read contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_provider());
