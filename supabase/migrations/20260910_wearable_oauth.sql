-- OEM OAuth connections for wearable cloud sync
create table if not exists public.wearable_oauth_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_id text not null,
  connector text not null,
  device_kind text not null,
  external_user_id text,
  access_token_enc text,
  refresh_token_enc text,
  scopes text[] not null default '{}',
  expires_at timestamptz,
  status text not null default 'connected'
    check (status in ('pending', 'connected', 'expired', 'revoked', 'error')),
  sandbox boolean not null default false,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_kind)
);

alter table public.wearable_oauth_connections enable row level security;

create policy "Users manage own wearable oauth"
  on public.wearable_oauth_connections
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
