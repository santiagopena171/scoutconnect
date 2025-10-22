// ============================================
// FULL INTEGRATION EXAMPLE
// Complete working chat implementation
// ============================================

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Components
import { SidebarConversations } from './components/SidebarConversations';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageItem } from './components/MessageItem';
import { Composer } from './components/Composer';
import { TypingIndicator } from './components/TypingIndicator';

// Hooks
import {
  useRealtimeMessages,
  useMessageStatus,
  usePresence,
  useAntiSpam,
} from './hooks';

// API Functions
import {
  createOrGetDirectConversation,
  listConversations,
  fetchMessages,
  sendMessage,
  markAsSeen,
  editMessage,
  softDeleteMessage,
} from './api';

// Types
import type {
  Conversation,
  Message,
  SendMessageParams,
  Profile,
} from './types';

// Supabase Client
const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ============================================
// MAIN CHAT COMPONENT
// ============================================

interface ChatContainerProps {
  currentUserId: string;
  currentUserProfile?: Profile;
  initialTargetUserId?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  currentUserId,
  currentUserProfile,
  initialTargetUserId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Hooks
  const { canSend, messagesRemaining } = useAntiSpam(activeConversation?.id);

  // Realtime subscriptions
  useRealtimeMessages(supabase, activeConversation?.id, (newMessage) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.find((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });

    // Auto-scroll to bottom
    setTimeout(() => {
      const container = document.querySelector('.message-list-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  });

  useMessageStatus(supabase, activeConversation?.id, (statusUpdate) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === statusUpdate.message_id
          ? {
              ...msg,
              status: statusUpdate.status,
              seen_by: statusUpdate.seen_by,
            }
          : msg
      )
    );
  });

  const typingUsers = usePresence(supabase, activeConversation?.id, currentUserId);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  // Auto-create conversation if target user provided
  useEffect(() => {
    if (initialTargetUserId && conversations.length > 0) {
      const existing = conversations.find((c) =>
        c.participants?.some((p) => p.user_id === initialTargetUserId)
      );

      if (existing) {
        handleSelectConversation(existing);
      } else {
        createNewConversation(initialTargetUserId);
      }
    }
  }, [initialTargetUserId, conversations]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await listConversations(supabase, currentUserId);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Create new conversation
  const createNewConversation = async (targetUserId: string) => {
    try {
      const conv = await createOrGetDirectConversation(
        supabase,
        currentUserId,
        targetUserId
      );
      setConversations((prev) => [conv, ...prev]);
      setActiveConversation(conv);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Select conversation
  const handleSelectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    setMessages([]);
    setOffset(0);
    setHasMore(true);
    await loadMessages(conv.id, 0);
  };

  // Load messages
  const loadMessages = async (conversationId: string, currentOffset: number) => {
    try {
      setLoading(true);
      const data = await fetchMessages(supabase, conversationId, 30, currentOffset);

      if (data.length < 30) {
        setHasMore(false);
      }

      setMessages((prev) => {
        if (currentOffset === 0) return data.reverse();
        return [...data.reverse(), ...prev];
      });

      setOffset(currentOffset + data.length);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load more messages
  const handleLoadMore = () => {
    if (activeConversation && hasMore && !loading) {
      loadMessages(activeConversation.id, offset);
    }
  };

  // Send message
  const handleSendMessage = async (params: SendMessageParams) => {
    if (!activeConversation) return;

    try {
      const message = await sendMessage(supabase, activeConversation.id, params);
      setMessages((prev) => [...prev, message]);

      // Mark as seen by sender automatically
      await markAsSeen(supabase, message.id, currentUserId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: string, newBody: string) => {
    try {
      await editMessage(supabase, messageId, newBody);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, body: newBody, edited_at: new Date().toISOString() }
            : msg
        )
      );
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Error al editar el mensaje');
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return;

    try {
      await softDeleteMessage(supabase, messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString(), body: null, link_url: null }
            : msg
        )
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Error al eliminar el mensaje');
    }
  };

  // Typing handlers
  const handleTypingStart = () => {
    if (!activeConversation) return;
    
    supabase
      .channel(`presence:${activeConversation.id}`)
      .track({
        user_id: currentUserId,
        full_name: currentUserProfile?.full_name || 'Usuario',
        avatar_url: currentUserProfile?.avatar_url,
        is_typing: true,
      });
  };

  const handleTypingStop = () => {
    if (!activeConversation) return;

    supabase
      .channel(`presence:${activeConversation.id}`)
      .track({
        user_id: currentUserId,
        full_name: currentUserProfile?.full_name || 'Usuario',
        avatar_url: currentUserProfile?.avatar_url,
        is_typing: false,
      });
  };

  // Get other user in conversation
  const getOtherUserId = () => {
    if (!activeConversation) return null;
    const otherParticipant = activeConversation.participants?.find(
      (p) => p.user_id !== currentUserId
    );
    return otherParticipant?.user_id || null;
  };

  // Get player position for facet tags
  const getPlayerPosition = (): string | undefined => {
    if (!activeConversation) return undefined;
    const otherParticipant = activeConversation.participants?.find(
      (p) => p.user_id !== currentUserId
    );
    return otherParticipant?.profile?.player_position;
  };

  return (
    <div className="chat-container" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <SidebarConversations
        onSelectConversation={handleSelectConversation}
        activeConversationId={activeConversation?.id}
      />

      {/* Main Chat Area */}
      {activeConversation ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <ChatHeader
            conversationId={activeConversation.id}
            otherUserId={getOtherUserId() || ''}
          />

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
          >
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
            ))}
          </MessageList>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

          {/* Composer */}
          <Composer
            playerPosition={getPlayerPosition()}
            canSend={canSend}
            messagesRemaining={messagesRemaining}
            onSend={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <i className="fas fa-comments" style={{ fontSize: 64, marginBottom: 16 }}></i>
            <p>Seleccioná una conversación para comenzar</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// APP WRAPPER WITH PROVIDERS
// ============================================

export default function App() {
  // Get current user from Supabase Auth
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!currentUser) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p>Por favor, iniciá sesión para usar el chat</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ChatContainer
        currentUserId={currentUser.id}
        currentUserProfile={{
          user_id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || 'Usuario',
          avatar_url: currentUser.user_metadata?.avatar_url,
          role: currentUser.user_metadata?.role || 'jugador',
        }}
      />
    </QueryClientProvider>
  );
}
