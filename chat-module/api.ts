// ============================================
// CHAT MODULE - SUPABASE API FUNCTIONS
// ============================================

import { createClient } from '@supabase/supabase-js';
import type {
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
  SendMessageParams,
  FetchMessagesParams,
} from './types';

// ============================================
// SUPABASE CLIENT
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function buildProfileName(profile: Record<string, any>): string {
  const fullName = typeof profile.full_name === 'string' ? profile.full_name.trim() : '';
  if (fullName.length > 0) {
    return fullName;
  }

  const first = typeof profile.first_name === 'string' ? profile.first_name.trim() : '';
  const last = typeof profile.last_name === 'string' ? profile.last_name.trim() : '';
  const fallback = `${first} ${last}`.trim();
  if (fallback.length > 0) {
    return fallback;
  }

  const username = typeof profile.username === 'string' ? profile.username.trim() : '';
  if (username.length > 0) {
    return username;
  }

  const email = typeof profile.email === 'string' ? profile.email.trim() : '';
  if (email.length > 0) {
    return email;
  }

  return 'Usuario';
}

// ============================================
// HELPER: Get current user ID
// ============================================

async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  
  return user.id;
}

// ============================================
// 1. CREATE OR GET DIRECT CONVERSATION
// ============================================

export async function createOrGetDirectConversation(
  targetUserId: string
): Promise<Conversation> {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
    target_user_id: targetUserId,
  });

  if (error) throw error;
  if (!data) throw new Error('No se pudo obtener la conversación');

  return data as Conversation;
}

// ============================================
// 2. LIST CONVERSATIONS
// ============================================

export async function listConversations(): Promise<ConversationWithDetails[]> {
  const currentUserId = await getCurrentUserId();

  // Get user's conversation IDs
  const { data: participantData, error: participantError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId);

  if (participantError) throw participantError;
  if (!participantData || participantData.length === 0) return [];

  const conversationIds = Array.from(new Set(participantData.map((p) => p.conversation_id))).filter(Boolean);

  // Get conversations
  const { data: conversations, error: convsError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('created_at', { ascending: false });

  if (convsError) throw convsError;
  if (!conversations) return [];

  // Enrich with participants, last message, unread count
  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      // Get participants via RPC to respect RLS while ensuring membership
      const { data: participantRows, error: participantsError } = await supabase.rpc(
        'get_conversation_contacts',
        { conversation_id: conv.id }
      );

      if (participantsError) throw participantsError;

      const normalizedProfiles = (participantRows || []).map((profile: Record<string, any>) => ({
        ...profile,
        full_name: buildProfileName(profile),
      }));

      // Get last message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('body, sender_id, created_at')
        .eq('conversation_id', conv.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let lastMessage = null;
      if (lastMsg) {
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', lastMsg.sender_id)
          .single();

        lastMessage = {
          body: lastMsg.body,
          sender_name: senderProfile ? buildProfileName(senderProfile) : 'Usuario',
          created_at: lastMsg.created_at,
        };
      }

      // Get unread count
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conv.id)
        .is('deleted_at', null)
        .neq('sender_id', currentUserId);

      let unreadCount = 0;
      if (unreadMessages) {
        const messageIds = unreadMessages.map((m) => m.id);
        if (messageIds.length > 0) {
          const { data: seenStatuses } = await supabase
            .from('message_status')
            .select('message_id')
            .in('message_id', messageIds)
            .eq('user_id', currentUserId)
            .eq('status', 'seen');

          const seenIds = seenStatuses?.map((s) => s.message_id) || [];
          unreadCount = messageIds.filter((id) => !seenIds.includes(id)).length;
        }
      }

      return {
        ...conv,
        participants: normalizedProfiles,
        last_message: lastMessage,
        unread_count: unreadCount,
      };
    })
  );

  return enrichedConversations;
}

// ============================================
// 3. FETCH MESSAGES
// ============================================

export async function fetchMessages(
  conversationId: string,
  params: FetchMessagesParams = {}
): Promise<MessageWithSender[]> {
  const { limit = 30, before } = params;
  const currentUserId = await getCurrentUserId();

  let query = supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data: messages, error } = await query;

  if (error) throw error;
  if (!messages) return [];

  const messageIds = messages.map((msg) => msg.id);

  let statusMap = new Map<string, string | null>();
  if (messageIds.length > 0) {
    const { data: statusRows, error: statusError } = await supabase
      .from('message_status')
      .select('message_id, status')
      .in('message_id', messageIds)
      .eq('user_id', currentUserId);

    if (statusError) throw statusError;

    if (statusRows) {
      statusRows.forEach((row: { message_id: string; status: string | null }) => {
        if (row && row.message_id) {
          statusMap.set(row.message_id, row.status);
        }
      });
    }
  }

  const enriched = messages.map((msg) => ({
    ...msg,
    sender: msg.sender,
    status: statusMap.get(msg.id) ?? null,
    is_own: msg.sender_id === currentUserId,
  }));

  return enriched.reverse(); // Oldest first for display
}

// ============================================
// 4. SEND MESSAGE
// ============================================

export async function sendMessage(
  conversationId: string,
  params: SendMessageParams
): Promise<Message> {
  const { body, link_url, facet_tag } = params;
  const currentUserId = await getCurrentUserId();

  // Validation
  if (!body && !link_url) {
    throw new Error('Message must have body or link_url');
  }

  if (link_url && !link_url.match(/^https?:\/\//)) {
    throw new Error('link_url must be a valid HTTPS URL');
  }

  if (body && body.length > 5000) {
    throw new Error('Message body exceeds 5000 characters');
  }

  // Insert message
  const { data: message, error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: body || null,
      link_url: link_url || null,
      facet_tag: facet_tag || null,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Create delivery status for all participants except sender
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', currentUserId);

  if (participants && participants.length > 0) {
    const statusInserts = participants.map((p) => ({
      message_id: message.id,
      user_id: p.user_id,
      status: 'delivered' as const,
    }));

    await supabase.from('message_status').insert(statusInserts);
  }

  return message;
}

// ============================================
// 5. MARK AS SEEN
// ============================================

export async function markAsSeen(
  conversationId: string,
  upToMessageId: string
): Promise<void> {
  const currentUserId = await getCurrentUserId();

  const { data: targetMessage, error: targetError } = await supabase
    .from('messages')
    .select('created_at')
    .eq('id', upToMessageId)
    .single();

  if (targetError) throw targetError;
  if (!targetMessage) return;

  const { data: messages, error: fetchError } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .lte('created_at', targetMessage.created_at)
    .neq('sender_id', currentUserId)
    .is('deleted_at', null);

  if (fetchError) throw fetchError;
  if (!messages || messages.length === 0) return;

  const messageIds = messages.map((m) => m.id);

  // Upsert seen status
  const upserts = messageIds.map((id) => ({
    message_id: id,
    user_id: currentUserId,
    status: 'seen' as const,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase
    .from('message_status')
    .upsert(upserts, {
      onConflict: 'message_id,user_id',
    });

  if (upsertError) throw upsertError;
}

// ============================================
// 6. EDIT MESSAGE
// ============================================

export async function editMessage(
  messageId: string,
  newBody: string
): Promise<Message> {
  if (newBody.length > 5000) {
    throw new Error('Message body exceeds 5000 characters');
  }

  const { data: message, error } = await supabase
    .from('messages')
    .update({
      body: newBody,
      edited_at: new Date().toISOString(),
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return message;
}

// ============================================
// 7. SOFT DELETE MESSAGE
// ============================================

export async function softDeleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId);

  if (error) throw error;
}
