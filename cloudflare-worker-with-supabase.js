// =============================================
// API BACKEND - Asistente IA con Supabase
// =============================================

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (usando variables de entorno del Worker)
// Debes configurar estas variables en tu Worker de Cloudflare

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
5. Ayudar a crear nuevos reportes con estructura profesional
6. Identificar patrones en las evaluaciones del scout

INSTRUCCIONES:
- Cuando te pidan recomendar jugadores, usa los datos de reportes proporcionados
- Cita nombres específicos, valoraciones y observaciones de los reportes
- Mantén un tono profesional y analítico
- Si no tienes suficientes datos, solicita más información
- Usa formato claro con viñetas y estructura cuando sea apropiado

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
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      const body = await request.json();
      const { 
        messages, 
        conversationId, 
        userToken 
      } = body;

      if (!userToken) {
        return new Response(JSON.stringify({ 
          error: 'Se requiere autenticación',
          message: 'Por favor inicia sesión para usar el asistente' 
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Inicializar Supabase con el token del usuario
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${userToken}`
            }
          }
        }
      );

      // Obtener información del usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return new Response(JSON.stringify({ 
          error: 'Usuario no autenticado',
          message: 'Token inválido o expirado' 
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Obtener el scout_id del usuario
      const { data: scout, error: scoutError } = await supabase
        .from('scouts')
        .select('id, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (scoutError || !scout) {
        return new Response(JSON.stringify({ 
          error: 'Scout no encontrado',
          message: 'No se pudo obtener la información del scout' 
        }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Obtener reportes del scout para contexto
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id,
          player_name,
          player_position,
          match_date,
          match_competition,
          overall_rating,
          technical_rating,
          physical_rating,
          tactical_rating,
          mental_rating,
          strengths,
          weaknesses,
          detailed_analysis,
          recommendation
        `)
        .eq('scout_id', scout.id)
        .order('created_at', { ascending: false })
        .limit(20);

      // Crear contexto con los reportes del scout
      let contextMessage = '';
      if (reports && reports.length > 0) {
        contextMessage = `\n\nCONTEXTO - REPORTES DEL SCOUT (${scout.first_name} ${scout.last_name}):\n`;
        contextMessage += `Total de reportes disponibles: ${reports.length}\n\n`;
        
        reports.forEach((report, index) => {
          contextMessage += `REPORTE ${index + 1}:\n`;
          contextMessage += `- Jugador: ${report.player_name}\n`;
          contextMessage += `- Posición: ${report.player_position || 'No especificada'}\n`;
          contextMessage += `- Fecha: ${report.match_date || 'No especificada'}\n`;
          contextMessage += `- Competición: ${report.match_competition || 'No especificada'}\n`;
          contextMessage += `- Valoración General: ${report.overall_rating || 'N/A'}/10\n`;
          contextMessage += `- Técnica: ${report.technical_rating || 'N/A'}/10\n`;
          contextMessage += `- Física: ${report.physical_rating || 'N/A'}/10\n`;
          contextMessage += `- Táctica: ${report.tactical_rating || 'N/A'}/10\n`;
          contextMessage += `- Mental: ${report.mental_rating || 'N/A'}/10\n`;
          if (report.strengths) contextMessage += `- Fortalezas: ${report.strengths}\n`;
          if (report.weaknesses) contextMessage += `- Debilidades: ${report.weaknesses}\n`;
          if (report.recommendation) contextMessage += `- Recomendación: ${report.recommendation}\n`;
          contextMessage += `\n`;
        });
      } else {
        contextMessage = '\n\nCONTEXTO: El scout aún no tiene reportes creados en la plataforma.\n';
      }

      // Construir mensajes con contexto
      const aiMessages = [
        { role: 'system', content: SYSTEM_PROMPT + contextMessage },
        ...messages
      ];

      // Llamar a la IA de Cloudflare
      const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: aiMessages
      });

      const assistantMessage = aiResponse.response || aiResponse.content || 'Lo siento, no pude generar una respuesta.';

      // Guardar la conversación en Supabase
      let finalConversationId = conversationId;
      
      if (!finalConversationId) {
        // Crear nueva conversación
        const { data: newConv, error: convError } = await supabase
          .from('ai_conversations')
          .insert({
            scout_id: scout.id,
            title: messages[0]?.content?.substring(0, 100) || 'Nueva conversación'
          })
          .select()
          .single();

        if (!convError && newConv) {
          finalConversationId = newConv.id;
        }
      }

      // Guardar mensajes en la base de datos
      if (finalConversationId) {
        // Guardar mensaje del usuario
        await supabase.from('ai_messages').insert({
          conversation_id: finalConversationId,
          role: 'user',
          content: messages[messages.length - 1]?.content || ''
        });

        // Guardar respuesta del asistente
        await supabase.from('ai_messages').insert({
          conversation_id: finalConversationId,
          role: 'assistant',
          content: assistantMessage
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
