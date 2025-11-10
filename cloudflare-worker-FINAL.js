// WORKER DE PRODUCCIÓN - Con Supabase completo y depuración
const SYSTEM_PROMPT = `Eres un asistente de IA para un scout de fútbol.

REGLA ABSOLUTA: NO INVENTES NADA. USA SOLO LA INFORMACIÓN QUE TE DOY.

Cuando te pregunten:
- "¿Cuál es mi nombre?" → Busca "Nombre del scout:" en los datos y responde ESE nombre exacto
- "¿Cuántos reportes tengo?" → Busca "Total de reportes:" y di ESE número exacto
- Sobre jugadores → Solo menciona los que aparecen en "REPORTES COMPLETOS"

Si no encuentras la información en los datos, di: "No tengo esa información en mi base de datos."

NO inventes nombres, números, ni datos. Solo usa lo que está explícitamente en el contexto.`;

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    // Manejar preflight CORS
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
      const { messages, userToken, conversationId } = body;

      if (!userToken) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Token no proporcionado'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Configurar headers para Supabase con TODOS los headers necesarios
      const supabaseHeaders = {
        'Authorization': `Bearer ${userToken}`,
        'apikey': env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      };

      // 1. Validar el token con Supabase
      const authResponse = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
        headers: supabaseHeaders
      });

      if (!authResponse.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Token inválido'
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const user = await authResponse.json();
      const userId = user.id;

      // 2. Obtener información del scout desde profiles
      const profileResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=full_name,email`,
        { headers: supabaseHeaders }
      );

      let scoutInfo = null;
      let scoutId = null;
      
      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        scoutInfo = profiles[0];
      }

      // Obtener el scout_id de la tabla scouts
      const scoutResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/scouts?user_id=eq.${userId}&select=id,organization`,
        { headers: supabaseHeaders }
      );

      if (scoutResponse.ok) {
        const scouts = await scoutResponse.json();
        console.log('Scouts data:', JSON.stringify(scouts));
        if (scouts[0]) {
          scoutId = scouts[0].id;
          scoutInfo = { ...scoutInfo, organization: scouts[0].organization };
          console.log('Scout ID obtenido:', scoutId);
        } else {
          console.log('⚠️ No se encontró scout para user_id:', userId);
        }
      }

      // 3. Obtener reportes del scout
      const reportsResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/reports?scout_id=eq.${scoutId}&select=*&order=created_at.desc&limit=20`,
        { headers: supabaseHeaders }
      );

      let reports = [];
      let reportsCount = 0;
      if (reportsResponse.ok) {
        reports = await reportsResponse.json();
        reportsCount = reports.length;
      }

      // 3b. Obtener lista de seguimiento con información completa
      let watchlist = [];
      let watchlistCount = 0;
      
      console.log('🔍 Buscando watchlist con scout_id:', scoutId);
      
      // Primero obtener la watchlist básica
      const watchlistResponse = await fetch(
        `${env.SUPABASE_URL}/rest/v1/watchlist?scout_id=eq.${scoutId}&select=*&order=created_at.desc`,
        { headers: supabaseHeaders }
      );

      console.log('Watchlist response status:', watchlistResponse.status);
      const watchlistResponseText = await watchlistResponse.text();
      console.log('Watchlist response body:', watchlistResponseText);
      
      if (watchlistResponse.ok) {
        const watchlistData = JSON.parse(watchlistResponseText);
        console.log('✅ Watchlist data length:', watchlistData.length);
        watchlistCount = watchlistData.length;
        
        // Para cada jugador en watchlist, obtener sus datos completos
        for (let item of watchlistData) {
          // Obtener datos del jugador desde la tabla players
          const playerResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/players?id=eq.${item.player_id}&select=position,current_club,country,bio`,
            { headers: supabaseHeaders }
          );
          
          if (playerResponse.ok) {
            const players = await playerResponse.json();
            item.player_data = players[0] || null;
          }
          
          // Obtener el perfil del jugador para su nombre
          if (item.player_data) {
            const playerProfileResponse = await fetch(
              `${env.SUPABASE_URL}/rest/v1/players?id=eq.${item.player_id}&select=user_id`,
              { headers: supabaseHeaders }
            );
            
            if (playerProfileResponse.ok) {
              const playerProfiles = await playerProfileResponse.json();
              if (playerProfiles[0]?.user_id) {
                const profileNameResponse = await fetch(
                  `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${playerProfiles[0].user_id}&select=full_name`,
                  { headers: supabaseHeaders }
                );
                
                if (profileNameResponse.ok) {
                  const profileNames = await profileNameResponse.json();
                  item.player_name = profileNames[0]?.full_name || 'Jugador sin nombre';
                }
              }
            }
          }
          
          // Contar reportes del jugador hechos por este scout
          const playerReportsResponse = await fetch(
            `${env.SUPABASE_URL}/rest/v1/reports?scout_id=eq.${scoutId}&player_id=eq.${item.player_id}&select=id`,
            { headers: supabaseHeaders }
          );
          
          if (playerReportsResponse.ok) {
            const playerReports = await playerReportsResponse.json();
            item.reports_count = playerReports.length;
          } else {
            item.reports_count = 0;
          }
          
          watchlist.push(item);
        }
      }

      // 4. Construir contexto enriquecido
      let contextMessage = `INFORMACIÓN EXACTA DE LA BASE DE DATOS:

Nombre del scout: ${scoutInfo?.full_name || 'N/A'}
Organización: ${scoutInfo?.organization || 'N/A'}
Total de reportes: ${reportsCount}
Total en lista de seguimiento: ${watchlistCount}

`;

      if (reports.length > 0) {
        contextMessage += `REPORTES COMPLETOS (${reports.length} jugadores evaluados):\n`;
        contextMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        reports.forEach((report, index) => {
          contextMessage += `REPORTE #${index + 1}: ${report.player_name || 'Sin nombre'}
📍 Posición: ${report.position || 'N/A'}
🎂 Edad: ${report.age || 'N/A'} años
⚽ Club: ${report.current_club || 'N/A'}
📅 Fecha evaluación: ${report.match_date || 'N/A'}

CALIFICACIONES:
• Overall: ${report.overall_rating || 'N/A'}/10
• Técnica: ${report.technical_rating || 'N/A'}/10
• Físico: ${report.physical_rating || 'N/A'}/10
• Táctico: ${report.tactical_rating || 'N/A'}/10
• Mental: ${report.mental_rating || 'N/A'}/10
• Potencial: ${report.potential || 'N/A'}

${report.observations ? `📝 Observaciones: ${report.observations.substring(0, 300)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
        });
      } else {
        contextMessage += `⚠️ IMPORTANTE: No hay reportes disponibles en la base de datos.
El scout aún no ha creado ningún reporte.`;
      }

      // Agregar información de la lista de seguimiento
      if (watchlist.length > 0) {
        contextMessage += `\n\nLISTA DE SEGUIMIENTO (${watchlist.length} jugadores):\n`;
        contextMessage += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        watchlist.forEach((item, index) => {
          const player = item.player_data;
          contextMessage += `JUGADOR #${index + 1} EN SEGUIMIENTO:
👤 Nombre: ${item.player_name || 'Jugador sin nombre'}
📍 Posición: ${player?.position || 'N/A'}
⚽ Club actual: ${player?.current_club || 'N/A'}
🌍 País: ${player?.country || 'N/A'}
📊 Reportes que le hice: ${item.reports_count || 0}
🎯 Prioridad: ${item.priority || 'media'}
📝 Notas: ${item.notes || 'Sin notas'}
📅 Agregado: ${item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}

`;
        });
      } else {
        contextMessage += `\n\n⚠️ Lista de seguimiento vacía. No hay jugadores en seguimiento actualmente.`;
      }

      // 5. Detectar preguntas directas y responder inmediatamente
      const userQuestion = messages[messages.length - 1].content.toLowerCase();
      let directAnswer = null;
      
      if (userQuestion.includes('mi nombre') || 
          userQuestion.includes('cual es mi nombre') || 
          userQuestion.includes('cuál es mi nombre') ||
          userQuestion.includes('cómo me llamo') || 
          userQuestion.includes('como me llamo') ||
          userQuestion.includes('quien soy') ||
          userQuestion.includes('quién soy')) {
        directAnswer = `Tu nombre es ${scoutInfo?.full_name || 'N/A'}.`;
      } else if (userQuestion.includes('cuantos reportes') || userQuestion.includes('cuántos reportes')) {
        directAnswer = `Tienes ${reportsCount} reporte${reportsCount !== 1 ? 's' : ''} en total.`;
      } else if (userQuestion.includes('mi organizacion') || userQuestion.includes('mi organización')) {
        directAnswer = scoutInfo?.organization ? `Tu organización es: ${scoutInfo.organization}` : 'No tienes una organización registrada.';
      } else if (userQuestion.includes('lista de seguimiento') || 
                 userQuestion.includes('watchlist') || 
                 userQuestion.includes('cuantos en seguimiento') || 
                 userQuestion.includes('cuántos en seguimiento') ||
                 userQuestion.includes('jugadores en lista')) {
        directAnswer = watchlistCount > 0 
          ? `Tienes ${watchlistCount} jugador${watchlistCount !== 1 ? 'es' : ''} en tu lista de seguimiento.`
          : 'Tu lista de seguimiento está vacía actualmente.';
      }

      // Si hay respuesta directa, usarla
      let assistantMessage;
      
      if (directAnswer) {
        assistantMessage = directAnswer;
      } else {
        // Construir mensajes para la IA
        const aiMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: contextMessage },
          ...messages
        ];

        // Llamar a la IA
        const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: aiMessages,
          max_tokens: 1024
        });

        assistantMessage = aiResponse.response || 'Lo siento, no pude generar una respuesta.';
      }

      // Guardar conversación en Supabase
      let savedConversationId = conversationId;

      if (!savedConversationId && scoutInfo) {
        const newConversation = {
          scout_id: scoutId,
          title: messages[0]?.content?.substring(0, 100) || 'Nueva conversación',
          created_at: new Date().toISOString()
        };

        const createConvResponse = await fetch(
          `${env.SUPABASE_URL}/rest/v1/ai_conversations`,
          {
            method: 'POST',
            headers: {
              ...supabaseHeaders,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(newConversation)
          }
        );

        if (createConvResponse.ok) {
          const [conv] = await createConvResponse.json();
          savedConversationId = conv.id;
        }
      }

      // Guardar mensajes
      if (savedConversationId) {
        const messagesToSave = [
          {
            conversation_id: savedConversationId,
            role: 'user',
            content: messages[messages.length - 1].content,
            created_at: new Date().toISOString()
          },
          {
            conversation_id: savedConversationId,
            role: 'assistant',
            content: assistantMessage,
            created_at: new Date().toISOString()
          }
        ];

        await fetch(
          `${env.SUPABASE_URL}/rest/v1/ai_messages`,
          {
            method: 'POST',
            headers: supabaseHeaders,
            body: JSON.stringify(messagesToSave)
          }
        );
      }

      // Responder
      return new Response(JSON.stringify({
        success: true,
        response: assistantMessage,
        conversationId: savedConversationId,
        scoutName: scoutInfo?.full_name || null,
        reportsCount: reportsCount,
        watchlistCount: watchlistCount,
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
        message: error.message,
        stack: error.stack
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
