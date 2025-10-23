(function () {
  function computeBasePath() {
    const path = window.location.pathname || '/';
    const segments = path.split('/');
    if (segments.length <= 1) {
      return '/';
    }

    segments.pop();
    const base = segments.join('/') || '';
    if (!base || base === '/') {
      return '/';
    }

    return base.endsWith('/') ? base : `${base}/`;
  }

  const BASE_PATH = computeBasePath();
  const CHAT_PAGE_PATH = `${BASE_PATH}chat.html`;
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

    const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
      target_user_id: targetUserId,
    });

    if (error) {
      throw error;
    }

    const conversation = Array.isArray(data) ? data[0] : data;

    if (!conversation || !conversation.id) {
      throw new Error('No se pudo obtener la conversación.');
    }

    return conversation.id;
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
