-- Script para permitir acceso público de lectura a reportes
-- Ejecutar este script en Supabase SQL Editor

-- Deshabilitar RLS temporalmente para permitir acceso de lectura
-- OPCIÓN 1: Permitir lectura pública (menos seguro pero funcional)
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;

-- Crear nueva política más permisiva para lectura
CREATE POLICY "Allow read access to reports" ON reports
    FOR SELECT USING (true);

-- Mantener políticas restrictivas para modificaciones
CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = scout_id);

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = scout_id);

CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE USING (auth.uid() = scout_id);

-- OPCIÓN 2: Alternativamente, deshabilitar RLS completamente (menos seguro)
-- Descomenta la siguiente línea si la opción 1 no funciona:
-- ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports';