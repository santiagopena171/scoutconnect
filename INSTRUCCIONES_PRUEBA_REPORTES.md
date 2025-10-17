# Instrucciones de Prueba - Sistema de Visualización de Reportes

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha creado un sistema completo de visualización de reportes con **validación de acceso restringida**. Solo el scout que creó un reporte puede acceder a él.

---

## 📋 ARCHIVOS CREADOS

1. **ver-reporte.html** - Página dedicada para ver reportes
2. **CSS/ver-reporte.css** - Estilos profesionales
3. **JS/ver-reporte.js** - Lógica con validación de acceso

## 🔄 ARCHIVOS ACTUALIZADOS

1. **JS/perfil-jugador.js** - `viewReport()` ahora redirige a ver-reporte.html
2. **JS/dashboard-futbolista.js** - `viewReportDetails()` redirige a ver-reporte.html
3. **JS/dashboard-scout.js** - `viewReport()` redirige a ver-reporte.html

---

## 🧪 CÓMO PROBAR

### Paso 1: Iniciar el Servidor

Si no está corriendo, ejecutar en PowerShell:
```powershell
.\simple-server.ps1
```

O usar el script de test:
```powershell
.\test-server.ps1
```

El servidor debe estar en: **http://localhost:3000**

---

### Paso 2: Simular Login como Scout

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Simular login como "Carlos Mendoza"
localStorage.setItem('scoutConnectUser', JSON.stringify({
  name: 'Carlos Mendoza',
  userType: 'scout',
  id: 'scout_001',
  email: 'carlos@example.com'
}));

