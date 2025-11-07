# 📁 Estructura del Proyecto - ScoutConnect

## ✅ Reorganización Completada

El proyecto ha sido reorganizado con una estructura más profesional y mantenible.

## 🗂️ Nueva Estructura

```
scoutconnect/
├── 📂 public/                      # Archivos públicos accesibles por el navegador
│   ├── 📂 CSS/                    # Hojas de estilo
│   │   ├── styles.css
│   │   ├── login.css
│   │   ├── registro.css
│   │   └── ...
│   ├── 📂 imagenes/               # Imágenes y assets
│   ├── 📄 login.html
│   ├── 📄 registro.html
│   ├── 📄 dashboard-scout.html
│   ├── 📄 dashboard-futbolista.html
│   └── 📄 ...                     # Otros archivos HTML
│
├── 📂 src/                         # Código fuente JavaScript
│   └── 📂 JS/                     # Lógica de la aplicación
│       ├── supabase-config.js     # Configuración de Supabase
│       ├── auth-guard.js          # Protección de rutas
│       ├── login.js               # Lógica de login
│       ├── registro.js            # Lógica de registro
│       ├── busqueda-avanzada.js   # Búsqueda de jugadores
│       └── ...
│
├── 📂 config/                      # Archivos de configuración
│   └── jest.config.js             # Configuración de testing
│
├── 📂 scripts/                     # Scripts de utilidad y automatización
│   ├── build.js                   # Inyección de variables de entorno
│   ├── server.js                  # Servidor HTTP local
│   └── setup.ps1                  # Configuración inicial automatizada
│
├── 📂 database/                    # Scripts de base de datos
│   ├── supabase-setup.sql         # Configuración inicial
│   ├── supabase-fix-policies.sql  # Políticas de seguridad
│   └── ...
│
├── 📂 docs/                        # Documentación del proyecto
│   ├── 📂 guides/                 # Guías de usuario
│   │   ├── GUIA_SUPABASE.md
│   │   ├── NOMBRES_NO_EDITABLES.md
│   │   └── ...
│   ├── 📂 setup/                  # Documentación de configuración
│   │   ├── CONFIGURACION_ENV.md
│   │   ├── CHECKLIST_SEGURIDAD.md
│   │   └── ...
│   └── 📂 troubleshooting/        # Solución de problemas
│       ├── SOLUCION_ERROR_LOGIN.md
│       └── ...
│
├── 📂 tests/                       # Tests unitarios e integración
│
├── 📂 chat-build/                  # Chat compilado (dist)
├── 📂 chat-module/                 # Módulo de chat (fuente)
│
├── 📄 .env                         # Variables de entorno (NO en Git)
├── 📄 .env.example                 # Plantilla de variables de entorno
├── 📄 .gitignore                   # Archivos ignorados por Git
├── 📄 index.html                   # Página principal (raíz)
├── 📄 package.json                 # Dependencias y scripts
├── 📄 README.md                    # Documentación principal
└── 📄 ESTRUCTURA_PROYECTO.md       # Este archivo
```

## 📋 Descripción de Carpetas

### `/public`
Contiene todos los archivos estáticos accesibles directamente por el navegador:
- **HTML**: Todas las páginas de la aplicación
- **CSS**: Estilos organizados por componente/página
- **imagenes**: Logos, iconos, imágenes del sitio

### `/src`
Código fuente JavaScript de la aplicación:
- **JS**: Lógica de negocio, integraciones con Supabase, manejo de eventos

### `/config`
Archivos de configuración de herramientas:
- `jest.config.js`: Configuración de tests
- (Futuro: eslint, prettier, etc.)

### `/scripts`
Scripts de automatización y utilidades:
- `build.js`: Inyecta variables de entorno en el código
- `server.js`: Servidor HTTP para desarrollo
- `setup.ps1`: Configuración inicial del proyecto

### `/database`
Scripts SQL para configurar Supabase:
- Creación de tablas
- Políticas de seguridad (RLS)
- Funciones y triggers

### `/docs`
Documentación completa del proyecto:
- **guides**: Guías de uso y características
- **setup**: Instrucciones de instalación y configuración
- **troubleshooting**: Solución de problemas comunes

### `/tests`
Tests automatizados del proyecto

## 🔄 Cambios Realizados

### Archivos Movidos

#### De raíz → `/public`
- Todos los archivos `.html` (excepto `index.html`)
- Carpeta `CSS/`
- Carpeta `imagenes/`

