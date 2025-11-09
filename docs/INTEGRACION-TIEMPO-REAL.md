# 📊 INTEGRACIÓN DE DATOS EN TIEMPO REAL - DOCUMENTACIÓN

## 🎯 Objetivo
Reemplazar datos simulados/hardcodeados por consultas reales a Supabase, habilitando visualización de datos reales y actualizaciones en tiempo real.

---

## 📁 Archivos Creados

### 1. `src/JS/chat-real.js` (636 líneas)
**Sistema de Chat con Tiempo Real**

#### Funcionalidades Implementadas:
✅ **Autenticación automática**: Verifica sesión antes de cargar
✅ **Carga de conversaciones**: Lee desde `conversation_participants` + `conversations`
✅ **Mensajes en tiempo real**: Suscripción a tabla `messages` con Realtime
✅ **Estados de lectura**: Marca mensajes como leídos (`message_status`)
✅ **Contador de no leídos**: Actualiza badges dinámicamente
✅ **Búsqueda de conversaciones**: Filtro local por nombre/mensaje
✅ **Envío de mensajes**: INSERT directo a tabla `messages`
✅ **Perfiles de contactos**: Carga avatares y nombres desde `profiles`

#### Estructura de Datos:
```javascript
// Conversaciones
{
  id: uuid,
  contact: {
    id: uuid,
    name: string,
    role: string (Scout/Futbolista),
    avatar: string,
    isOnline: boolean
  },
  lastMessage: string,
  time: string (relativo),
  timestamp: Date,
  unread: number
}

// Mensajes
{
  id: uuid,
  conversation_id: uuid,
  sender_id: uuid,
  body: string,
  created_at: timestamp
}
```

#### Métodos Principales:
- `loadConversations()`: Obtiene todas las conversaciones del usuario
- `openConversation(id)`: Carga mensajes de una conversación
- `handleSendMessage(e)`: Envía nuevo mensaje a Supabase
- `subscribeToMessages()`: Escucha nuevos mensajes en tiempo real
- `markMessagesAsRead(convId)`: Actualiza estado de lectura
- `updateConversationsCount()`: Actualiza badges de mensajes no leídos

#### Suscripciones Realtime:
```javascript
// Nuevos mensajes
supabase.channel('messages-channel')
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, handler)
  .subscribe()

// Estados de lectura
supabase.channel('message-status-channel')
  .on('postgres_changes', { event: '*', table: 'message_status' }, handler)
  .subscribe()
```

---

### 2. `src/JS/dashboard-scout-real.js` (575 líneas)
**Dashboard con Estadísticas Reales**

#### Funcionalidades Implementadas:
✅ **Verificación de rol**: Solo permite acceso a scouts
✅ **Estadísticas dinámicas**: Contadores reales desde base de datos
✅ **Últimas evaluaciones**: Muestra reportes recientes con ratings
✅ **Watchlist**: Lista de seguimiento con prioridades
✅ **Badges actualizados**: Mensajes no leídos, jugadores en watchlist
✅ **Cálculo de edad**: Dinámico desde fecha de nacimiento
✅ **Formato de tiempo relativo**: "Hace 2 horas", "Ayer", etc.

#### Estadísticas Implementadas:

| Estadística | Tabla | Query |
|-------------|-------|-------|
| Total Jugadores | `profiles` | WHERE user_type IN ('jugador', 'futbolista', 'player') |
| Reportes Completados | `scout_reports` | WHERE scout_id = current AND status = 'completed' |
| Evaluaciones Pendientes | `scout_reports` | WHERE scout_id = current AND status IN ('draft', 'pending') |
| Recomendados para Fichaje | `scout_reports` | WHERE overall_rating >= 8.5 AND recommendation = 'sign' |
| Watchlist | `watchlist` | WHERE scout_id = current |
| Mensajes No Leídos | `messages` + `message_status` | JOIN para contar no vistos |

#### Métodos Principales:
- `loadAllStats()`: Carga todas las estadísticas en paralelo
- `loadRecentEvaluations()`: Últimas 3 evaluaciones con JOIN a perfiles
- `loadWatchlist()`: Jugadores en seguimiento con detalles
- `updateMessagesBadge()`: Cuenta mensajes no leídos en todas las conversaciones
- `renderStats()`: Actualiza UI con valores reales
- `removeFromWatchlist(id)`: Elimina jugador de lista de seguimiento