localStorage.setItem('scoutConnectToken', 'token_123456');
localStorage.setItem('scoutConnectExpiry', Date.now() + 86400000); // 24 horas
```

Luego recarga la página: `F5`

---

### Paso 3: Generar Reportes de Demo

1. Ve al perfil de un jugador:
   ```
   http://localhost:3000/perfil-jugador.html?id=1
   ```

2. Click en la pestaña **"Reportes"**

3. Click en el botón azul **"Demo: Cargar Reportes"**

Esto generará 3 reportes de ejemplo:
- ✅ 1 reporte de "Carlos Mendoza" (TÚ)
- ❌ 1 reporte de "Ana Rodriguez" (otro scout)
- ❌ 1 reporte de "Roberto Silva" (otro scout)

---

### Paso 4: Probar Filtro "Mis reportes"

En la sección Reportes del perfil:

1. **Click en "Todos"**
   - Deberías ver 3 reportes

2. **Click en "Mis reportes"**
   - Deberías ver solo 1 reporte (el de "Carlos Mendoza")

---

### Paso 5: Acceder a TU Reporte (✅ DEBE FUNCIONAR)

1. Click en el reporte de "Carlos Mendoza"
2. Serás redirigido a `ver-reporte.html?id=...`
3. ✅ **RESULTADO ESPERADO:**
   - Se carga el reporte completo
   - Ves todas las evaluaciones
   - Puedes Editar, Imprimir, Compartir

---

### Paso 6: Intentar Acceder a Reporte de Otro Scout (❌ DEBE DENEGAR)

1. Vuelve al perfil del jugador
2. Click en "Todos" para ver todos los reportes
3. Copia la URL de un reporte de "Ana Rodriguez" o "Roberto Silva"
   - Click derecho en el reporte → Inspeccionar
   - Busca el `onclick="playerProfile.viewReport('report_...')"` 
   - Copia el ID del reporte

4. En la consola:
   ```javascript
   window.location.href = 'ver-reporte.html?id=PEGA_EL_ID_AQUI';
   ```

5. ❌ **RESULTADO ESPERADO:**
   - Pantalla roja con ícono de candado 🔒
   - Mensaje: "No tienes permiso para ver este reporte"
   - Botones para volver

---

### Paso 7: Cambiar de Scout y Probar

Simula login como otro scout:

```javascript
// Simular login como "Ana Rodriguez"
localStorage.setItem('scoutConnectUser', JSON.stringify({
  name: 'Ana Rodriguez',
  userType: 'scout',
  id: 'scout_002',
  email: 'ana@example.com'
}));
```

Recarga: `F5`

Ahora:
- ✅ Puedes acceder a reportes de "Ana Rodriguez"
- ❌ NO puedes acceder a reportes de "Carlos Mendoza"

---

### Paso 8: Probar Sin Sesión (❌ DEBE DENEGAR)

```javascript
// Limpiar sesión
localStorage.removeItem('scoutConnectUser');
localStorage.removeItem('scoutConnectToken');
```

Intenta acceder a cualquier reporte:
- ❌ **RESULTADO ESPERADO:** Acceso denegado

---

## 🎯 CASOS DE PRUEBA ESPECÍFICOS

### Test 1: Ver Reporte desde Perfil de Jugador
```
1. Login como "Carlos Mendoza"
2. Ir a: http://localhost:3000/perfil-jugador.html?id=1
3. Tab "Reportes" → Click "Demo: Cargar Reportes"
4. Click "Mis reportes"
5. Click en tu reporte
6. ✅ Debe abrir ver-reporte.html con el reporte completo
```

### Test 2: Ver Reporte desde Dashboard del Futbolista
```
1. Ir a: http://localhost:3000/dashboard-futbolista.html?direct=true
2. Scroll a "Mis Reportes de Scouting"
3. Click "Ver Completo" en un reporte
4. ✅ Debe abrir ver-reporte.html
```

### Test 3: Ver Reporte desde Dashboard del Scout
```
1. Ir a: http://localhost:3000/dashboard-scout.html
2. Sección "Reportes Generados"
3. Click en "Ver" en un reporte
4. ✅ Debe abrir ver-reporte.html
```

### Test 4: Editar Reporte
```
1. Abrir un reporte tuyo en ver-reporte.html
2. Click en "Editar"
3. ✅ Debe redirigir a: nuevo-reporte.html?editId=...
```

### Test 5: Imprimir Reporte
```
1. Abrir un reporte tuyo
2. Click en "Imprimir"
3. ✅ Debe abrir diálogo de impresión del navegador
4. ✅ Vista previa debe ocultar botones y navbar
```

### Test 6: Compartir Reporte
```
1. Abrir un reporte tuyo
2. Click en "Compartir"
3. ✅ Debe copiar URL al portapapeles
4. ✅ Debe mostrar notificación verde
```

---

## 🔐 VALIDACIÓN DE SEGURIDAD

### ¿Qué se valida?

El sistema compara:
1. `report.scoutName` vs `currentUser.name`
2. `report.scoutId` vs `currentUser.id`
3. `report.scoutEmail` vs `currentUser.email`

Si **alguno** coincide → ✅ Acceso permitido  
Si **ninguno** coincide → ❌ Acceso denegado

### ¿Dónde está la validación?

**Archivo:** `JS/ver-reporte.js`  
**Método:** `validateAccess()`  
**Líneas:** 67-87

---

## 📊 ESTRUCTURA DEL REPORTE

Un reporte completo incluye:

### Header
- Título del reporte
- Fecha de creación
- Scout evaluador
- Jugador evaluado
- Rating general con estrellas ⭐

### Secciones
1. **Información del Jugador**
   - Nombre, Posición, Edad, Club, Nacionalidad, Fecha

2. **Evaluaciones Detalladas**
   - ⚽ Técnico (skills individuales)
   - 💪 Físico (velocidad, resistencia, fuerza, etc.)
   - 🧠 Mental (concentración, liderazgo, etc.)
   - ♟️ Táctico (posicionamiento, visión, etc.)

3. **Resumen**
   - Texto libre con observaciones generales

4. **Fortalezas y Debilidades**
   - Listas identificadas automáticamente o manuales

5. **Recomendación Final**
   - Badge con recomendación (Altamente Recomendado / A Considerar / No Recomendado)
   - Texto de recomendación

### Footer
- Scout autor
- Fecha
- Aviso de confidencialidad 🔒

---

## 🐛 TROUBLESHOOTING

### Error: "Reporte No Encontrado"
**Causa:** El ID del reporte no existe en localStorage  
**Solución:** Genera reportes demo o verifica el ID

### Error: "Acceso Denegado" cuando debería funcionar
**Causa:** El nombre del scout en el reporte no coincide con el usuario actual  
**Solución:** 
```javascript
// Ver reportes en localStorage
console.log(JSON.parse(localStorage.getItem('generatedReports')));

