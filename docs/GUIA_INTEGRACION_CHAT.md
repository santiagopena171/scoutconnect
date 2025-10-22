# Guía de integración del módulo de chat

Este documento resume los pasos necesarios para compilar el módulo de chat basado en React, incrustarlo dentro de las páginas HTML existentes y probarlo con una sesión activa de Supabase.

## 1. Requisitos previos
- Node.js 20 o superior.
- Dependencias instaladas en `chat-module/`:
  ```powershell
  cd "c:\Users\Santiago Peña\Desktop\scoutconnect-2\chat-module"
  npm install
  ```
- Variables de entorno de Supabase configuradas en `chat-module/.env` (URL y anon key).
- Una instancia de Supabase con tablas y políticas actualizadas (utilizar los scripts de `database/` si es necesario).

## 2. Compilar el bundle del chat
1. Abrí una terminal PowerShell.
2. Ejecutá:
   ```powershell
   cd "c:\Users\Santiago Peña\Desktop\scoutconnect-2\chat-module"
   npm run build
   ```
3. El build genera los archivos listos para producción en `chat-build/`:
   - `chat-build/chat-app.css`
   - `chat-build/chat-app.js`
   - `chat-build/index.html` (solo para pruebas locales).

> Repetí `npm run build` cada vez que hagas cambios a los componentes de React.

## 3. Incrustar el módulo en una página HTML
En `chat.html` ya se agregó el contenedor y las referencias necesarias:
```html
<link rel="stylesheet" href="chat-build/chat-app.css">
...
<div id="chat-root"></div>
<script type="module" src="chat-build/chat-app.js"></script>
```
Si querés reutilizar el chat en otra página, copiá estas tres líneas y asegurate de incluir un `<div id="chat-root"></div>` donde se montará la app.

## 4. Reutilizar la sesión de Supabase
1. El bundle usa la misma configuración de Supabase definida en `chat-module/.env`. Verificá que las credenciales coincidan con el backend del proyecto.
2. Iniciá sesión desde `login.html` (o cualquier flujo existente) utilizando `supabase.auth.signInWithPassword`.
3. Confirmá que el navegador guarda la sesión en `localStorage`/`sessionStorage` (buscá claves que comiencen con `sb-`).
4. Al abrir `chat.html`, la app llamará a `supabase.auth.getUser()` y cargará las conversaciones asociadas al usuario autenticado.
5. Si la página sigue pidiendo login, revisá:
   - Que el dominio/puerto sea el mismo donde se autenticó el usuario.
   - Que el bundle apunte a la URL de Supabase correcta.

## 5. Poblar conversaciones y mensajes
Para ver datos reales necesitás registros en las tablas `profiles`, `conversations`, `conversation_participants` y `messages`.

### Inserción rápida (ejemplo)
Ejecutá los siguientes SQL desde Supabase Studio (ajustá los UUID por los IDs reales de tus usuarios):
```sql
-- Crear una conversación directa
insert into conversations (id, is_group, created_by)
values ('00000000-0000-0000-0000-000000000001', false, 'UUID_DEL_SCOUT');

-- Relacionar participantes
insert into conversation_participants (conversation_id, user_id, role_in_conversation)
values
  ('00000000-0000-0000-0000-000000000001', 'UUID_DEL_SCOUT', 'owner'),
  ('00000000-0000-0000-0000-000000000001', 'UUID_DEL_JUGADOR', 'member');

-- Mensaje de ejemplo
insert into messages (id, conversation_id, sender_id, body)
values ('00000000-0000-0000-0000-00000000000A', '00000000-0000-0000-0000-000000000001', 'UUID_DEL_SCOUT', '¡Hola! Probando el chat.');
```
Asegurate de que ambos usuarios existan en `profiles` y tengan datos completos.

> Los archivos `database/*.sql` contienen scripts útiles para inicializar tablas, políticas y relaciones si necesitás reconstruir el esquema.

## 6. Pruebas manuales sugeridas
1. **Render inicial**: abrir `chat.html` sin sesión -> debe mostrar el mensaje "Necesitás iniciar sesión".
2. **Sesión activa sin conversaciones**: iniciar sesión con un usuario sin chats -> se mostrará "No hay conversaciones".
3. **Conversaciones existentes**: crear registros como en la sección anterior -> seleccionar la conversación, enviar y editar mensajes para confirmar el flujo completo.
4. **Realtime**: abrir la misma conversación en dos navegadores y verificar que los mensajes se reflejan sin recargar.

## 7. Problemas comunes
- **Pantalla en blanco**: revisar la consola del navegador. Errores típicos son claves incorrectas de Supabase o falta de sesión.
- **No aparecen conversaciones**: confirmar que `conversation_participants` incluye al usuario actual y que la política RLS permite la lectura.
- **Mensajes pendientes**: si el botón Enviar no responde, revisá la cuota anti-spam del hook (`useAntiSpam`).

Con estos pasos el chat React queda integrado dentro del proyecto existente y listo para iterar en estilo o funcionalidad adicional.
