-- Clinician pharmacy handoff fields for async cash-pay launch.
alter table public.appointments
  add column if not exists pharmacy_status text,
  add column if not exists pharmacy_notes text,
  add column if not exists pharmacy_sent_at timestamptz;

comment on column public.appointments.pharmacy_status is
  'queued | sent | held | declined — clinician pharmacy handoff';
comment on column public.appointments.pharmacy_notes is
  'Free-text Rx / pharmacy portal notes for ops';
