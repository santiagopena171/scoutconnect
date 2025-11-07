// =============================================
// SCRIPT DE MIGRACIÓN DE REPORTES
// =============================================
// Este script actualiza reportes antiguos que no tienen información del scout
// Ejecutar en la consola del navegador (F12 → Console)

function migrateReports() {
  
  
  try {
    // Cargar reportes existentes
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    
    if (reports.length === 0) {
      
      return;
    }
    
    
    
    // Obtener información del usuario actual
    let currentUser = null;
    
    // 1. Buscar en localStorage (clave del login)
    try {
      const scoutConnectUser = JSON.parse(localStorage.getItem('scoutConnectUser') || 'null');
      if (scoutConnectUser) {
        currentUser = {
          id: scoutConnectUser.userId || scoutConnectUser.id,
          name: scoutConnectUser.fullName || scoutConnectUser.full_name || scoutConnectUser.name,
          email: scoutConnectUser.email
        };
        
      }
    } catch (e) {}
    
    // 2. Alternativa: buscar en localStorage del perfil
    if (!currentUser) {
      try {
        const userProfile = JSON.parse(localStorage.getItem('scoutconnect_user') || 'null');
        if (userProfile) {
          currentUser = {
            id: userProfile.id || userProfile.userId,
            name: userProfile.name || userProfile.fullName,
            email: userProfile.email
          };
          
        }
      } catch (e) {}
    }
    
    // Si no hay usuario, preguntar
    if (!currentUser) {
      const name = prompt('👤 Ingresa tu nombre para migrar los reportes:', 'Scout Profesional');
      const email = prompt('📧 Ingresa tu email:', 'scout@scoutconnect.com');
      
      if (!name || !email) {
        
        return;
      }
      
      currentUser = {
        id: 'migrated_' + Date.now(),
        name: name,
        email: email
      };
      
      // Guardar en ambas claves para máxima compatibilidad
      const userData = {
        userId: currentUser.id,
        id: currentUser.id,
        fullName: currentUser.name,
        full_name: currentUser.name,
        name: currentUser.name,
        email: currentUser.email,
        userType: 'scout'
      };
      localStorage.setItem('scoutConnectUser', JSON.stringify(userData));
      localStorage.setItem('scoutconnect_user', JSON.stringify(userData));
    }
    
    
    
    // Migrar reportes
    let migratedCount = 0;
    const updatedReports = reports.map(report => {
      // Si ya tiene información del scout, no modificar
      if (report.scoutId && report.scoutName && report.scoutEmail) {
        return report;
      }
      
      // Agregar información del scout
      migratedCount++;
      return {
        ...report,
        scoutId: report.scoutId || currentUser.id,
        scoutName: report.scoutName || currentUser.name,
        scoutEmail: report.scoutEmail || currentUser.email
      };
    });
    
    // Guardar reportes actualizados
    localStorage.setItem('generatedReports', JSON.stringify(updatedReports));
    
    
    
    
    return {
      total: reports.length,
      migrated: migratedCount,
      user: currentUser
    };
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    return null;
  }
}

// =============================================
// FUNCIÓN PARA LIMPIAR REPORTES (SOLO PARA TESTING)
// =============================================

function clearAllReports() {
  const confirm = prompt('⚠️ Esto eliminará TODOS los reportes. Escribe "CONFIRMAR" para continuar:', '');
  
  if (confirm === 'CONFIRMAR') {
    localStorage.removeItem('generatedReports');
    
    
    return true;
  } else {
    
    return false;
  }
}

// =============================================
// FUNCIÓN PARA VER REPORTES POR JUGADOR
// =============================================

function getReportsByPlayer(playerId) {
  const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
  const playerReports = reports.filter(r => r.playerId == playerId);
  
  
  playerReports.forEach((r, i) => {
    
  });
  
  return playerReports;
}

// =============================================
// FUNCIÓN PARA CREAR REPORTES DE PRUEBA
// =============================================

function createTestReports(playerId, count = 3) {
  
  
  // Obtener usuario actual
  let currentUser = null;
  try {
    const scoutConnectUser = JSON.parse(localStorage.getItem('scoutConnectUser'));
    if (scoutConnectUser) {
      currentUser = {
        id: scoutConnectUser.userId || scoutConnectUser.id,
        name: scoutConnectUser.fullName || scoutConnectUser.full_name || scoutConnectUser.name,
        email: scoutConnectUser.email
      };
    } else {
      currentUser = JSON.parse(localStorage.getItem('scoutconnect_user'));
    }
  } catch (e) {}
  
  if (!currentUser) {
    
    return;
  }
  
  const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
  const playerNames = {
    '1': 'Miguel Rodríguez',
    '2': 'Andrés Silva',
    '3': 'Luis Gómez',
    '4': 'Carlos Mendoza'
  };
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7)); // Reportes semanales
    
    const report = {
      id: 'report_' + Date.now() + '_' + i,
      playerId: playerId,
      playerName: playerNames[playerId] || 'Jugador Test',
      scoutId: currentUser.id,
      scoutName: currentUser.name,
      scoutEmail: currentUser.email,
      date: date.toISOString().split('T')[0],
      createdAt: date.toISOString(),
      title: `Reporte de Seguimiento ${i + 1}`,
      type: 'scouting',
      priority: ['high', 'medium', 'low'][i % 3],
      technicalRating: 7 + Math.random() * 2,
      physicalRating: 6.5 + Math.random() * 2,
      mentalRating: 7.5 + Math.random() * 2,
      tacticalRating: 7 + Math.random() * 2,
      overallRating: 7 + Math.random() * 2,
      summary: `Evaluación ${i + 1} del jugador. Muestra buenos fundamentos y potencial de mejora.`,
      observations: `Observaciones detalladas del reporte ${i + 1}.`,
      recommendation: 'Continuar seguimiento',
      status: 'completed'
    };
    
    reports.push(report);
  }
  
  localStorage.setItem('generatedReports', JSON.stringify(reports));
  
  
}

// Exponer funciones globalmente
window.migrateReports = migrateReports;
window.clearAllReports = clearAllReports;
window.getReportsByPlayer = getReportsByPlayer;
window.createTestReports = createTestReports;






