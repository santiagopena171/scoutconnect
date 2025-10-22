-- Agregar campos faltantes de información del jugador a la tabla reports
-- Ejecutar este script en Supabase SQL Editor

-- Agregar columnas para información adicional del jugador
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS player_age INTEGER,
ADD COLUMN IF NOT EXISTS player_club TEXT,
ADD COLUMN IF NOT EXISTS player_nationality TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS type TEXT;

-- Actualizar reportes existentes con títulos y tipos por defecto
UPDATE reports 
SET title = 'Reporte de ' || player_name 
WHERE title IS NULL;

UPDATE reports 
SET type = 'Reporte de Scouting'
WHERE type IS NULL;

-- Comentarios sobre las nuevas columnas:
-- player_age: Edad del jugador al momento del reporte
-- player_club: Club actual del jugador
-- player_nationality: Nacionalidad del jugador
-- title: Título personalizado del reporte
-- type: Tipo de reporte (Primer Equipo, Juvenil, etc.)