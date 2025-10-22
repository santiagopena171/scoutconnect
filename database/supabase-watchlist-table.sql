-- ===================================
-- TABLA: watchlist
-- Descripción: Lista de seguimiento de jugadores por scout
-- ===================================

-- Eliminar tabla existente si hay errores (CUIDADO: esto borra datos)
DROP TABLE IF EXISTS public.watchlist CASCADE;

-- Crear la tabla watchlist
CREATE TABLE public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scout_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: un scout no puede seguir al mismo jugador dos veces
  UNIQUE(scout_id, player_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_watchlist_scout ON public.watchlist(scout_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_player ON public.watchlist(player_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_added_date ON public.watchlist(added_date DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Los scouts solo pueden ver su propia lista
CREATE POLICY "Los scouts pueden ver su propia lista"
  ON public.watchlist
  FOR SELECT
  USING (auth.uid() = scout_id);

-- Los scouts pueden añadir a su lista
CREATE POLICY "Los scouts pueden añadir a su lista"
  ON public.watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = scout_id);

-- Los scouts pueden eliminar de su lista
CREATE POLICY "Los scouts pueden eliminar de su lista"
  ON public.watchlist
  FOR DELETE
  USING (auth.uid() = scout_id);

-- Los scouts pueden actualizar sus notas
CREATE POLICY "Los scouts pueden actualizar sus notas"
  ON public.watchlist
  FOR UPDATE
  USING (auth.uid() = scout_id)
  WITH CHECK (auth.uid() = scout_id);

-- Comentarios para documentación
COMMENT ON TABLE public.watchlist IS 'Lista de seguimiento de jugadores por scout';
COMMENT ON COLUMN public.watchlist.scout_id IS 'ID del scout que sigue al jugador';
COMMENT ON COLUMN public.watchlist.player_id IS 'ID del jugador siendo seguido';
COMMENT ON COLUMN public.watchlist.added_date IS 'Fecha en que se añadió a la lista';
COMMENT ON COLUMN public.watchlist.notes IS 'Notas personales del scout sobre el jugador';
