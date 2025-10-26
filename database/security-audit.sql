-- AUDITORÍA DE SEGURIDAD: Verificar políticas RLS
-- Ejecutar en Supabase SQL Editor

-- 1. Ver todas las políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 2. Ver permisos de tablas críticas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('reports', 'profiles', 'players', 'scouts');

-- 3. Verificar que RLS esté habilitado
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;

-- 4. Política estricta para reports: solo el scout creador puede acceder
DROP POLICY IF EXISTS "allow_scout_access" ON reports;
CREATE POLICY "scout_own_reports_only" ON reports
    FOR ALL USING (auth.uid() = scout_id)
    WITH CHECK (auth.uid() = scout_id);

-- 5. Política para profiles: usuarios solo ven su propio perfil
DROP POLICY IF EXISTS "users_own_profile" ON profiles;
CREATE POLICY "users_own_profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- 6. Política para players: solo el propio jugador o scouts autorizados
DROP POLICY IF EXISTS "players_access" ON players;
CREATE POLICY "players_access" ON players
    FOR ALL USING (auth.uid() = user_id);

-- 7. Política para scouts: solo el propio scout
DROP POLICY IF EXISTS "scouts_access" ON scouts;
CREATE POLICY "scouts_access" ON scouts
    FOR ALL USING (auth.uid() = user_id);

-- 8. Verificar permisos
SELECT * FROM reports LIMIT 1; -- Debería fallar si no eres scout
SELECT * FROM profiles WHERE id = auth.uid(); -- Debería funcionar