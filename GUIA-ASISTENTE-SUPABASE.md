# 🤖 Asistente IA con Supabase - Guía Completa de Configuración

## 📋 Resumen de Cambios

El asistente IA ahora tiene acceso completo a:
- ✅ Reportes del scout autenticado
- ✅ Información de jugadores evaluados
- ✅ Historial de conversaciones guardado en Supabase
- ✅ Recomendaciones basadas en datos reales
- ✅ Análisis contextual de evaluaciones

---

## 🔧 Pasos de Configuración

### 1️⃣ Crear las Tablas en Supabase

1. Ve a tu proyecto de Supabase → **SQL Editor**
2. Copia y ejecuta el contenido de: `database/ai-conversations.sql`
3. Verifica que se crearon las tablas:
   - `ai_conversations`
   - `ai_messages`

### 2️⃣ Configurar Variables de Entorno en Cloudflare Worker

1. Ve a tu Worker en Cloudflare → **Settings** → **Variables**
2. Agrega estas variables:



*(Usa tus propias credenciales de Supabase)*

### 3️⃣ Instalar Dependencia de Supabase en el Worker

El Worker necesita la librería de Supabase. Tienes 2 opciones:

#### Opción A: Usar npm module (Recomendado)

1. Crea un archivo `package.json` en tu Worker:

