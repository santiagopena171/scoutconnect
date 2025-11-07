--- Eliminar todas las políticas existentes de scout_activity
DROP POLICY IF EXISTS "Scouts can view their own activity" ON scout_activity;
DROP POLICY IF EXISTS "Scouts can insert their own activity" ON scout_activity;
DROP POLICY IF EXISTS "Scouts can update their own activity" ON scout_activity;
DROP POLICY IF EXISTS "Scouts can delete their own activity" ON scout_activity;

-- Deshabilitar RLS temporalmente para probar
ALTER TABLE scout_activity DISABLE ROW LEVEL SECURITY;

-- Si quieres mantener RLS habilitado, usa estas políticas más simples:
-- ALTER TABLE scout_activity ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Enable all for authenticated users" ON scout_activity
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- Verificar que la tabla existe y tiene datos
SELECT COUNT(*) as total_activities FROM scout_activity;

-- Ver las últimas actividades insertadas
SELECT * FROM scout_activity ORDER BY created_at DESC LIMIT 5;
