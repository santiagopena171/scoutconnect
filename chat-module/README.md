# ScoutConnect Chat Module - Documentación Completa

## 🚀 Instalación

### 1. Base de Datos y Realtime

El script SQL ya incluye la habilitación de Realtime, así que solo necesitás ejecutarlo:

```bash
# Opción A: Desde la interfaz web de Supabase
1. Abrí Supabase Dashboard → SQL Editor
2. Copiá el contenido de database/chat-setup.sql (ya está en tu portapapeles!)
3. Pegalo y ejecutá (RUN o Ctrl+Enter)

# Opción B: Desde CLI (si tenés Supabase CLI instalado)
supabase db push --file database/chat-setup.sql
```

**Nota sobre Realtime:** El script incluye estos comandos al final:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_status;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_presence;
```

Esto habilita automáticamente Realtime sin necesidad de ir a Database → Replication (que todavía dice "coming soon" en algunas versiones).

### 2. Instalar Dependencias

```bash
cd chat-module
npm install
```

### 3. Variables de Entorno

```bash
cp .env.example .env
# Editá .env con tus credenciales de Supabase
```

Archivo `.env`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Desarrollo

```bash
npm run dev
```

---

## 📂 Estructura del Proyecto

```
chat-module/
├── database/
│   └── chat-setup.sql         # Schema completo con RLS
├── types.ts                   # TypeScript types
├── api.ts                     # 7 funciones API
├── hooks.ts                   # 4 React hooks
├── components/
│   ├── SidebarConversations.tsx
│   ├── SidebarConversations.css
│   ├── ChatHeader.tsx
│   ├── ChatHeader.css
│   ├── MessageList.tsx
│   ├── MessageList.css
│   ├── MessageItem.tsx
│   ├── MessageItem.css
│   ├── Composer.tsx
│   ├── Composer.css
│   ├── TypingIndicator.tsx
│   └── TypingIndicator.css
├── utils/
│   └── facetTags.ts          # Mapeo posición → tags
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎯 Uso Básico

### Ejemplo Completo

```tsx
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { SidebarConversations } from './components/SidebarConversations';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { Composer } from './components/Composer';
import { TypingIndicator } from './components/TypingIndicator';
import { useRealtimeMessages, usePresence, useAntiSpam } from './hooks';
import { fetchMessages, sendMessage } from './api';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const queryClient = new QueryClient();

function ChatApp() {
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);

  // Realtime
  useRealtimeMessages(supabase, activeConv?.id, (msg) => {
    setMessages(prev => [...prev, msg]);
  });

  const typingUsers = usePresence(supabase, activeConv?.id, 'user123');
  const { canSend, messagesRemaining } = useAntiSpam(activeConv?.id);

  // Cargar mensajes
  useEffect(() => {
    if (activeConv) {
      fetchMessages(supabase, activeConv.id).then(setMessages);
    }
  }, [activeConv]);

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <SidebarConversations
          onSelectConversation={setActiveConv}
          activeConversationId={activeConv?.id}
        />

        {activeConv && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ChatHeader conversationId={activeConv.id} otherUserId="player456" />
            <MessageList messages={messages} currentUserId="user123" />
            {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
            <Composer
              playerPosition="Delantero"
              canSend={canSend}
              messagesRemaining={messagesRemaining}
              onSend={(params) => sendMessage(supabase, activeConv.id, params)}
              onTypingStart={() => {}}
              onTypingStop={() => {}}
            />
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default ChatApp;
```

---

## 📡 API Functions

### 1. `createOrGetDirectConversation()`
Encuentra o crea conversación 1:1.

```typescript
const conv = await createOrGetDirectConversation(
  supabase,
  'scout-uuid',
  'player-uuid'
);
```

### 2. `listConversations()`
Lista conversaciones del usuario.

```typescript
const convs = await listConversations(supabase, 'user-uuid');
```

### 3. `fetchMessages()`
Carga mensajes con paginación.

```typescript
const msgs = await fetchMessages(
  supabase,
  'conv-id',
  20,  // limit
  0    // offset
);
```

### 4. `sendMessage()`
Envía mensaje nuevo.

```typescript
const msg = await sendMessage(supabase, 'conv-id', {
  body: 'Gran partido!',
  link_url: 'https://youtube.com/watch?v=abc',
  facet_tag: 'Remate de Cabeza'
});
```

