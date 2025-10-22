
-- ============================================
-- LIMPIEZA (opcional pero recomendada en desarrollo)
-- ============================================
DROP TABLE IF EXISTS message_status CASCADE;
DROP TABLE IF EXISTS conversation_presence CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- 1. TABLA: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('player', 'scout', 'admin')),
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. TABLA: conversations
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group boolean DEFAULT false NOT NULL,
  title text,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. TABLA: conversation_participants
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_conversation text DEFAULT 'member' CHECK (role_in_conversation IN ('member', 'owner')),
  joined_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- 4. TABLA: messages
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  body text CHECK (char_length(body) <= 5000),
  link_url text CHECK (link_url ~* '^https?://'),
  facet_tag text,
  created_at timestamptz DEFAULT now() NOT NULL,
  edited_at timestamptz,
  deleted_at timestamptz,
  CONSTRAINT message_content_check CHECK (body IS NOT NULL OR link_url IS NOT NULL)
);

-- 5. TABLA: message_status
-- ============================================
CREATE TABLE IF NOT EXISTS message_status (
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('delivered', 'seen')),
  updated_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (message_id, user_id)
);

-- 6. TABLA: conversation_presence (opcional)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_presence (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_active_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- 7. ÍNDICES PARA RENDIMIENTO
-- ============================================
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_message_status_user ON message_status(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);

-- ============================================
-- RLS + POLÍTICAS - profiles
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- RLS + POLÍTICAS - conversation_participants (PRIMERO!)
-- ============================================
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add themselves to conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave conversations"
  ON conversation_participants FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their memberships"
  ON conversation_participants FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- RLS + POLÍTICAS - conversations (DESPUÉS de participants)
-- ============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id 
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- RLS + POLÍTICAS - messages
-- ============================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Senders can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id AND deleted_at IS NULL);

CREATE POLICY "Senders can soft delete their messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (deleted_at IS NOT NULL);

-- ============================================
-- RLS + POLÍTICAS - message_status
-- ============================================
ALTER TABLE message_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view message status"
  ON message_status FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own message status"
  ON message_status FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can upsert their message status"
  ON message_status FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- RLS + POLÍTICAS - conversation_presence
-- ============================================
ALTER TABLE conversation_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence"
  ON conversation_presence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_presence.conversation_id 
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own presence"
  ON conversation_presence FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their presence timestamp"
  ON conversation_presence FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- HABILITAR REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_status;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_presence;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Chat tables created successfully!' as status;
