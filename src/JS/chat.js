// ===== CHAT JAVASCRIPT - SISTEMA COMPLETO =====

class ChatApp {
  constructor() {
    this.conversations = [];
    this.activeConversationId = null;
    this.currentUser = {
      id: 'player1',
      name: 'Juan Pérez',
      avatar: 'imagenes/imagen1.png'
    };
    
    this.init();
  }

  init() {
    
    this.loadConversations();
    this.setupEventListeners();
    this.updateConversationsCount();
    
  }

  loadConversations() {
    // Datos de conversaciones simuladas
    this.conversations = [
      {
        id: 1,
        contact: {
          name: 'Carlos Mendoza',
          role: 'Scout - FC Barcelona',
          avatar: 'imagenes/imagen2.png',
          status: 'En línea',
          isOnline: true
        },
        lastMessage: '¿Podrías enviarme un video de tus mejores jugadas de los últimos 6 meses?',
        time: 'Ahora',
        timestamp: new Date('2024-10-16T11:45:00'),
        unread: 3,
        messages: [
          {
            id: 1,
            senderId: 'scout1',
            senderName: 'Carlos Mendoza',
            content: 'Hola Juan, he visto tu perfil y me ha llamado mucho la atención tu técnica defensiva.',
            time: '10:30 AM',
            timestamp: new Date('2024-10-16T10:30:00'),
            type: 'text'
          },
          {
            id: 2,
            senderId: 'player1',
            senderName: 'Juan Pérez',
            content: '¡Hola Carlos! Muchas gracias por contactarme. Es un honor que el FC Barcelona se interese en mi perfil.',
            time: '10:35 AM',
            timestamp: new Date('2024-10-16T10:35:00'),
            type: 'text'
          },
          {
            id: 3,
            senderId: 'scout1',
            senderName: 'Carlos Mendoza',
            content: 'He revisado tus videos y tu posicionamiento defensivo es excelente. Me recuerda a algunos de nuestros mejores centrales.',
            time: '10:40 AM',
            timestamp: new Date('2024-10-16T10:40:00'),
            type: 'text'
          },
          {
            id: 4,
            senderId: 'scout1',
            senderName: 'Carlos Mendoza',
            content: '¿Podrías enviarme un video de tus mejores jugadas de los últimos 6 meses?',
            time: '10:45 AM',
            timestamp: new Date('2024-10-16T10:45:00'),
            type: 'text'
          },
          {
            id: 5,
            senderId: 'scout1',
            senderName: 'Carlos Mendoza',
            content: 'También nos gustaría saber si tienes disponibilidad para una prueba presencial en Barcelona.',
            time: '10:46 AM',
            timestamp: new Date('2024-10-16T10:46:00'),
            type: 'text'
          }
        ]
      },
      {
        id: 2,
        contact: {
          name: 'Ana García',
          role: 'Directora - Academia Elite Madrid',
          avatar: 'imagenes/imagen3.png',
          status: 'En línea',
          isOnline: true
        },
        lastMessage: 'Tenemos una beca completa disponible para jugadores de tu perfil.',
        time: '5 min',
        timestamp: new Date('2024-10-16T11:40:00'),
        unread: 2,
        messages: [
          {
            id: 1,
            senderId: 'scout2',
            senderName: 'Ana García',
            content: 'Hola Juan, somos una academia en Madrid y nos gustaría hablar contigo sobre una oportunidad.',
            time: '9:15 AM',
            timestamp: new Date('2024-10-16T09:15:00'),
            type: 'text'
          },
          {
            id: 2,
            senderId: 'player1',
            senderName: 'Juan Pérez',
            content: 'Hola Ana, me encantaría conocer más sobre la academia y la oportunidad.',
            time: '9:20 AM',
            timestamp: new Date('2024-10-16T09:20:00'),
            type: 'text'
          },
          {
            id: 3,
            senderId: 'scout2',
            senderName: 'Ana García',
            content: 'Somos una de las academias más prestigiosas de España. Hemos formado jugadores que ahora juegan en La Liga.',
            time: '9:25 AM',
            timestamp: new Date('2024-10-16T09:25:00'),
            type: 'text'
          },
          {
            id: 4,
            senderId: 'scout2',
            senderName: 'Ana García',
            content: 'Tenemos una beca completa disponible para jugadores de tu perfil.',
            time: '11:40 AM',
            timestamp: new Date('2024-10-16T11:40:00'),
            type: 'text'
          }
        ]
      },
      {
        id: 3,
        contact: {
          name: 'Roberto Silva',
          role: 'Scout - Real Madrid Castilla',
          avatar: 'imagenes/imagen4.png',
          status: 'Hace 30 min',
          isOnline: false
        },
        lastMessage: '¿Tienes pasaporte europeo? Esto facilitaría mucho el proceso.',
        time: '30 min',
        timestamp: new Date('2024-10-16T11:15:00'),
        unread: 1,
        messages: [
          {
            id: 1,
            senderId: 'scout3',
            senderName: 'Roberto Silva',
            content: 'Hola Juan, soy Roberto Silva del Real Madrid Castilla. Tu perfil nos ha llamado mucho la atención.',
            time: '8:00 AM',
            timestamp: new Date('2024-10-16T08:00:00'),
            type: 'text'
          },
          {
            id: 2,
            senderId: 'player1',
            senderName: 'Juan Pérez',
            content: '¡Increíble! No puedo creer que el Real Madrid se haya fijado en mí. Es mi sueño desde niño.',
            time: '8:05 AM',
            timestamp: new Date('2024-10-16T08:05:00'),
            type: 'text'
          },
          {
            id: 3,
            senderId: 'scout3',
            senderName: 'Roberto Silva',
            content: 'Tu técnica defensiva y capacidad de anticipación son excepcionales para tu edad.',
            time: '8:10 AM',
            timestamp: new Date('2024-10-16T08:10:00'),
            type: 'text'
          },
          {
            id: 4,
            senderId: 'scout3',
            senderName: 'Roberto Silva',
            content: '¿Tienes pasaporte europeo? Esto facilitaría mucho el proceso.',
            time: '11:15 AM',
            timestamp: new Date('2024-10-16T11:15:00'),
            type: 'text'
          }
        ]
      },
      {
        id: 4,
        contact: {
          name: 'Marco Pérez',
          role: 'Agente FIFA',
          avatar: 'imagenes/imagen5.png',
          status: 'Hace 2 horas',
          isOnline: false
        },
        lastMessage: 'He hablado con varios clubes europeos interesados en tu perfil.',
        time: '2h',
        timestamp: new Date('2024-10-16T09:45:00'),
        unread: 1,
        messages: [
          {
            id: 1,
            senderId: 'agent1',
            senderName: 'Marco Pérez',
            content: 'Hola Juan, soy Marco Pérez, agente FIFA. Me han recomendado tu perfil varios scouts.',
            time: 'Ayer 6:30 PM',
            timestamp: new Date('2024-10-15T18:30:00'),
            type: 'text'
          },
          {
            id: 2,
            senderId: 'player1',
            senderName: 'Juan Pérez',
            content: 'Hola Marco, me interesa mucho saber más sobre las oportunidades que maneja.',
            time: 'Ayer 7:00 PM',
            timestamp: new Date('2024-10-15T19:00:00'),
            type: 'text'
          },
          {
            id: 3,
            senderId: 'agent1',
            senderName: 'Marco Pérez',
            content: 'He hablado con varios clubes europeos interesados en tu perfil.',
            time: '9:45 AM',
            timestamp: new Date('2024-10-16T09:45:00'),
            type: 'text'
          }
        ]
      }
    ];

    this.renderConversations();
  }

