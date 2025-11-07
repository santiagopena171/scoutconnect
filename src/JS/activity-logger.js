// ===== UTILIDAD PARA REGISTRAR ACTIVIDAD DE SCOUTS =====

/**
 * Registra una actividad del scout en la base de datos
 * @param {string} activityType - Tipo de actividad (report_created, player_added_watchlist, etc.)
 * @param {string} title - Título de la actividad
 * @param {Object} options - Opciones adicionales
 * @param {string} options.description - Descripción detallada
 * @param {string} options.relatedPlayerId - ID del jugador relacionado
 * @param {string} options.relatedPlayerName - Nombre del jugador relacionado
 * @param {string} options.relatedReportId - ID del reporte relacionado
 * @param {Object} options.metadata - Datos adicionales en formato JSON
 */
async function logScoutActivity(activityType, title, options = {}) {
  try {
    // Verificar que Supabase está disponible
    if (!window.supabase) {
      console.warn('⚠️ Supabase no está disponible para registrar actividad');
      return null;
    }

    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.warn('⚠️ No hay usuario autenticado para registrar actividad', userError);
      return null;
    }

    console.log('👤 Usuario para actividad:', user.id);

    // Preparar datos de actividad (sin related_player_id para evitar errores de FK)
    const activityData = {
      scout_id: user.id,
      activity_type: activityType,
      title: title,
      description: options.description || null,
      related_player_name: options.relatedPlayerName || null,
      related_report_id: options.relatedReportId || null,
      metadata: options.metadata || null,
      created_at: new Date().toISOString()
    };

    console.log('📝 Datos a insertar:', activityData);

    // Insertar actividad
    const { data, error } = await supabase
      .from('scout_activity')
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al registrar actividad:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('✅ Actividad registrada exitosamente:', data);
    return data;

  } catch (error) {
    console.error('❌ Excepción en logScoutActivity:', error);
    return null;
  }
}

/**
 * Registra cuando un scout crea un reporte
 */
async function logReportCreated(playerName, playerPosition, rating) {
  return await logScoutActivity(
    'report_created',
    'Nuevo reporte generado',
    {
      description: `${playerName} - ${playerPosition}`,
      relatedPlayerName: playerName,
      metadata: {
        position: playerPosition,
        rating: rating
      }
    }
  );
}

/**
 * Registra cuando un scout añade un jugador a seguimiento
 */
async function logPlayerAddedToWatchlist(playerId, playerName, playerPosition) {
  console.log('🎯 Registrando actividad: Jugador añadido a watchlist', {
    playerId,
    playerName,
    playerPosition
  });
  
  const result = await logScoutActivity(
    'player_added_watchlist',
    'Jugador añadido a seguimiento',
    {
      description: `${playerName} - ${playerPosition}`,
      relatedPlayerId: playerId,
      relatedPlayerName: playerName,
      metadata: {
        position: playerPosition
      }
    }
  );
  
  if (result) {
    console.log('✅ Actividad registrada exitosamente:', result);
  } else {
    console.log('❌ No se pudo registrar la actividad');
  }
  
  return result;
}

/**
 * Registra cuando un scout quita un jugador de seguimiento
 */
async function logPlayerRemovedFromWatchlist(playerId, playerName, playerPosition) {
  return await logScoutActivity(
    'player_removed_watchlist',
    'Jugador removido de seguimiento',
    {
      description: `${playerName} - ${playerPosition}`,
      relatedPlayerId: playerId,
      relatedPlayerName: playerName,
      metadata: {
        position: playerPosition
      }
    }
  );
}

/**
 * Registra cuando un scout visualiza un perfil de jugador
 */
async function logPlayerProfileViewed(playerId, playerName, playerPosition) {
  return await logScoutActivity(
    'profile_viewed',
    'Perfil visualizado',
    {
      description: `${playerName} - ${playerPosition}`,
      relatedPlayerId: playerId,
      relatedPlayerName: playerName,
      metadata: {
        position: playerPosition
      }
    }
  );
}

/**
 * Registra cuando un scout actualiza su perfil
 */
async function logProfileUpdated() {
  return await logScoutActivity(
    'profile_updated',
    'Perfil actualizado',
    {
      description: 'Información personal y profesional actualizada'
    }
  );
}

// Exportar funciones para uso global
window.logScoutActivity = logScoutActivity;
window.logReportCreated = logReportCreated;
window.logPlayerAddedToWatchlist = logPlayerAddedToWatchlist;
window.logPlayerRemovedFromWatchlist = logPlayerRemovedFromWatchlist;
window.logPlayerProfileViewed = logPlayerProfileViewed;
window.logProfileUpdated = logProfileUpdated;
