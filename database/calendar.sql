-- Calendar schema for ScoutConnect

-- ============================================
-- ENUMS
-- ============================================

-- Event types
DO $$ BEGIN
  CREATE TYPE event_type AS ENUM (
    'match',        -- Partido a scoutear
    'tryout',       -- Prueba/tryout
    'meeting',      -- Reunión
    'travel',       -- Viaje/traslado
    'deadline',     -- Deadline/vencimiento
    'reminder'      -- Recordatorio
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Event status
DO $$ BEGIN
  CREATE TYPE event_status AS ENUM (
    'scheduled',    -- Programado
    'done',         -- Completado
    'canceled',     -- Cancelado
    'postponed'     -- Postpuesto
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Event visibility
DO $$ BEGIN
  CREATE TYPE event_visibility AS ENUM (
    'private',      -- Solo el creador
    'team',         -- Equipo del creador
    'org'           -- Toda la organización
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Reminder methods
DO $$ BEGIN
  CREATE TYPE reminder_method AS ENUM (
    'inapp',        -- Notificación in-app
    'email',        -- Email
    'whatsapp'      -- WhatsApp
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- MAIN EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  
  -- Basic info
  title text not null,
  type event_type not null,
  status event_status not null default 'scheduled',
  
  -- Timing (UTC)
  start_at_utc timestamptz not null,
  end_at_utc timestamptz not null,
  all_day boolean not null default false,
  
  -- Location
  location text null,
  location_url text null,  -- Google Maps link
  
  -- Details
  description text null,
  notes text null,
  
  -- Type-specific fields (JSONB for flexibility)
  metadata jsonb null default '{}'::jsonb,
  
  -- Visibility & permissions
  visibility event_visibility not null default 'private',
  organization_id uuid null,
  team_id uuid null,
  
  -- Recurrence (iCal RRULE format)
  recurrence_rule text null,
  recurrence_exceptions timestamptz[] null,
  parent_event_id uuid null references public.calendar_events(id) on delete cascade,
  
  -- Reminders
  reminders jsonb null default '[]'::jsonb,
  
  -- Attachments (links only)
  attachments jsonb null default '[]'::jsonb,
  
  -- Audit
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  canceled_reason text null,
  postponed_to_utc timestamptz null,
  
  -- External sync
  external_calendar_id text null,
  external_event_id text null,
  
  -- Constraints
  constraint valid_time_range check (end_at_utc > start_at_utc),
  constraint valid_duration check (
    all_day = true or 
    extract(epoch from (end_at_utc - start_at_utc)) >= 900
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS calendar_events_created_by_idx ON public.calendar_events(created_by);
CREATE INDEX IF NOT EXISTS calendar_events_start_idx ON public.calendar_events(start_at_utc);
CREATE INDEX IF NOT EXISTS calendar_events_type_idx ON public.calendar_events(type);
CREATE INDEX IF NOT EXISTS calendar_events_status_idx ON public.calendar_events(status);
CREATE INDEX IF NOT EXISTS calendar_events_org_idx ON public.calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS calendar_events_time_range_idx ON public.calendar_events USING btree (start_at_utc, end_at_utc);
CREATE INDEX IF NOT EXISTS calendar_events_metadata_gin_idx ON public.calendar_events USING gin (metadata);

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  
  -- Polymorphic participant
  entity_type text not null check (entity_type in ('scout', 'player', 'contact', 'team')),
  entity_id uuid not null,
  
  -- Role in event
  role text not null check (role in ('owner', 'cohost', 'guest', 'observer')),
  
  -- Response
  response text null check (response in ('accepted', 'declined', 'tentative', 'pending')),
  response_at timestamptz null,
  
  -- Audit
  added_by uuid not null references auth.users(id) on delete cascade,
  added_at timestamptz not null default now(),
  
  -- Unique constraint
  constraint unique_participant unique (event_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS calendar_participants_event_idx ON public.calendar_event_participants(event_id);
CREATE INDEX IF NOT EXISTS calendar_participants_entity_idx ON public.calendar_event_participants(entity_type, entity_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  mentions uuid[] null,
  
  -- Thread support
  parent_comment_id uuid null references public.calendar_event_comments(id) on delete cascade,
  
  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null
);

CREATE INDEX IF NOT EXISTS calendar_comments_event_idx ON public.calendar_event_comments(event_id);
CREATE INDEX IF NOT EXISTS calendar_comments_author_idx ON public.calendar_event_comments(author_id);
CREATE INDEX IF NOT EXISTS calendar_comments_created_idx ON public.calendar_event_comments(created_at desc);

-- ============================================
-- LINKS TABLE (Relations to other entities)
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_event_links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  
  -- Link type
  link_type text not null check (link_type in (
    'conversation', 'report', 'watchlist', 'pipeline', 'player', 'offer', 'fixture'
  )),
  target_id uuid not null,
  
  -- Metadata
  notes text null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  
  -- Unique constraint
  constraint unique_link unique (event_id, link_type, target_id)
);

CREATE INDEX IF NOT EXISTS calendar_links_event_idx ON public.calendar_event_links(event_id);
CREATE INDEX IF NOT EXISTS calendar_links_target_idx ON public.calendar_event_links(link_type, target_id);

-- ============================================
-- AVAILABILITY BLOCKS (for "Do Not Disturb" periods)
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_availability_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Time range
  start_at_utc timestamptz not null,
  end_at_utc timestamptz not null,
  
  -- Type
  block_type text not null check (block_type in ('focus', 'dnd', 'travel', 'pto')),
  reason text null,
  
  -- Recurrence
  recurrence_rule text null,
  
  -- Audit
  created_at timestamptz not null default now(),
  
  constraint valid_block_time check (end_at_utc > start_at_utc)
);

CREATE INDEX IF NOT EXISTS availability_blocks_user_idx ON public.calendar_availability_blocks(user_id);
CREATE INDEX IF NOT EXISTS availability_blocks_time_idx ON public.calendar_availability_blocks(start_at_utc, end_at_utc);

-- ============================================
-- SAVED FILTERS/VIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS calendar_saved_views_user_idx ON public.calendar_saved_views(user_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_saved_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CALENDAR_EVENTS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS calendar_events_select ON public.calendar_events;
DROP POLICY IF EXISTS calendar_events_insert ON public.calendar_events;
DROP POLICY IF EXISTS calendar_events_update ON public.calendar_events;
DROP POLICY IF EXISTS calendar_events_delete ON public.calendar_events;

-- Select: own events + public org events (simplified to avoid recursion)
CREATE POLICY calendar_events_select ON public.calendar_events
  FOR SELECT USING (
    created_by = auth.uid() OR
    visibility = 'org'
  );

-- Insert: authenticated users can create events
CREATE POLICY calendar_events_insert ON public.calendar_events
  FOR INSERT TO authenticated 
  WITH CHECK (created_by = auth.uid());

-- Update: only owner can update
CREATE POLICY calendar_events_update ON public.calendar_events
  FOR UPDATE USING (created_by = auth.uid());

-- Delete: only owner can delete
CREATE POLICY calendar_events_delete ON public.calendar_events
  FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- PARTICIPANTS POLICIES
-- ============================================

DROP POLICY IF EXISTS calendar_participants_select ON public.calendar_event_participants;
DROP POLICY IF EXISTS calendar_participants_insert ON public.calendar_event_participants;
DROP POLICY IF EXISTS calendar_participants_delete ON public.calendar_event_participants;

CREATE POLICY calendar_participants_select ON public.calendar_event_participants
  FOR SELECT USING (
    entity_id = auth.uid() OR
    added_by = auth.uid()
  );

CREATE POLICY calendar_participants_insert ON public.calendar_event_participants
  FOR INSERT TO authenticated
  WITH CHECK (added_by = auth.uid());

CREATE POLICY calendar_participants_delete ON public.calendar_event_participants
  FOR DELETE USING (
    added_by = auth.uid()
  );

-- ============================================
-- COMMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS calendar_comments_select ON public.calendar_event_comments;
DROP POLICY IF EXISTS calendar_comments_insert ON public.calendar_event_comments;
DROP POLICY IF EXISTS calendar_comments_update ON public.calendar_event_comments;
DROP POLICY IF EXISTS calendar_comments_delete ON public.calendar_event_comments;

CREATE POLICY calendar_comments_select ON public.calendar_event_comments
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY calendar_comments_insert ON public.calendar_event_comments
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY calendar_comments_update ON public.calendar_event_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY calendar_comments_delete ON public.calendar_event_comments
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- LINKS POLICIES
-- ============================================

DROP POLICY IF EXISTS calendar_links_select ON public.calendar_event_links;
DROP POLICY IF EXISTS calendar_links_insert ON public.calendar_event_links;
DROP POLICY IF EXISTS calendar_links_delete ON public.calendar_event_links;

CREATE POLICY calendar_links_select ON public.calendar_event_links
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY calendar_links_insert ON public.calendar_event_links
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY calendar_links_delete ON public.calendar_event_links
  FOR DELETE USING (created_by = auth.uid());

-- ============================================
-- AVAILABILITY BLOCKS POLICIES
-- ============================================

DROP POLICY IF EXISTS availability_blocks_all ON public.calendar_availability_blocks;

CREATE POLICY availability_blocks_all ON public.calendar_availability_blocks
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- SAVED VIEWS POLICIES
-- ============================================

DROP POLICY IF EXISTS calendar_saved_views_all ON public.calendar_saved_views;

CREATE POLICY calendar_saved_views_all ON public.calendar_saved_views
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_event_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS calendar_events_updated_at ON public.calendar_events;

-- Create trigger for calendar_events
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_event_timestamp();

-- Function to detect conflicts
CREATE OR REPLACE FUNCTION check_event_conflicts(
  p_user_id uuid,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_exclude_event_id uuid DEFAULT NULL
)
RETURNS TABLE(
  event_id uuid,
  title text,
  start_at timestamptz,
  end_at timestamptz,
  type event_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.start_at_utc,
    e.end_at_utc,
    e.type
  FROM public.calendar_events e
  WHERE 
    e.status = 'scheduled' AND
    (e.id != p_exclude_event_id OR p_exclude_event_id IS NULL) AND
    (
      e.created_by = p_user_id OR
      EXISTS (
        SELECT 1 FROM public.calendar_event_participants p
        WHERE p.event_id = e.id
        AND p.entity_type = 'scout'
        AND p.entity_id = p_user_id
      )
    ) AND
    -- Time overlap check
    tstzrange(e.start_at_utc, e.end_at_utc, '[)') && tstzrange(p_start_at, p_end_at, '[)');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Uncomment to insert sample data
/*
insert into public.calendar_events (
  title, type, start_at_utc, end_at_utc, location, 
  description, created_by, visibility, metadata
) values 
(
  'Partido Nacional vs Peñarol Sub-20',
  'match',
  now() + interval '2 days' + interval '15 hours',
  now() + interval '2 days' + interval '17 hours',
  'Estadio Gran Parque Central',
  'Observar mediocampistas',
  auth.uid(),
  'team',
  '{"competition": "Torneo Juvenil", "category": "Sub-20", "scouting_goals": ["Mediocampista central", "Lateral derecho"]}'::jsonb
),
(
  'Prueba Juan Pérez',
  'tryout',
  now() + interval '5 days' + interval '10 hours',
  now() + interval '5 days' + interval '11 hours 30 minutes',
  'Los Céspedes Training Center',
  'Evaluación física y técnica',
  auth.uid(),
  'private',
  '{"tests": ["Sprint 30m", "Conducción", "Pase largo", "Definición"], "duration_per_station": 20, "capacity": 1}'::jsonb
);
*/
