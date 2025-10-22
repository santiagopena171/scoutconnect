-- SOLUCIÓN DEFINITIVA: Arreglar acceso a reportes del scout
-- Ejecutar este script línea por línea en Supabase SQL Editor

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "full_access_temporary" ON reports;
DROP POLICY IF EXISTS "temporary_debug_access" ON reports;
DROP POLICY IF EXISTS "scouts_can_read_own_reports_only" ON reports;
DROP POLICY IF EXISTS "scouts_can_create_own_reports_only" ON reports;
DROP POLICY IF EXISTS "scouts_can_update_own_reports_only" ON reports;
DROP POLICY IF EXISTS "scouts_can_delete_own_reports_only" ON reports;

-- 2. Verificar tu usuario actual
SELECT auth.uid() as mi_usuario_actual;

-- 3. Ver reportes existentes y sus scout_id
SELECT scout_id, player_name, title, created_at 
FROM reports 
ORDER BY created_at DESC;

-- 4. ACTUALIZAR todos los reportes existentes para que tengan tu scout_id
-- (Reemplaza 'TU_USUARIO_ID' con el resultado del paso 2)
UPDATE reports 
SET scout_id = auth.uid()
WHERE scout_id IS NOT NULL;

-- 5. Crear políticas RLS simples pero seguras
CREATE POLICY "allow_scout_access" ON reports
    FOR ALL USING (auth.uid() = scout_id::uuid) 
    WITH CHECK (auth.uid() = scout_id::uuid);

-- 6. Verificar que ahora puedes ver tus reportes
SELECT COUNT(*) as mis_reportes_visibles 
FROM reports 
WHERE scout_id = auth.uid();

-- 7. Mostrar algunos reportes para confirmar
SELECT id, scout_id, player_name, title 
FROM reports 
WHERE scout_id = auth.uid()
LIMIT 3;