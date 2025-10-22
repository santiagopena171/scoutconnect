-- SOLUCIÓN INMEDIATA: Permitir acceso temporal completo
-- Ejecutar este script en Supabase SQL Editor

-- 1. Eliminar todas las políticas restrictivas
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
DROP POLICY IF EXISTS "Allow read access to reports" ON reports;
DROP POLICY IF EXISTS "scouts_can_read_own_reports" ON reports;
DROP POLICY IF EXISTS "scouts_can_create_reports" ON reports;
DROP POLICY IF EXISTS "scouts_can_update_own_reports" ON reports;
DROP POLICY IF EXISTS "scouts_can_delete_own_reports" ON reports;
DROP POLICY IF EXISTS "temporary_debug_access" ON reports;

-- 2. Crear política completamente permisiva para diagnóstico
CREATE POLICY "full_access_temporary" ON reports
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Verificar que los reportes son accesibles
SELECT COUNT(*) as total_reportes_visibles FROM reports;

-- 4. Mostrar algunos reportes para verificar datos
SELECT id, scout_id, player_id, player_name, title, type, created_at 
FROM reports 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Verificar el usuario actual
SELECT auth.uid() as usuario_actual;