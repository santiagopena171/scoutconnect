# ScoutConnect

Plataforma web que conecta scouts/ojeadores de fútbol con jugadores, facilitando el proceso de scouting y el desarrollo profesional de futbolistas.

## 🚀 Características

### Para Jugadores
- ⚽ Perfil profesional personalizable
- 📊 Dashboard con estadísticas y reportes
- 👀 Visualización de reportes de scouts
- 📹 Subida de videos y galería de imágenes
- 💬 Sistema de mensajería con scouts
- 🔔 Notificaciones en tiempo real

### Para Scouts/Ojeadores
- 🔍 Búsqueda avanzada de jugadores
- 📝 Sistema de reportes detallados
- ⭐ Lista de seguimiento personalizada
- 💬 Comunicación directa con jugadores
- 📊 Historial completo de reportes
- 🎯 Filtros por posición, edad, ubicación

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Autenticación:** Supabase Auth con Row Level Security (RLS)
- **Base de datos:** PostgreSQL con triggers y policies
- **Storage:** Supabase Storage para avatares y videos

## 📁 Estructura del Proyecto

```
scoutconnect-2/
├── CSS/                      # Estilos de la aplicación
│   ├── styles.css           # Estilos globales
│   ├── login.css            # Estilos del login
│   ├── registro.css         # Estilos del registro
│   ├── dashboard-*.css      # Estilos de dashboards
│   └── ...
├── JS/                       # JavaScript de la aplicación
│   ├── supabase-config.js   # Configuración de Supabase
│   ├── auth-guard.js        # Protección de rutas
│   ├── login.js             # Lógica de login
│   ├── registro.js          # Lógica de registro
│   └── ...
├── database/                 # Scripts SQL
│   ├── supabase-setup.sql   # Configuración inicial de BD
│   └── supabase-fix-policies.sql  # Políticas RLS
├── docs/                     # Documentación
│   ├── GUIA_SUPABASE.md     # Guía de configuración
│   └── ...
├── imagenes/                 # Assets e imágenes
├── index.html               # Página de inicio
├── login.html               # Página de login
├── registro.html            # Página de registro
├── dashboard-scout.html     # Dashboard de scouts
├── dashboard-futbolista.html # Dashboard de jugadores
└── server.js                # Servidor Node.js (opcional)
```

## 🔧 Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota tu `URL` y `anon key`

### 2. Configurar base de datos

1. Ve a SQL Editor en Supabase
2. Ejecuta el script `database/supabase-setup.sql`
3. Ejecuta el script `database/supabase-fix-policies.sql`

### 3. Configurar credenciales

Edita `JS/supabase-config.js` y actualiza:

```javascript
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_DE_SUPABASE';
```

### 4. Desactivar confirmación de email (Desarrollo)

1. Ve a Authentication → Providers en Supabase
2. Click en "Email"
3. Desactiva "Confirm email"
4. Guarda los cambios

### 5. Ejecutar la aplicación

Puedes usar cualquier servidor local:

**Opción 1: Live Server (VS Code)**
```bash
# Instalar extensión Live Server en VS Code
# Click derecho en index.html → "Open with Live Server"
```

**Opción 2: Python**
```bash
python -m http.server 5500
```

**Opción 3: Node.js**
```bash
node server.js
```

## 👤 Uso

### Registro

1. Ve a `registro.html`
2. Selecciona tipo de usuario (Jugador o Scout)
3. Completa el formulario
4. El sistema te redirigirá automáticamente a tu dashboard

### Login

1. Ve a `login.html`
2. Selecciona el tipo de usuario con el que te registraste
3. Ingresa email y contraseña
4. El sistema validará que el tipo seleccionado coincida con tu registro

### Funcionalidades principales

**Jugadores:**
- Edita tu perfil en `perfil-jugador.html`
- Ve reportes de scouts en tu dashboard
- Comunícate con scouts interesados

**Scouts:**
- Busca jugadores en `busqueda-avanzada.html`
- Crea reportes en `nuevo-reporte.html`
- Gestiona tu lista de seguimiento en `lista-seguimiento.html`

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Validación de tipo de usuario en login
- ✅ Protección de rutas con `auth-guard.js`
- ✅ Sesiones seguras con tokens

## 📝 Base de datos

### Tablas principales

- **profiles** - Perfiles de usuarios
- **players** - Información específica de jugadores
- **scouts** - Información específica de scouts
- **reports** - Reportes de scouts sobre jugadores
- **watchlist** - Lista de seguimiento de scouts
- **messages** - Sistema de mensajería
- **notifications** - Notificaciones del sistema

### Triggers

- `handle_new_user()` - Crea perfil automáticamente al registrarse

## 🐛 Solución de problemas

### Error: "Email not confirmed"
- Desactiva la confirmación de email en Supabase (ver docs)
- O confirma manualmente el usuario en Authentication → Users

### Error: "Esta cuenta está registrada como..."
- Asegúrate de seleccionar el mismo tipo de usuario con el que te registraste
- Scout debe seleccionar "Scout/Ojeador"
- Jugador debe seleccionar "Futbolista"

### Loop de redirección
- Limpia el localStorage (F12 → Application → Clear site data)
- Recarga la página

## 📚 Documentación adicional

- [Guía de Supabase](docs/GUIA_SUPABASE.md)
- [Desactivar confirmación de email](docs/DESACTIVAR_CONFIRMACION_EMAIL.md)

## 👨‍💻 Desarrollo

**Versión actual:** 2.0  
**Branch:** pruebas  
**Última actualización:** Octubre 2025

## 📄 Licencia

Este proyecto es privado y está en desarrollo.

---

Desarrollado con ⚽ para conectar el talento futbolístico con oportunidades profesionales.
