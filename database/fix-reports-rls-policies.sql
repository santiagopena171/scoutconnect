-- Solución inmediata: Configurar políticas RLS correctas para reportes
-- Ejecutar este script en Supabase SQL Editor

-- Primero, eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports; 
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
DROP POLICY IF EXISTS "Allow read access to reports" ON reports;
DROP POLICY IF EXISTS "Users can select their own reports" ON reports;
DROP POLICY IF EXISTS "Users can access their own reports" ON reports;

-- Habilitar RLS en la tabla reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Crear políticas más permisivas para solucionar el problema

-- 1. LECTURA: Permitir que los usuarios vean reportes donde son el scout
CREATE POLICY "scouts_can_read_own_reports" ON reports
    FOR SELECT USING (
        auth.uid() = scout_id OR 
        auth.uid()::text = scout_id OR
        scout_id = auth.uid()::text
    );

-- 2. INSERCIÓN: Permitir que los usuarios creen reportes
CREATE POLICY "scouts_can_create_reports" ON reports
    FOR INSERT WITH CHECK (
        auth.uid() = scout_id OR 
        auth.uid()::text = scout_id OR
        scout_id = auth.uid()::text
    );

-- 3. ACTUALIZACIÓN: Permitir que los usuarios actualicen sus reportes
CREATE POLICY "scouts_can_update_own_reports" ON reports
    FOR UPDATE USING (
        auth.uid() = scout_id OR 
        auth.uid()::text = scout_id OR
        scout_id = auth.uid()::text
    );

-- 4. ELIMINACIÓN: Permitir que los usuarios eliminen sus reportes
CREATE POLICY "scouts_can_delete_own_reports" ON reports
    FOR DELETE USING (
        auth.uid() = scout_id OR 
        auth.uid()::text = scout_id OR
        scout_id = auth.uid()::text
    );

-- 5. FALLBACK: Si aún hay problemas, crear política muy permisiva
-- (Descomenta las siguientes líneas si las políticas anteriores no funcionan)

-- CREATE POLICY "temporary_full_access" ON reports
--     FOR ALL USING (true) WITH CHECK (true);

-- Verificar que las políticas se crearon correctamente
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports';

-- Verificar acceso actual
SELECT COUNT(*) as reportes_visibles FROM reports;