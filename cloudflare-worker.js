// worker.js - Código para tu Cloudflare Worker
// Copia este archivo completo en tu Worker de Cloudflare

// Prompt del sistema para el asistente de scout
const SYSTEM_PROMPT = `Eres un asistente experto en scouting de fútbol profesional para la plataforma ScoutConnect. Tu misión es ayudar a los scouts a evaluar jugadores, crear reportes detallados y tomar decisiones informadas.

CONOCIMIENTOS ESPECIALIZADOS:
- Evaluación técnica de jugadores (regate, pase, tiro, control)
- Análisis táctico (posicionamiento, lectura de juego, trabajo sin balón)
- Evaluación física (velocidad, resistencia, fuerza)
- Aspectos mentales (liderazgo, actitud, mentalidad competitiva)
- Metodología de scouting profesional
- Estándares de reportes de scouting

CAPACIDADES:
1. Ayudar a redactar reportes de jugadores con estructura profesional
2. Sugerir aspectos técnicos, tácticos y físicos a evaluar
3. Recomendar criterios de valoración y puntuación
4. Identificar fortalezas y áreas de mejora de jugadores
5. Comparar perfiles de jugadores
6. Sugerir preguntas clave para evaluar durante observaciones
7. Orientar sobre mejores prácticas de scouting

ESTRUCTURA DE RESPUESTA:
- Responde de manera concisa y profesional
- Usa terminología técnica del fútbol cuando sea apropiado
- Proporciona ejemplos específicos cuando sea útil
- Enfócate en datos objetivos y observables
- Mantén un tono constructivo y analítico
- Usa viñetas y estructura clara cuando sea apropiado

RESTRICCIONES:
- No inventes datos o estadísticas de jugadores reales
- No hagas evaluaciones sin información suficiente
- No proporciones consejos legales o contractuales
- Reconoce cuando necesitas más información para dar una respuesta precisa

Tu objetivo es ser un asistente práctico que mejore la calidad del trabajo de scouting y facilite la creación de reportes profesionales.`;

export default {
  async fetch(request, env) {
    // Habilitar CORS con headers completos
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    // Manejar preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // Solo permitir POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    try {
      // Parsear el body de la petición
      const body = await request.json();
      const userMessages = body.messages || [];

      // Construir el array de mensajes con el sistema
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...userMessages
      ];

      // Llamar a la IA de Cloudflare
      const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: messages
      });

      // Retornar la respuesta
      return new Response(JSON.stringify({
        success: true,
        response: response.response || response.content || 'Lo siento, no pude generar una respuesta.',
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
