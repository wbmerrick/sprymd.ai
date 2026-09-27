-- Secure messaging between patients and providers/staff
-- Applied to clinical project jodcpflzbmhnnivtwghw

create or replace function public.is_active_provider()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.providers p
    where p.user_id = auth.uid() and p.active = true
  );
$$;

create or replace function public.current_patient_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id from public.patients p
  where p.user_id = auth.uid()
  limit 1;
$$;

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  provider_id uuid references public.providers (id) on delete set null,
  subject text not null,
  preview text not null default '',
  status text not null default 'awaiting_staff'
    check (status in ('open', 'awaiting_staff', 'awaiting_patient', 'closed')),
  urgency text not null default 'routine'
    check (urgency in ('routine', 'soon', 'urgent')),
  patient_unread boolean not null default false,
  staff_unread boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists message_threads_patient_id_idx on public.message_threads (patient_id);
create index if not exists message_threads_provider_id_idx on public.message_threads (provider_id);
create index if not exists message_threads_updated_at_idx on public.message_threads (updated_at desc);
create index if not exists message_threads_status_idx on public.message_threads (status);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  sender_role text not null check (sender_role in ('patient', 'staff')),
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_id_created_at_idx
  on public.messages (thread_id, created_at);

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;

create policy "Patients select own threads"
  on public.message_threads for select
  using (patient_id = public.current_patient_id());

create policy "Patients insert own threads"
  on public.message_threads for insert
  with check (patient_id = public.current_patient_id());

create policy "Patients update own threads"
  on public.message_threads for update
  using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

create policy "Providers select all threads"
  on public.message_threads for select
  using (public.is_active_provider());

create policy "Providers update all threads"
  on public.message_threads for update
  using (public.is_active_provider())
  with check (public.is_active_provider());

create policy "Patients select own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.message_threads t
      where t.id = thread_id and t.patient_id = public.current_patient_id()
    )
  );

create policy "Patients insert own messages"
  on public.messages for insert
  with check (
    sender_role = 'patient'
    and sender_user_id = auth.uid()
    and exists (
      select 1 from public.message_threads t
      where t.id = thread_id and t.patient_id = public.current_patient_id()
    )
  );

create policy "Providers select all messages"
  on public.messages for select
  using (public.is_active_provider());

create policy "Providers insert staff messages"
  on public.messages for insert
  with check (
    public.is_active_provider()
    and sender_role = 'staff'
    and sender_user_id = auth.uid()
  );
