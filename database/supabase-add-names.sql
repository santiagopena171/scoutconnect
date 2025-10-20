-- =============================================
-- AGREGAR CAMPOS FIRST_NAME Y LAST_NAME
-- ScoutConnect - Actualización de perfiles
-- =============================================

-- Agregar columnas first_name y last_name a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Migrar datos existentes de full_name a first_name y last_name
-- Esto divide el nombre completo en la primera palabra (first_name) y el resto (last_name)
UPDATE public.profiles 
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Hacer los campos NOT NULL después de la migración
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Crear índices para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- Actualizar la función trigger para incluir first_name y last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, email, full_name, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'jugador'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios con first_name y last_name separados';
COMMENT ON COLUMN public.profiles.first_name IS 'Nombre del usuario (no modificable después del registro)';
COMMENT ON COLUMN public.profiles.last_name IS 'Apellido del usuario (no modificable después del registro)';
