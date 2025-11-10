# 🤖 Asistente IA Scout - Guía de Configuración

## ✅ Archivos Creados

1. **`public/asistente-ia.html`** - Interfaz del chatbox
2. **`scripts/asistente-ia.js`** - Lógica del cliente
3. **`cloudflare-worker.js`** - Código del Worker de Cloudflare

---

## 🚀 Pasos para Configuración

### 1️⃣ Actualizar el Worker en Cloudflare

1. Ve a tu [Dashboard de Cloudflare Workers](https://dash.cloudflare.com/)
2. Selecciona tu Worker existente (o crea uno nuevo)
3. Haz clic en **"Quick Edit"**
4. **Copia todo el contenido** de `cloudflare-worker.js`
5. **Pégalo** en el editor del Worker
6. Haz clic en **"Save and Deploy"**

### 2️⃣ Obtener la URL de tu Worker

Después de desplegar, verás una URL como:
```
https://scout-assistant.tu-cuenta.workers.dev
```

Copia esta URL completa.

### 3️⃣ Configurar la URL en tu Proyecto

1. Abre el archivo: `scripts/asistente-ia.js`
2. En la línea 2, reemplaza la URL:

```javascript
// ANTES:
const WORKER_URL = 'https://tu-worker.tu-cuenta.workers.dev';

// DESPUÉS (con tu URL real):
const WORKER_URL = 'https://scout-assistant.tu-cuenta.workers.dev';
```

3. Guarda el archivo

### 4️⃣ Probar el Asistente

1. Abre tu proyecto en el navegador
2. Ve a: `public/asistente-ia.html`
3. Escribe una pregunta como:
   - "¿Qué aspectos debo evaluar en un delantero centro?"
   - "Ayúdame a crear un reporte de un mediocampista"
   - "¿Cómo evalúo la capacidad táctica de un jugador?"

---

## 🔗 Integración con tu Dashboard

Para agregar el asistente IA a tu dashboard de scout:

### Opción 1: Botón en el menú de navegación

Agrega este código en `dashboard-scout.html`:

```html
<a href="asistente-ia.html" class="nav-link">
    <svg><!-- Icono --></svg>
    Asistente IA
</a>
```

### Opción 2: Widget flotante

Agrega este código antes del cierre de `</body>` en cualquier página:

```html
<!-- Botón flotante del asistente IA -->
<a href="asistente-ia.html" class="ai-assistant-fab" title="Asistente IA">
    🤖
</a>

<style>
.ai-assistant-fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    text-decoration: none;
    z-index: 1000;
    transition: transform 0.3s;
}

.ai-assistant-fab:hover {
    transform: scale(1.1);
}
</style>
```

---

## 🎨 Funcionalidades Incluidas

✅ **Interfaz moderna y responsiva** - Funciona en móvil y escritorio
✅ **Acciones rápidas** - Botones con preguntas predefinidas
✅ **Historial de conversación** - Mantiene el contexto
✅ **Indicador de escritura** - Animación mientras la IA responde
✅ **Formato de texto** - Soporte para negritas, cursivas y listas
✅ **Manejo de errores** - Mensajes claros si algo falla
✅ **Auto-scroll** - Se desplaza automáticamente al último mensaje

---

## 🛠️ Personalización

### Cambiar el prompt del sistema

Edita el contenido de `SYSTEM_PROMPT` en `cloudflare-worker.js` para ajustar el comportamiento del asistente.

### Agregar más acciones rápidas

En `asistente-ia.html`, agrega más botones:

```html
<button class="quick-action" data-prompt="Tu pregunta aquí">Texto del botón</button>
```

### Cambiar colores

Modifica las variables CSS en `asistente-ia.html`:

```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cambia los colores a tu preferencia */
background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
```

---

## 🐛 Solución de Problemas

### El asistente no responde

1. Verifica que la URL del Worker esté correcta en `asistente-ia.js`
2. Abre la consola del navegador (F12) y busca errores
3. Verifica que el Worker esté desplegado en Cloudflare

### Error de CORS

El Worker ya incluye headers CORS. Si aún tienes problemas:
- Verifica que el código del Worker sea exactamente el de `cloudflare-worker.js`
- Redespliega el Worker

### La IA da respuestas genéricas

- Asegúrate de que el `SYSTEM_PROMPT` esté completo en el Worker
- Haz preguntas más específicas sobre scouting

---

## 📱 Uso del Asistente

### Ejemplos de preguntas efectivas:

**Evaluación de jugadores:**
- "¿Qué aspectos técnicos debo evaluar en un lateral derecho?"
- "Dame una lista de criterios para evaluar a un portero"

**Creación de reportes:**
- "Ayúdame a estructurar un reporte de un mediocampista ofensivo"
- "¿Qué secciones debe tener un reporte profesional de scouting?"

**Metodología:**
- "¿Cómo debo observar a un jugador durante un partido?"
- "Dame consejos para tomar notas durante el scouting"

**Análisis táctico:**
- "¿Cómo evalúo el posicionamiento defensivo de un central?"
- "¿Qué aspectos tácticos son importantes en un extremo?"

---

## 🚀 Próximos Pasos

- [ ] Configurar la URL del Worker
- [ ] Probar el asistente
- [ ] Integrar en el dashboard
- [ ] Personalizar colores y estilo (opcional)
- [ ] Agregar más acciones rápidas (opcional)

---

## 💡 Notas

- El asistente mantiene el contexto de la conversación
- Los mensajes se guardan en memoria durante la sesión
- Al recargar la página, el historial se reinicia
- El Worker de Cloudflare es gratis hasta 100,000 peticiones/día

---

¿Necesitas ayuda? Revisa la documentación de [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