  setupEventListeners() {
    // Input de mensaje
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    if (messageInput && sendBtn) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      sendBtn.addEventListener('click', () => this.sendMessage());
    }

    // Otros botones
    const newConversationBtn = document.getElementById('newConversationBtn');
    if (newConversationBtn) {
      newConversationBtn.addEventListener('click', () => this.showNewConversationModal());
    }
  }

  renderConversations() {
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList) return;

    conversationsList.innerHTML = '';

    this.conversations.forEach(conversation => {
      const conversationElement = this.createConversationElement(conversation);
      conversationsList.appendChild(conversationElement);
    });
  }

  createConversationElement(conversation) {
    const element = document.createElement('div');
    element.className = 'conversation-item';
    element.dataset.conversationId = conversation.id;

    const isActive = this.activeConversationId === conversation.id;
    if (isActive) {
      element.classList.add('active');
    }

    element.innerHTML = `
      <img src="${conversation.contact.avatar}" alt="${conversation.contact.name}" class="conversation-avatar">
      <div class="conversation-details">
        <div class="conversation-name">${conversation.contact.name}</div>
        <div class="conversation-preview">${conversation.lastMessage}</div>
        <div class="conversation-meta">
          <div class="conversation-time">${conversation.time}</div>
          ${conversation.unread > 0 ? `<div class="unread-badge">${conversation.unread}</div>` : ''}
        </div>
      </div>
    `;

    element.addEventListener('click', () => this.selectConversation(conversation.id));

    return element;
  }

  selectConversation(conversationId) {
    
    
    // Actualizar conversación activa
    this.activeConversationId = conversationId;
    
    // Actualizar UI de conversaciones
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`[data-conversation-id="${conversationId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('active');
    }

    // Marcar mensajes como leídos
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (conversation) {
      conversation.unread = 0;
      this.renderConversations();
      this.updateConversationsCount();
    }

    // Mostrar chat activo
    this.showActiveChat(conversation);
    this.renderMessages(conversation);
  }

  showActiveChat(conversation) {
    const noChatState = document.getElementById('noChatState');
    const activeChat = document.getElementById('activeChat');
    
    if (noChatState && activeChat) {
      noChatState.style.display = 'none';
      activeChat.style.display = 'flex';
    }

    // Actualizar información del contacto
    const contactAvatar = document.getElementById('contactAvatar');
    const contactName = document.getElementById('contactName');
    const contactStatus = document.getElementById('contactStatus');

    if (contactAvatar) contactAvatar.src = conversation.contact.avatar;
    if (contactName) contactName.textContent = conversation.contact.name;
    if (contactStatus) {
      contactStatus.textContent = conversation.contact.status;
      contactStatus.className = `contact-status ${conversation.contact.isOnline ? 'online' : 'offline'}`;
    }
  }

  renderMessages(conversation) {
    const messagesArea = document.getElementById('messagesArea');
    if (!messagesArea || !conversation) return;

    messagesArea.innerHTML = '';

    conversation.messages.forEach(message => {
      const messageElement = this.createMessageElement(message);
      messagesArea.appendChild(messageElement);
    });

    // Scroll al final
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  createMessageElement(message) {
    const element = document.createElement('div');
    element.className = `message ${message.senderId === this.currentUser.id ? 'own' : ''}`;

    const avatar = message.senderId === this.currentUser.id 
      ? this.currentUser.avatar 
      : this.conversations.find(c => c.messages.some(m => m.id === message.id))?.contact.avatar || 'imagenes/default-avatar.png';

    element.innerHTML = `
      <img src="${avatar}" alt="Avatar" class="message-avatar">
      <div class="message-content">
        <div class="message-bubble">${message.content}</div>
        <div class="message-time">${message.time}</div>
      </div>
    `;

    return element;
  }

  sendMessage() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput || !this.activeConversationId) return;

    const messageText = messageInput.value.trim();
    if (!messageText) return;

    const conversation = this.conversations.find(c => c.id === this.activeConversationId);
    if (!conversation) return;

    // Crear nuevo mensaje
    const newMessage = {
      id: conversation.messages.length + 1,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      content: messageText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(),
      type: 'text'
    };

    // Agregar mensaje a la conversación
    conversation.messages.push(newMessage);
    conversation.lastMessage = messageText;
    conversation.time = 'Ahora';
    conversation.timestamp = new Date();

    // Actualizar UI
    this.renderMessages(conversation);
    this.renderConversations();
    
    // Limpiar input y reset altura
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Ocultar contador de caracteres
    const wrapper = messageInput.closest('.message-input-wrapper');
    if (wrapper) {
      wrapper.classList.remove('typing');
    }
    
    // Scroll automático al enviar mensaje
    setTimeout(() => {
      const messagesArea = document.getElementById('messagesArea');
      scrollToBottom(messagesArea, true);
    }, 100);

    // Simular respuesta automática después de 2 segundos
    setTimeout(() => {
      this.simulateAutoReply(conversation);
    }, 2000);

    
  }

  simulateAutoReply(conversation) {
    const autoReplies = [
      'Gracias por tu mensaje, te responderé pronto.',
      'Interesante, déjame revisar tu perfil en detalle.',
      'Perfecto, estaremos en contacto.',
      '¿Podrías contarme más sobre tu experiencia?',
      'Excelente, eso es justo lo que buscamos.',
      'Me parece muy bien, coordinemos una videollamada.',
      'Envíame tu CV actualizado por favor.',
      '¿Cuándo estarías disponible para una prueba?'
    ];

    const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
    
    const autoMessage = {
      id: conversation.messages.length + 1,
      senderId: conversation.contact.name.toLowerCase().replace(' ', ''),
      senderName: conversation.contact.name,
      content: randomReply,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(),
      type: 'text'
    };

    conversation.messages.push(autoMessage);
    conversation.lastMessage = randomReply;
    conversation.time = 'Ahora';

    // Solo actualizar si esta conversación está activa
    if (this.activeConversationId === conversation.id) {
      this.renderMessages(conversation);
      
      // Verificar si el usuario está al final del chat
      const messagesArea = document.getElementById('messagesArea');
      if (messagesArea) {
        const { scrollTop, scrollHeight, clientHeight } = messagesArea;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        if (isNearBottom) {
          // Auto-scroll si está cerca del final
          setTimeout(() => {
            scrollToBottom(messagesArea, true);
          }, 100);
        } else {
          // Mostrar indicador de mensajes nuevos
          showNewMessageIndicator();
        }
      }
    }

    // Agregar badge de no leído si no es la conversación activa
    if (this.activeConversationId !== conversation.id) {
      conversation.unread++;
    }

    this.renderConversations();
    this.updateConversationsCount();

    
  }

  updateConversationsCount() {
    const conversationsCount = document.getElementById('conversationsCount');
    if (conversationsCount) {
      const totalUnread = this.conversations.reduce((total, conv) => total + conv.unread, 0);
      conversationsCount.textContent = this.conversations.length;
      
      // Opcional: mostrar solo no leídos
      // conversationsCount.textContent = totalUnread;
    }
  }

  showNewConversationModal() {
    // Placeholder para funcionalidad de nueva conversación
    
    alert('Funcionalidad de nueva conversación en desarrollo');
  }
}

// Auto-respuestas más inteligentes basadas en el contexto
class SmartAutoReply {
  static getReplies(senderRole, messageContent) {
    const lowerMessage = messageContent.toLowerCase();
    
    if (senderRole?.includes('Scout')) {
      if (lowerMessage.includes('video')) {
        return [
          'Te enviaré los videos esta tarde.',
          'Claro, ¿qué tipo de videos prefieres?',
          'Tengo varios videos recientes, ¿cuál te interesa más?'
        ];
      }
      if (lowerMessage.includes('prueba')) {
        return [
          '¡Me encantaría participar! ¿Cuándo sería?',
          'Estoy muy interesado. ¿Qué necesito preparar?',
          '¿Dónde se realizaría la prueba?'
        ];
      }
      if (lowerMessage.includes('barcelona') || lowerMessage.includes('madrid')) {
        return [
          '¡Sería increíble! ¿Cuándo podríamos coordinar?',
          'Es mi sueño. ¿Qué pasos seguimos?',
          'Estoy muy emocionado por esta oportunidad.'
        ];
      }
    }

    if (senderRole?.includes('Agente')) {
      return [
        'Me interesa mucho trabajar contigo.',
        '¿Qué clubes están interesados?',
        '¿Cuáles serían los próximos pasos?'
      ];
    }

    // Respuestas genéricas
    return [
      'Gracias por contactarme.',
      'Me parece excelente.',
      '¿Podrías darme más detalles?',
      'Estoy muy interesado.'
    ];
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  
  const chatApp = new ChatApp();
  
  // Configurar funcionalidades de scrollbar y escritura mejorada
  setupScrollbarFunctionality(chatApp);
  setupEnhancedInput(chatApp);
});

// ===== FUNCIONALIDADES DE SCROLLBAR Y ESCRITURA =====

function setupScrollbarFunctionality(chatApp) {
  const messagesArea = document.getElementById('messagesArea');
  const scrollToBottomBtn = document.getElementById('scrollToBottom');
  const newMessagesIndicator = document.getElementById('newMessagesIndicator');
  
  if (!messagesArea) return;
  
  // Manejar scroll del área de mensajes
  messagesArea.addEventListener('scroll', () => {
    handleScroll(messagesArea, scrollToBottomBtn, newMessagesIndicator);
  });
  
  // Botón de scroll al final
  if (scrollToBottomBtn) {
    scrollToBottomBtn.addEventListener('click', () => {
      scrollToBottom(messagesArea, true);
    });
  }
  
  // Indicador de mensajes nuevos
  if (newMessagesIndicator) {
    newMessagesIndicator.addEventListener('click', () => {
      scrollToBottom(messagesArea, true);
    });
  }
}

function setupEnhancedInput(chatApp) {
  const messageInput = document.getElementById('messageInput');
  if (!messageInput) return;
  
  let typingTimeout;
  
  // Auto-resize del textarea
  messageInput.addEventListener('input', (e) => {
    handleInputResize(e.target);
    handleCharCounter(e.target);
    showTypingIndicator();
    
    // Limpiar indicador de escritura
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      hideTypingIndicator();
    }, 1000);
  });
  
  // Manejar Enter para enviar
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatApp.sendMessage();
    }
  });
}

function handleInputResize(textarea) {
  // Reset height para calcular correctamente
  textarea.style.height = 'auto';
  
  // Calcular nueva altura basada en el contenido
  const newHeight = Math.min(textarea.scrollHeight, 100); // Max 100px
  textarea.style.height = newHeight + 'px';
  
  // Añadir clase para mostrar contador si hay texto
  const wrapper = textarea.closest('.message-input-wrapper');
  if (textarea.value.length > 0) {
    wrapper.classList.add('typing');
  } else {
    wrapper.classList.remove('typing');
  }
}

function handleCharCounter(textarea) {
  const counter = document.getElementById('charCounter');
  const currentLength = textarea.value.length;
  const maxLength = 500;
  
  if (counter) {
    counter.textContent = `${currentLength}/${maxLength}`;
    
    // Cambiar color si se acerca al límite
    if (currentLength > maxLength * 0.8) {
      counter.style.color = '#e74c3c';
    } else if (currentLength > maxLength * 0.6) {
      counter.style.color = '#f39c12';
    } else {
      counter.style.color = '#94a3b8';
    }
  }
  
  // Prevenir más entrada si se alcanza el límite
  if (currentLength >= maxLength) {
    textarea.value = textarea.value.substring(0, maxLength);
  }
}

function showTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.add('show');
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.classList.remove('show');
  }
}

function handleScroll(messagesArea, scrollToBottomBtn, newMessagesIndicator) {
  if (!messagesArea) return;
  
  const { scrollTop, scrollHeight, clientHeight } = messagesArea;
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
  
  // Mostrar/ocultar botón de scroll
  if (scrollToBottomBtn) {
    if (isNearBottom) {
      scrollToBottomBtn.classList.remove('show');
    } else {
      scrollToBottomBtn.classList.add('show');
    }
  }
  
  // Ocultar indicador de mensajes nuevos si está cerca del final
  if (newMessagesIndicator && isNearBottom) {
    newMessagesIndicator.classList.remove('show');
  }
}

function scrollToBottom(messagesArea, smooth = false) {
  if (messagesArea) {
    const scrollOptions = {
      top: messagesArea.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    };
    messagesArea.scrollTo(scrollOptions);
  }
}

function showNewMessageIndicator() {
  const indicator = document.getElementById('newMessagesIndicator');
  if (indicator) {
    indicator.classList.add('show');
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      indicator.classList.remove('show');
    }, 3000);
  }
}

// Manejar visibilidad de la página para notificaciones
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    
  } else {
    
  }
});
