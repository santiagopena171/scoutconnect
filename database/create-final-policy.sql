-- SCRIPT FINAL: Crear política correcta sin errores de tipo
-- Ejecutar este script en Supabase SQL Editor

-- 1. Eliminar política problemática
DROP POLICY IF EXISTS "allow_scout_access" ON reports;

-- 2. Crear política simple que funcione con tipos compatibles
CREATE POLICY "scout_access_to_own_reports" ON reports
    FOR ALL USING (auth.uid()::text = scout_id) 
    WITH CHECK (auth.uid()::text = scout_id);

-- 3. Verificar que funciona
SELECT COUNT(*) as reportes_accesibles 
FROM reports 
WHERE scout_id = auth.uid()::text;

-- 4. Mostrar reportes para confirmar
SELECT id, scout_id, player_name, title, type 
FROM reports 
WHERE scout_id = auth.uid()::text
ORDER BY created_at DESC;