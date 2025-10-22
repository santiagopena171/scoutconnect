-- SOLUCIÓN CORRECTA: Arreglar relaciones y políticas restrictivas
-- Ejecutar este script en Supabase SQL Editor

-- 1. Eliminar políticas permisivas temporales
DROP POLICY IF EXISTS "full_access_temporary" ON reports;
DROP POLICY IF EXISTS "temporary_debug_access" ON reports;

-- 2. Verificar y crear la relación correcta con auth.users
-- Primero verificar si la foreign key existe
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='reports'
    AND kcu.column_name='scout_id';

-- 3. Si no existe la foreign key, crearla
-- (Si hay error aquí, significa que ya existe - está bien)
ALTER TABLE reports 
ADD CONSTRAINT fk_reports_scout_id 
FOREIGN KEY (scout_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Crear políticas RLS correctas y restrictivas
CREATE POLICY "scouts_can_read_own_reports_only" ON reports
    FOR SELECT USING (auth.uid() = scout_id);

CREATE POLICY "scouts_can_create_own_reports_only" ON reports
    FOR INSERT WITH CHECK (auth.uid() = scout_id);

CREATE POLICY "scouts_can_update_own_reports_only" ON reports
    FOR UPDATE USING (auth.uid() = scout_id);

CREATE POLICY "scouts_can_delete_own_reports_only" ON reports
    FOR DELETE USING (auth.uid() = scout_id);

-- 5. Verificar que RLS está habilitado
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 6. Verificar usuario actual y reportes
SELECT auth.uid() as mi_usuario_id;

-- 7. Verificar reportes del usuario actual
SELECT COUNT(*) as mis_reportes 
FROM reports 
WHERE scout_id = auth.uid();

-- 8. Si no hay reportes, mostrar todos los scout_id para diagnóstico
SELECT DISTINCT scout_id, COUNT(*) as cantidad_reportes
FROM reports 
GROUP BY scout_id;