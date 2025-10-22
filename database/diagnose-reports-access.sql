-- Script de diagnóstico para entender el problema de acceso a reportes
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'reports';

-- 2. Verificar estructura de la tabla reports
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 3. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'reports';

-- 4. Contar total de reportes en la tabla
SELECT COUNT(*) as total_reports FROM reports;

-- 5. Verificar estructura de scout_id vs auth.uid()
SELECT scout_id, player_name, title, created_at
FROM reports 
LIMIT 5;

-- 6. Si tienes acceso, verificar tu user ID actual
SELECT auth.uid() as current_user_id;