#### Cálculos Dinámicos:
```javascript
// Edad del jugador
calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  // Ajuste por mes/día
  return age;
}

// Tiempo relativo
formatRelativeTime(dateString) {
  // "Hace 5 minutos", "Hace 2 horas", "Ayer", "Hace 3 días"
}
```

---

## 🗄️ Tablas de Base de Datos Requeridas

### Chat System
```sql
-- Conversaciones
conversations (id, is_group, title, created_by, created_at)

-- Participantes
conversation_participants (conversation_id, user_id, role_in_conversation, joined_at)

-- Mensajes
messages (id, conversation_id, sender_id, body, created_at, edited_at, deleted_at)

-- Estado de mensajes
message_status (message_id, user_id, status ['delivered', 'seen'], updated_at)

-- Presencia (opcional)
conversation_presence (conversation_id, user_id, last_active_at)
```

### Dashboard Scout
```sql
-- Perfiles
profiles (id, user_type, full_name, avatar_url, position, birth_date, current_club)

-- Reportes de scouts
scout_reports (id, scout_id, player_id, overall_rating, recommendation, status, created_at)

-- Lista de seguimiento
watchlist (id, scout_id, player_id, notes, priority, created_at)
```

---

## 🔄 Comparación: Antes vs Después

### Chat (src/JS/chat.js)

#### ❌ ANTES (Hardcodeado):
```javascript
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
    lastMessage: '¿Podrías enviarme un video...',
    time: 'Ahora',
    unread: 3,
    messages: [
      { id: 1, senderId: 'scout1', content: 'Hola Juan...', time: '10:30 AM' },
      // ... más mensajes hardcodeados
    ]
  },
  // ... más conversaciones simuladas
];
```

#### ✅ DESPUÉS (Supabase):
```javascript
async loadConversations() {
  // Obtener conversaciones reales
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', this.currentUser.id);

  // Cargar último mensaje de cada conversación
  const { data: lastMessage } = await supabase
    .from('messages')
    .select('body, created_at, sender_id')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Contar mensajes no leídos
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', convId)
    .neq('sender_id', this.currentUser.id)
    .not('id', 'in', `(SELECT message_id FROM message_status...)`);
}
```

### Dashboard Scout

#### ❌ ANTES (dashboard-scout.html - Hardcodeado):
```html
<div class="stat-card primary">
  <div class="stat-content">
    <h3>247</h3> <!-- Valor fijo -->
    <p>Jugadores en Base</p>
    <span class="stat-trend positive">+12 este mes</span>
  </div>
</div>

<span class="nav-badge">12</span> <!-- Fijo -->
<span class="notification-badge">5</span> <!-- Fijo -->
```

#### ✅ DESPUÉS (dashboard-scout-real.js):
```javascript
async loadTotalPlayersCount() {
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .in('user_type', ['jugador', 'futbolista', 'player']);
  
  this.stats.totalPlayers = count || 0;
}

renderStats() {
  document.querySelector('.stat-card.primary h3').textContent = this.stats.totalPlayers;
  // Actualiza dinámicamente desde la base de datos
}
```

---

## 🚀 Cómo Implementar

### Paso 1: Reemplazar Scripts en HTML

#### Chat (Buscar en HTML del chat):
```html
<!-- ❌ ANTES -->
<script src="../src/JS/chat.js"></script>

<!-- ✅ DESPUÉS -->
<script src="../src/JS/supabase-config.js"></script>
<script src="../src/JS/chat-real.js"></script>
```

#### Dashboard Scout:
```html
<!-- ❌ ANTES -->
<script src="../src/JS/dashboard-scout.js"></script>

<!-- ✅ DESPUÉS -->
<script src="../src/JS/supabase-config.js"></script>
<script src="../src/JS/dashboard-scout-real.js"></script>
```

### Paso 2: Verificar Estructura de Base de Datos

Ejecutar en Supabase SQL Editor:
```sql
-- Verificar tablas de chat
SELECT * FROM information_schema.tables 
WHERE table_name IN ('conversations', 'messages', 'conversation_participants', 'message_status');

-- Verificar tablas de dashboard
SELECT * FROM information_schema.tables 
WHERE table_name IN ('profiles', 'scout_reports', 'watchlist');
```

