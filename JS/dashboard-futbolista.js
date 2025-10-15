// ===== JAVASCRIPT PARA EL DASHBOARD DEL FUTBOLISTA =====

document.addEventListener('DOMContentLoaded', function() {
  // Verificar si se está accediendo directamente al dashboard (para desarrollo)
  const urlParams = new URLSearchParams(window.location.search);
  const directAccess = urlParams.get('direct') === 'true';
  
  console.log('🚀 Iniciando dashboard del futbolista...');
  console.log('🔧 Acceso directo:', directAccess);
  
  if (!directAccess && !checkSession()) {
    console.log('❌ No se pudo verificar la sesión, pero continuando con datos por defecto para demo');
    // Para desarrollo, permitir continuar sin sesión válida
    // En producción, descomenta la línea de abajo:
    // return;
  }
  // Elementos del DOM
  const notificationBtn = document.getElementById('notificationBtn');
  const notificationDropdown = document.getElementById('notificationDropdown');
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenuDropdown = document.getElementById('userMenuDropdown');
  const editProfileBtn = document.getElementById('editProfileInfoBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const addVideoModal = document.getElementById('addVideoModal');
  const videoFacets = document.getElementById('videoFacets');
  const addMoreVideosBtn = document.getElementById('addMoreVideosBtn');

  // Datos del jugador (simulados - en producción vendrían de una API)
  let playerData = {
    id: 1,
    name: 'Juan Pérez',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    avatar: 'imagenes/imagen1.png',
    position: 'Mediocampista Ofensivo',
    secondaryPosition: 'Extremo Derecho',
    age: 22,
    birthDate: '2003-05-15',
    dominantFoot: 'Derecha',
    height: '1.75',
    weight: '68',
    location: 'Buenos Aires, Argentina',
    nationality: 'Argentina',
    level: 'Semi-profesional',
    club: 'River Plate - Reserva',
    bio: 'Mediocampista creativo con gran visión de juego y capacidad para generar jugadas. Especializado en pases largos y remates de media distancia.',
    
    // Características físicas adicionales
    physicalAttributes: {
      speed: 8,
      strength: 7,
      endurance: 8,
      agility: 9,
      balance: 8
    },
    
    // Características técnicas
    technicalAttributes: {
      shooting: 7,
      passing: 9,
      dribbling: 8,
      defending: 6,
      goalkeeping: 3
    },
    
    // Características mentales
    mentalAttributes: {
      vision: 9,
      leadership: 7,
      determination: 8,
      composure: 8,
      workRate: 8
    },
    
    // Información adicional
    additionalInfo: {
      preferredFormation: '4-3-3',
      languages: ['Español', 'Inglés'],
      experience: 'Primera División (2 años), Reserva (3 años)',
      achievements: 'Subcampeón torneo juvenil 2023',
      injuries: 'Ninguna lesión significativa',
      availability: 'Disponible inmediatamente'
    },
    
    profileCompletion: 75,
    videos: {
      'control-pase': 'https://youtube.com/watch?v=example1',
      'vision-juego': '',
      'remates': 'https://youtube.com/watch?v=example2',
      'regates': '',
      'tiros-libres': '',
      'asistencias': '',
      'movimientos-area': '',
      'creatividad': '',
      'presion-perdida': ''
    },
    profileViews: 12,
    newMessages: 5
  };

  // Cargar datos persistentes del jugador
  function loadPlayerDataFromStorage() {
    console.log('📂 Cargando datos persistentes del jugador...');
    
    try {
      const savedPlayerData = localStorage.getItem('scoutConnectPlayerData');
      if (savedPlayerData) {
        const parsedData = JSON.parse(savedPlayerData);
        // Combinar datos por defecto con datos guardados
        playerData = { ...playerData, ...parsedData };
        console.log('✅ Datos del jugador cargados desde localStorage:', playerData);
      } else {
        console.log('ℹ️ No hay datos guardados, usando datos por defecto');
        // Guardar datos por defecto por primera vez
        savePlayerDataToStorage();
      }
    } catch (error) {
      console.error('❌ Error cargando datos del jugador:', error);
      console.log('🔄 Usando datos por defecto');
    }
  }

  // Guardar datos del jugador en localStorage
  function savePlayerDataToStorage() {
    console.log('💾 Guardando datos del jugador...');
    
    try {
      updateSaveStatus('saving');
      
      // Crear backup automático cada 5 guardados
      const saveCount = parseInt(localStorage.getItem('scoutConnectSaveCount') || '0') + 1;
      if (saveCount % 5 === 0) {
        createBackup();
      }
      localStorage.setItem('scoutConnectSaveCount', saveCount.toString());
      
      localStorage.setItem('scoutConnectPlayerData', JSON.stringify(playerData));
      console.log('✅ Datos del jugador guardados correctamente');
      updateSaveStatus('saved');
      return true;
    } catch (error) {
      console.error('❌ Error guardando datos del jugador:', error);
      updateSaveStatus('error');
      return false;
    }
  }

  // Función para actualizar el indicador de estado de guardado
  function updateSaveStatus(status) {
    const indicator = document.querySelector('.save-indicator');
    if (!indicator) return;

    // Remover clases anteriores
    indicator.classList.remove('saving', 'error');
    
    switch (status) {
      case 'saving':
        indicator.classList.add('saving');
        indicator.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Guardando...
        `;
        break;
      case 'saved':
        indicator.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          Cambios guardados
        `;
        break;
      case 'error':
        indicator.classList.add('error');
        indicator.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Error al guardar
        `;
        break;
    }
  }

  // Configuración de videos por posición (expandida)
  const videoFacetsByPosition = {
    'Portero': [
      { key: 'atajadas-reflejos', title: '🧤 Atajadas y reflejos', description: 'Muestra tus mejores atajadas y reflejos espectaculares' },
      { key: 'juego-pies', title: '⚽ Juego con los pies', description: 'Salidas del área, pases largos y distribución' },
      { key: 'centros-aereos', title: '✋ Centros y juego aéreo', description: 'Manejo de centros y situaciones aéreas' },
      { key: 'uno-contra-uno', title: '🎯 Uno contra uno', description: 'Situaciones mano a mano con delanteros' },
      { key: 'penales', title: '🚫 Penales y tiros libres', description: 'Atajadas de penales y tiros libres directos' },
      { key: 'comunicacion', title: '📢 Comunicación y liderazgo', description: 'Organización de la defensa y comunicación' },
      { key: 'distribucion', title: '📤 Distribución con las manos', description: 'Saques largos y precisos con las manos' },
      { key: 'reacciones', title: '⚡ Reacciones rápidas', description: 'Desvíos y segundas jugadas' }
    ],
    'Defensa Central': [
      { key: 'anticipos', title: '🛡️ Anticipos y cortes', description: 'Lectura del juego e interceptaciones precisas' },
      { key: 'duelos-aereos', title: '🏀 Duelos aéreos', description: 'Juego de cabeza defensivo y ofensivo' },
      { key: 'salida-limpia', title: '📤 Salida limpia', description: 'Pases precisos desde la defensa bajo presión' },
      { key: 'marcaje', title: '👥 Marcaje personal', description: 'Marcaje estrecho y seguimiento' },
      { key: 'coberturas', title: '🤝 Coberturas y ayudas', description: 'Trabajo en equipo defensivo' },
      { key: 'entradas', title: '💥 Entradas y tackles', description: 'Recuperaciones con contacto limpio' },
      { key: 'centros-defensivos', title: '📍 Centros defensivos', description: 'Rechazos y despejes de centros' },
      { key: 'liderazgo-defensa', title: '🗣️ Liderazgo defensivo', description: 'Organización y comunicación de la línea' },
      { key: 'jugadas-pelota-parada', title: '🎯 Jugadas de pelota parada', description: 'Corners y tiros libres defensivos y ofensivos' }
    ],
    'Lateral Derecho': [
      { key: 'anticipos', title: '🛡️ Anticipos y cortes', description: 'Lectura del juego e interceptaciones' },
      { key: 'duelos-aereos', title: '🏀 Duelos aéreos', description: 'Juego de cabeza defensivo y ofensivo' },
      { key: 'salida-limpia', title: '📤 Salida limpia', description: 'Pases precisos desde la defensa' },
      { key: 'proyeccion-ofensiva', title: '🏃 Proyección ofensiva', description: 'Subidas al ataque y overlaps' },
      { key: 'centros', title: '📍 Centros y asistencias', description: 'Centros precisos desde banda' },
      { key: 'velocidad', title: '💨 Velocidad y recuperación', description: 'Sprint y recuperación defensiva' },
      { key: 'uno-contra-uno-def', title: '🎯 1vs1 defensivo', description: 'Duelos individuales en banda' },
      { key: 'cambios-ritmo', title: '🔄 Cambios de ritmo', description: 'Aceleración y control de pelota' },
      { key: 'trabajo-equipo', title: '🤝 Trabajo con mediocampistas', description: 'Combinaciones y pared en banda' }
    ],
    'Lateral Izquierdo': [
      { key: 'anticipos', title: '🛡️ Anticipos y cortes', description: 'Lectura del juego e interceptaciones' },
      { key: 'duelos-aereos', title: '🏀 Duelos aéreos', description: 'Juego de cabeza defensivo y ofensivo' },
      { key: 'salida-limpia', title: '📤 Salida limpia', description: 'Pases precisos desde la defensa' },
      { key: 'proyeccion-ofensiva', title: '🏃 Proyección ofensiva', description: 'Subidas al ataque y overlaps' },
      { key: 'centros', title: '📍 Centros y asistencias', description: 'Centros precisos desde banda' },
      { key: 'velocidad', title: '💨 Velocidad y recuperación', description: 'Sprint y recuperación defensiva' },
      { key: 'uno-contra-uno-def', title: '🎯 1vs1 defensivo', description: 'Duelos individuales en banda' },
      { key: 'cambios-ritmo', title: '🔄 Cambios de ritmo', description: 'Aceleración y control de pelota' },
      { key: 'trabajo-equipo', title: '🤝 Trabajo con mediocampistas', description: 'Combinaciones y pared en banda' }
    ],
    'Mediocentro Defensivo': [
      { key: 'recuperaciones', title: '⚙️ Recuperaciones y presión', description: 'Cortes, robos y presión sobre rivales' },
      { key: 'control-pase', title: '🎯 Control y pase', description: 'Técnica individual y distribución precisa' },
      { key: 'transiciones', title: '🔄 Transiciones', description: 'Cambio de ritmo y visión de juego' },
      { key: 'marcaje-volante', title: '👥 Marcaje de volantes', description: 'Seguimiento y neutralización' },
      { key: 'pases-largos', title: '📡 Pases largos', description: 'Distribución a larga distancia' },
      { key: 'entradas-limpias', title: '💥 Entradas limpias', description: 'Tackles y recuperaciones sin faltas' },
      { key: 'coberturas-defensa', title: '🛡️ Coberturas a la defensa', description: 'Ayudas y repliegue defensivo' },
      { key: 'juego-fisico', title: '💪 Juego físico', description: 'Fortaleza en duelos y disputas' },
      { key: 'posicionamiento', title: '📍 Posicionamiento', description: 'Ubicación táctica y lectura del juego' }
    ],
    'Mediocentro': [
      { key: 'control-pase', title: '🎯 Control y pase', description: 'Técnica individual y distribución' },
      { key: 'recuperaciones', title: '⚙️ Recuperaciones y presión', description: 'Cortes y presión sobre rivales' },
      { key: 'transiciones', title: '🔄 Transiciones', description: 'Cambio de ritmo y visión de juego' },
      { key: 'vision-juego', title: '👁️ Visión de juego', description: 'Pases filtrados y asistencias' },
      { key: 'conduccion', title: '🎮 Conducción', description: 'Manejo de pelota en espacios reducidos' },
      { key: 'remates-media', title: '⚽ Remates de media distancia', description: 'Tiros desde fuera del área' },
      { key: 'presion-alta', title: '🔥 Presión alta', description: 'Pressing y recuperación en campo rival' },
      { key: 'juego-aereo', title: '🏀 Juego aéreo', description: 'Cabezazos en ambas áreas' },
      { key: 'combinaciones', title: '🤝 Combinaciones', description: 'Pared y triangulaciones' }
    ],
    'Mediocampista Ofensivo': [
      { key: 'control-pase', title: '🎯 Control y pase', description: 'Técnica individual y distribución creativa' },
      { key: 'vision-juego', title: '👁️ Visión de juego', description: 'Pases filtrados y asistencias' },
      { key: 'remates', title: '⚽ Remates y goles', description: 'Definición desde fuera y dentro del área' },
      { key: 'regates', title: '🎪 Regates y dribles', description: 'Gambetas y superación individual' },
      { key: 'tiros-libres', title: '🎯 Tiros libres', description: 'Ejecución de tiros libres directos' },
      { key: 'asistencias', title: '🎁 Asistencias', description: 'Pases de gol y jugadas preparadas' },
      { key: 'movimientos-area', title: '� Movimientos en área', description: 'Desmarques y llegadas al área' },
      { key: 'creatividad', title: '✨ Creatividad', description: 'Jugadas inesperadas y soluciones únicas' },
      { key: 'presion-perdida', title: '🔄 Presión tras pérdida', description: 'Recuperación inmediata tras perder pelota' }
    ],
    'Extremo Derecho': [
      { key: 'regates-velocidad', title: '💨 Regates y velocidad', description: 'Gambetas y aceleración en banda' },
      { key: 'centros-asistencias', title: '📍 Centros y asistencias', description: 'Centros precisos y pases de gol' },
      { key: 'definicion', title: '⚡ Definición y remates', description: 'Goles desde banda y área' },
      { key: 'uno-contra-uno', title: '� 1vs1 ofensivo', description: 'Superación individual de defensores' },
      { key: 'cambios-pie', title: '🔄 Cambios de pie', description: 'Habilidad con ambos pies' },
      { key: 'movimientos-area', title: '📦 Movimientos en área', description: 'Llegadas y remates en área' },
      { key: 'repliegue', title: '🔙 Repliegue defensivo', description: 'Ayuda defensiva y trabajo de equipo' },
      { key: 'corners', title: '� Corners y centros', description: 'Ejecución de corners y centros al área' },
      { key: 'contraataques', title: '⚡ Contraataques', description: 'Velocidad en transiciones ofensivas' }
    ],
    'Extremo Izquierdo': [
      { key: 'regates-velocidad', title: '💨 Regates y velocidad', description: 'Gambetas y aceleración en banda' },
      { key: 'centros-asistencias', title: '📍 Centros y asistencias', description: 'Centros precisos y pases de gol' },
      { key: 'definicion', title: '⚡ Definición y remates', description: 'Goles desde banda y área' },
      { key: 'uno-contra-uno', title: '� 1vs1 ofensivo', description: 'Superación individual de defensores' },
      { key: 'cambios-pie', title: '🔄 Cambios de pie', description: 'Habilidad con ambos pies' },
      { key: 'movimientos-area', title: '📦 Movimientos en área', description: 'Llegadas y remates en área' },
      { key: 'repliegue', title: '🔙 Repliegue defensivo', description: 'Ayuda defensiva y trabajo de equipo' },
      { key: 'corners', title: '� Corners y centros', description: 'Ejecución de corners y centros al área' },
      { key: 'contraataques', title: '⚡ Contraataques', description: 'Velocidad en transiciones ofensivas' }
    ],
    'Delantero Centro': [
      { key: 'definicion-area', title: '⚽ Definición en área', description: 'Goles dentro del área chica y grande' },
      { key: 'cabezazos', title: '🏀 Cabezazos y juego aéreo', description: 'Remates de cabeza y disputas aéreas' },
      { key: 'movimientos-area', title: '📦 Movimientos en área', description: 'Desmarques y anticipación' },
      { key: 'control-espaldas', title: '🔄 Control de espaldas', description: 'Recepción y protección de pelota' },
      { key: 'presion-defensores', title: '🔥 Presión a defensores', description: 'Presión alta y recuperación' },
      { key: 'remates-distancia', title: '🎯 Remates de distancia', description: 'Tiros desde fuera del área' },
      { key: 'asistencias-pivote', title: '🎁 Asistencias y pivoteo', description: 'Juego asociativo y pases' },
      { key: 'penales', title: '🎯 Penales', description: 'Ejecución de penales' },
      { key: 'contraataques', title: '⚡ Contraataques', description: 'Velocidad y definición en contras' },
      { key: 'jugadas-preparadas', title: '📋 Jugadas preparadas', description: 'Corners, tiros libres y saques' }
    ]
  };

  // Notificaciones simuladas
  const notifications = [
    {
      id: 1,
      title: 'Nuevo scout interesado',
      message: 'Carlos Mendoza de Boca Juniors vio tu perfil',
      time: '2 min',
      type: 'scout',
      read: false
    },
    {
      id: 2,
      title: 'Video revisado',
      message: 'Tu video de "Control y pase" fue revisado por un scout',
      time: '1 hora',
      type: 'video',
      read: false
    },
    {
      id: 3,
      title: 'Nueva propuesta',
      message: 'Club Atlético San Lorenzo te envió una propuesta',
      time: '3 horas',
      type: 'proposal',
      read: true
    }
  ];

  // Mensajes simulados
  const messages = [
    {
      id: 1,
      name: 'Carlos Mendoza',
      club: 'Boca Juniors',
      message: 'Me interesa conocer más sobre tu experiencia...',
      time: '2 min',
      avatar: 'imagenes/imagen2.png',
      unread: true
    },
    {
      id: 2,
      name: 'Ana García',
      club: 'River Plate',
      message: 'Hola Juan, vi tu perfil y me gustaría...',
      time: '1 hora',
      avatar: 'imagenes/imagen3.png',
      unread: true
    }
  ];

  // Scouts simulados
  const scouts = [
    {
      id: 1,
      name: 'Carlos Mendoza',
      club: 'Boca Juniors',
      country: 'Argentina',
      searchType: 'Mediocampistas jóvenes',
      avatar: 'imagenes/imagen2.png'
    },
    {
      id: 2,
      name: 'Ana García',
      club: 'River Plate',
      country: 'Argentina',
      searchType: 'Talentos Sub-23',
      avatar: 'imagenes/imagen3.png'
    }
  ];

  // Inicialización
  init();

  // Función para verificar sesión válida
  function checkSession() {
    console.log('🔍 Verificando sesión...');
    
    const sessionToken = localStorage.getItem('scoutConnectToken');
    const sessionUser = localStorage.getItem('scoutConnectUser');
    const sessionExpiry = localStorage.getItem('scoutConnectExpiry');

    console.log('📋 Datos de sesión encontrados:', {
      hasToken: !!sessionToken,
      hasUser: !!sessionUser,
      hasExpiry: !!sessionExpiry
    });

    if (!sessionToken || !sessionUser || !sessionExpiry) {
      console.log('⚠️ Faltan datos de sesión - funcionando en modo demo');
      // En modo desarrollo, permitir continuar sin sesión
      return true;
    }

    const now = new Date().getTime();
    const expiryTime = parseInt(sessionExpiry);

    console.log('⏰ Verificando expiración:', {
      now: new Date(now).toLocaleString(),
      expiry: new Date(expiryTime).toLocaleString(),
      isExpired: now >= expiryTime
    });

    if (now >= expiryTime) {
      console.log('⏰ Sesión expirada - limpiando datos');
      clearSession();
      // En modo desarrollo, permitir continuar
      return true;
    }

    // Cargar datos del usuario desde la sesión
    try {
      const userData = JSON.parse(sessionUser);
      console.log('✅ Datos de usuario cargados:', userData);
      updatePlayerDataFromSession(userData);
      return true;
    } catch (error) {
      console.error('❌ Error parseando datos de sesión:', error);
      console.log('📄 Datos de sesión raw:', sessionUser);
      clearSession();
      // En modo desarrollo, permitir continuar con datos por defecto
      console.log('⚠️ Continuando con datos por defecto');
      return true;
    }
  }

  // Función para limpiar sesión
  function clearSession() {
    console.log('🧹 Limpiando datos de sesión...');
    try {
      localStorage.removeItem('scoutConnectToken');
      localStorage.removeItem('scoutConnectUser');
      localStorage.removeItem('scoutConnectExpiry');
      console.log('✅ Datos de sesión limpiados');
    } catch (error) {
      console.error('❌ Error limpiando sesión:', error);
    }
  }

  // Función para limpiar completamente el localStorage (para debugging)
  function clearAllStorageData() {
    console.log('🧹 Limpiando TODOS los datos del localStorage...');
    try {
      localStorage.clear();
      console.log('✅ localStorage completamente limpiado');
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }

  // Función para hacer debugging del almacenamiento
  function debugStorage() {
    console.group('🔍 Debug del almacenamiento ScoutConnect');
    
    // Datos principales
    const mainData = localStorage.getItem('scoutConnectPlayerData');
    console.log('📊 Datos principales:', mainData ? JSON.parse(mainData) : 'No encontrados');
    
    // Backup
    const backup = localStorage.getItem('scoutConnectBackup');
    if (backup) {
      const { timestamp, data } = JSON.parse(backup);
      console.log('🔄 Backup disponible del:', new Date(timestamp).toLocaleString());
      console.log('📄 Datos del backup:', data);
    } else {
      console.log('❌ Sin backup disponible');
    }
    
    // Contador de guardados
    const saveCount = localStorage.getItem('scoutConnectSaveCount');
    console.log('💾 Guardados realizados:', saveCount || '0');
    
    // Datos de sesión
    const sessionData = localStorage.getItem('scoutconnect_session');
    console.log('🔐 Datos de sesión:', sessionData ? JSON.parse(sessionData) : 'No encontrados');
    
    // Tamaño total del almacenamiento
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('scoutConnect')) {
        totalSize += localStorage[key].length;
      }
    }
    console.log('📦 Tamaño total del almacenamiento:', (totalSize / 1024).toFixed(2) + ' KB');
    
    console.groupEnd();
    return {
      mainData: mainData ? JSON.parse(mainData) : null,
      backup: backup ? JSON.parse(backup) : null,
      saveCount: parseInt(saveCount || '0'),
      sessionData: sessionData ? JSON.parse(sessionData) : null,
      totalSize: totalSize
    };
  }

  // Hacer función disponible globalmente para debugging
  window.clearAllStorageData = clearAllStorageData;
  window.debugStorage = debugStorage;

  // Funciones para exportar/importar datos del perfil
  function exportPlayerData() {
    console.log('📤 Exportando datos del jugador...');
    const timestamp = new Date().toISOString().split('T')[0];
    const dataBlob = new Blob([JSON.stringify(playerData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scoutconnect-${playerData.name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('✅ Datos exportados correctamente');
    showMessage('success', 'Exportación completa', `Tu perfil ha sido exportado como "scoutconnect-${playerData.name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.json"`);
  }

  function importPlayerData(file) {
    if (!file) return;
    
    console.log('📥 Importando datos del jugador...');
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validar que el archivo tenga la estructura correcta
        if (!importedData.name || !importedData.position) {
          throw new Error('Archivo de perfil inválido');
        }
        
        // Crear backup antes de importar
        createBackup();
        
        playerData = { ...playerData, ...importedData };
        savePlayerDataToStorage();
        loadPlayerData();
        loadVideoFacets();
        calculateProfileCompletion();
        showMessage('success', 'Datos importados', 'El perfil ha sido importado correctamente.');
        console.log('✅ Datos importados correctamente:', playerData);
      } catch (error) {
        console.error('❌ Error importando datos:', error);
        showMessage('error', 'Error de importación', 'El archivo no tiene un formato válido.');
      }
    };
    reader.readAsText(file);
  }

  // Función para crear backup automático
  function createBackup() {
    try {
      const backup = {
        timestamp: Date.now(),
        data: { ...playerData }
      };
      localStorage.setItem('scoutConnectBackup', JSON.stringify(backup));
      console.log('🔄 Backup creado automáticamente');
    } catch (error) {
      console.error('❌ Error creando backup:', error);
    }
  }

  // Función para restaurar desde backup
  function restoreFromBackup() {
    try {
      const backup = localStorage.getItem('scoutConnectBackup');
      if (!backup) {
        showMessage('error', 'Sin backup', 'No hay ningún backup disponible para restaurar.');
        return;
      }
      
      const { timestamp, data } = JSON.parse(backup);
      const backupDate = new Date(timestamp).toLocaleString();
      
      if (confirm(`¿Restaurar backup del ${backupDate}?`)) {
        playerData = { ...data };
        savePlayerDataToStorage();
        loadPlayerData();
        loadVideoFacets();
        calculateProfileCompletion();
        showMessage('success', 'Backup restaurado', 'Tu perfil ha sido restaurado correctamente.');
        console.log('✅ Backup restaurado:', playerData);
      }
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      showMessage('error', 'Error de restauración', 'No se pudo restaurar el backup.');
    }
  }

  // Hacer funciones disponibles globalmente para debugging
  window.exportPlayerData = exportPlayerData;
  window.savePlayerDataToStorage = savePlayerDataToStorage;
  window.loadPlayerDataFromStorage = loadPlayerDataFromStorage;

  // Función para redirigir al login
  function redirectToLogin(message) {
    console.log('🚪 Redirigiendo al login:', message);
    setTimeout(() => {
      alert(message + '. Serás redirigido al login.');
      window.location.href = 'login.html';
    }, 500);
  }

  // Función para actualizar datos del jugador desde la sesión
  function updatePlayerDataFromSession(userData) {
    console.log('🔄 Actualizando datos del jugador desde sesión:', userData);
    
    try {
      if (userData.name) {
        playerData.name = userData.name;
        const nameParts = userData.name.split(' ');
        playerData.firstName = nameParts[0] || 'Usuario';
        playerData.lastName = nameParts.slice(1).join(' ') || '';
        console.log('✅ Nombre actualizado:', playerData.name);
      }
      
      if (userData.email) {
        playerData.email = userData.email;
        console.log('✅ Email actualizado:', playerData.email);
      }
      
      if (userData.userType) {
        console.log('✅ Tipo de usuario:', userData.userType);
      }
      
      console.log('🎯 Datos del jugador actualizados correctamente');
    } catch (error) {
      console.error('❌ Error actualizando datos del jugador:', error);
    }
  }

  function init() {
    loadPlayerDataFromStorage(); // Cargar datos persistentes primero
    loadPlayerData();
    setupEventListeners();
    loadVideoFacets();
    loadNotifications();
    loadMessages();
    loadScouts();
    calculateProfileCompletion();
  }

  function setupEventListeners() {
    // Hamburger menu for mobile
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const userInfo = document.getElementById('userInfo');
    
    if (hamburgerMenu && userInfo) {
      hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        userInfo.classList.toggle('mobile-active');
      });
    }

    // Dropdowns
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(notificationDropdown);
      closeDropdown(userMenuDropdown);
    });

    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(userMenuDropdown);
      closeDropdown(notificationDropdown);
    });

    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', () => {
      closeDropdown(notificationDropdown);
      closeDropdown(userMenuDropdown);
      // Close mobile menu when clicking outside
      if (hamburgerMenu && userInfo) {
        hamburgerMenu.classList.remove('active');
        userInfo.classList.remove('mobile-active');
      }
    });

    // Modales
    editProfileBtn.addEventListener('click', () => openEditProfileModal());
    addMoreVideosBtn.addEventListener('click', () => openAddVideoModal());

    // Cerrar modales
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });

    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModals();
      });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });

    // Marcar notificaciones como leídas
    document.querySelector('.mark-all-read').addEventListener('click', markAllNotificationsRead);
  }

  function loadPlayerData() {
    // Cargar datos básicos del jugador
    document.getElementById('userName').textContent = playerData.name;
    document.getElementById('userAvatar').src = playerData.avatar;
    document.getElementById('profilePhoto').src = playerData.avatar;
    document.getElementById('playerName').textContent = playerData.name;
    document.getElementById('primaryPosition').textContent = playerData.position;
    document.getElementById('secondaryPosition').textContent = playerData.secondaryPosition || '';
    document.getElementById('playerAge').textContent = `${playerData.age} años`;
    document.getElementById('dominantFoot').textContent = playerData.dominantFoot;
    document.getElementById('playerHeight').textContent = `${playerData.height}m`;
    document.getElementById('playerWeight').textContent = `${playerData.weight}kg`;
    document.getElementById('playerLocation').textContent = playerData.location;
    document.getElementById('competitiveLevel').textContent = playerData.level;
    document.getElementById('currentClub').textContent = playerData.club;
    document.getElementById('playerBio').textContent = playerData.bio;
    
    // Cargar atributos físicos
    if (playerData.physicalAttributes) {
      updateAttributeBar('speed', playerData.physicalAttributes.speed);
      updateAttributeBar('strength', playerData.physicalAttributes.strength);
      updateAttributeBar('endurance', playerData.physicalAttributes.endurance);
      updateAttributeBar('agility', playerData.physicalAttributes.agility);
      updateAttributeBar('balance', playerData.physicalAttributes.balance);
    }
    
    // Cargar atributos técnicos
    if (playerData.technicalAttributes) {
      updateAttributeBar('shooting', playerData.technicalAttributes.shooting);
      updateAttributeBar('passing', playerData.technicalAttributes.passing);
      updateAttributeBar('dribbling', playerData.technicalAttributes.dribbling);
      updateAttributeBar('defending', playerData.technicalAttributes.defending);
      updateAttributeBar('goalkeeping', playerData.technicalAttributes.goalkeeping);
    }
    
    // Cargar atributos mentales
    if (playerData.mentalAttributes) {
      updateAttributeBar('vision', playerData.mentalAttributes.vision);
      updateAttributeBar('leadership', playerData.mentalAttributes.leadership);
      updateAttributeBar('determination', playerData.mentalAttributes.determination);
      updateAttributeBar('composure', playerData.mentalAttributes.composure);
      updateAttributeBar('workRate', playerData.mentalAttributes.workRate);
    }
    
    // Cargar información adicional
    if (playerData.additionalInfo) {
      document.getElementById('nationality-display').textContent = playerData.nationality || 'No especificado';
      document.getElementById('formation-display').textContent = playerData.additionalInfo.preferredFormation || 'No especificado';
      document.getElementById('languages-display').textContent = playerData.additionalInfo.languages ? playerData.additionalInfo.languages.join(', ') : 'No especificado';
      document.getElementById('availability-display').textContent = playerData.additionalInfo.availability || 'No especificado';
      document.getElementById('experience-display').textContent = playerData.additionalInfo.experience || 'No especificado';
      document.getElementById('achievements-display').textContent = playerData.additionalInfo.achievements || 'No especificado';
    }
    
    // Contadores
    document.getElementById('profileViews').textContent = `${playerData.profileViews} visualizaciones`;
    document.getElementById('messageCount').textContent = `${playerData.newMessages} nuevos`;
    document.getElementById('notificationBadge').textContent = notifications.filter(n => !n.read).length;
  }

  // Función para actualizar las barras de atributos
  function updateAttributeBar(attributeName, value) {
    const barElement = document.getElementById(`${attributeName}-bar`);
    const valueElement = document.getElementById(`${attributeName}-value`);
    
    if (barElement && valueElement) {
      const percentage = (value / 10) * 100;
      barElement.style.width = `${percentage}%`;
      valueElement.textContent = value;
      
      // Agregar animación
      setTimeout(() => {
        barElement.style.transition = 'width 0.8s ease';
      }, 100);
    }
  }

  function loadVideoFacets() {
    const facets = videoFacetsByPosition[playerData.position] || videoFacetsByPosition['Mediocampista Ofensivo'];
    
    videoFacets.innerHTML = '';
    
    facets.forEach(facet => {
      const isCompleted = playerData.videos[facet.key] && playerData.videos[facet.key].trim() !== '';
      
      const facetElement = document.createElement('div');
      facetElement.className = `video-facet ${isCompleted ? 'completed' : ''}`;
      facetElement.innerHTML = `
        <div class="facet-header">
          <div class="facet-title">${facet.title}</div>
          <div class="facet-status">${isCompleted ? '✅' : '📹'}</div>
        </div>
        <div class="facet-description">${facet.description}</div>
        <div class="video-input-group">
          <input 
            type="url" 
            class="video-url-input" 
            placeholder="Pega el enlace de tu video aquí..."
            value="${playerData.videos[facet.key] || ''}"
            data-facet="${facet.key}"
          >
          <button class="add-video-btn" data-facet="${facet.key}">
            ${isCompleted ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      `;
      
      videoFacets.appendChild(facetElement);
    });

    // Event listeners para los botones de video
    document.querySelectorAll('.add-video-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const facetKey = e.target.dataset.facet;
        const input = document.querySelector(`input[data-facet="${facetKey}"]`);
        const url = input.value.trim();
        
        if (url && isValidVideoUrl(url)) {
          updateVideo(facetKey, url);
        } else {
          showMessage('error', 'URL inválida', 'Por favor, ingresa una URL válida de video.');
        }
      });
    });
    
    // Actualizar barra de progreso de videos
    updateVideoProgress();
  }

  // Función para actualizar la barra de progreso de videos
  function updateVideoProgress() {
    const facets = videoFacetsByPosition[playerData.position] || videoFacetsByPosition['Mediocampista Ofensivo'];
    const totalVideos = facets.length;
    const completedVideos = Object.values(playerData.videos).filter(url => url && url.trim() !== '').length;
    const progressPercentage = Math.round((completedVideos / totalVideos) * 100);
    
    // Actualizar elementos de la UI
    const progressText = document.getElementById('videoProgressText');
    const progressFill = document.getElementById('videoProgressFill');
    
    if (progressText) {
      progressText.textContent = `${completedVideos} de ${totalVideos}`;
    }
    
    if (progressFill) {
      progressFill.style.width = `${progressPercentage}%`;
    }
    
    console.log(`📹 Progreso de videos: ${completedVideos}/${totalVideos} (${progressPercentage}%)`);
  }

  function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    notificationList.innerHTML = '';

    if (notifications.length === 0) {
      notificationList.innerHTML = '<div class="no-notifications">No tienes notificaciones</div>';
      return;
    }

    notifications.forEach(notification => {
      const notificationElement = document.createElement('div');
      notificationElement.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
      notificationElement.innerHTML = `
        <div class="notification-content">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
        </div>
        <div class="notification-time">${notification.time}</div>
      `;
      
      notificationElement.addEventListener('click', () => markNotificationRead(notification.id));
      notificationList.appendChild(notificationElement);
    });
  }

  function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';

    messages.slice(0, 3).forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = 'message-item';
      messageElement.innerHTML = `
        <img src="${message.avatar}" alt="${message.name}" class="item-avatar">
        <div class="item-info">
          <div class="item-name">${message.name} - ${message.club}</div>
          <div class="item-description">${message.message}</div>
        </div>
        <div class="item-time">${message.time}</div>
      `;
      
      messageElement.addEventListener('click', () => openMessage(message.id));
      messagesList.appendChild(messageElement);
    });
  }

  function loadScouts() {
    const scoutsList = document.getElementById('scoutsList');
    scoutsList.innerHTML = '';

    scouts.slice(0, 3).forEach(scout => {
      const scoutElement = document.createElement('div');
      scoutElement.className = 'scout-item';
      scoutElement.innerHTML = `
        <img src="${scout.avatar}" alt="${scout.name}" class="item-avatar">
        <div class="item-info">
          <div class="item-name">${scout.name} - ${scout.club}</div>
          <div class="item-description">${scout.searchType} • ${scout.country}</div>
        </div>
      `;
      
      scoutElement.addEventListener('click', () => viewScoutProfile(scout.id));
      scoutsList.appendChild(scoutElement);
    });
  }

  function calculateProfileCompletion() {
    let completion = 0;
    
    // Campos básicos (50%)
    if (playerData.name && playerData.name.trim() !== '') completion += 5;
    if (playerData.position && playerData.position.trim() !== '') completion += 5;
    if (playerData.age && playerData.age > 0) completion += 5;
    if (playerData.location && playerData.location.trim() !== '') completion += 5;
    if (playerData.bio && playerData.bio.trim() !== '') completion += 5;
    if (playerData.club && playerData.club.trim() !== '') completion += 5;
    if (playerData.level && playerData.level.trim() !== '') completion += 5;
    if (playerData.dominantFoot && playerData.dominantFoot.trim() !== '') completion += 5;
    if (playerData.nationality && playerData.nationality.trim() !== '') completion += 5;
    if (playerData.birthDate && playerData.birthDate.trim() !== '') completion += 5;
    
    // Características físicas (15%)
    if (playerData.height && playerData.height > 0) completion += 5;
    if (playerData.weight && playerData.weight > 0) completion += 5;
    if (playerData.physicalAttributes && Object.values(playerData.physicalAttributes).some(val => val > 5)) completion += 5;
    
    // Habilidades técnicas y mentales (15%)
    if (playerData.technicalAttributes && Object.values(playerData.technicalAttributes).some(val => val > 5)) completion += 5;
    if (playerData.mentalAttributes && Object.values(playerData.mentalAttributes).some(val => val > 5)) completion += 5;
    if (playerData.additionalInfo && playerData.additionalInfo.experience && playerData.additionalInfo.experience.trim() !== '') completion += 5;
    
    // Videos (20%)
    const positionFacets = videoFacetsByPosition[playerData.position] || videoFacetsByPosition['Mediocampista Ofensivo'];
    const totalVideosForPosition = positionFacets.length;
    const completedVideos = Object.values(playerData.videos).filter(url => url && url.trim() !== '').length;
    const videoCompletion = Math.round((completedVideos / Math.min(totalVideosForPosition, 5)) * 20); // Max 5 videos for full completion
    completion += videoCompletion;
    
    // Asegurar que no exceda 100%
    completion = Math.min(completion, 100);
    
    // Actualizar UI
    document.getElementById('completionPercentage').textContent = `${completion}%`;
    document.getElementById('completionFill').style.width = `${completion}%`;
    
    return completion;
  }

  function updateVideo(facetKey, url) {
    playerData.videos[facetKey] = url;
    savePlayerDataToStorage(); // Guardar cambios
    loadVideoFacets(); // Recargar facetas
    updateVideoProgress(); // Actualizar progreso
    calculateProfileCompletion(); // Recalcular completado
    showMessage('success', 'Video actualizado', 'Tu video ha sido guardado correctamente.');
  }

  function isValidVideoUrl(url) {
    const videoPatterns = [
      /youtube\.com\/watch\?v=/,
      /youtu\.be\//,
      /vimeo\.com\//,
      /drive\.google\.com/,
      /dropbox\.com/
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
  }

  function toggleDropdown(dropdown) {
    dropdown.classList.toggle('show');
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove('show');
  }

  function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }

  function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const form = document.getElementById('editProfileForm');
    
    form.innerHTML = `
      <div class="edit-form-tabs">
        <button type="button" class="tab-btn active" data-tab="basic">Información Básica</button>
        <button type="button" class="tab-btn" data-tab="physical">Características Físicas</button>
        <button type="button" class="tab-btn" data-tab="technical">Habilidades Técnicas</button>
        <button type="button" class="tab-btn" data-tab="mental">Atributos Mentales</button>
        <button type="button" class="tab-btn" data-tab="additional">Información Adicional</button>
      </div>

      <!-- Tab 1: Información Básica -->
      <div class="tab-content active" data-tab="basic">
        <div class="form-row">
          <div class="form-group">
            <label for="editFirstName">Nombre</label>
            <input type="text" id="editFirstName" value="${playerData.firstName}" required>
          </div>
          <div class="form-group">
            <label for="editLastName">Apellido</label>
            <input type="text" id="editLastName" value="${playerData.lastName}" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="editAge">Edad</label>
            <input type="number" id="editAge" value="${playerData.age}" min="16" max="45">
          </div>
          <div class="form-group">
            <label for="editBirthDate">Fecha de Nacimiento</label>
            <input type="date" id="editBirthDate" value="${playerData.birthDate}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editPosition">Posición Principal</label>
            <select id="editPosition" required>
              <option value="Portero">Portero</option>
              <option value="Defensa Central">Defensa Central</option>
              <option value="Lateral Derecho">Lateral Derecho</option>
              <option value="Lateral Izquierdo">Lateral Izquierdo</option>
              <option value="Mediocentro Defensivo">Mediocentro Defensivo</option>
              <option value="Mediocentro">Mediocentro</option>
              <option value="Mediocampista Ofensivo">Mediocampista Ofensivo</option>
              <option value="Extremo Derecho">Extremo Derecho</option>
              <option value="Extremo Izquierdo">Extremo Izquierdo</option>
              <option value="Delantero Centro">Delantero Centro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editSecondaryPosition">Posición Secundaria</label>
            <select id="editSecondaryPosition">
              <option value="">Seleccionar...</option>
              <option value="Portero">Portero</option>
              <option value="Defensa Central">Defensa Central</option>
              <option value="Lateral Derecho">Lateral Derecho</option>
              <option value="Lateral Izquierdo">Lateral Izquierdo</option>
              <option value="Mediocentro Defensivo">Mediocentro Defensivo</option>
              <option value="Mediocentro">Mediocentro</option>
              <option value="Mediocampista Ofensivo">Mediocampista Ofensivo</option>
              <option value="Extremo Derecho">Extremo Derecho</option>
              <option value="Extremo Izquierdo">Extremo Izquierdo</option>
              <option value="Delantero Centro">Delantero Centro</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editDominantFoot">Pie Dominante</label>
            <select id="editDominantFoot">
              <option value="Derecho">Derecho</option>
              <option value="Izquierdo">Izquierdo</option>
              <option value="Ambidiestro">Ambidiestro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editNationality">Nacionalidad</label>
            <input type="text" id="editNationality" value="${playerData.nationality}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editLocation">Ubicación</label>
            <input type="text" id="editLocation" value="${playerData.location}" placeholder="Ciudad, País">
          </div>
          <div class="form-group">
            <label for="editLevel">Nivel de Juego</label>
            <select id="editLevel">
              <option value="Amateur">Amateur</option>
              <option value="Semi-profesional">Semi-profesional</option>
              <option value="Profesional">Profesional</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="editClub">Club Actual</label>
          <input type="text" id="editClub" value="${playerData.club}" placeholder="Nombre del club">
        </div>

        <div class="form-group">
          <label for="editBio">Descripción Personal</label>
          <textarea id="editBio" maxlength="500" placeholder="Describe tu estilo de juego, fortalezas y objetivos...">${playerData.bio}</textarea>
        </div>
      </div>

      <!-- Tab 2: Características Físicas -->
      <div class="tab-content" data-tab="physical">
        <div class="form-row">
          <div class="form-group">
            <label for="editHeight">Altura (metros)</label>
            <input type="number" id="editHeight" value="${playerData.height}" step="0.01" min="1.40" max="2.20" placeholder="1.75">
          </div>
          <div class="form-group">
            <label for="editWeight">Peso (kg)</label>
            <input type="number" id="editWeight" value="${playerData.weight}" min="40" max="120" placeholder="70">
          </div>
        </div>

        <h4>Atributos Físicos (1-10)</h4>
        <div class="attributes-grid">
          <div class="attribute-item">
            <label for="editSpeed">Velocidad</label>
            <input type="range" id="editSpeed" min="1" max="10" value="${playerData.physicalAttributes.speed}">
            <span class="attribute-value">${playerData.physicalAttributes.speed}</span>
          </div>
          <div class="attribute-item">
            <label for="editStrength">Fuerza</label>
            <input type="range" id="editStrength" min="1" max="10" value="${playerData.physicalAttributes.strength}">
            <span class="attribute-value">${playerData.physicalAttributes.strength}</span>
          </div>
          <div class="attribute-item">
            <label for="editEndurance">Resistencia</label>
            <input type="range" id="editEndurance" min="1" max="10" value="${playerData.physicalAttributes.endurance}">
            <span class="attribute-value">${playerData.physicalAttributes.endurance}</span>
          </div>
          <div class="attribute-item">
            <label for="editAgility">Agilidad</label>
            <input type="range" id="editAgility" min="1" max="10" value="${playerData.physicalAttributes.agility}">
            <span class="attribute-value">${playerData.physicalAttributes.agility}</span>
          </div>
          <div class="attribute-item">
            <label for="editBalance">Equilibrio</label>
            <input type="range" id="editBalance" min="1" max="10" value="${playerData.physicalAttributes.balance}">
            <span class="attribute-value">${playerData.physicalAttributes.balance}</span>
          </div>
        </div>
      </div>

      <!-- Tab 3: Habilidades Técnicas -->
      <div class="tab-content" data-tab="technical">
        <h4>Habilidades Técnicas (1-10)</h4>
        <div class="attributes-grid">
          <div class="attribute-item">
            <label for="editShooting">Disparo</label>
            <input type="range" id="editShooting" min="1" max="10" value="${playerData.technicalAttributes.shooting}">
            <span class="attribute-value">${playerData.technicalAttributes.shooting}</span>
          </div>
          <div class="attribute-item">
            <label for="editPassing">Pase</label>
            <input type="range" id="editPassing" min="1" max="10" value="${playerData.technicalAttributes.passing}">
            <span class="attribute-value">${playerData.technicalAttributes.passing}</span>
          </div>
          <div class="attribute-item">
            <label for="editDribbling">Regate</label>
            <input type="range" id="editDribbling" min="1" max="10" value="${playerData.technicalAttributes.dribbling}">
            <span class="attribute-value">${playerData.technicalAttributes.dribbling}</span>
          </div>
          <div class="attribute-item">
            <label for="editDefending">Defensa</label>
            <input type="range" id="editDefending" min="1" max="10" value="${playerData.technicalAttributes.defending}">
            <span class="attribute-value">${playerData.technicalAttributes.defending}</span>
          </div>
          <div class="attribute-item">
            <label for="editGoalkeeping">Portería</label>
            <input type="range" id="editGoalkeeping" min="1" max="10" value="${playerData.technicalAttributes.goalkeeping}">
            <span class="attribute-value">${playerData.technicalAttributes.goalkeeping}</span>
          </div>
        </div>
      </div>

      <!-- Tab 4: Atributos Mentales -->
      <div class="tab-content" data-tab="mental">
        <h4>Atributos Mentales (1-10)</h4>
        <div class="attributes-grid">
          <div class="attribute-item">
            <label for="editVision">Visión de Juego</label>
            <input type="range" id="editVision" min="1" max="10" value="${playerData.mentalAttributes.vision}">
            <span class="attribute-value">${playerData.mentalAttributes.vision}</span>
          </div>
          <div class="attribute-item">
            <label for="editLeadership">Liderazgo</label>
            <input type="range" id="editLeadership" min="1" max="10" value="${playerData.mentalAttributes.leadership}">
            <span class="attribute-value">${playerData.mentalAttributes.leadership}</span>
          </div>
          <div class="attribute-item">
            <label for="editDetermination">Determinación</label>
            <input type="range" id="editDetermination" min="1" max="10" value="${playerData.mentalAttributes.determination}">
            <span class="attribute-value">${playerData.mentalAttributes.determination}</span>
          </div>
          <div class="attribute-item">
            <label for="editComposure">Concentración</label>
            <input type="range" id="editComposure" min="1" max="10" value="${playerData.mentalAttributes.composure}">
            <span class="attribute-value">${playerData.mentalAttributes.composure}</span>
          </div>
          <div class="attribute-item">
            <label for="editWorkRate">Entrega</label>
            <input type="range" id="editWorkRate" min="1" max="10" value="${playerData.mentalAttributes.workRate}">
            <span class="attribute-value">${playerData.mentalAttributes.workRate}</span>
          </div>
        </div>
      </div>

      <!-- Tab 5: Información Adicional -->
      <div class="tab-content" data-tab="additional">
        <div class="form-group">
          <label for="editPreferredFormation">Formación Preferida</label>
          <select id="editPreferredFormation">
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
            <option value="3-5-2">3-5-2</option>
            <option value="4-5-1">4-5-1</option>
            <option value="5-3-2">5-3-2</option>
          </select>
        </div>

        <div class="form-group">
          <label for="editLanguages">Idiomas</label>
          <input type="text" id="editLanguages" value="${playerData.additionalInfo.languages.join(', ')}" placeholder="Español, Inglés, Portugués...">
        </div>

        <div class="form-group">
          <label for="editExperience">Experiencia</label>
          <textarea id="editExperience" placeholder="Describe tu experiencia futbolística...">${playerData.additionalInfo.experience}</textarea>
        </div>

        <div class="form-group">
          <label for="editAchievements">Logros y Reconocimientos</label>
          <textarea id="editAchievements" placeholder="Títulos, premios, reconocimientos...">${playerData.additionalInfo.achievements}</textarea>
        </div>

        <div class="form-group">
          <label for="editInjuries">Historial de Lesiones</label>
          <textarea id="editInjuries" placeholder="Describe cualquier lesión significativa o escribe 'Ninguna'">${playerData.additionalInfo.injuries}</textarea>
        </div>

        <div class="form-group">
          <label for="editAvailability">Disponibilidad</label>
          <select id="editAvailability">
            <option value="Disponible inmediatamente">Disponible inmediatamente</option>
            <option value="Disponible en 1 mes">Disponible en 1 mes</option>
            <option value="Disponible en 3 meses">Disponible en 3 meses</option>
            <option value="Disponible al final de temporada">Disponible al final de temporada</option>
            <option value="No disponible actualmente">No disponible actualmente</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModals()">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar todos los cambios</button>
      </div>
    `;
    
    // Set selected values
    document.getElementById('editPosition').value = playerData.position;
    document.getElementById('editSecondaryPosition').value = playerData.secondaryPosition || '';
    document.getElementById('editDominantFoot').value = playerData.dominantFoot;
    document.getElementById('editLevel').value = playerData.level;
    document.getElementById('editPreferredFormation').value = playerData.additionalInfo.preferredFormation;
    document.getElementById('editAvailability').value = playerData.additionalInfo.availability;
    
    // Setup tab functionality
    setupTabFunctionality();
    
    // Setup range input updates
    setupRangeInputs();
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfileChanges();
    });
    
    modal.classList.add('show');
  }

  // Función para configurar la funcionalidad de tabs
  function setupTabFunctionality() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Remove active class from all tabs and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        document.querySelector(`[data-tab="${targetTab}"].tab-content`).classList.add('active');
      });
    });
  }

  // Función para configurar los inputs de rango
  function setupRangeInputs() {
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    
    rangeInputs.forEach(input => {
      const updateValue = () => {
        const valueSpan = input.nextElementSibling;
        if (valueSpan && valueSpan.classList.contains('attribute-value')) {
          valueSpan.textContent = input.value;
        }
      };
      
      input.addEventListener('input', updateValue);
      updateValue(); // Set initial value
    });
  }

  function openAddVideoModal() {
    const modal = document.getElementById('addVideoModal');
    const categorySelect = document.getElementById('videoCategory');
    const facets = videoFacetsByPosition[playerData.position] || videoFacetsByPosition['Mediocampista Ofensivo'];
    
    categorySelect.innerHTML = '';
    facets.forEach(facet => {
      const option = document.createElement('option');
      option.value = facet.key;
      option.textContent = facet.title;
      categorySelect.appendChild(option);
    });
    
    modal.classList.add('show');
  }

  function saveProfileChanges() {
    // Información básica
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const age = parseInt(document.getElementById('editAge').value);
    const birthDate = document.getElementById('editBirthDate').value;
    const position = document.getElementById('editPosition').value;
    const secondaryPosition = document.getElementById('editSecondaryPosition').value;
    const dominantFoot = document.getElementById('editDominantFoot').value;
    const nationality = document.getElementById('editNationality').value;
    const location = document.getElementById('editLocation').value;
    const level = document.getElementById('editLevel').value;
    const club = document.getElementById('editClub').value;
    const bio = document.getElementById('editBio').value;
    
    // Características físicas
    const height = document.getElementById('editHeight').value;
    const weight = document.getElementById('editWeight').value;
    
    // Atributos físicos
    const physicalAttributes = {
      speed: parseInt(document.getElementById('editSpeed').value),
      strength: parseInt(document.getElementById('editStrength').value),
      endurance: parseInt(document.getElementById('editEndurance').value),
      agility: parseInt(document.getElementById('editAgility').value),
      balance: parseInt(document.getElementById('editBalance').value)
    };
    
    // Atributos técnicos
    const technicalAttributes = {
      shooting: parseInt(document.getElementById('editShooting').value),
      passing: parseInt(document.getElementById('editPassing').value),
      dribbling: parseInt(document.getElementById('editDribbling').value),
      defending: parseInt(document.getElementById('editDefending').value),
      goalkeeping: parseInt(document.getElementById('editGoalkeeping').value)
    };
    
    // Atributos mentales
    const mentalAttributes = {
      vision: parseInt(document.getElementById('editVision').value),
      leadership: parseInt(document.getElementById('editLeadership').value),
      determination: parseInt(document.getElementById('editDetermination').value),
      composure: parseInt(document.getElementById('editComposure').value),
      workRate: parseInt(document.getElementById('editWorkRate').value)
    };
    
    // Información adicional
    const preferredFormation = document.getElementById('editPreferredFormation').value;
    const languages = document.getElementById('editLanguages').value.split(',').map(lang => lang.trim()).filter(lang => lang);
    const experience = document.getElementById('editExperience').value;
    const achievements = document.getElementById('editAchievements').value;
    const injuries = document.getElementById('editInjuries').value;
    const availability = document.getElementById('editAvailability').value;
    
    // Actualizar todos los datos del jugador
    playerData.firstName = firstName;
    playerData.lastName = lastName;
    playerData.name = `${firstName} ${lastName}`;
    playerData.age = age;
    playerData.birthDate = birthDate;
    playerData.position = position;
    playerData.secondaryPosition = secondaryPosition;
    playerData.dominantFoot = dominantFoot;
    playerData.nationality = nationality;
    playerData.height = height;
    playerData.weight = weight;
    playerData.location = location;
    playerData.level = level;
    playerData.club = club;
    playerData.bio = bio;
    
    // Actualizar atributos
    playerData.physicalAttributes = physicalAttributes;
    playerData.technicalAttributes = technicalAttributes;
    playerData.mentalAttributes = mentalAttributes;
    
    // Actualizar información adicional
    playerData.additionalInfo.preferredFormation = preferredFormation;
    playerData.additionalInfo.languages = languages;
    playerData.additionalInfo.experience = experience;
    playerData.additionalInfo.achievements = achievements;
    playerData.additionalInfo.injuries = injuries;
    playerData.additionalInfo.availability = availability;
    
    // Guardar en localStorage
    savePlayerDataToStorage();
    
    // Recargar UI
    loadPlayerData();
    loadVideoFacets();
    updateVideoProgress();
    calculateProfileCompletion();
    
    closeModals();
    showMessage('success', 'Perfil actualizado', 'Todos tus cambios han sido guardados correctamente.');
  }

  function markNotificationRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      loadNotifications();
      document.getElementById('notificationBadge').textContent = notifications.filter(n => !n.read).length;
    }
  }

  function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    loadNotifications();
    document.getElementById('notificationBadge').textContent = '0';
  }

  function openMessage(messageId) {
    // Aquí irías a la vista de mensaje completo
    showMessage('info', 'Mensaje', 'Redirigiendo a la conversación...');
  }

  function viewScoutProfile(scoutId) {
    // Aquí irías al perfil del scout
    showMessage('info', 'Perfil del Scout', 'Redirigiendo al perfil del scout...');
  }

  function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      // Limpiar toda la sesión
      clearSession();
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
      
      // Redirigir al login
      window.location.href = 'login.html';
    }
  }

  function showMessage(type, title, text) {
    // Crear modal de mensaje simple
    const messageModal = document.createElement('div');
    messageModal.className = 'modal show';
    messageModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>${text}</p>
          <div class="form-actions">
            <button class="btn btn-primary">Entendido</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(messageModal);
    
    // Event listeners
    messageModal.querySelector('.modal-close').addEventListener('click', () => {
      document.body.removeChild(messageModal);
    });
    
    messageModal.querySelector('.btn').addEventListener('click', () => {
      document.body.removeChild(messageModal);
    });
    
    messageModal.addEventListener('click', (e) => {
      if (e.target === messageModal) {
        document.body.removeChild(messageModal);
      }
    });
  }

  // Auto-save videos al cambiar input
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('video-url-input')) {
      const facetKey = e.target.dataset.facet;
      const url = e.target.value.trim();
      
      // Actualizar datos inmediatamente
      playerData.videos[facetKey] = url;
      
      // Guardar en localStorage con debounce
      clearTimeout(window.videoSaveTimeout);
      window.videoSaveTimeout = setTimeout(() => {
        savePlayerDataToStorage();
        console.log('💾 Video auto-guardado:', facetKey, url);
        
        // Actualizar UI después de un segundo
        setTimeout(() => {
          calculateProfileCompletion();
          loadVideoFacets();
        }, 1000);
      }, 500); // Guardar después de 500ms sin cambios
    }
  });

  console.log('🏆 Dashboard del futbolista inicializado correctamente');
  console.log('💡 Para debugging: ejecuta debugStorage() en la consola para ver el estado completo');
  console.log('🔧 Funciones disponibles: clearAllStorageData(), debugStorage(), exportPlayerData(), restoreFromBackup()');
  
  // Mostrar estadísticas iniciales
  setTimeout(() => {
    const stats = debugStorage();
    if (stats.mainData) {
      console.log(`📈 Perfil de ${stats.mainData.name} cargado (${stats.saveCount} guardados realizados)`);
    }
  }, 1000);
});