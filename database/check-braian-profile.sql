-- Verificar el perfil de Braian De León

-- Buscar por nombre
SELECT id, full_name, email, role, user_type, created_at
FROM profiles
WHERE full_name ILIKE '%Braian%' OR full_name ILIKE '%De León%' OR full_name ILIKE '%De Leon%';

-- Si no aparece, buscar todos los perfiles de jugadores
SELECT id, full_name, email, role, user_type, created_at
FROM profiles
WHERE user_type = 'jugador' OR role = 'player';

-- Ver todos los perfiles (para identificar a Braian)
SELECT id, full_name, first_name, last_name, email, role, user_type, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;