Si falta alguna tabla, ejecutar:
```bash
# Desde el directorio del proyecto
psql < database/chat-setup.sql
```

### Paso 3: Habilitar Realtime en Supabase

1. Ir a **Supabase Dashboard** → **Database** → **Replication**
2. Habilitar Realtime para las tablas:
   - ✅ `messages`
   - ✅ `message_status`
   - ✅ `conversation_participants`

### Paso 4: Verificar RLS (Row Level Security)

Las políticas deben permitir:
```sql
-- Usuarios pueden ver sus propias conversaciones
CREATE POLICY "Users can view own conversations"
  ON conversation_participants FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden ver mensajes de sus conversaciones
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid()
  ));

-- Usuarios pueden insertar mensajes en sus conversaciones
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (conversation_id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid()
  ));
```

---

## 📊 Beneficios de la Integración

### 1. **Datos Reales**
- ❌ Antes: Historias inventadas, números ficticios
- ✅ Ahora: Información real desde la base de datos

### 2. **Tiempo Real**
- ❌ Antes: Sin actualizaciones, recarga manual
- ✅ Ahora: Suscripciones WebSocket, actualizaciones instantáneas

### 3. **Escalabilidad**
- ❌ Antes: Limitado a datos hardcodeados
- ✅ Ahora: Crece con la base de datos sin cambiar código

### 4. **Mantenibilidad**
- ❌ Antes: Modificar arrays en JavaScript
- ✅ Ahora: Los datos se gestionan desde la base

### 5. **Pruebas Reales**
- ❌ Antes: No se podía probar mensajería real
- ✅ Ahora: Conversaciones entre usuarios reales funcionan

---

## 🐛 Debugging

### Ver mensajes en consola:
```javascript
// chat-real.js
console.log('📨 Nuevo mensaje recibido:', payload);
console.log('✅ Mensaje enviado:', newMessage);

// dashboard-scout-real.js
console.log('Estadísticas cargadas:', this.stats);
console.log('Evaluaciones recientes:', reports);
```

### Verificar suscripciones:
```javascript
// En la consola del navegador
supabase.getChannels()  // Ver canales activos
```

### Verificar datos:
```sql
-- En Supabase SQL Editor
SELECT COUNT(*) FROM messages;
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM scout_reports WHERE scout_id = 'UUID';
```

---

## ✅ Checklist de Implementación

- [ ] Verificar que `supabase-config.js` esté generado con `npm run build`
- [ ] Reemplazar `chat.js` por `chat-real.js` en HTML
- [ ] Reemplazar `dashboard-scout.js` por `dashboard-scout-real.js` en HTML
- [ ] Verificar estructura de tablas en Supabase
- [ ] Habilitar Realtime en tablas `messages` y `message_status`
- [ ] Verificar políticas RLS para chat
- [ ] Verificar políticas RLS para scout_reports
- [ ] Probar envío de mensaje entre dos usuarios
- [ ] Verificar actualización de contadores en tiempo real
- [ ] Probar watchlist (agregar/quitar jugadores)
- [ ] Verificar que badges se actualicen dinámicamente

---

## 🔮 Próximas Mejoras

### Chat:
- [ ] Indicador de "escribiendo..." (typing indicator)
- [ ] Estado de presencia real (online/offline)
- [ ] Envío de archivos/imágenes
- [ ] Reacciones a mensajes
- [ ] Mensajes de voz

### Dashboard:
- [ ] Gráficos con Chart.js o Recharts
- [ ] Exportación de reportes a PDF
- [ ] Filtros avanzados de jugadores
- [ ] Mapa interactivo de talentos
- [ ] Notificaciones push

---

## 📞 Soporte

Si encuentras problemas:
1. Verificar que las tablas existan en Supabase
2. Revisar políticas RLS (Row Level Security)
3. Confirmar que Realtime esté habilitado
4. Revisar consola del navegador para errores
5. Verificar que `supabase-config.js` esté correctamente generado

---

**Fecha de documentación**: 8 de noviembre, 2025  
**Autor**: Sistema de Integración ScoutConnect  
**Versión**: 1.0
