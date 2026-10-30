create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  due_date date,
  status text not null default 'Pending'
    check (status in ('Pending', 'In progress', 'Completed')),
  created_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks(user_id);
alter table public.tasks enable row level security;

create policy "Read own tasks" on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Add own tasks" on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Update own tasks" on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Delete own tasks" on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.tasks from anon;
grant select, insert, update, delete on public.tasks to authenticated;
