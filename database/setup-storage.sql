-- =============================================
-- CONFIGURACIÓN DE STORAGE PARA AVATARES
-- ScoutConnect - Supabase
-- =============================================

-- 1. Crear bucket para avatares (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Los usuarios pueden subir su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Todos pueden ver avatares" ON storage.objects;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propio avatar" ON storage.objects;

-- 3. Política para permitir que usuarios autenticados suban avatares
CREATE POLICY "Los usuarios pueden subir avatares"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- 4. Política para permitir que usuarios actualicen avatares
CREATE POLICY "Los usuarios pueden actualizar avatares"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- 5. Política para que todos puedan ver los avatares (público)
CREATE POLICY "Todos pueden ver avatares"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 6. Política para permitir que usuarios eliminen avatares
CREATE POLICY "Los usuarios pueden eliminar avatares"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

