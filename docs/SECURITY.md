# 🔐 Guía de Seguridad y Gestión de Credenciales

## Resumen

ScoutConnect implementa un sistema seguro de gestión de credenciales que previene que datos sensibles se suban accidentalmente al repositorio.

## 📁 Arquitectura de Archivos

```
src/JS/
├── supabase-config.template.js  ✅ Template seguro (EN GIT)
└── supabase-config.js           ❌ Con credenciales (IGNORADO por Git)
```

### Archivos Clave

#### 1. `supabase-config.template.js` (Template)
- **Estado:** Versionado en Git
- **Contenido:** Placeholders `{{SUPABASE_URL}}` y `{{SUPABASE_ANON_KEY}}`
- **Propósito:** Plantilla segura sin credenciales reales
- **Ubicación:** `src/JS/supabase-config.template.js`

#### 2. `supabase-config.js` (Generado)
- **Estado:** Ignorado por Git (`.gitignore`)
- **Contenido:** Credenciales reales de Supabase
- **Propósito:** Archivo de configuración usado por la aplicación
- **Generación:** Se crea automáticamente con `npm run build`

## 🚀 Flujo de Trabajo

### Para Desarrolladores Nuevos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/scoutconnect.git
   cd scoutconnect
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales
   ```

3. **Generar archivo de configuración:**
   ```bash
   npm run build
   ```
   
   Esto ejecuta `scripts/build.js` que:
   - Lee `.env`
   - Lee `supabase-config.template.js`
   - Reemplaza placeholders con credenciales reales
   - Genera `supabase-config.js`

4. **Verificar que funciona:**
   ```bash
   npm start
   ```

### Para Desarrollo Continuo

#### ✅ Flujo Correcto

```bash
# 1. Cambiar credenciales en .env (si es necesario)
nano .env

# 2. Regenerar configuración
npm run build

# 3. Iniciar servidor
npm start
```

#### ❌ Flujos Incorrectos (EVITAR)

```bash
# ❌ NO hagas esto:
nano src/JS/supabase-config.js  # NO editar directamente
git add src/JS/supabase-config.js  # NO versionar
```

## 🛡️ Medidas de Seguridad Implementadas

### 1. Template System
- **Template inmutable:** `supabase-config.template.js` nunca contiene credenciales
- **Generación automática:** Credenciales se inyectan en tiempo de build
- **Separación clara:** Template en Git, config generado fuera de Git

### 2. Git Ignore
```gitignore
# .gitignore
src/JS/supabase-config.js  # Archivo generado, no versionar
.env                        # Variables de entorno
.env.local
.env.production
```

### 3. Validación en Build
```javascript
// scripts/build.js valida:
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Credenciales faltantes');
  process.exit(1);
}
```

### 4. Advertencias en el Código Generado
```javascript
// ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR
// Este archivo fue generado desde supabase-config.template.js
// Generado el: 2025-01-10T15:30:00.000Z
```

## 🔍 Verificación de Seguridad

### Antes de Hacer Commit

```bash
# 1. Verificar qué archivos se van a commitear
git status

# 2. Asegurarse de que supabase-config.js NO aparece
# Debe aparecer en "Untracked files" o no aparecer

# 3. Verificar .gitignore
cat .gitignore | grep supabase-config.js
# Debe mostrar: src/JS/supabase-config.js

# 4. Revisar si hay credenciales expuestas
git diff --cached
```

### Auditoría de Seguridad

```bash
# Buscar posibles credenciales en el repositorio
git log --all --full-history -- src/JS/supabase-config.js

# Si aparece historial, las credenciales están expuestas
# Necesitas limpiar el historial (ver sección "Limpieza")
```

## 🧹 Limpieza de Credenciales Expuestas

Si accidentalmente commiteaste credenciales:

### Opción 1: Resetear Credenciales en Supabase (RECOMENDADO)

1. Ve a Supabase Dashboard → Settings → API
2. Regenera tu `anon key`
3. Actualiza `.env` con la nueva key
4. Ejecuta `npm run build`

### Opción 2: Limpiar Historial de Git (AVANZADO)

```bash
# ⚠️ PELIGROSO: Esto reescribe el historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/JS/supabase-config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (si ya está en remoto)
git push origin --force --all
```

### Opción 3: BFG Repo-Cleaner (MÁS RÁPIDO)

```bash
# Instalar BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Eliminar archivo del historial
bfg --delete-files supabase-config.js

# Limpiar
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push forzado
git push --force
```

## 📋 Checklist de Seguridad

### Antes de Cada Commit

- [ ] `git status` no muestra `supabase-config.js`
- [ ] `.env` no aparece en tracked files
- [ ] `git diff` no muestra credenciales
- [ ] Solo el template está en el staging area

### Configuración Inicial del Proyecto

- [ ] `.gitignore` incluye `src/JS/supabase-config.js`
- [ ] `.gitignore` incluye `.env*`
- [ ] `.env.example` existe sin credenciales reales
- [ ] `supabase-config.template.js` usa placeholders
- [ ] `npm run build` genera el archivo correctamente

### Revisión de Código

- [ ] No hay URLs de Supabase hardcodeadas
- [ ] No hay API keys en el código
- [ ] Template mantiene placeholders
- [ ] Build script valida variables de entorno

## 🎯 Mejores Prácticas

### 1. Variables de Entorno por Ambiente

```bash
# .env.development
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=dev_key_here

# .env.production
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=prod_key_here
```

### 2. CI/CD con Secrets

```yaml
# GitHub Actions example
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

steps:
  - run: npm run build
```

### 3. Rotación de Credenciales

- **Frecuencia:** Cada 90 días o después de exposición
- **Proceso:**
  1. Generar nuevas credenciales en Supabase
  2. Actualizar `.env`
  3. Ejecutar `npm run build`
  4. Notificar al equipo

### 4. Documentación

Mantén este documento actualizado con:
- Cambios en el sistema de credenciales
- Nuevas medidas de seguridad
- Incidentes y lecciones aprendidas

## 🚨 Detección de Problemas

### Síntoma: "Credenciales no configuradas"

```
⚠️ ERROR: Las credenciales de Supabase no están configuradas.
Por favor ejecuta: npm run build
```

**Solución:**
1. Verifica que `.env` existe
2. Verifica que `.env` tiene las variables correctas
3. Ejecuta `npm run build`

### Síntoma: "Template no encontrado"

```
❌ ERROR: No se encontró el archivo template: supabase-config.template.js
```

**Solución:**
1. Verifica que `src/JS/supabase-config.template.js` existe
2. Si no existe, recupéralo del repositorio

### Síntoma: Git detecta cambios en supabase-config.js

```
modified: src/JS/supabase-config.js
```

**Solución:**
```bash
# Verificar .gitignore
cat .gitignore | grep supabase-config.js

# Si no está, agregarlo
echo "src/JS/supabase-config.js" >> .gitignore

# Remover del staging
git reset HEAD src/JS/supabase-config.js
```

## 📚 Referencias

- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Git Secrets Management](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## 🤝 Contribuir

Si encuentras una vulnerabilidad de seguridad:

1. **NO** abras un issue público
2. Envía un email a: [security@scoutconnect.com]
3. Incluye:
   - Descripción del problema
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación

---

**Última actualización:** 2025-01-10  
**Versión:** 1.0.0  
**Mantenedor:** Equipo ScoutConnect
