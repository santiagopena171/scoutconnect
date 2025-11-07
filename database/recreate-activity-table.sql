-- SOLUCIÓN DEFINITIVA: Eliminar la tabla y recrearla sin foreign key problemática

-- 1. Eliminar tabla existente
DROP TABLE IF EXISTS scout_activity CASCADE;

-- 2. Recrear tabla SIN foreign key a players
CREATE TABLE scout_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scout_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  related_player_id UUID, -- Solo guardamos el ID, sin foreign key
  related_player_name TEXT,
  related_report_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear índices
CREATE INDEX idx_scout_activity_scout_id ON scout_activity(scout_id);
CREATE INDEX idx_scout_activity_created_at ON scout_activity(created_at DESC);
CREATE INDEX idx_scout_activity_type ON scout_activity(activity_type);

-- 4. DESHABILITAR RLS (más simple para empezar)
ALTER TABLE scout_activity DISABLE ROW LEVEL SECURITY;

-- 5. Verificar que funcionó
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'scout_activity'
ORDER BY ordinal_position;
