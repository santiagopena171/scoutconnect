# Guía Paso a Paso: Módulo de Chat

Este documento resume las acciones que debés realizar después de haber ejecutado correctamente `database/chat-setup.sql` en Supabase.

## 1. Verificar que el esquema quedó creado

1. Ingresá a [Supabase Dashboard](https://supabase.com/dashboard) y seleccioná el proyecto.
2. Abrí **Table Editor** y confirmá que existen las tablas:
   - `conversations`
   - `conversation_participants`
   - `messages`
   - `message_status`
   - `conversation_presence`
3. Cada tabla debería verse vacía por ahora, lo cual es correcto.

## 2. Configurar las variables de entorno en el proyecto local

1. En la carpeta `chat-module/` confirmá que existe `.env.example` (lo generamos antes).
2. Copiá ese archivo para crear `.env`:
   ```powershell
   cd chat-module
   copy .env.example .env
   ```
3. Editá `.env` y completá tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu-anon-key>
   ```
4. Guardá los cambios.

## 3. Instalar dependencias y levantar el entorno local

1. Parado en `chat-module/`, instalá las dependencias:
   ```powershell
   npm install
   ```
2. Una vez completada la instalación, levantá el servidor de desarrollo:
   ```powershell
   npm run dev
   ```
3. Vite abrirá la app en `http://localhost:3000`.

## 4. Probar el flujo completo

1. Iniciá sesión en la app (usando una cuenta que exista en Supabase).
2. Creá o buscá una conversación:
   - Si no existen conversaciones, usá la función `createOrGetDirectConversation` (por ejemplo desde la consola o un botón) para generar una.
   - Asegurate de que ambos usuarios (scout/jugador) estén en la tabla `profiles`.
3. Enviá mensajes desde ambos usuarios y comprobá que:
   - Los mensajes aparecen en `messages`.
   - El estado se refleja en `message_status` (delivered/seen).
   - El indicador de presencia (`conversation_presence`) registra actividad.
4. Revisá en Supabase > Table Editor que los registros se van creando/modificando.

## 5. Consideraciones para producción

1. **Eliminá los `DROP TABLE`** del inicio de `database/chat-setup.sql` antes de aplicarlo en producción (evitá borrar datos reales).
2. Verificá que el usuario `service_role` cuente con permisos para futuras migraciones.
3. Si usás migraciones automáticas, convertí este script en un archivo de migración (Supabase CLI) para mantener versionado el esquema.
4. Activá backups regulares en Supabase antes de lanzar el chat a usuarios reales.

## 6. Próximos pasos sugeridos

- Integrar el front del chat en tu dashboard actual.
- Agregar tests manuales de UX (mensajes largos, enlaces, facet tags).
- Configurar logs/analytics para el uso del chat.

Con estos pasos listos, el módulo de chat queda operativo y listo para combinarse con el resto de ScoutConnect.