#### De raíz → `/src`
- Carpeta `JS/`

#### De raíz → `/scripts`
- `build.js`
- `server.js`
- `setup.ps1`

#### De raíz → `/config`
- `jest.config.js`

#### De raíz → `/docs`
- `CONFIGURACION_ENV.md` → `docs/setup/`
- `CHECKLIST_SEGURIDAD.md` → `docs/setup/`
- `RESUMEN_CAMBIOS_SEGURIDAD.md` → `docs/setup/`
- `SOLUCION_ERROR_LOGIN.md` → `docs/troubleshooting/`
- `PROBLEMA_SUPABASE_RESTAURACION.md` → `docs/troubleshooting/`
- Guías existentes → `docs/guides/`

### Archivos Actualizados

#### `package.json`
```json
{
  "main": "scripts/server.js",
  "scripts": {
    "start": "node scripts/build.js && node scripts/server.js",
    "build": "node scripts/build.js",
    "dev": "node scripts/build.js && node scripts/server.js",
    "test": "jest --config=config/jest.config.js"
  }
}
```

#### `scripts/build.js`
- Actualizada ruta a `src/JS/supabase-config.js`

#### `scripts/server.js`
- Configurado para servir archivos desde `public/`
- Soporte para `src/JS/` 
- `index.html` desde la raíz

#### `index.html`
- Rutas actualizadas:
  - CSS: `public/CSS/`
  - Imágenes: `public/imagenes/`
  - Enlaces: `public/*.html`

#### Archivos HTML en `/public`
- Rutas de CSS: `CSS/` (relativas)
- Rutas de JS: `../src/JS/` (relativas)
- Rutas de imágenes: `imagenes/` (relativas)

## 🚀 Comandos Actualizados

### Instalación y Configuración
```powershell
# Configuración automática
.\scripts\setup.ps1

# O manualmente
npm install
node scripts/build.js
```

### Desarrollo
```powershell
# Iniciar servidor de desarrollo
npm start

# O directamente
node scripts/server.js
```

### Testing
```powershell
# Ejecutar tests
npm test

# Con cobertura
npm run test:ci
```

### Build
```powershell
# Inyectar variables de entorno
npm run build

# O directamente
node scripts/build.js
```

## 📝 Beneficios de la Nueva Estructura

### ✅ Organización
- Separación clara entre frontend (public), backend (src), y configuración
- Fácil navegación y localización de archivos
- Estructura escalable para crecimiento futuro

### ✅ Mantenibilidad
- Código más fácil de mantener y actualizar
- Documentación organizada por tipo
- Scripts centralizados

### ✅ Profesionalismo
- Sigue mejores prácticas de la industria
- Similar a frameworks modernos (Next.js, Vite, etc.)
- Facilita la colaboración en equipo

### ✅ Seguridad
- Separación clara de código público vs privado
- Variables de entorno fuera del código fuente
- Configuración centralizada

## 🔍 Referencias Rápidas

### Donde encontrar...

**Páginas HTML**
- `index.html` → Raíz del proyecto
- Otras páginas → `public/*.html`

**Estilos**
- `public/CSS/*.css`

**JavaScript**
- `src/JS/*.js`

**Scripts de configuración**
- `scripts/*.js`
- `scripts/*.ps1`

**Documentación**
- General → `docs/guides/`
- Instalación → `docs/setup/`
- Problemas → `docs/troubleshooting/`

**Base de datos**
- `database/*.sql`

**Tests**
- `tests/*.test.js`

## ⚙️ Configuración de IDEs

### VS Code
Archivos recomendados en `.vscode/`:
```json
{
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/.git": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/chat-build": true
    }
  }
}
```

## 🎯 Próximos Pasos Sugeridos

1. [ ] Mover módulos de chat a estructura similar
2. [ ] Considerar usar bundler (Vite/Webpack) para producción
3. [ ] Implementar source maps para debugging
4. [ ] Configurar linting (ESLint) y formatting (Prettier)
5. [ ] Añadir pre-commit hooks con Husky

## 📖 Documentación Relacionada

- [README.md](../README.md) - Documentación principal
- [docs/setup/CONFIGURACION_ENV.md](setup/CONFIGURACION_ENV.md) - Variables de entorno
- [docs/guides/](guides/) - Guías de usuario

---

**Última actualización:** 7 de Noviembre, 2025
**Versión de la estructura:** 2.0
