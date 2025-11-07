# 🚀 GUÍA DE CONFIGURACIÓN DE SUPABASE - ScoutConnect

## 📋 PASO 1: Configurar el Proyecto en Supabase

### 1.1 Acceder a tu Dashboard
- Ve a: https://supabase.com/dashboard
- Inicia sesión con tu cuenta
- Selecciona tu proyecto (o crea uno nuevo si no tienes)

---

## 📋 PASO 2: Crear las Tablas de Base de Datos

### 2.1 Abrir el SQL Editor
1. En el menú lateral izquierdo, click en **SQL Editor** 📝
2. Click en **New Query** (+ Nueva consulta)

### 2.2 Ejecutar el Script SQL
1. Abre el archivo `supabase-setup.sql` en tu proyecto
2. **Copia TODO el contenido** del archivo
3. **Pega** en el SQL Editor de Supabase
4. Click en **RUN** (▶️ Ejecutar)
5. Espera a que aparezca el mensaje: ✅ **Success. No rows returned**

### 2.3 Verificar que las tablas se crearon
1. En el menú lateral, click en **Table Editor** 📊
2. Deberías ver estas tablas:
   - ✅ profiles
   - ✅ players
   - ✅ scouts
   - ✅ reports
   - ✅ watchlist
   - ✅ messages
   - ✅ notifications

---

## 📋 PASO 3: Configurar Storage para Avatares

### 3.1 Crear el Bucket de Avatares
1. En el menú lateral, click en **Storage** 🗄️
2. Click en **Create a new bucket**
3. Configurar:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Activado** (marcar la casilla)
4. Click en **Create bucket**

### 3.2 Configurar Políticas de Storage
1. Click en el bucket `avatars` que acabas de crear
2. Ve a la pestaña **Policies**
3. Click en **New Policy**
4. Selecciona la plantilla **"Allow public read access"**
5. Click en **Review** → **Save policy**

### 3.3 (Opcional) Crear bucket para videos de jugadores
Repite los pasos 3.1-3.2 pero con el nombre `player-videos`

---

## 📋 PASO 4: Obtener tus Credenciales API

### 4.1 Ir a Configuración de API
1. En el menú lateral, click en **⚙️ Settings**
2. En el submenú, click en **API**

### 4.2 Copiar las Credenciales
Verás dos valores importantes:

**📍 Project URL:**
```
https://xyzcompany.supabase.co
```
👆 Copia este valor completo

