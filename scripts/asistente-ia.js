// Configuración del Worker de Cloudflare AI
const WORKER_URL = 'https://scoutassistant.santijoelpena.workers.dev';

class ChatAssistant {
    constructor() {
        this.messages = [];
        this.conversationId = null;
        this.userToken = null;
        this.scoutName = null;
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.init();
    }

    init() {
        // Verificar autenticación
        this.checkAuth();

        // Event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', () => {
                const prompt = button.getAttribute('data-prompt');
                this.chatInput.value = prompt;
                this.sendMessage();
            });
        });
    }

    async checkAuth() {
        try {
            // Usar la misma lógica que auth-guard.js
            let supabase;
            
            if (typeof window.initSupabase === 'function') {
                supabase = await window.initSupabase();
            } else if (typeof window.supabase !== 'undefined') {
                supabase = window.supabase;
            } else {
                throw new Error('Supabase no está disponible');
            }

            console.log('🔍 Verificando sesión...');
            
            // Obtener sesión actual
            const { data: { session }, error } = await supabase.auth.getSession();
            
            console.log('Sesión:', session ? '✅ Activa' : '❌ No activa', error ? `Error: ${error.message}` : '');
            
            if (error) {
                console.error('Error al obtener sesión:', error);
                throw error;
            }
            
            if (!session) {
                console.warn('⚠️ No hay sesión activa');
                this.showError('⚠️ No estás logueado. Por favor inicia sesión primero.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
                return;
            }

            // Guardar token del usuario
            this.userToken = session.access_token;
            console.log('✅ Token obtenido:', this.userToken ? 'OK' : 'FALLO');
            
            // Obtener información del scout desde profiles
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', session.user.id)
                .single();
            
            if (profileError) {
                console.error('Error al obtener perfil:', profileError);
            }
            
            if (profile) {
                this.scoutName = profile.full_name;
                console.log('✅ Scout:', this.scoutName);
                this.updateWelcomeMessage();
            } else {
                console.warn('⚠️ No se encontró información del scout');
            }

        } catch (error) {
            console.error('❌ Error de autenticación:', error);
            this.showError(`Error: ${error.message}`);
        }
    }

    updateWelcomeMessage() {
        const welcomeMsg = document.querySelector('.message.system .message-content');
        if (welcomeMsg && this.scoutName) {
            welcomeMsg.innerHTML = `👋 ¡Hola <strong>${this.scoutName}</strong>! Soy tu asistente de scouting. Puedo ayudarte a analizar tus reportes, recomendar jugadores y mejorar tu metodología. ¿En qué puedo ayudarte hoy?`;
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message) return;
        
        // Validar que se haya configurado la URL del worker
        if (WORKER_URL === 'https://tu-worker.tu-cuenta.workers.dev') {
            this.showError('⚠️ Por favor configura la URL de tu Worker de Cloudflare en scripts/asistente-ia.js');
            return;
        }

        // Deshabilitar input mientras se procesa
        this.chatInput.disabled = true;
        this.sendButton.disabled = true;

        // Añadir mensaje del usuario
        this.addMessage('user', message);
        
        // Limpiar input
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';

        // Mostrar indicador de escritura
        const typingId = this.showTypingIndicator();

        try {
            // Llamar al Worker de Cloudflare
            const response = await this.callWorkerAI(message);
            
            // Remover indicador de escritura
            this.removeTypingIndicator(typingId);
            
            // Añadir respuesta del asistente
            this.addMessage('assistant', response);
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator(typingId);
            this.showError('Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.');
        } finally {
            // Rehabilitar input
            this.chatInput.disabled = false;
            this.sendButton.disabled = false;
            this.chatInput.focus();
        }
    }

    async callWorkerAI(userMessage) {
        // Construir el historial de mensajes
        this.messages.push({
            role: 'user',
            content: userMessage
        });

        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: this.messages,
                conversationId: this.conversationId,
                userToken: this.userToken
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error al procesar la solicitud');
        }

        // Guardar el ID de la conversación
        if (data.conversationId) {
            this.conversationId = data.conversationId;
        }
        
        // Extraer la respuesta del asistente
        const assistantMessage = data.response || 'Lo siento, no pude generar una respuesta.';

        // Guardar respuesta en el historial
        this.messages.push({
            role: 'assistant',
            content: assistantMessage
        });

        return assistantMessage;
    }

    addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Formatear el contenido (convertir markdown básico a HTML)
        contentDiv.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll al final
        this.scrollToBottom();
    }

    formatMessage(content) {
        // Convertir saltos de línea
        content = content.replace(/\n/g, '<br>');
        
        // Convertir negritas **texto**
        content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Convertir cursivas *texto*
        content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Convertir listas
        content = content.replace(/^- (.+)$/gm, '• $1');
        
        return content;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        const id = 'typing-' + Date.now();
        typingDiv.id = id;
        typingDiv.className = 'message assistant';
        
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        return id;
    }

    removeTypingIndicator(id) {
        const typingDiv = document.getElementById(id);
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.chatMessages.appendChild(errorDiv);
        this.scrollToBottom();
        
        // Remover después de 5 segundos
        setTimeout(() => errorDiv.remove(), 5000);
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Inicializar el chat cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatAssistant();
});
