-- =============================================
-- AGREGAR SEGUNDA NACIONALIDAD
-- ScoutConnect - Actualización de perfiles
-- =============================================

-- Agregar columna second_nationality a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS second_nationality VARCHAR(100);

-- Comentario descriptivo
COMMENT ON COLUMN public.profiles.second_nationality IS 'Segunda nacionalidad del usuario (opcional y editable)';

-- La nacionalidad principal (nationality) será readonly después del registro
COMMENT ON COLUMN public.profiles.nationality IS 'Nacionalidad principal del usuario (no modificable después del registro)';

-- Actualizar la función trigger para incluir second_nationality si viene en metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, email, full_name, first_name, last_name, phone, nationality, second_nationality)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'jugador'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'nationality',
    NEW.raw_user_meta_data->>'second_nationality'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar la columna creada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('nationality', 'second_nationality')
ORDER BY column_name;