**🔑 anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```
👆 Copia este valor completo (es muy largo, como 200+ caracteres)

---

## 📋 PASO 5: Configurar las Credenciales en tu Proyecto

### 5.1 Abrir el archivo de configuración
1. Abre el archivo: `JS/supabase-config.js`
2. Busca las líneas 13-17:

```javascript
const SUPABASE_CONFIG = {
  url: 'TU_SUPABASE_URL_AQUI',
  anonKey: 'TU_SUPABASE_ANON_KEY_AQUI'
};
```

### 5.2 Pegar tus Credenciales
Reemplaza los textos con tus valores reales:

```javascript
const SUPABASE_CONFIG = {
  // Pega aquí tu Project URL (entre comillas)
  url: 'https://tuproyecto.supabase.co',
  
  // Pega aquí tu anon public key (entre comillas)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

### 5.3 Guardar el archivo
- **Ctrl + S** para guardar
- ⚠️ **IMPORTANTE**: Mantén estas credenciales privadas
- ⚠️ No subas este archivo a repositorios públicos de GitHub

---

## 📋 PASO 6: Agregar Supabase a tus páginas HTML

### 6.1 Agregar los scripts en registro.html

Abre `registro.html` y agrega estos scripts **ANTES** de la etiqueta `</body>`:

```html
  <!-- Librería de Supabase -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <!-- Configuración de Supabase -->
  <script src="JS/supabase-config.js"></script>
  
  <!-- Script de registro (tu script existente) -->
  <script src="JS/registro.js"></script>
</body>
```

### 6.2 Agregar los scripts en login.html

Abre `login.html` y agrega lo mismo:

```html
  <!-- Librería de Supabase -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <!-- Configuración de Supabase -->
  <script src="JS/supabase-config.js"></script>
  
  <!-- Script de login (tu script existente) -->
  <script src="JS/login.js"></script>
</body>
```

---

## 📋 PASO 7: Configurar Email Authentication

### 7.1 Configurar el proveedor de Email
1. Ve a **Authentication** → **Providers** 🔐
2. Click en **Email**
3. Asegúrate de que esté **habilitado** ✅
4. Configuraciones recomendadas:
   - **Confirm email**: ✅ Activado (para verificar emails)
   - **Secure email change**: ✅ Activado
   - **Secure password change**: ✅ Activado

### 7.2 Configurar Templates de Email (Opcional)
1. Ve a **Authentication** → **Email Templates**
2. Puedes personalizar los emails de:
   - Confirmación de registro
   - Recuperación de contraseña
   - Cambio de email
   - Invitación

### 7.3 Configurar URL de Redirección
1. Ve a **Authentication** → **URL Configuration**
2. En **Site URL** agrega: `http://127.0.0.1:5500`
3. En **Redirect URLs** agrega:
   - `http://127.0.0.1:5500/dashboard-scout.html`
   - `http://127.0.0.1:5500/dashboard-futbolista.html`
   - `http://127.0.0.1:5500/login.html`

---

## 📋 PASO 8: Probar la Configuración

### 8.1 Verificar la Consola del Navegador
1. Abre tu proyecto: `http://127.0.0.1:5500/registro.html`
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Deberías ver: ✅ **"Supabase inicializado correctamente"**

### 8.2 Si ves errores:
❌ **"Debes configurar las credenciales..."**
→ Verifica que hayas pegado correctamente la URL y API Key en `supabase-config.js`

❌ **"Invalid API key"**
→ Verifica que copiaste la **anon public key** completa (no la service_role key)

❌ **"Failed to fetch"**
→ Verifica que tu Project URL sea correcta y el proyecto esté activo en Supabase

---

## 📋 PASO 9: Siguiente Paso - Integrar con Registro

Una vez que veas ✅ **"Supabase inicializado correctamente"** en la consola:

1. Avísame y procederé a integrar el sistema de registro
2. Modificaré `registro.js` para que use Supabase
3. Modificaré `login.js` para autenticación real
4. Los usuarios se guardarán en la base de datos real

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema: "No se crearon las tablas"
**Solución:**
- Verifica que ejecutaste TODO el script SQL
- Revisa en la pestaña "Logs" si hay errores
- Intenta ejecutar el script en secciones más pequeñas

### Problema: "Cannot insert into profiles"
**Solución:**
- Asegúrate de que RLS (Row Level Security) esté configurado
- Verifica que las políticas se crearon correctamente
- Ve a Table Editor → profiles → Policies

### Problema: "Storage: bucket not found"
**Solución:**
- Verifica que creaste el bucket "avatars"
- Asegúrate de que sea público
- Verifica las políticas de storage

### Problema: "Auth: Invalid credentials"
**Solución:**
- Verifica que copiaste la API key correcta (anon, no service_role)
- Verifica que no haya espacios extra al copiar/pegar
- Asegúrate de que la URL termine sin "/"

---

## ✅ CHECKLIST FINAL

Antes de continuar, verifica que completaste:

- [ ] ✅ Proyecto de Supabase creado
- [ ] ✅ Tablas creadas con el script SQL
- [ ] ✅ Bucket "avatars" creado y público
- [ ] ✅ Credenciales copiadas (URL + API Key)
- [ ] ✅ Credenciales pegadas en `supabase-config.js`
- [ ] ✅ Scripts de Supabase agregados en HTML
- [ ] ✅ Consola muestra "Supabase inicializado correctamente"
- [ ] ✅ Sin errores en la consola del navegador

---

## 🎯 PRÓXIMOS PASOS

Una vez completada esta configuración:

1. **Integrar sistema de registro** → Los usuarios se crearán en Supabase
2. **Integrar sistema de login** → Autenticación real con tokens
3. **Migrar datos de localStorage** → Todo se guardará en la nube
4. **Implementar subida de avatares** → Imágenes en Supabase Storage
5. **Sistema de permisos y seguridad** → RLS protegerá los datos

---

## 📞 ¿NECESITAS AYUDA?

Si tienes algún problema:
1. Revisa la sección "Solución de Problemas"
2. Verifica la consola del navegador (F12)
3. Revisa los logs en Supabase Dashboard
4. Avísame en qué paso estás atorado

---

**¡Listo! Ahora estás preparado para conectar ScoutConnect con Supabase! 🚀**
