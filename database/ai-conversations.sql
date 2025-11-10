-- =============================================
-- TABLA DE CONVERSACIONES CON IA
-- =============================================

-- Tabla para guardar conversaciones con el asistente IA
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID REFERENCES public.scouts(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) DEFAULT 'Nueva conversación',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para guardar los mensajes de cada conversación
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_conversations_scout_id ON public.ai_conversations(scout_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);

-- RLS (Row Level Security) para conversaciones
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para conversaciones
CREATE POLICY "Los scouts pueden ver sus propias conversaciones"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = scout_id);

CREATE POLICY "Los scouts pueden crear sus propias conversaciones"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = scout_id);

CREATE POLICY "Los scouts pueden actualizar sus propias conversaciones"
  ON public.ai_conversations FOR UPDATE
  USING (auth.uid() = scout_id);

CREATE POLICY "Los scouts pueden eliminar sus propias conversaciones"
  ON public.ai_conversations FOR DELETE
  USING (auth.uid() = scout_id);

-- Políticas de acceso para mensajes
CREATE POLICY "Los scouts pueden ver mensajes de sus conversaciones"
  ON public.ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.scout_id = auth.uid()
    )
  );

CREATE POLICY "Los scouts pueden crear mensajes en sus conversaciones"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE ai_conversations.id = ai_messages.conversation_id
      AND ai_conversations.scout_id = auth.uid()
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ai_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp cuando se agrega un mensaje
CREATE TRIGGER update_ai_conversation_timestamp_trigger
AFTER INSERT ON public.ai_messages
FOR EACH ROW
EXECUTE FUNCTION update_ai_conversation_timestamp();

-- Comentarios para documentación
COMMENT ON TABLE public.ai_conversations IS 'Almacena las conversaciones de los scouts con el asistente IA';
COMMENT ON TABLE public.ai_messages IS 'Almacena los mensajes individuales de cada conversación con la IA';
COMMENT ON COLUMN public.ai_conversations.title IS 'Título de la conversación, generado automáticamente o personalizado';
COMMENT ON COLUMN public.ai_messages.role IS 'Rol del mensaje: user (scout), assistant (IA), o system (contexto)';