### 5. `markAsSeen()`
Marca mensaje como visto.

```typescript
await markAsSeen(supabase, 'msg-id', 'user-uuid');
```

### 6. `editMessage()`
Edita mensaje existente.

```typescript
await editMessage(supabase, 'msg-id', 'Texto actualizado');
```

### 7. `softDeleteMessage()`
Soft-delete de mensaje.

```typescript
await softDeleteMessage(supabase, 'msg-id');
```

---

## 🪝 React Hooks

### `useRealtimeMessages()`
Suscripción a mensajes nuevos.

```typescript
useRealtimeMessages(supabase, conversationId, (newMsg) => {
  setMessages(prev => [...prev, newMsg]);
});
```

### `useMessageStatus()`
Suscripción a cambios de estado.

```typescript
useMessageStatus(supabase, conversationId, (status) => {
  updateStatus(status);
});
```

### `usePresence()`
Tracking de usuarios online y escribiendo.

```typescript
const typingUsers = usePresence(supabase, conversationId, currentUserId);
// Retorna: [{ user_id, full_name, is_typing }]
```

### `useAntiSpam()`
Límite de mensajes (5 cada 15 seg).

```typescript
const { canSend, messagesRemaining } = useAntiSpam(conversationId);
```

---

## 🧩 Componentes

### `<SidebarConversations />`
Lista de conversaciones con búsqueda.

```tsx
<SidebarConversations
  onSelectConversation={(conv) => setActive(conv)}
  activeConversationId="conv-123"
/>
```

### `<ChatHeader />`
Header con info del usuario y estado.

```tsx
<ChatHeader
  conversationId="conv-123"
  otherUserId="player-456"
/>
```

### `<MessageList />`
Lista scrolleable de mensajes.

```tsx
<MessageList
  messages={messages}
  currentUserId="user-123"
  onLoadMore={() => loadMore()}
  hasMore={true}
/>
```

### `<MessageItem />`
Burbuja individual de mensaje.

```tsx
<MessageItem
  message={message}
  currentUserId="user-123"
  onEdit={(id, text) => handleEdit(id, text)}
  onDelete={(id) => handleDelete(id)}
/>
```

### `<TypingIndicator />`
Indicador de "escribiendo...".

```tsx
<TypingIndicator users={[{ full_name: 'Juan', avatar_url: '...' }]} />
```

### `<Composer />`
Input de mensaje con tags y links.

```tsx
<Composer
  playerPosition="Mediocampista"
  canSend={canSend}
  messagesRemaining={5}
  onSend={(params) => sendMessage(params)}
  onTypingStart={() => updatePresence('typing')}
  onTypingStop={() => updatePresence('idle')}
/>
```

---

## 🏷️ Facet Tags por Posición

### Portero
- Agilidad
- Reflejos
- Salidas
- Juego con los Pies

### Defensor
- Marca
- Anticipación
- Juego Aéreo
- Tackles

### Mediocampista
- Visión de Juego
- Pase Largo
- Control
- Recuperación

### Delantero
- Definición
- Velocidad
- Desmarque
- Remate de Cabeza

---

## 🔒 Seguridad

- **RLS Policies**: Todos los datos filtrados por participación
- **Auth Required**: JWT token obligatorio
- **URL Validation**: Solo HTTPS permitido
- **Anti-Spam**: 5 mensajes/15 segundos
- **Soft Delete**: Mensajes nunca se borran físicamente

---

## 🐛 Troubleshooting

### Mensajes no actualizan en tiempo real
✅ Habilitá Realtime en Supabase Dashboard  
✅ Verificá que las policies RLS permitan SELECT  
✅ Revisá console del browser por errores WebSocket

### Presence no funciona
✅ Confirmá suscripción al canal de presencia  
✅ Verificá que el usuario esté autenticado  
✅ Revisá logs de Supabase Realtime

### Anti-spam no funciona
✅ Verificá que el `conversationId` sea consistente  
✅ Revisá el estado de Zustand en DevTools  
✅ Confirmá timestamps correctos

---

## 📄 Licencia

MIT

## Testing

```bash
npm run test
```

Los tests cubren las 7 funciones API principales.
