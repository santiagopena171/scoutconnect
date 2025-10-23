import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  supabase,
  listConversations,
  fetchMessages,
  sendMessage,
  markAsSeen,
  editMessage,
  softDeleteMessage,
} from './api';
import { SidebarConversations } from './components/SidebarConversations';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { Composer } from './components/Composer';
import { TypingIndicator } from './components/TypingIndicator';
import { useRealtimeMessages, useMessageStatus, usePresence, useAntiSpam } from './hooks';
import type { ConversationWithDetails, MessageWithSender, Profile } from './types';
import './App.css';

const MESSAGE_PAGE_SIZE = 30;

function getOtherParticipant(conversation: ConversationWithDetails, currentUserId: string): Profile | null {
  return conversation.participants.find((p) => p.id !== currentUserId) || null;
}

export default function App() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConversationWithDetails | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [oldestMessageCursor, setOldestMessageCursor] = useState<string | null>(null);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [conversationsVersion, setConversationsVersion] = useState(0);
  const [backUrl, setBackUrl] = useState<string | null>(null);

  const { messages, setMessages } = useRealtimeMessages(selectedConversationId);
  const statusesMap = useMessageStatus(selectedConversationId);
  const { presenceState, startTyping, stopTyping } = usePresence(selectedConversationId);
  const { canSendMessage, recordMessageSent, messagesRemaining } = useAntiSpam(selectedConversationId);

  useEffect(() => {
    const initAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        setCurrentUserId(data.user.id);
      }
      setAuthChecked(true);
    };

    initAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const referrer = document.referrer;
    let normalizedReferrer: string | null = null;

    if (referrer) {
      try {
        const refUrl = new URL(referrer, window.location.origin);
        if (refUrl.origin === window.location.origin) {
          normalizedReferrer = refUrl.toString();
        }
      } catch (error) {
        console.warn('Could not parse document.referrer', error);
      }
    }

    setBackUrl(normalizedReferrer);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const load = async () => {
      try {
        setIsLoadingConversations(true);
        const convs = await listConversations();
        setConversations(convs);
        if (selectedConversationId) {
          const active = convs.find((conv) => conv.id === selectedConversationId) || null;
          setActiveConversation(active);
        }
      } catch (error) {
        console.error('Error loading conversations', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    load();
  }, [currentUserId, conversationsVersion, selectedConversationId]);

  useEffect(() => {
    if (!currentUserId) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .single();

        if (error) throw error;
        setCurrentUserProfile(data as Profile);
      } catch (error) {
        console.error('Error loading current user profile', error);
      }
    };

    loadProfile();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedConversationId || !currentUserId || messages.length === 0) return;

    const lastIncoming = [...messages]
      .reverse()
      .find((msg) => msg.sender_id !== currentUserId);

    if (lastIncoming && lastIncoming.id !== lastSeenMessageId) {
      markAsSeen(selectedConversationId, lastIncoming.id)
        .then(() => setLastSeenMessageId(lastIncoming.id))
        .catch((error) => console.error('Error marking realtime message as seen', error));
    }
  }, [messages, selectedConversationId, currentUserId, lastSeenMessageId]);

  const messagesWithStatuses: MessageWithSender[] = useMemo(() => {
    return messages.map((msg) => ({
      ...msg,
      status: statusesMap.get(msg.id) ?? msg.status ?? null,
    }));
  }, [messages, statusesMap]);

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsLoadingMessages(true);
    setOldestMessageCursor(null);
    setLastSeenMessageId(null);

    try {
      const [conversation, fetchedMessages] = await Promise.all([
        ensureConversation(conversationId),
        fetchMessages(conversationId, { limit: MESSAGE_PAGE_SIZE }),
      ]);

      if (!conversation) {
        throw new Error('No se encontró la conversación');
      }

      setActiveConversation(conversation);
      setMessages(fetchedMessages);
      updatePaginationState(fetchedMessages);
      await markNewestAsSeen(conversationId, fetchedMessages);
    } catch (error) {
      console.error('Error loading conversation', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const ensureConversation = async (conversationId: string) => {
    const existing = conversations.find((conv) => conv.id === conversationId);
    if (existing) return existing;

    const convs = await listConversations();
    setConversations(convs);
    const found = convs.find((conv) => conv.id === conversationId) || null;
    
    // Actualizar activeConversation si encontramos la conversación
    if (found) {
      setActiveConversation(found);
    }
    
    return found;
  };

  const updatePaginationState = (fetchedMessages: MessageWithSender[]) => {
    setHasMoreMessages(fetchedMessages.length === MESSAGE_PAGE_SIZE);
    setOldestMessageCursor(fetchedMessages.length > 0 ? fetchedMessages[0].created_at : null);
  };

  const markNewestAsSeen = async (conversationId: string, fetchedMessages: MessageWithSender[]) => {
    if (!currentUserId) return;

    const lastIncoming = [...fetchedMessages]
      .reverse()
      .find((msg) => msg.sender_id !== currentUserId);

    if (lastIncoming) {
      try {
        await markAsSeen(conversationId, lastIncoming.id);
        setLastSeenMessageId(lastIncoming.id);
      } catch (error) {
        console.error('Error marking messages as seen', error);
      }
    }
  };

  const handleLoadMore = async () => {
    if (!selectedConversationId || !oldestMessageCursor) return;
    setIsLoadingMessages(true);

    try {
      const older = await fetchMessages(selectedConversationId, {
        limit: MESSAGE_PAGE_SIZE,
        before: oldestMessageCursor,
      });

      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
        setOldestMessageCursor(older[0].created_at);
        setHasMoreMessages(older.length === MESSAGE_PAGE_SIZE);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Error loading older messages', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (params: Parameters<typeof sendMessage>[1]) => {
    if (!selectedConversationId || !currentUserId) return;

    try {
      const sent = await sendMessage(selectedConversationId, params);

      const optimisticMessage: MessageWithSender = {
        ...sent,
        sender: {
          id: currentUserId,
          role: currentUserProfile?.role ?? 'player',
          full_name: currentUserProfile?.full_name ?? 'Vos',
          avatar_url: currentUserProfile?.avatar_url ?? null,
          created_at: currentUserProfile?.created_at ?? new Date().toISOString(),
        },
        status: null,
        is_own: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      recordMessageSent();
      setConversationsVersion((version) => version + 1);
    } catch (error) {
      console.error('Error sending message', error);
      alert('No se pudo enviar el mensaje');
    }
  };

  const handleEditMessage = async (messageId: string, newBody: string) => {
    try {
      const updated = await editMessage(messageId, newBody);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, body: updated.body, edited_at: updated.edited_at } : msg))
      );
      setConversationsVersion((version) => version + 1);
    } catch (error) {
      console.error('Error editing message', error);
      alert('No se pudo editar el mensaje');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;

    try {
      await softDeleteMessage(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, deleted_at: new Date().toISOString(), body: null, link_url: null }
            : msg
        )
      );
      setConversationsVersion((version) => version + 1);
    } catch (error) {
      console.error('Error deleting message', error);
      alert('No se pudo eliminar el mensaje');
    }
  };

  const handleReportMessage = (messageId: string) => {
    console.log('Report message', messageId);
    alert('Funcionalidad de reporte próximamente');
  };

  const handleBack = useCallback(() => {
    if (backUrl) {
      window.location.href = backUrl;
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = 'index.html';
  }, [backUrl]);

  const handleSelectConversationRef = useRef(handleSelectConversation);

  useEffect(() => {
    handleSelectConversationRef.current = handleSelectConversation;
  }, [handleSelectConversation]);

  useEffect(() => {
    if (!currentUserId) return;
    
    const params = new URLSearchParams(window.location.search);
    const conversationIdFromQuery = params.get('conversationId') ?? params.get('conversation_id');
    const fn = handleSelectConversationRef.current;
    if (conversationIdFromQuery && fn) {
      fn(conversationIdFromQuery);
    }
  }, [currentUserId]);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>;
      const conversationId = customEvent.detail?.conversationId;
      const fn = handleSelectConversationRef.current;
      if (conversationId && fn) {
        fn(conversationId);
      }
    };

    window.addEventListener('sc:open-conversation', listener as EventListener);
    return () => {
      window.removeEventListener('sc:open-conversation', listener as EventListener);
    };
  }, []);

  // Obtener participant: primero de activeConversation, sino de conversations, sino del primer mensaje
  const participant = (() => {
    if (activeConversation && currentUserId) {
      return getOtherParticipant(activeConversation, currentUserId);
    }
    
    // Fallback: buscar en conversations
    if (selectedConversationId && currentUserId) {
      const conv = conversations.find((c) => c.id === selectedConversationId);
      if (conv) {
        return getOtherParticipant(conv, currentUserId);
      }
    }
    
    // Último fallback: obtener del primer mensaje si existe
    if (messages.length > 0 && currentUserId) {
      const firstMessage = messages[0];
      if (firstMessage.sender_id !== currentUserId) {
        return firstMessage.sender;
      }
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id !== currentUserId) {
        return lastMessage.sender;
      }
    }
    
    return null;
  })();

  const canSend = canSendMessage();

  if (!authChecked) {
    return (
      <div className="chat-loading-state">
        <i className="fas fa-spinner fa-spin" />
        <span>Verificando sesión...</span>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="chat-auth-required">
        <h2>Necesitás iniciar sesión</h2>
        <p>Ingresá con tu cuenta de ScoutConnect para ver los mensajes.</p>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <SidebarConversations
        currentUserId={currentUserId}
        conversations={conversations}
        isLoading={isLoadingConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
      />

      <div className="chat-main">
        <ChatHeader
          participant={participant}
          presenceState={presenceState}
          onBack={handleBack}
        />

        {selectedConversationId ? (
          <>
            <MessageList
              messages={messagesWithStatuses}
              presenceState={presenceState}
              currentUserId={currentUserId}
              isLoading={isLoadingMessages}
              hasMore={hasMoreMessages}
              onLoadMore={handleLoadMore}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onReport={handleReportMessage}
            />

            {presenceState.typing_users.length > 0 && (
              <TypingIndicator typingUsers={presenceState.typing_users} currentUserId={currentUserId} />
            )}

            <Composer
              playerPosition={undefined}
              canSend={canSend}
              messagesRemaining={messagesRemaining}
              onSend={handleSendMessage}
              onTypingStart={startTyping}
              onTypingStop={stopTyping}
            />
          </>
        ) : (
          <div className="chat-empty-state">
            <i className="fas fa-comments" />
            <h3>Seleccioná una conversación</h3>
            <p>Elegí un contacto en la barra izquierda para comenzar a chatear.</p>
          </div>
        )}
      </div>
    </div>
  );
}
