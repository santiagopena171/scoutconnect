--- =============================================
-- AGREGAR CAMPOS PARA BÚSQUEDA AVANZADA
-- ScoutConnect - Supabase
-- =============================================

-- Agregar columnas faltantes a la tabla profiles para la búsqueda avanzada
-- Esto permite que los datos de jugadores estén disponibles sin necesidad de JOIN con players

-- 1. Agregar campos de nombre separados (si no existen)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- 2. Agregar campos de jugador directamente en profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS position VARCHAR(50),
ADD COLUMN IF NOT EXISTS secondary_position VARCHAR(50),
ADD COLUMN IF NOT EXISTS preferred_foot VARCHAR(20),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS current_club VARCHAR(255),
ADD COLUMN IF NOT EXISTS league VARCHAR(255),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- 3. Agregar campos de contrato
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS contract_status VARCHAR(30),
ADD COLUMN IF NOT EXISTS contract_expiry DATE,
ADD COLUMN IF NOT EXISTS market_value VARCHAR(50);

-- 4. Agregar campo de segunda nacionalidad (si no existe)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS second_nationality VARCHAR(100);

-- 5. Agregar bio si no existe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 6. Agregar constraints para validar datos
ALTER TABLE public.profiles 
ADD CONSTRAINT check_preferred_foot 
CHECK (preferred_foot IS NULL OR preferred_foot IN ('Derecho', 'Izquierdo', 'Ambidiestro'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_contract_status 
CHECK (contract_status IS NULL OR contract_status IN ('professional', 'semiprofessional', 'amateur', 'free-agent', 'youth'));

-- 7. Crear índices para mejorar el rendimiento de búsqueda
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON public.profiles(position);
CREATE INDEX IF NOT EXISTS idx_profiles_nationality ON public.profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);

-- 8. Comentarios para documentación
COMMENT ON COLUMN public.profiles.position IS 'Posición primaria del jugador';
COMMENT ON COLUMN public.profiles.secondary_position IS 'Posición secundaria del jugador';
COMMENT ON COLUMN public.profiles.preferred_foot IS 'Pie hábil: Derecho, Izquierdo o Ambidiestro';
COMMENT ON COLUMN public.profiles.contract_status IS 'Estado contractual: professional, semiprofessional, amateur, free-agent, youth';
COMMENT ON COLUMN public.profiles.market_value IS 'Valor de mercado estimado (ej: 2.5M, 800K)';

-- 9. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para actualizar updated_at en profiles
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- =============================================
-- SCRIPT COMPLETADO
-- =============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para agregar las columnas necesarias para la búsqueda avanzada
