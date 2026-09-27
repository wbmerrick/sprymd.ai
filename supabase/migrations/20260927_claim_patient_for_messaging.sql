-- Allow signed-in users to claim a prior guest checkout patient row (null user_id)
-- or create their own. Needed because Patients SELECT RLS only allows auth.uid() = user_id,
-- so guest rows are invisible and unique(email) blocks a second insert — messaging failed silently.

create or replace function public.claim_or_create_patient(
  p_email text,
  p_full_name text default '',
  p_date_of_birth date default null,
  p_phone text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  pid uuid;
  existing_uid uuid;
  normalized_email text := lower(trim(coalesce(p_email, '')));
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if normalized_email = '' then
    raise exception 'Email required';
  end if;

  select id into pid
  from public.patients
  where user_id = uid
  limit 1;
  if pid is not null then
    return pid;
  end if;

  select id, user_id into pid, existing_uid
  from public.patients
  where lower(email) = normalized_email
  limit 1;

  if pid is not null then
    if existing_uid is null then
      update public.patients
      set
        user_id = uid,
        full_name = coalesce(nullif(trim(coalesce(p_full_name, '')), ''), full_name),
        date_of_birth = coalesce(p_date_of_birth, date_of_birth),
        phone = coalesce(nullif(trim(coalesce(p_phone, '')), ''), phone),
        updated_at = now()
      where id = pid;
      return pid;
    end if;
    if existing_uid = uid then
      return pid;
    end if;
    raise exception 'Patient email already linked to another account';
  end if;

  insert into public.patients (user_id, email, full_name, date_of_birth, phone)
  values (
    uid,
    normalized_email,
    coalesce(nullif(trim(coalesce(p_full_name, '')), ''), split_part(normalized_email, '@', 1)),
    p_date_of_birth,
    coalesce(p_phone, '')
  )
  returning id into pid;

  return pid;
end;
$$;

revoke all on function public.claim_or_create_patient(text, text, date, text) from public;
grant execute on function public.claim_or_create_patient(text, text, date, text) to authenticated;
