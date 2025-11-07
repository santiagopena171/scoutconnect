-- Crear tabla para registrar actividad de scouts
CREATE TABLE IF NOT EXISTS scout_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scout_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'report_created', 'player_added_watchlist', 'player_removed_watchlist', 'profile_viewed', 'profile_updated'
  title TEXT NOT NULL,
  description TEXT,
  related_player_id UUID, -- SIN FOREIGN KEY para evitar errores
  related_player_name TEXT,
  related_report_id UUID,
  metadata JSONB, -- Para datos adicionales como rating, posición, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_scout_activity_scout_id ON scout_activity(scout_id);
CREATE INDEX IF NOT EXISTS idx_scout_activity_created_at ON scout_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scout_activity_type ON scout_activity(activity_type);

-- Habilitar RLS
ALTER TABLE scout_activity ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Scouts can view their own activity" ON scout_activity;
DROP POLICY IF EXISTS "Scouts can insert their own activity" ON scout_activity;

-- Política: Los scouts pueden ver su propia actividad
CREATE POLICY "Scouts can view their own activity"
  ON scout_activity
  FOR SELECT
  TO authenticated
  USING (scout_id = auth.uid());

-- Política: Los scouts pueden insertar su propia actividad
CREATE POLICY "Scouts can insert their own activity"
  ON scout_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (scout_id = auth.uid());

-- Política: Los scouts pueden actualizar su propia actividad
CREATE POLICY "Scouts can update their own activity"
  ON scout_activity
  FOR UPDATE
  TO authenticated
  USING (scout_id = auth.uid())
  WITH CHECK (scout_id = auth.uid());

-- Política: Los scouts pueden eliminar su propia actividad
CREATE POLICY "Scouts can delete their own activity"
  ON scout_activity
  FOR DELETE
  TO authenticated
  USING (scout_id = auth.uid());

-- Función para registrar actividad automáticamente
CREATE OR REPLACE FUNCTION log_scout_activity(
  p_activity_type VARCHAR,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_player_id UUID DEFAULT NULL,
  p_related_player_name TEXT DEFAULT NULL,
  p_related_report_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO scout_activity (
    scout_id,
    activity_type,
    title,
    description,
    related_player_id,
    related_player_name,
    related_report_id,
    metadata
  )
  VALUES (
    auth.uid(),
    p_activity_type,
    p_title,
    p_description,
    p_related_player_id,
    p_related_player_name,
    p_related_report_id,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

-- Comentarios para documentación
COMMENT ON TABLE scout_activity IS 'Registro de todas las actividades realizadas por los scouts';
COMMENT ON COLUMN scout_activity.activity_type IS 'Tipo de actividad: report_created, player_added_watchlist, player_removed_watchlist, profile_viewed, profile_updated';
COMMENT ON COLUMN scout_activity.metadata IS 'Datos adicionales en formato JSON (rating, posición, edad, etc.)';
