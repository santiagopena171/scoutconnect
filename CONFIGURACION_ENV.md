# Configuración de Variables de Entorno - ScoutConnect

## 🔐 Seguridad Mejorada

Las credenciales de Supabase ahora se gestionan mediante variables de entorno en lugar de estar hardcodeadas en el código fuente. Esto mejora significativamente la seguridad del proyecto.

## 📋 Configuración Inicial

### 1. Crear archivo .env

Copia el archivo de ejemplo y configúralo con tus credenciales reales:

```powershell
Copy-Item .env.example .env
```

### 2. Rellenar credenciales

Edita el archivo `.env` y añade tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_publica_aqui
```

**Dónde obtener las credenciales:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Copia la "Project URL" y la "anon/public key"

### 3. Ejecutar el script de build

Inyecta las variables de entorno en el código:

```powershell
node build.js
```

Este comando:
- Lee las credenciales desde `.env`
- Las inyecta en `JS/supabase-config.js`
- Verifica que estén correctamente configuradas

## 🚀 Flujo de Desarrollo

### Para desarrollo local:
```powershell
# 1. Configurar variables de entorno (solo la primera vez)
Copy-Item .env.example .env
# Edita .env con tus credenciales

# 2. Inyectar credenciales antes de ejecutar la aplicación
node build.js

# 3. Iniciar el servidor
node server.js
```

### Para nuevos desarrolladores:
1. Clonar el repositorio
2. Ejecutar `npm install`
3. Copiar `.env.example` a `.env`
4. Añadir sus propias credenciales de Supabase
5. Ejecutar `node build.js`

## 📁 Archivos Importantes

- **`.env`**: Contiene las credenciales reales (NO se sube a Git)
- **`.env.example`**: Plantilla con placeholders (SÍ se sube a Git)
- **`build.js`**: Script que inyecta las variables de entorno
- **`JS/supabase-config.js`**: Configuración de Supabase con placeholders

## ⚠️ Importante

- **NUNCA** subas el archivo `.env` a Git
- El archivo `.env` ya está incluido en `.gitignore`
- Cada entorno (desarrollo, staging, producción) debe tener su propio `.env`
- Ejecuta `node build.js` cada vez que cambies las credenciales en `.env`

## 🔄 Cambios Realizados

1. ✅ Creado archivo `.env` con credenciales reales
2. ✅ Creado archivo `.env.example` como plantilla
3. ✅ Actualizado `build.js` con validaciones mejoradas
4. ✅ Modificado `JS/supabase-config.js` para usar placeholders
5. ✅ Verificado que `.env` está en `.gitignore`

## 🛡️ Beneficios de Seguridad

- Las credenciales no están en el código fuente
- Se pueden usar diferentes credenciales por entorno
- Fácil rotación de claves sin modificar código
- Reduce el riesgo de exponer credenciales en repositorios públicos
