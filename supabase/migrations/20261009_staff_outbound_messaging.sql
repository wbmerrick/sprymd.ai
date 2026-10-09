-- Allow active clinicians to browse all patients (All Contacts) and start
-- outbound message threads so staff can relay info to any customer.

drop policy if exists "Providers select all patients for messaging" on public.patients;
create policy "Providers select all patients for messaging"
  on public.patients for select
  using (public.is_active_provider());

drop policy if exists "Providers insert patient threads" on public.message_threads;
create policy "Providers insert patient threads"
  on public.message_threads for insert
  with check (public.is_active_provider());

-- Atomic staff-outbound thread + first message (RLS-safe via security definer).
create or replace function public.create_staff_outbound_thread(
  p_patient_id uuid,
  p_subject text,
  p_body text,
  p_urgency text default 'routine'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_id uuid;
  v_user_id uuid := auth.uid();
  v_thread_id uuid;
  v_subject text := nullif(trim(coalesce(p_subject, '')), '');
  v_body text := nullif(trim(coalesce(p_body, '')), '');
  v_urgency text := lower(coalesce(p_urgency, 'routine'));
  v_preview text;
begin
  if v_user_id is null then
    raise exception 'auth_required';
  end if;
  if not public.is_active_provider() then
    raise exception 'staff_required';
  end if;
  if v_body is null then
    raise exception 'body_required';
  end if;
  if v_urgency not in ('routine', 'soon', 'urgent') then
    v_urgency := 'routine';
  end if;
  if v_subject is null then
    v_subject := 'Message from SpryMD care team';
  end if;

  select p.id into v_provider_id
  from public.providers p
  where p.user_id = v_user_id and p.active = true
  limit 1;

  if v_provider_id is null then
    raise exception 'provider_required';
  end if;

  if not exists (select 1 from public.patients where id = p_patient_id) then
    raise exception 'patient_not_found';
  end if;

  v_preview := left(regexp_replace(v_body, '\s+', ' ', 'g'), 160);

  insert into public.message_threads (
    patient_id,
    provider_id,
    subject,
    preview,
    status,
    urgency,
    patient_unread,
    staff_unread,
    updated_at
  ) values (
    p_patient_id,
    v_provider_id,
    v_subject,
    v_preview,
    'awaiting_patient',
    v_urgency,
    true,
    false,
    now()
  )
  returning id into v_thread_id;

  insert into public.messages (thread_id, sender_role, sender_user_id, body)
  values (v_thread_id, 'staff', v_user_id, v_body);

  return v_thread_id;
end;
$$;

grant execute on function public.create_staff_outbound_thread(uuid, text, text, text) to authenticated;
