(function () {
  const CHAT_PAGE_PATH = 'chat.html';
  const LOADING_ATTRIBUTE = 'data-chat-loading';
  const EVENT_NAME = 'sc:open-conversation';

  function ensureSupabase() {
    if (typeof supabase === 'undefined' || supabase === null) {
      if (typeof initSupabase === 'function') {
        initSupabase();
      }
    }

    if (typeof supabase === 'undefined' || supabase === null) {
      throw new Error('Supabase no está disponible.');
    }
  }

  async function createOrGetConversation(targetUserId) {
    ensureSupabase();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Debés iniciar sesión para enviar mensajes.');
    }

    const currentUserId = user.id;

    const { data: existingConversations, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (participantsError) {
      throw participantsError;
    }

    if (existingConversations && existingConversations.length > 0) {
      const ids = existingConversations.map((row) => row.conversation_id);
      const { data: sharedConversations, error: sharedError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', targetUserId)
        .in('conversation_id', ids);

      if (sharedError) {
        throw sharedError;
      }

      if (sharedConversations && sharedConversations.length > 0) {
        return sharedConversations[0].conversation_id;
      }

    }

    const conversationId = generateUuid();

    const { error: createError } = await supabase
      .from('conversations')
      .insert(
        {
          id: conversationId,
          is_group: false,
          created_by: currentUserId,
        },
        { returning: 'minimal' }
      );

    if (createError) {
      throw createError;
    }

    const participantsPayload = [
      {
        conversation_id: conversationId,
        user_id: currentUserId,
        role_in_conversation: 'owner',
      },
    ];

    if (targetUserId !== currentUserId) {
      participantsPayload.push({
        conversation_id: conversationId,
        user_id: targetUserId,
        role_in_conversation: 'member',
      });
    }

    const { error: addParticipantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsPayload);

    if (addParticipantsError) {
      throw addParticipantsError;
    }

    return conversationId;
  }

  function generateUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, (char) => {
      const rand = (Math.random() * 16) | 0;
      const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
      return value.toString(16);
    });
  }

  function redirectToChat(conversationId) {
    const url = new URL(CHAT_PAGE_PATH, window.location.origin);
    if (conversationId) {
      url.searchParams.set('conversationId', conversationId);
    }
    window.location.href = url.toString();
  }

  function isChatStandalonePage() {
    const pathname = window.location.pathname || '';
    const filename = pathname.split('/').pop() || '';
    return filename.toLowerCase() === 'chat.html';
  }

  function setTriggerLoading(trigger, isLoading) {
    if (!trigger) {
      return;
    }

    if (isLoading) {
      trigger.setAttribute(LOADING_ATTRIBUTE, 'true');
    } else {
      trigger.removeAttribute(LOADING_ATTRIBUTE);
    }

    if (typeof trigger.disabled === 'boolean') {
      trigger.disabled = Boolean(isLoading);
    }

    trigger.classList.toggle('is-loading', Boolean(isLoading));
  }

  async function handleTrigger(event) {
    const trigger = event.currentTarget;
    const isBusy = trigger.getAttribute(LOADING_ATTRIBUTE) === 'true';
    if (isBusy) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const targetUserId = trigger.getAttribute('data-chat-player-id') || '';

    if (!targetUserId) {
      redirectToChat(null);
      return;
    }

    try {
      setTriggerLoading(trigger, true);
      const conversationId = await createOrGetConversation(targetUserId);
      redirectToChat(conversationId);
    } catch (error) {
      console.error('Error al abrir el chat:', error);
      alert(error.message || 'No se pudo abrir el chat. Intentá nuevamente.');
    } finally {
      setTriggerLoading(trigger, false);
    }
  }

  function registerTriggers() {
    const triggers = document.querySelectorAll('[data-open-chat]');
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', handleTrigger);
    });
  }

  registerTriggers();

  window.ChatIntegration = {
    openChat: () => redirectToChat(null),
    closeChat: () => {},
    openConversation: (conversationId) => {
      if (!conversationId) {
        redirectToChat(null);
        return;
      }
      if (isChatStandalonePage()) {
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { conversationId } }));
        return;
      }
      redirectToChat(conversationId);
    },
    startConversation: async (targetUserId) => {
      if (!targetUserId) {
        redirectToChat(null);
        return;
      }

      try {
        const conversationId = await createOrGetConversation(targetUserId);
        if (isChatStandalonePage()) {
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { conversationId } }));
          return;
        }
        redirectToChat(conversationId);
      } catch (error) {
        console.error('Error al abrir el chat:', error);
        alert(error.message || 'No se pudo abrir el chat. Intentá nuevamente.');
      }
    },
  };
})();
