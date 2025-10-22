// ============================================
// CHAT MODULE - TYPE DEFINITIONS
// ============================================

export type UserRole = 'player' | 'scout' | 'admin';

export type MessageStatus = 'delivered' | 'seen';

export type ConversationRole = 'member' | 'owner';

export type FacetTag =
  // Delanteros
  | 'definicion'
  | 'desmarque'
  | 'presion'
  // Mediocampistas
  | 'control_pase'
  | 'recuperacion'
  | 'transicion'
  // Defensas
  | 'anticipos'
  | 'duelo_aereo'
  | 'salida'
  // Arqueros
  | 'reflejos'
  | 'juego_pies'
  | 'centros_1v1';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  title: string | null;
  created_by: string;
  created_at: string;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  role_in_conversation: ConversationRole;
  joined_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  link_url: string | null;
  facet_tag: FacetTag | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export interface MessageStatusRecord {
  message_id: string;
  user_id: string;
  status: MessageStatus;
  updated_at: string;
}

export interface ConversationPresence {
  conversation_id: string;
  user_id: string;
  last_active_at: string;
}

// ============================================
// EXTENDED TYPES FOR UI
// ============================================

export interface ConversationWithDetails extends Conversation {
  participants: Profile[];
  last_message: {
    body: string | null;
    sender_name: string;
    created_at: string;
  } | null;
  unread_count: number;
}

export interface MessageWithSender extends Message {
  sender: Profile;
  status: MessageStatus | null;
  is_own: boolean;
}

export interface TypingUser {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

export interface PresenceState {
  online_users: TypingUser[];
  typing_users: TypingUser[];
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface SendMessageParams {
  body?: string;
  link_url?: string;
  facet_tag?: FacetTag;
}

export interface FetchMessagesParams {
  limit?: number;
  before?: string; // ISO timestamp of last loaded message
}

export interface CreateConversationParams {
  target_user_id: string;
  is_group?: boolean;
  title?: string;
  participant_ids?: string[];
}
