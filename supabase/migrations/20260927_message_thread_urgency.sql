-- Urgency levels for patient → care-team messaging
alter table public.message_threads
  add column if not exists urgency text not null default 'routine'
  check (urgency in ('routine', 'soon', 'urgent'));

create index if not exists message_threads_urgency_idx
  on public.message_threads (urgency);
