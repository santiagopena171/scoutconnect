-- =============================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
-- ScoutConnect - Supabase
-- =============================================

-- 1. TABLA DE USUARIOS (profiles)
-- Extiende la tabla auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('jugador', 'scout')),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  birth_date DATE,
  nationality VARCHAR(100),
  city VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE JUGADORES (players)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  position VARCHAR(50),
  preferred_foot VARCHAR(20) CHECK (preferred_foot IN ('Derecha', 'Izquierda', 'Ambidiestro')),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  current_club VARCHAR(255),
  country VARCHAR(100),
  state VARCHAR(100),
  bio TEXT,
  video_url TEXT,
  achievements TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE SCOUTS
CREATE TABLE IF NOT EXISTS public.scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  organization VARCHAR(255),
  position VARCHAR(100),
  experience INTEGER,
  specialization VARCHAR(100),
  region VARCHAR(100),
  languages VARCHAR(255),
  bio TEXT,
  stats JSONB DEFAULT '{"evaluations": 0, "reports": 0, "watchlist": 0}',
  settings JSONB DEFAULT '{"emailNotifications": true, "pushNotifications": true, "weeklyDigest": true, "publicProfile": true, "showStats": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE REPORTES
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID REFERENCES public.scouts(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  player_name VARCHAR(255) NOT NULL,
  player_position VARCHAR(50),
  match_date DATE,
  match_competition VARCHAR(255),
  match_teams VARCHAR(255),
  overall_rating DECIMAL(3,1) CHECK (overall_rating >= 0 AND overall_rating <= 10),
  technical_rating DECIMAL(3,1) CHECK (technical_rating >= 0 AND technical_rating <= 10),
  physical_rating DECIMAL(3,1) CHECK (physical_rating >= 0 AND physical_rating <= 10),
  tactical_rating DECIMAL(3,1) CHECK (tactical_rating >= 0 AND tactical_rating <= 10),
  mental_rating DECIMAL(3,1) CHECK (mental_rating >= 0 AND mental_rating <= 10),
  strengths TEXT,
  weaknesses TEXT,
  detailed_analysis TEXT,
  recommendation TEXT,
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'organization')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE LISTA DE SEGUIMIENTO (watchlist)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID REFERENCES public.scouts(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  notes TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scout_id, player_id)
);

-- 6. TABLA DE MENSAJES/CHAT
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON public.players(user_id);
CREATE INDEX IF NOT EXISTS idx_scouts_user_id ON public.scouts(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_scout_id ON public.reports(scout_id);
CREATE INDEX IF NOT EXISTS idx_reports_player_id ON public.reports(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_scout_id ON public.watchlist(scout_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player_id ON public.watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =============================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA PROFILES
CREATE POLICY "Los usuarios pueden ver todos los perfiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- POLÍTICAS PARA PLAYERS
CREATE POLICY "Los jugadores pueden ver todos los perfiles de jugadores" 
  ON public.players FOR SELECT 
  USING (true);

CREATE POLICY "Los jugadores pueden actualizar su propio perfil" 
  ON public.players FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los jugadores pueden insertar su propio perfil" 
  ON public.players FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS PARA SCOUTS
CREATE POLICY "Los scouts pueden ver todos los perfiles de scouts" 
  ON public.scouts FOR SELECT 
  USING (true);

CREATE POLICY "Los scouts pueden actualizar su propio perfil" 
  ON public.scouts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los scouts pueden insertar su propio perfil" 
  ON public.scouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS PARA REPORTS
CREATE POLICY "Los scouts pueden ver sus propios reportes" 
  ON public.reports FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = reports.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Los scouts pueden crear reportes" 
  ON public.reports FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = reports.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Los scouts pueden actualizar sus reportes" 
  ON public.reports FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = reports.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Los scouts pueden eliminar sus reportes" 
  ON public.reports FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = reports.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

-- POLÍTICAS PARA WATCHLIST
CREATE POLICY "Los scouts pueden ver su propia lista de seguimiento" 
  ON public.watchlist FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = watchlist.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Los scouts pueden agregar a su lista de seguimiento" 
  ON public.watchlist FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = watchlist.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Los scouts pueden eliminar de su lista de seguimiento" 
  ON public.watchlist FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scouts 
      WHERE scouts.id = watchlist.scout_id 
      AND scouts.user_id = auth.uid()
    )
  );

-- POLÍTICAS PARA MESSAGES
CREATE POLICY "Los usuarios pueden ver sus mensajes" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Los usuarios pueden enviar mensajes" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- POLÍTICAS PARA NOTIFICATIONS
CREATE POLICY "Los usuarios pueden ver sus notificaciones" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scouts_updated_at BEFORE UPDATE ON public.scouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS (para avatares y archivos)
-- =============================================

-- Nota: Los buckets se crean desde el dashboard de Supabase
-- o usando el siguiente código en el SQL Editor:

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('player-videos', 'player-videos', true);

-- Políticas de storage para avatars
-- CREATE POLICY "Los avatars son públicos" 
--   ON storage.objects FOR SELECT 
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Los usuarios pueden subir su avatar" 
--   ON storage.objects FOR INSERT 
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =============================================

-- Descomentar para insertar datos de prueba
/*
-- Usuario Scout de prueba (requiere auth.users existente)
INSERT INTO public.profiles (id, user_type, email, full_name, phone, nationality, city)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'scout', 'carlos.mendoza@scoutconnect.com', 'Carlos Mendoza', '+34 612 345 678', 'España', 'Barcelona');

INSERT INTO public.scouts (user_id, organization, position, experience, specialization, region, languages)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'FC Barcelona', 'Scout Senior', 15, 'Mediocampistas', 'Sudamérica', 'Español, Inglés, Portugués');
*/

-- =============================================
-- SCRIPT COMPLETADO
-- =============================================
