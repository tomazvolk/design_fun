-- Leaky: run once in the Supabase SQL editor.

-- One row per user holding the app state (subscriptions, settings, budget) as JSON.
create table if not exists public.leaky_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.leaky_state enable row level security;

drop policy if exists "Users read their own state" on public.leaky_state;
drop policy if exists "Users insert their own state" on public.leaky_state;
drop policy if exists "Users update their own state" on public.leaky_state;
drop policy if exists "Users delete their own state" on public.leaky_state;

create policy "Users read their own state" on public.leaky_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert their own state" on public.leaky_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own state" on public.leaky_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own state" on public.leaky_state
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Lets a signed-in user delete their own account. The cascade removes their state row.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
