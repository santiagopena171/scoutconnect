// ============================================
// CHAT MODULE - REACT HOOKS
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './api';
import type {
  Message,
  MessageStatus,
  MessageWithSender,
  TypingUser,
  PresenceState,
  Profile,
} from './types';

// ============================================
// HOOK: useRealtimeMessages
// ============================================

export function useRealtimeMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Fetch sender profile
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMessage.sender_id)
            .single();

          const { data: { user } } = await supabase.auth.getUser();

          const enrichedMessage: MessageWithSender = {
            ...newMessage,
            sender: senderProfile as Profile,
            status: null,
            is_own: user?.id === newMessage.sender_id,
          };

          setMessages((prev) => {
            const exists = prev.find((msg) => msg.id === enrichedMessage.id);
            if (exists) {
              return prev.map((msg) =>
                msg.id === enrichedMessage.id ? { ...msg, ...enrichedMessage } : msg
              );
            }
            return [...prev, enrichedMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, setMessages };
}

// ============================================
// HOOK: useMessageStatus
// ============================================

export function useMessageStatus(conversationId: string | null) {
  const [statuses, setStatuses] = useState<Map<string, MessageStatus>>(new Map());

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`message_status:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_status',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const status = payload.new as { message_id: string; status: MessageStatus };
            
            setStatuses((prev) => {
              const newStatuses = new Map(prev);
              newStatuses.set(status.message_id, status.status);
              return newStatuses;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return statuses;
}

// ============================================
// HOOK: usePresence
// ============================================

export function usePresence(conversationId: string | null) {
  const [presenceState, setPresenceState] = useState<PresenceState>({
    online_users: [],
    typing_users: [],
  });

  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    const presenceChannel = supabase.channel(
      `presence:conversation:${conversationId}`,
      {
        config: {
          presence: {
            key: conversationId,
          },
        },
      }
    );

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: TypingUser[] = [];

        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.user_id && presence.name) {
              users.push({
                user_id: presence.user_id,
                name: presence.name,
                avatar_url: presence.avatar_url || null,
              });
            }
          });
        });

        setPresenceState((prev) => ({
          ...prev,
          online_users: users,
        }));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            await presenceChannel.track({
              user_id: user.id,
              name: profile?.full_name || 'Unknown',
              avatar_url: profile?.avatar_url,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [conversationId]);

  // Typing indicators
  const startTyping = useCallback(async () => {
    if (!channel || !conversationId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    await channel.track({
      user_id: user.id,
      name: profile?.full_name || 'Unknown',
      avatar_url: profile?.avatar_url,
      typing: true,
      typing_at: new Date().toISOString(),
    });

    setPresenceState((prev) => {
      const typingUser: TypingUser = {
        user_id: user.id,
        name: profile?.full_name || 'Unknown',
        avatar_url: profile?.avatar_url || null,
      };

      const alreadyTyping = prev.typing_users.some(
        (u) => u.user_id === user.id
      );

      return {
        ...prev,
        typing_users: alreadyTyping
          ? prev.typing_users
          : [...prev.typing_users, typingUser],
      };
    });
  }, [channel, conversationId]);

  const stopTyping = useCallback(async () => {
    if (!channel || !conversationId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    await channel.track({
      user_id: user.id,
      name: profile?.full_name || 'Unknown',
      avatar_url: profile?.avatar_url,
      typing: false,
    });

    setPresenceState((prev) => ({
      ...prev,
      typing_users: prev.typing_users.filter((u) => u.user_id !== user.id),
    }));
  }, [channel, conversationId]);

  return {
    presenceState,
    startTyping,
    stopTyping,
  };
}

// ============================================
// HOOK: useAntiSpam
// ============================================

export function useAntiSpam(conversationId: string | null) {
  const [messageTimestamps, setMessageTimestamps] = useState<number[]>([]);

  const canSendMessage = useCallback(() => {
    const now = Date.now();
    const recentMessages = messageTimestamps.filter(
      (ts) => now - ts < 15000 // 15 seconds
    );

    if (recentMessages.length >= 5) {
      return false;
    }

    return true;
  }, [messageTimestamps]);

  const recordMessageSent = useCallback(() => {
    setMessageTimestamps((prev) => [...prev, Date.now()]);
  }, []);

  // Cleanup old timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessageTimestamps((prev) =>
        prev.filter((ts) => now - ts < 15000)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMessageTimestamps([]);
  }, [conversationId]);

  return {
    canSendMessage,
    recordMessageSent,
    messagesRemaining: Math.max(0, 5 - messageTimestamps.length),
  };
}
