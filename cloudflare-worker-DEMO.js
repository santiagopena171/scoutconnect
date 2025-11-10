// WORKER TEMPORAL DE PRUEBA - Sin autenticación
const SYSTEM_PROMPT = `Eres un asistente experto en scouting de fútbol profesional. Ayudas a scouts a evaluar jugadores y crear reportes profesionales.`;

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
      const { messages } = body;

      // Construir mensajes para la IA
      const aiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ];

      // Llamar a la IA
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: aiMessages
      });

      const assistantMessage = aiResponse.response || 'Lo siento, no pude generar una respuesta.';

      return new Response(JSON.stringify({
        success: true,
        response: assistantMessage,
        scoutName: 'Demo',
        reportsCount: 0,
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