```json
{
  "name": "scoutassistant-worker",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

2. Instala las dependencias y despliega con Wrangler CLI:

```bash
npm install
npx wrangler deploy
```

#### Opción B: Usar Worker desde dashboard (Más simple)

Si estás usando el dashboard de Cloudflare sin CLI, el código del Worker usará `fetch` directamente para comunicarse con Supabase. Aquí te doy la versión simplificada:

**Usa este código en tu Worker:**

```javascript
const SYSTEM_PROMPT = `Eres un asistente experto en scouting de fútbol profesional para la plataforma ScoutConnect. Tu misión es ayudar a los scouts a evaluar jugadores, crear reportes detallados y tomar decisiones informadas.

CONOCIMIENTOS ESPECIALIZADOS:
- Evaluación técnica de jugadores (regate, pase, tiro, control)
- Análisis táctico (posicionamiento, lectura de juego, trabajo sin balón)
- Evaluación física (velocidad, resistencia, fuerza)
- Aspectos mentales (liderazgo, actitud, mentalidad competitiva)
- Metodología de scouting profesional
- Estándares de reportes de scouting

CAPACIDADES CON ACCESO A DATOS:
1. Analizar reportes existentes del scout
2. Recomendar jugadores según criterios específicos
3. Comparar jugadores de la base de datos
4. Generar insights basados en los reportes históricos

INSTRUCCIONES:
- Cuando te pidan recomendar jugadores, usa los datos de reportes proporcionados
- Cita nombres específicos, valoraciones y observaciones de los reportes
- Mantén un tono profesional y analítico
- Usa formato claro con viñetas cuando sea apropiado

Tu objetivo es ser un asistente práctico que mejore la calidad del trabajo de scouting usando datos reales del scout.`;

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      const body = await request.json();
      const { messages, conversationId, userToken } = body;

      if (!userToken) {
        return new Response(JSON.stringify({ 
          error: 'Se requiere autenticación'
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Headers comunes para Supabase
      const supabaseHeaders = {
        'Authorization': `Bearer ${userToken}`,
        'apikey': env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };

      // Obtener usuario de Supabase
      const userResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: supabaseHeaders
      });

      if (!userResponse.ok) {
        return new Response(JSON.stringify({ 
          error: 'Token inválido' 
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const user = await userResponse.json();

      // Obtener scout info
      const scoutResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scouts?id=eq.${user.id}&select=id,first_name,last_name`,
        { headers: supabaseHeaders }
      );

      const scouts = await scoutResponse.json();
      const scout = scouts[0];

      if (!scout) {
        return new Response(JSON.stringify({ 
          error: 'Scout no encontrado' 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Obtener reportes del scout
      const reportsResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/reports?scout_id=eq.${scout.id}&select=player_name,player_position,match_date,match_competition,overall_rating,technical_rating,physical_rating,tactical_rating,mental_rating,strengths,weaknesses,detailed_analysis,recommendation&order=created_at.desc&limit=20`,
        { headers: supabaseHeaders }
      );

      const reports = await reportsResponse.json();

      // Crear contexto con reportes
      let contextMessage = '';
      if (reports && reports.length > 0) {
        contextMessage = `\n\nCONTEXTO - REPORTES DEL SCOUT (${scout.first_name} ${scout.last_name}):\n`;
        contextMessage += `Total de reportes: ${reports.length}\n\n`;
        
        reports.forEach((report, index) => {
          contextMessage += `REPORTE ${index + 1}:\n`;
          contextMessage += `- Jugador: ${report.player_name}\n`;
          contextMessage += `- Posición: ${report.player_position || 'N/A'}\n`;
          contextMessage += `- Valoración: ${report.overall_rating || 'N/A'}/10\n`;
          contextMessage += `- Técnica: ${report.technical_rating || 'N/A'}/10, Física: ${report.physical_rating || 'N/A'}/10\n`;
          contextMessage += `- Táctica: ${report.tactical_rating || 'N/A'}/10, Mental: ${report.mental_rating || 'N/A'}/10\n`;
          if (report.strengths) contextMessage += `- Fortalezas: ${report.strengths}\n`;
          if (report.weaknesses) contextMessage += `- Debilidades: ${report.weaknesses}\n`;
          contextMessage += `\n`;
        });
      } else {
        contextMessage = '\n\nCONTEXTO: El scout aún no tiene reportes.\n';
      }

      // Construir mensajes para la IA
      const aiMessages = [
        { role: 'system', content: SYSTEM_PROMPT + contextMessage },
        ...messages
      ];

      // Llamar a la IA
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: aiMessages
      });

      const assistantMessage = aiResponse.response || 'Lo siento, no pude generar una respuesta.';

      // Guardar conversación (simplificado)
      let finalConversationId = conversationId;
      
      if (!finalConversationId) {
        // Crear nueva conversación
        const convResponse = await fetch(`${env.SUPABASE_URL}/rest/v1/ai_conversations`, {
          method: 'POST',
          headers: {
            ...supabaseHeaders,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            scout_id: scout.id,
            title: messages[0]?.content?.substring(0, 100) || 'Nueva conversación'
          })
        });

        if (convResponse.ok) {
          const newConv = await convResponse.json();
          finalConversationId = newConv[0]?.id;
        }
      }

      // Guardar mensajes
      if (finalConversationId) {
        await fetch(`${env.SUPABASE_URL}/rest/v1/ai_messages`, {
          method: 'POST',
          headers: supabaseHeaders,
          body: JSON.stringify([
            {
              conversation_id: finalConversationId,
              role: 'user',
              content: messages[messages.length - 1]?.content || ''
            },
            {
              conversation_id: finalConversationId,
              role: 'assistant',
              content: assistantMessage
            }
          ])
        });
      }

      return new Response(JSON.stringify({
        success: true,
        response: assistantMessage,
        conversationId: finalConversationId,
        scoutName: `${scout.first_name} ${scout.last_name}`,
        reportsCount: reports?.length || 0,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Error al procesar la solicitud',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};
```

### 4️⃣ Probar el Sistema

1. Inicia sesión como scout
2. Crea algunos reportes de prueba
3. Ve a `asistente-ia.html`
4. Prueba preguntas como:
   - "Muéstrame un resumen de todos mis reportes"
   - "¿Cuál es el jugador mejor valorado?"
   - "Recomiéndame un mediocampista"

---

## 🎯 Funcionalidades Disponibles

### Preguntas que el asistente puede responder:

✅ **Análisis de reportes:**
- "Muéstrame un resumen de todos mis reportes"
- "¿Cuántos reportes he hecho?"
- "¿Cuál es mi promedio de evaluación?"

✅ **Recomendaciones:**
- "Recomiéndame un delantero de mis reportes"
- "¿Qué jugador tiene mejor valoración técnica?"
- "Dame opciones para mediocampista ofensivo"

✅ **Comparaciones:**
- "Compara [Jugador A] con [Jugador B]"
- "¿Qué jugador es mejor para jugar de extremo?"

✅ **Análisis de patrones:**
- "¿Qué aspectos suelo valorar más alto?"
- "¿Hay algún patrón en mis evaluaciones?"
- "¿En qué posición he evaluado más jugadores?"

✅ **Ayuda general:**
- "¿Qué aspectos debo evaluar en un lateral?"
- "Dame una plantilla para crear un reporte"

---

## 📊 Estructura de Datos

### ai_conversations
```sql
- id (UUID)
- scout_id (UUID) → scouts.id
- title (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### ai_messages
```sql
- id (UUID)
- conversation_id (UUID) → ai_conversations.id
- role ('user' | 'assistant' | 'system')
- content (TEXT)
- created_at (TIMESTAMP)
```

---

## 🔒 Seguridad

- ✅ RLS activado en ambas tablas
- ✅ Solo el scout propietario puede ver sus conversaciones
- ✅ Autenticación requerida para cada petición
- ✅ Token validado en cada llamada al Worker

---

## 🐛 Solución de Problemas

### "Se requiere autenticación"
- Verifica que estés logueado
- Revisa que el token se esté enviando correctamente
- Comprueba la consola del navegador (F12)

### "Scout no encontrado"
- Asegúrate de tener un registro en la tabla `scouts`
- Verifica que el `id` coincida con el `user.id` de auth

### El asistente no usa mis reportes
- Verifica que los reportes tengan `scout_id` correcto
- Comprueba que las políticas RLS permitan leer reportes
- Mira los logs del Worker en Cloudflare

### Error de CORS
- Verifica que el código del Worker tenga los headers correctos
- Redespliega el Worker

---

## 📈 Próximas Mejoras

- [ ] Historial de conversaciones en la interfaz
- [ ] Búsqueda semántica en reportes
- [ ] Exportar conversaciones
- [ ] Compartir insights con otros scouts
- [ ] Integración con calendario de partidos

---

¿Necesitas ayuda? Revisa los logs del Worker y la consola del navegador.
