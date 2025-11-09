-- =============================================
-- HABILITAR REALTIME - VERSIÓN MÍNIMA
-- =============================================
-- Solo las 3 tablas esenciales para chat en tiempo real
-- Copiar y pegar en: Supabase Dashboard → SQL Editor → New Query
-- =============================================

-- 1. Mensajes (esencial para chat en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 2. Estados de mensajes (para "visto" en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE message_status;

-- 3. Participantes (para ver quién se une a conversaciones)
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- Verificar que funcionó:
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'message_status', 'conversation_participants');

-- Si ves las 3 tablas en el resultado, ¡está listo! ✅
