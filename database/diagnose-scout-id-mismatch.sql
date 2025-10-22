-- DIAGNÓSTICO: Verificar scout_id vs usuario actual
-- Ejecutar este script en Supabase SQL Editor

-- 1. Ver tu usuario actual
SELECT auth.uid() as mi_id_actual, auth.email() as mi_email_actual;

-- 2. Ver todos los reportes y sus scout_id
SELECT 
    id,
    scout_id,
    player_name,
    title,
    created_at,
    CASE 
        WHEN scout_id = auth.uid()::text THEN 'COINCIDE'
        WHEN scout_id = auth.uid() THEN 'COINCIDE'
        ELSE 'NO COINCIDE'
    END as coincide_conmigo
FROM reports 
ORDER BY created_at DESC;

-- 3. Mostrar tipos de datos para verificar compatibilidad
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'scout_id';

SELECT 
    'auth.uid()' as campo,
    pg_typeof(auth.uid()) as tipo_dato;