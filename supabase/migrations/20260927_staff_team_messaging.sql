-- Internal staff ↔ staff messaging (providers only)

create table if not exists public.staff_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  preview text not null default '',
  urgency text not null default 'routine'
    check (urgency in ('routine', 'soon', 'urgent')),
  created_by_provider_id uuid not null references public.providers (id) on delete cascade,
  -- null recipient = whole care team; set for direct message to one colleague
  recipient_provider_id uuid references public.providers (id) on delete set null,
  status text not null default 'open'
    check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_threads_updated_at_idx on public.staff_threads (updated_at desc);
create index if not exists staff_threads_recipient_idx on public.staff_threads (recipient_provider_id);
create index if not exists staff_threads_created_by_idx on public.staff_threads (created_by_provider_id);

create table if not exists public.staff_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.staff_threads (id) on delete cascade,
  sender_provider_id uuid not null references public.providers (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists staff_messages_thread_created_idx
  on public.staff_messages (thread_id, created_at);

alter table public.staff_threads enable row level security;
alter table public.staff_messages enable row level security;

create policy "Providers select staff threads"
  on public.staff_threads for select
  using (public.is_active_provider());

create policy "Providers insert staff threads"
  on public.staff_threads for insert
  with check (
    public.is_active_provider()
    and created_by_provider_id = public.current_provider_id()
  );

create policy "Providers update staff threads"
  on public.staff_threads for update
  using (public.is_active_provider())
  with check (public.is_active_provider());

create policy "Providers select staff messages"
  on public.staff_messages for select
  using (public.is_active_provider());

create policy "Providers insert staff messages"
  on public.staff_messages for insert
  with check (
    public.is_active_provider()
    and sender_provider_id = public.current_provider_id()
  );
