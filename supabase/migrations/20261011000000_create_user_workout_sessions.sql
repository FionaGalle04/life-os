create table public.workout_sessions (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session jsonb not null check (jsonb_typeof(session) = 'object' and session ->> 'id' = id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workout_sessions enable row level security;

grant select, insert, update, delete on public.workout_sessions to authenticated;

create policy "Users can read their own workout sessions"
  on public.workout_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own workout sessions"
  on public.workout_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own workout sessions"
  on public.workout_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own workout sessions"
  on public.workout_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);
