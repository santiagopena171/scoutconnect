# Solución al Error "Failed to fetch" en Login

## 🔍 Diagnóstico del Problema

El error "Failed to fetch" indica un problema de conectividad con Supabase. Aquí están las posibles causas y soluciones:

## ✅ Pasos para Solucionar

### 1. Abrir la Consola del Navegador

1. Presiona **F12** en tu navegador
2. Ve a la pestaña **Console**
3. Recarga la página de login (F5)
4. Busca el mensaje "=== DIAGNÓSTICO DE CONEXIÓN SUPABASE ==="

### 2. Verificar los Mensajes de Diagnóstico

El script mostrará uno de estos estados:

#### ✅ Si todo está bien:
```
✅ Librería de Supabase cargada correctamente
✅ Configuración encontrada
✅ Cliente de Supabase inicializado
✅ Conectividad exitosa con Supabase
```

#### ❌ Si hay problemas:
Verás mensajes de error específicos que indican el problema.

### 3. Soluciones Según el Error

#### Error: "Librería de Supabase NO está cargada"
**Causa:** El CDN de Supabase no está accesible.
**Solución:**
- Verifica tu conexión a internet
- Intenta acceder directamente a: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
- Si no funciona, puede ser un problema de red o firewall

#### Error: "SUPABASE_CONFIG no está definido"
**Causa:** El archivo de configuración no se cargó.
**Solución:**
```powershell
# Verifica que el archivo exista
Test-Path "JS/supabase-config.js"

# Re-ejecuta el build
node build.js
```

#### Error: "Cliente de Supabase NO inicializado"
**Causa:** Las credenciales no están correctamente configuradas.
**Solución:**
```powershell
# 1. Verifica que .env tenga las credenciales correctas
Get-Content .env

# 2. Re-ejecuta el build
node build.js

# 3. Recarga la página (Ctrl+F5 para forzar recarga)
```

#### Error: "Failed to fetch" o "Error de conectividad"
**Causas posibles:**

1. **Problema de CORS (más común)**
   - Supabase podría estar bloqueando peticiones desde localhost
   - **Solución:** Usa `127.0.0.1` en lugar de `localhost`
   - O usa el puerto 3000 con el servidor Node.js: `npm start`

2. **Credenciales incorrectas**
   - Verifica en Supabase Dashboard que las credenciales sean correctas
   - Settings → API → Project URL y anon/public key

3. **Proyecto de Supabase pausado o eliminado**
   - Ve a https://supabase.com/dashboard
   - Verifica que el proyecto esté activo

4. **Firewall o antivirus bloqueando la conexión**
   - Temporalmente desactiva el firewall/antivirus para probar
   - O agrega una excepción para el dominio de Supabase

### 4. Verificación Manual de Credenciales

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings → API
4. Compara:
   - Project URL debe coincidir con SUPABASE_URL en .env
   - anon public key debe coincidir con SUPABASE_ANON_KEY en .env

### 5. Reiniciar el Servidor

Si estás usando el servidor Node.js:
```powershell
# Detener el servidor (Ctrl+C en la terminal)
# Luego reiniciar:
npm start
```

Accede desde: http://127.0.0.1:3000/login.html

### 6. Limpiar Caché del Navegador

A veces el navegador cachea archivos antiguos:
1. Presiona **Ctrl + Shift + Delete**
2. Marca "Archivos e imágenes en caché"
3. Haz clic en "Borrar datos"
4. Recarga la página con **Ctrl + F5**

## 🔬 Test Manual de Conectividad

Puedes probar manualmente en la consola del navegador:

```javascript
// Verificar que Supabase esté cargado
console.log('Supabase:', typeof window.supabase);

// Intentar obtener sesión
supabase.auth.getSession().then(console.log).catch(console.error);
```

## 📝 Checklist de Verificación

- [ ] Conexión a internet funcionando
- [ ] Archivo .env existe con credenciales correctas
- [ ] `node build.js` ejecutado sin errores
- [ ] Servidor corriendo (npm start o Live Server)
- [ ] Consola del navegador sin errores previos
- [ ] Proyecto de Supabase activo en dashboard
- [ ] Credenciales coinciden con las del dashboard
- [ ] Caché del navegador limpiado

## 🆘 Si Nada Funciona

1. **Verifica el estado de Supabase:**
   - Ve a https://status.supabase.com/
   - Verifica que todos los servicios estén operativos

2. **Crea un proyecto de prueba:**
   - Crea un nuevo proyecto en Supabase
   - Actualiza las credenciales en .env
   - Ejecuta node build.js
   - Prueba el login

3. **Revisa los logs de Supabase:**
   - En el dashboard de Supabase
   - Ve a Logs → Auth
   - Busca intentos de login fallidos

## 📊 Información del Error para Soporte

Si necesitas pedir ayuda, proporciona:

1. Mensaje completo de error de la consola
2. Resultado del diagnóstico
3. Output de `node build.js`
4. Si el proyecto de Supabase está activo
5. Navegador y versión que estás usando
6. Sistema operativo

## ✅ Cambios Aplicados

He realizado las siguientes mejoras al código:

1. ✅ Agregado verificación de que Supabase esté cargado antes de usarlo
2. ✅ Mejorado manejo de errores en la inicialización
3. ✅ Agregado logs detallados para debugging
4. ✅ Creado script de diagnóstico automático
5. ✅ Agregado verificación en el login antes de autenticar

## 🎯 Próximos Pasos

1. Recarga la página de login
2. Abre la consola (F12)
3. Revisa los mensajes de diagnóstico
4. Intenta iniciar sesión nuevamente
5. Copia cualquier error que aparezca en la consola
6. Comparte el error conmigo si persiste el problema
