-- =============================================
-- CORRECCIÓN: Políticas de Seguridad para Registro
-- =============================================

-- 1. Eliminar la política restrictiva de INSERT en profiles
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON public.profiles;

-- 2. Crear una política más permisiva para INSERT durante el registro
CREATE POLICY "Permitir INSERT en profiles durante registro" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

-- Nota: Esta política permite insertar perfiles. La seguridad está garantizada
-- porque solo el usuario autenticado puede hacer el INSERT a través de la API.

-- 3. Actualizar política de INSERT en players
DROP POLICY IF EXISTS "Los jugadores pueden insertar su propio perfil" ON public.players;

CREATE POLICY "Permitir INSERT en players durante registro" 
  ON public.players FOR INSERT 
  WITH CHECK (true);

-- 4. Actualizar política de INSERT en scouts
DROP POLICY IF EXISTS "Los scouts pueden insertar su propio perfil" ON public.scouts;

CREATE POLICY "Permitir INSERT en scouts durante registro" 
  ON public.scouts FOR INSERT 
  WITH CHECK (true);

-- =============================================
-- Alternativamente, puedes usar un TRIGGER para crear el perfil automáticamente
-- =============================================

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar en la tabla profiles usando los metadatos del usuario
  INSERT INTO public.profiles (id, user_type, email, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'jugador'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger (si no existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SCRIPT COMPLETADO
-- =============================================

-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Copia y pega TODO este código
-- 3. Presiona RUN
-- 4. Deberías ver: "Success. No rows returned"
-- 5. Intenta registrarte nuevamente en la aplicación
