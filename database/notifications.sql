-- Notifications schema for ScoutConnect

-- Drop existing table if needed (WARNING: this will delete all data)
-- Uncomment the line below if you want to recreate the table from scratch
-- drop table if exists public.notifications cascade;

-- Create table or add missing column if table exists
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid null references auth.users(id) on delete set null,
  type text not null,
  title text null,
  body text null,
  link text null,
  metadata jsonb null,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Add missing columns if they don't exist (for existing tables)
do $$
begin
  -- Add actor_id
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'actor_id'
  ) then
    alter table public.notifications add column actor_id uuid null references auth.users(id) on delete set null;
  end if;

  -- Add body
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'body'
  ) then
    alter table public.notifications add column body text null;
  end if;

  -- Add link
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'link'
  ) then
    alter table public.notifications add column link text null;
  end if;

  -- Add metadata
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'metadata'
  ) then
    alter table public.notifications add column metadata jsonb null;
  end if;

  -- Add read_at
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'read_at'
  ) then
    alter table public.notifications add column read_at timestamptz null;
  end if;

  -- Add created_at
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'created_at'
  ) then
    alter table public.notifications add column created_at timestamptz not null default now();
  end if;

  -- Drop message column if it exists (rename it to body if you want to keep data)
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'notifications' and column_name = 'message'
  ) then
    -- Copy data from message to body if body is empty
    update public.notifications set body = message where body is null and message is not null;
    -- Drop message column
    alter table public.notifications drop column message;
  end if;
end $$;

-- Helpful indexes
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;

-- RLS policies
alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_select_self'
  ) then
    create policy notifications_select_self on public.notifications
      for select using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_insert_authenticated'
  ) then
    create policy notifications_insert_authenticated on public.notifications
      for insert to authenticated with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update_self'
  ) then
    create policy notifications_update_self on public.notifications
      for update using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
end $$;

