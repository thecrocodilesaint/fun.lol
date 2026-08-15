begin;

alter table public.app_users
  add column if not exists profile_handle text,
  add column if not exists profile_path text,
  add column if not exists profile_url text,
  add column if not exists dashboard_settings jsonb not null default '{}'::jsonb,
  add column if not exists role text not null default 'user',
  add column if not exists account_status text not null default 'active',
  add column if not exists account_status_updated_at timestamptz,
  add column if not exists snake_high_score integer not null default 0,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_skipped boolean not null default false,
  add column if not exists onboarding_updated_at timestamptz;

update public.app_users
set
  role = coalesce(nullif(role, ''), 'user'),
  account_status = coalesce(nullif(account_status, ''), 'active'),
  dashboard_settings = coalesce(dashboard_settings, '{}'::jsonb),
  snake_high_score = coalesce(snake_high_score, 0),
  onboarding_completed = coalesce(onboarding_completed, false),
  onboarding_skipped = coalesce(onboarding_skipped, false);

update public.app_users
set role = 'user'
where role not in ('user', 'admin');

update public.app_users
set account_status = 'active'
where account_status not in ('active', 'suspended', 'banned');

alter table public.app_users
  alter column role set default 'user',
  alter column role set not null,
  alter column account_status set default 'active',
  alter column account_status set not null,
  alter column dashboard_settings set default '{}'::jsonb,
  alter column dashboard_settings set not null,
  alter column snake_high_score set default 0,
  alter column snake_high_score set not null,
  alter column onboarding_completed set default false,
  alter column onboarding_completed set not null,
  alter column onboarding_skipped set default false,
  alter column onboarding_skipped set not null;

alter table public.app_users
  drop constraint if exists app_users_role_check,
  add constraint app_users_role_check check (role in ('user', 'admin'));

alter table public.app_users
  drop constraint if exists app_users_account_status_check,
  add constraint app_users_account_status_check check (account_status in ('active', 'suspended', 'banned'));

drop view if exists public.app_user_profiles;

create view public.app_user_profiles as
select
  u.id as user_id,
  u.email,
  u.created_at,
  u.account_status,
  u.account_status_updated_at,
  u.snake_high_score,
  u.dashboard_settings,
  u.onboarding_completed,
  u.onboarding_skipped,
  u.onboarding_updated_at,
  coalesce(u.profile_handle, p.handle) as profile_handle,
  coalesce(u.profile_path, p.data ->> 'profilePath', case when p.handle is not null then '/u/' || p.handle end) as profile_path,
  coalesce(u.profile_url, p.data ->> 'profileUrl') as profile_url,
  p.views,
  p.updated_at as profile_updated_at
from public.app_users u
left join lateral (
  select handle, views, updated_at, data
  from public.app_profiles
  where owner_user_id = u.id
  order by updated_at desc
  limit 1
) p on true;

commit;

notify pgrst, 'reload schema';
