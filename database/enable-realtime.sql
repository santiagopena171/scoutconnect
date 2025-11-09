-- =============================================
-- HABILITAR REALTIME EN TABLAS DE CHAT
-- =============================================
-- 
-- Este script habilita Supabase Realtime en las tablas necesarias
-- para que los mensajes y actualizaciones lleguen instantáneamente
-- vía WebSocket sin necesidad de refrescar la página.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- O vía CLI: psql -d scoutconnect -f database/enable-realtime.sql
--
-- =============================================

-- Habilitar Realtime para la tabla de mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Habilitar Realtime para estados de mensajes (visto/entregado)
ALTER PUBLICATION supabase_realtime ADD TABLE message_status;

-- Habilitar Realtime para participantes de conversaciones
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- OPCIONAL: Habilitar para otras tablas relacionadas

-- Conversaciones (si quieres notificaciones cuando se crean nuevas conversaciones)
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Watchlist (si quieres ver cuando un scout agrega/quita jugadores en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE watchlist;

-- Scout reports (si quieres notificaciones cuando se crean/actualizan reportes)
ALTER PUBLICATION supabase_realtime ADD TABLE scout_reports;

-- Notificaciones (si quieres que lleguen instantáneamente)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- VERIFICAR QUE REALTIME ESTÁ HABILITADO
-- =============================================

-- Ver todas las tablas con Realtime habilitado
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- =============================================
-- COMANDOS ÚTILES
-- =============================================

-- Para DESHABILITAR Realtime en una tabla:
-- ALTER PUBLICATION supabase_realtime DROP TABLE nombre_tabla;

-- Para ver detalles de la publicación:
-- SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Para ver qué tablas están replicándose:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- =============================================
-- NOTAS IMPORTANTES
-- =============================================
--
-- 1. Realtime consume recursos. Solo habilítalo en tablas que realmente necesiten
--    actualizaciones instantáneas.
--
-- 2. Las tablas deben tener Row Level Security (RLS) habilitado y políticas
--    configuradas correctamente para que los usuarios solo vean sus datos.
--
-- 3. Después de ejecutar este script, las aplicaciones JavaScript podrán
--    suscribirse a cambios con:
--    
--    supabase
--      .channel('my-channel')
--      .on('postgres_changes', { 
--        event: '*', 
--        schema: 'public', 
--        table: 'messages' 
--      }, (payload) => {
--        console.log('Cambio detectado:', payload);
--      })
--      .subscribe();
--
-- 4. Verifica que RLS esté habilitado:
--    SELECT tablename, rowsecurity 
--    FROM pg_tables 
--    WHERE schemaname = 'public' 
--    AND tablename IN ('messages', 'message_status', 'conversation_participants');
--
-- =============================================

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Realtime habilitado exitosamente';
  RAISE NOTICE '📊 Ejecuta la siguiente query para verificar:';
  RAISE NOTICE 'SELECT tablename FROM pg_publication_tables WHERE pubname = ''supabase_realtime'';';
END $$;
