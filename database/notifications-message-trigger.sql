-- Trigger para crear notificaciones automáticamente cuando llega un mensaje nuevo

-- Función que se ejecuta cuando se inserta un mensaje
CREATE OR REPLACE FUNCTION notify_message_received()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  recipient_id UUID;
  recipient_record RECORD;
BEGIN
  -- Obtener el nombre del remitente
  SELECT 
    COALESCE(
      NULLIF(TRIM(first_name || ' ' || last_name), ''),
      NULLIF(TRIM(username), ''),
      NULLIF(TRIM(email), ''),
      'Usuario'
    ) INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Obtener todos los participantes de la conversación excepto el remitente
  FOR recipient_record IN
    SELECT user_id
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
      AND user_id != NEW.sender_id
  LOOP
    recipient_id := recipient_record.user_id;
    
    -- Crear notificación para cada destinatario
    INSERT INTO notifications (
      user_id,
      actor_id,
      type,
      title,
      body,
      link,
      metadata,
      created_at
    ) VALUES (
      recipient_id,
      NEW.sender_id,
      'message',
      'Nuevo mensaje',
      CASE 
        WHEN LENGTH(NEW.body) > 100 THEN 
          sender_name || ': ' || SUBSTRING(NEW.body, 1, 100) || '...'
        ELSE 
          sender_name || ': ' || NEW.body
      END,
      'chat.html?conversation=' || NEW.conversation_id,
      jsonb_build_object(
        'conversation_id', NEW.conversation_id,
        'message_id', NEW.id,
        'sender_id', NEW.sender_id,
        'sender_name', sender_name
      ),
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS on_message_insert_notify ON messages;

-- Crear trigger que se ejecuta después de insertar un mensaje
CREATE TRIGGER on_message_insert_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NULL)  -- Solo para mensajes no eliminados
  EXECUTE FUNCTION notify_message_received();

-- Comentario
COMMENT ON FUNCTION notify_message_received() IS 'Crea notificaciones automáticamente cuando un usuario recibe un mensaje nuevo';
