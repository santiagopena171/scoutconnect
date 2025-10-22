-- =============================================
-- FIX: Cambiar foreign keys de reports
-- para que apunten a auth.users en lugar de scouts/players
-- =============================================

-- Paso 1: Eliminar las foreign key constraints existentes
ALTER TABLE public.reports
DROP CONSTRAINT IF EXISTS reports_scout_id_fkey;

ALTER TABLE public.reports
DROP CONSTRAINT IF EXISTS reports_player_id_fkey;

-- Paso 2: Agregar nuevas foreign keys que apunten a auth.users
ALTER TABLE public.reports
ADD CONSTRAINT reports_scout_id_fkey 
FOREIGN KEY (scout_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

ALTER TABLE public.reports
ADD CONSTRAINT reports_player_id_fkey 
FOREIGN KEY (player_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Confirmación
SELECT 'Foreign keys de reports actualizadas correctamente' AS status;