// Ver usuario actual
console.log(JSON.parse(localStorage.getItem('scoutConnectUser')));
```

Asegúrate que `report.scoutName` === `currentUser.name` exactamente.

### Página en blanco
**Causa:** Error de JavaScript  
**Solución:** Abre la consola (F12) y busca errores en rojo

### Estilos rotos
**Causa:** No se cargó el CSS  
**Solución:** Verifica que `CSS/ver-reporte.css` existe y el servidor está corriendo

---

## 📱 RESPONSIVE

La página se adapta a:
- 📱 **Mobile** (< 768px): 1 columna
- 📱 **Tablet** (768px - 1024px): 2 columnas
- 💻 **Desktop** (> 1024px): 2-4 columnas

Prueba redimensionando el navegador o usando DevTools → Toggle Device Toolbar (Ctrl+Shift+M)

---

## ✨ CARACTERÍSTICAS IMPLEMENTADAS

✅ Página dedicada para ver reportes  
✅ Validación de acceso (solo scout autor)  
✅ Pantallas de error (No encontrado, Acceso denegado)  
✅ Rating general con estrellas  
✅ Evaluaciones detalladas por categoría  
✅ Barras de progreso coloreadas por rating  
✅ Resumen y recomendaciones  
✅ Fortalezas y debilidades  
✅ Botones de acción (Editar, Imprimir, Compartir)  
✅ Responsive design  
✅ Estilos de impresión optimizados  
✅ Redirección automática desde perfil/dashboards  
✅ Notificaciones elegantes  
✅ Console logs para debugging  

---

## 🎨 CUSTOMIZACIÓN

### Cambiar colores

Edita `CSS/ver-reporte.css`:

```css
:root {
  --primary-color: #3b82f6;     /* Azul principal */
  --secondary-color: #6366f1;   /* Violeta */
  --success-color: #10b981;     /* Verde */
  --warning-color: #f59e0b;     /* Amarillo */
  --danger-color: #ef4444;      /* Rojo */
}
```

### Añadir nueva sección

1. Edita `ver-reporte.html` y añade la sección
2. Edita `JS/ver-reporte.js` → método `renderReport()`
3. Añade el método de renderizado específico

---

## 📝 LOGS DE CONSOLA

Para debugging, abre la consola y busca:

```
🎯 Iniciando visualizador de reportes...
🔐 Validación de acceso: { currentUser, reportScout, isAuthor }
📊 Renderizando reporte: { report object }
```

Si ves:
```
❌ No hay usuario actual
❌ No hay reporte cargado
```

Hay un problema con la sesión o el reporte no existe.

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

1. **Backend de validación** (Node.js/Express)
2. **Sistema de permisos** (compartir reportes con otros)
3. **Exportación a PDF** profesional
4. **Historial de accesos** y auditoría
5. **Comentarios** en reportes
6. **Versionado** de reportes

---

## 📞 SOPORTE

Si encuentras problemas:
1. Verifica la consola del navegador (F12)
2. Revisa que el servidor esté corriendo
3. Comprueba que hay reportes generados
4. Verifica que la sesión esté activa

---

**¡Listo para probar! 🎉**

Navega a http://localhost:3000/perfil-jugador.html?id=1 y comienza las pruebas.
