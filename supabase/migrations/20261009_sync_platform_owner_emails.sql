-- Keep is_platform_owner() aligned with OWNER_EMAILS in masterAccount.ts
create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(coalesce(u.email, '')) in (
        'wbmerrick@gmail.com',
        'wbmerrick@sprymd.ai',
        'wbm22@sprymd.ai'
      )
  );
$$;
