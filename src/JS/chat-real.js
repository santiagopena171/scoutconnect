// =============================================
// CHAT - INTEGRACIÓN TIEMPO REAL CON SUPABASE
// =============================================

class ChatApp {
  constructor() {
    this.conversations = [];
    this.activeConversationId = null;
    this.currentUser = null;
    this.messageSubscription = null;
    this.statusSubscription = null;
    
    this.init();
  }

  async init() {
    // Verificar autenticación
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    // Cargar perfil del usuario actual
    await this.loadCurrentUserProfile(session.user.id);
    
    // Cargar conversaciones
    await this.loadConversations();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Actualizar contador
    this.updateConversationsCount();
    
    // Suscribirse a mensajes en tiempo real
    this.subscribeToMessages();
    
    // Suscribirse a cambios de estado (lectura)
    this.subscribeToMessageStatus();
  }

  async loadCurrentUserProfile(userId) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error cargando perfil:', error);
      return;
    }

    this.currentUser = {
      id: profile.id,
      name: profile.full_name,
      avatar: profile.avatar_url || 'imagenes/default-avatar.png'
    };
  }

  async loadConversations() {
    // Obtener todas las conversaciones donde el usuario es participante
    const { data: participants, error: participantsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', this.currentUser.id);

    if (participantsError) {
      console.error('Error cargando participantes:', participantsError);
      return;
    }

    const conversationIds = participants.map(p => p.conversation_id);

    if (conversationIds.length === 0) {
      this.renderConversationsList();
      return;
    }

    // Obtener detalles de cada conversación
    const conversationsPromises = conversationIds.map(async (convId) => {
      // Obtener último mensaje
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('body, created_at, sender_id')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Obtener participantes (el otro usuario en conversación directa)
      const { data: otherParticipants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', convId)
        .neq('user_id', this.currentUser.id);

      if (!otherParticipants || otherParticipants.length === 0) return null;

      const otherUserId = otherParticipants[0].user_id;

      // Obtener perfil del otro usuario
      const { data: contactProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, user_type')
        .eq('id', otherUserId)
        .single();

      if (!contactProfile) return null;

      // Contar mensajes no leídos
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .neq('sender_id', this.currentUser.id)
        .not('id', 'in', `(
          SELECT message_id FROM message_status 
          WHERE user_id = '${this.currentUser.id}' 
          AND status = 'seen'
        )`);

      return {
        id: convId,
        contact: {
          id: contactProfile.id,
          name: contactProfile.full_name,
          role: this.getUserTypeLabel(contactProfile.user_type),
          avatar: contactProfile.avatar_url || 'imagenes/default-avatar.png',
          status: 'En línea', // TODO: implementar presencia real
          isOnline: false
        },
        lastMessage: lastMessage?.body || 'Sin mensajes',
        time: this.formatRelativeTime(lastMessage?.created_at),
        timestamp: new Date(lastMessage?.created_at),
        unread: unreadCount || 0
      };
    });

    const conversationsData = await Promise.all(conversationsPromises);
    this.conversations = conversationsData.filter(c => c !== null);
    
    // Ordenar por timestamp más reciente
    this.conversations.sort((a, b) => b.timestamp - a.timestamp);

    this.renderConversationsList();
  }

  getUserTypeLabel(userType) {
    const labels = {
      'scout': 'Scout',
      'ojeador': 'Scout',
      'jugador': 'Futbolista',
      'futbolista': 'Futbolista',
      'player': 'Futbolista'
    };
    return labels[userType] || 'Usuario';
  }

  formatRelativeTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  renderConversationsList() {
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList) return;

    if (this.conversations.length === 0) {
      conversationsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <p>No tienes conversaciones aún</p>
          <small>Comienza a conectarte con otros usuarios</small>
        </div>
      `;
      return;
    }

    conversationsList.innerHTML = this.conversations.map(conv => `
      <div class="conversation-item ${conv.id === this.activeConversationId ? 'active' : ''}" 
           data-conversation-id="${conv.id}">
        <div class="conversation-avatar">
          <img src="${conv.contact.avatar}" alt="${conv.contact.name}">
          ${conv.contact.isOnline ? '<span class="online-indicator"></span>' : ''}
        </div>
        <div class="conversation-info">
          <div class="conversation-header">
            <h4 class="conversation-name">${conv.contact.name}</h4>
            <span class="conversation-time">${conv.time}</span>
          </div>
          <div class="conversation-preview">
            <p class="last-message">${conv.lastMessage}</p>
            ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Agregar event listeners
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const convId = item.getAttribute('data-conversation-id');
        this.openConversation(convId);
      });
    });
  }

  async openConversation(conversationId) {
    this.activeConversationId = conversationId;
    const conversation = this.conversations.find(c => c.id === conversationId);
    
    if (!conversation) return;

    // Actualizar UI
    this.renderConversationsList();
    this.renderChatHeader(conversation);
    
    // Cargar mensajes
    await this.loadMessages(conversationId);
    
    // Marcar mensajes como leídos
    await this.markMessagesAsRead(conversationId);
    
    // Mostrar área de chat
    document.getElementById('emptyState')?.classList.add('hidden');
    document.getElementById('chatArea')?.classList.remove('hidden');
  }

  renderChatHeader(conversation) {
    const chatHeader = document.getElementById('chatHeader');
    if (!chatHeader) return;

    chatHeader.innerHTML = `
      <div class="chat-header-info">
        <img src="${conversation.contact.avatar}" alt="${conversation.contact.name}" class="chat-avatar">
        <div>
          <h3 class="chat-contact-name">${conversation.contact.name}</h3>
          <span class="chat-contact-role">${conversation.contact.role}</span>
        </div>
      </div>
      <div class="chat-header-actions">
        <button class="icon-button" id="chatMenuBtn">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </div>
    `;
  }

  async loadMessages(conversationId) {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        body,
        created_at,
        sender_id,
        edited_at,
        deleted_at
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error cargando mensajes:', error);
      return;
    }

    // Obtener información de remitentes
    const senderIds = [...new Set(messages.map(m => m.sender_id))];
    const { data: senders } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', senderIds);

    const sendersMap = {};
    senders.forEach(s => {
      sendersMap[s.id] = s;
    });

    // Renderizar mensajes
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea) return;

    if (messages.length === 0) {
      messagesArea.innerHTML = `
        <div class="no-messages">
          <p>No hay mensajes en esta conversación</p>
          <small>Envía el primer mensaje para comenzar</small>
        </div>
      `;
      return;
    }

    messagesArea.innerHTML = messages.map(msg => {
      const sender = sendersMap[msg.sender_id];
      const isSent = msg.sender_id === this.currentUser.id;
      const time = new Date(msg.created_at).toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `
        <div class="message ${isSent ? 'sent' : 'received'}">
          ${!isSent ? `<img src="${sender?.avatar_url || 'imagenes/default-avatar.png'}" alt="${sender?.full_name}" class="message-avatar">` : ''}
          <div class="message-content">
            ${!isSent ? `<span class="message-sender">${sender?.full_name}</span>` : ''}
            <div class="message-bubble">
              <p>${this.escapeHtml(msg.body)}</p>
              <span class="message-time">${time}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll al final
    this.scrollToBottom(messagesArea);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  scrollToBottom(element, smooth = false) {
    if (!element) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  async markMessagesAsRead(conversationId) {
    // Obtener mensajes no leídos de esta conversación
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', this.currentUser.id)
      .not('id', 'in', `(
        SELECT message_id FROM message_status 
        WHERE user_id = '${this.currentUser.id}' 
        AND status = 'seen'
      )`);

    if (!unreadMessages || unreadMessages.length === 0) return;

    // Insertar estados de "visto"
    const statusInserts = unreadMessages.map(msg => ({
      message_id: msg.id,
      user_id: this.currentUser.id,
      status: 'seen',
      updated_at: new Date().toISOString()
    }));

    await supabase
      .from('message_status')
      .upsert(statusInserts);

    // Actualizar contador de no leídos
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unread = 0;
      this.updateConversationsCount();
      this.renderConversationsList();
    }
  }

  setupEventListeners() {
    // Formulario de envío
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
      messageForm.addEventListener('submit', (e) => this.handleSendMessage(e));
    }

    // Botón de envío
    const sendBtn = document.getElementById('sendMessageBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', (e) => this.handleSendMessage(e));
    }

    // Input de mensaje
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
      messageInput.addEventListener('input', () => {
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
          sendBtn.disabled = messageInput.value.trim().length === 0;
        }
      });

      messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage(e);
        }
      });
    }

    // Búsqueda de conversaciones
    const searchInput = document.getElementById('searchConversations');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
  }

  async handleSendMessage(e) {
    e.preventDefault();

    if (!this.activeConversationId) {
      console.error('No hay conversación activa');
      return;
    }

    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    if (!messageText) return;

    // Limpiar input
    messageInput.value = '';
    messageInput.focus();

    // Deshabilitar botón de envío
    const sendBtn = document.getElementById('sendMessageBtn');
    if (sendBtn) sendBtn.disabled = true;

    try {
      // Insertar mensaje en la base de datos
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: this.activeConversationId,
          sender_id: this.currentUser.id,
          body: messageText
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Mensaje enviado:', newMessage);

      // El mensaje se agregará automáticamente via suscripción en tiempo real
      // Actualizar conversación local
      const conversation = this.conversations.find(c => c.id === this.activeConversationId);
      if (conversation) {
        conversation.lastMessage = messageText;
        conversation.time = 'Ahora';
        conversation.timestamp = new Date();
        
        // Mover a la parte superior
        this.conversations = this.conversations.filter(c => c.id !== this.activeConversationId);
        this.conversations.unshift(conversation);
        
        this.renderConversationsList();
      }

    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
      
      // Restaurar mensaje en el input
      messageInput.value = messageText;
    }
  }

  subscribeToMessages() {
    // Suscribirse a nuevos mensajes en todas las conversaciones del usuario
    this.messageSubscription = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('📨 Nuevo mensaje recibido:', payload);
          this.handleNewMessage(payload.new);
        }
      )
      .subscribe();
  }

  async handleNewMessage(message) {
    // Verificar si el mensaje es de una conversación del usuario
    const conversation = this.conversations.find(c => c.id === message.conversation_id);
    
    if (!conversation) return;

    // Si es la conversación activa, agregar mensaje al chat
    if (message.conversation_id === this.activeConversationId) {
      const messagesArea = document.getElementById('messagesArea');
      if (!messagesArea) return;

      // Obtener información del remitente
      const { data: sender } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', message.sender_id)
        .single();

      const isSent = message.sender_id === this.currentUser.id;
      const time = new Date(message.created_at).toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const messageHtml = `
        <div class="message ${isSent ? 'sent' : 'received'}">
          ${!isSent ? `<img src="${sender?.avatar_url || 'imagenes/default-avatar.png'}" alt="${sender?.full_name}" class="message-avatar">` : ''}
          <div class="message-content">
            ${!isSent ? `<span class="message-sender">${sender?.full_name}</span>` : ''}
            <div class="message-bubble">
              <p>${this.escapeHtml(message.body)}</p>
              <span class="message-time">${time}</span>
            </div>
          </div>
        </div>
      `;

      messagesArea.insertAdjacentHTML('beforeend', messageHtml);
      this.scrollToBottom(messagesArea, true);

      // Si no es nuestro mensaje, marcarlo como leído
      if (!isSent) {
        await this.markMessagesAsRead(this.activeConversationId);
      }
    } else {
      // Actualizar preview y contador de no leídos
      if (message.sender_id !== this.currentUser.id) {
        conversation.unread += 1;
      }
      
      conversation.lastMessage = message.body;
      conversation.time = 'Ahora';
      conversation.timestamp = new Date();
      
      // Mover a la parte superior
      this.conversations = this.conversations.filter(c => c.id !== message.conversation_id);
      this.conversations.unshift(conversation);
      
      this.renderConversationsList();
      this.updateConversationsCount();
    }
  }

  subscribeToMessageStatus() {
    // Suscribirse a cambios de estado de mensajes
    this.statusSubscription = supabase
      .channel('message-status-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_status'
        },
        (payload) => {
          console.log('👁️ Estado de mensaje actualizado:', payload);
          // TODO: Implementar indicador visual de "visto"
        }
      )
      .subscribe();
  }

  updateConversationsCount() {
    const totalUnread = this.conversations.reduce((sum, conv) => sum + conv.unread, 0);
    
    // Actualizar badge del navbar
    const badge = document.getElementById('messagesBadge');
    if (badge) {
      if (totalUnread > 0) {
        badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    // Actualizar contador en el header del chat
    const countElement = document.getElementById('conversationsCount');
    if (countElement) {
      countElement.textContent = this.conversations.length;
    }
  }

  handleSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
      const convId = item.getAttribute('data-conversation-id');
      const conversation = this.conversations.find(c => c.id === convId);
      
      if (!conversation) return;
      
      const matchesSearch = 
        conversation.contact.name.toLowerCase().includes(searchTerm) ||
        conversation.lastMessage.toLowerCase().includes(searchTerm);
      
      item.style.display = matchesSearch ? 'flex' : 'none';
    });
  }

  destroy() {
    // Limpiar suscripciones
    if (this.messageSubscription) {
      supabase.removeChannel(this.messageSubscription);
    }
    if (this.statusSubscription) {
      supabase.removeChannel(this.statusSubscription);
    }
  }
}

// Inicializar chat cuando el DOM esté listo
let chatApp;
document.addEventListener('DOMContentLoaded', () => {
  chatApp = new ChatApp();
});

// Limpiar al salir
window.addEventListener('beforeunload', () => {
  if (chatApp) {
    chatApp.destroy();
  }
});
