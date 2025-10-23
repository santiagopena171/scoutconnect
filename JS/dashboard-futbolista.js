// ===== JAVASCRIPT PARA EL DASHBOARD DEL FUTBOLISTA =====

document.addEventListener('DOMContentLoaded', function() {
  // Verificar si se está accediendo directamente al dashboard (para desarrollo)
  const urlParams = new URLSearchParams(window.location.search);
  const directAccess = urlParams.get('direct') === 'true';
  
  console.log('🚀 Iniciando dashboard del futbolista...');
  console.log('🔧 Acceso directo:', directAccess);
  
  // Nota: checkSession() ya no actualiza playerData directamente
  // Los datos se cargarán en init() -> loadPlayerDataFromStorage()
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
      // PASO 1: Cargar primero los datos del usuario registrado (nombre, apellido, etc.)
      const sessionUser = localStorage.getItem('scoutConnectUser');
      if (sessionUser) {
        try {
          const userData = JSON.parse(sessionUser);
          console.log('👤 Cargando datos del usuario registrado:', userData);
          updatePlayerDataFromSession(userData);
        } catch (error) {
          console.error('❌ Error parseando datos del usuario:', error);
        }
      } else {
        console.log('⚠️ No hay datos de usuario registrado en scoutConnectUser');
      }
      
      // PASO 2: Luego cargar/fusionar con datos del perfil guardados
      const savedPlayerData = localStorage.getItem('scoutConnectPlayerData');
      if (savedPlayerData) {
        const parsedData = JSON.parse(savedPlayerData);
        // Combinar datos, PERO sin sobrescribir nombre, apellido, birthDate que vienen del registro
        const { firstName, lastName, name, birthDate, age, nationality, second_nationality, ...editableData } = parsedData;
        playerData = { ...playerData, ...editableData };
        console.log('✅ Datos del perfil fusionados desde scoutConnectPlayerData');
      } else {
        console.log('ℹ️ No hay datos del perfil guardados, usando estructura por defecto');
        // Guardar datos por defecto por primera vez
        savePlayerDataToStorage();
      }
      
      console.log('🎯 Datos finales del jugador:', playerData);
    } catch (error) {
      console.error('❌ Error cargando datos del jugador:', error);
      console.log('🔄 Usando datos por defecto');
    }
  }

  // Guardar datos del jugador en localStorage
  async function savePlayerDataToStorage() {
    console.log('💾 Guardando datos del jugador...');
    
    try {
      updateSaveStatus('saving');
      
      // Crear backup automático cada 5 guardados
      const saveCount = parseInt(localStorage.getItem('scoutConnectSaveCount') || '0') + 1;
      if (saveCount % 5 === 0) {
        createBackup();
      }
      localStorage.setItem('scoutConnectSaveCount', saveCount.toString());
      
      // Guardar en localStorage (fallback)
      localStorage.setItem('scoutConnectPlayerData', JSON.stringify(playerData));
      console.log('✅ Datos guardados en localStorage');
      
      // Guardar en Supabase si está disponible
      if (typeof supabase !== 'undefined') {
        await saveToSupabase();
      } else {
        console.warn('⚠️ Supabase no disponible, solo se guardó en localStorage');
      }
      
      updateSaveStatus('saved');
      return true;
    } catch (error) {
      console.error('❌ Error guardando datos del jugador:', error);
      updateSaveStatus('error');
      return false;
    }
  }

  // Función para guardar datos en Supabase
  async function saveToSupabase() {
    try {
      console.log('☁️ Guardando en Supabase...');
      
      // Obtener el usuario actual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.warn('⚠️ No hay usuario autenticado en Supabase');
        return false;
      }
      
      // Preparar datos para actualizar en profiles
      const profileUpdate = {
        position: playerData.position || null,
        secondary_position: playerData.secondaryPosition || null,
        preferred_foot: playerData.dominantFoot || null,
        height: playerData.height ? parseFloat(playerData.height) : null,
        weight: playerData.weight ? parseFloat(playerData.weight) : null,
        current_club: playerData.club || null,
        league: playerData.level || null,
        bio: playerData.bio || null,
        updated_at: new Date().toISOString()
      };
      
      // Actualizar perfil en Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
      
      if (updateError) {
        console.error('❌ Error actualizando Supabase:', updateError);
        return false;
      }
      
      console.log('✅ Datos guardados en Supabase correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error en saveToSupabase:', error);
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

    // Solo verificar que los datos existen, NO actualizarlos aquí
    // Los datos se cargarán en loadPlayerDataFromStorage()
    try {
      const userData = JSON.parse(sessionUser);
      console.log('✅ Datos de usuario validados:', userData.name || userData.email);
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
      // Usar first_name y last_name si están disponibles, si no usar name
      if (userData.first_name && userData.last_name) {
        playerData.firstName = userData.first_name;
        playerData.lastName = userData.last_name;
        playerData.name = `${userData.first_name} ${userData.last_name}`;
        console.log('✅ Nombre actualizado desde first_name/last_name:', playerData.name);
      } else if (userData.name) {
        playerData.name = userData.name;
        const nameParts = userData.name.split(' ');
        playerData.firstName = nameParts[0] || 'Usuario';
        playerData.lastName = nameParts.slice(1).join(' ') || '';
        console.log('✅ Nombre actualizado desde name:', playerData.name);
      }
      
      if (userData.email) {
        playerData.email = userData.email;
        console.log('✅ Email actualizado:', playerData.email);
      }
      
      if (userData.nationality) {
        playerData.nationality = userData.nationality;
        console.log('✅ Nacionalidad actualizada:', playerData.nationality);
      }
      
      if (userData.second_nationality) {
        playerData.second_nationality = userData.second_nationality;
        console.log('✅ Segunda nacionalidad actualizada:', playerData.second_nationality);
      }
      
      if (userData.birth_date) {
        playerData.birthDate = userData.birth_date;
        // Calcular edad automáticamente
        playerData.age = calculateAge(userData.birth_date);
        console.log('✅ Fecha de nacimiento actualizada:', playerData.birthDate, '- Edad:', playerData.age);
      }
      
      if (userData.userType) {
        console.log('✅ Tipo de usuario:', userData.userType);
      }
      
      console.log('🎯 Datos del jugador actualizados correctamente');
    } catch (error) {
      console.error('❌ Error actualizando datos del jugador:', error);
    }
  }

  // Función para calcular edad desde fecha de nacimiento
  function calculateAge(birthDate) {
    if (!birthDate) return playerData.age || 22; // Valor por defecto
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Ajustar si aún no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  function init() {
    loadPlayerDataFromStorage(); // Cargar datos persistentes primero
    loadPlayerData();
    setupEventListeners();
    loadVideoFacets();
    loadNotifications();
    loadMessages();
    loadScouts();
    loadPlayerReports(); // Cargar reportes de scouting
    calculateProfileCompletion();
    
    // Debug chat
    console.log('💬 Inicializando chat...');
    console.log('📊 Conversaciones disponibles:', conversations.length);
    
    updateChatBadge(); // Inicializar badge del chat
    setupChatInput(); // Configurar input del chat
  }

  function setupEventListeners() {
    // Hamburger menu for mobile
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const userInfo = document.getElementById('userInfo');
    const navbarMenu = document.querySelector('.navbar-menu');
    const closeMobileMenu = () => {
      if (hamburgerMenu) {
        hamburgerMenu.classList.remove('active');
      }
      if (userInfo) {
        userInfo.classList.remove('mobile-active');
      }
      if (navbarMenu) {
        navbarMenu.classList.remove('mobile-active');
          navbarMenu.classList.remove('mobile-full');
      }
    };
    
    if (hamburgerMenu && userInfo) {
      hamburgerMenu.addEventListener('click', (event) => {
        event.stopPropagation();
        hamburgerMenu.classList.toggle('active');
        userInfo.classList.toggle('mobile-active');
        if (navbarMenu) {
          // toggle both the legacy mobile-active and the new mobile-panel variant
          navbarMenu.classList.toggle('mobile-active');
            navbarMenu.classList.toggle('mobile-full');
        }
      });
      userInfo.addEventListener('click', (event) => event.stopPropagation());
      if (navbarMenu) {
        navbarMenu.addEventListener('click', (event) => event.stopPropagation());
      }
    }

    // Navegación suave a la sección de videos
    const navVideosLink = document.getElementById('navVideosLink');
    if (navVideosLink) {
      navVideosLink.addEventListener('click', (e) => {
        e.preventDefault();
        const videosSection = document.getElementById('videos-section');
        if (videosSection) {
          videosSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          // Actualizar el estado activo de los links
          document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
          });
          navVideosLink.classList.add('active');
        }
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
      closeMobileMenu();
    });

    if (navbarMenu) {
      navbarMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });
    }

    // Mobile logout button inside navbar (close menu after clicking)
    const mobileLogout = document.getElementById('mobileLogout');
    if (mobileLogout) {
      mobileLogout.addEventListener('click', (e) => {
        e.preventDefault();
        // forward to existing logout function (which asks confirmation)
        logout();
        closeMobileMenu();
      });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
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

    // Cambio de foto de perfil
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profilePhoto = document.getElementById('profilePhoto');
    const userAvatar = document.getElementById('userAvatar');

    if (changePhotoBtn && profilePhotoInput) {
      changePhotoBtn.addEventListener('click', () => {
        profilePhotoInput.click();
      });

      profilePhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          handleProfilePhotoChange(file);
        }
      });
    }

    // Chat functionality
    const chatBtn = document.getElementById('chatBtn');
    const chatModal = document.getElementById('chatModal');
    const closeChatModal = document.getElementById('closeChatModal');

    if (chatBtn && chatModal) {
      console.log('✅ Elementos de chat encontrados, configurando event listeners...');
      chatBtn.addEventListener('click', () => {
        console.log('🖱️ Click en botón de chat detectado');
        openChatModal();
      });

      closeChatModal.addEventListener('click', () => {
        chatModal.classList.remove('show');
      });

      chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
          chatModal.classList.remove('show');
        }
      });
    } else {
      console.error('❌ No se encontraron elementos de chat:', {
        chatBtn: !!chatBtn,
        chatModal: !!chatModal,
        closeChatModal: !!closeChatModal
      });
    }
  }

  function loadPlayerData() {
    // Recalcular edad desde la fecha de nacimiento antes de cargar
    if (playerData.birthDate) {
      playerData.age = calculateAge(playerData.birthDate);
    }
    
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
    
    // NOTA: Sección de atributos eliminada del dashboard
    // Los atributos físicos, técnicos y mentales ya no se muestran en el dashboard principal
    // pero se mantienen en la estructura de datos para el modal de edición y futuras funcionalidades
    
    /* COMENTADO - Ya no existe esta sección en el HTML
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
    */
    
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

  // Función para manejar el cambio de foto de perfil
  function handleProfilePhotoChange(file) {
    // Validar el archivo
    if (!file.type.startsWith('image/')) {
      showNotification('Por favor selecciona un archivo de imagen válido.', 'error');
      return;
    }

    // Validar el tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('El archivo es demasiado grande. Máximo 5MB.', 'error');
      return;
    }

    // Crear URL temporal para previsualización
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageUrl = e.target.result;
      
      // Mostrar modal de previsualización
      showPhotoPreviewModal(imageUrl, file);
    };

    reader.onerror = function() {
      showNotification('Error al cargar la imagen. Intenta nuevamente.', 'error');
    };

    // Leer el archivo como data URL
    reader.readAsDataURL(file);
  }

  // Función para mostrar el modal de previsualización
  function showPhotoPreviewModal(imageUrl, file) {
    const modal = document.getElementById('photoPreviewModal');
    const preview = document.getElementById('photoPreview');
    const fileName = document.getElementById('photoFileName');
    const fileSize = document.getElementById('photoFileSize');
    const confirmBtn = document.getElementById('confirmPhotoChange');
    const cancelBtn = document.getElementById('cancelPhotoChange');
    const closeBtn = document.getElementById('closePhotoModal');

    // Configurar previsualización
    preview.src = imageUrl;
    fileName.textContent = `📁 ${file.name}`;
    fileSize.textContent = `📊 ${(file.size / 1024).toFixed(2)} KB • ${file.type}`;

    // Mostrar modal
    modal.classList.add('show');

    // Event listeners para el modal
    const confirmChange = () => {
      // Actualizar todas las instancias de la foto de perfil
      const profilePhoto = document.getElementById('profilePhoto');
      const userAvatar = document.getElementById('userAvatar');
      
      if (profilePhoto) {
        profilePhoto.src = imageUrl;
      }
      if (userAvatar) {
        userAvatar.src = imageUrl;
      }

      // Actualizar el objeto playerData
      playerData.avatar = imageUrl;
      
      // Guardar en localStorage para persistencia
      savePlayerDataToStorage();
      
      // Cerrar modal y mostrar éxito
      closePhotoModal();
      showNotification('✅ Foto de perfil actualizada correctamente', 'success');
      
      console.log('✅ Foto de perfil cambiada:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type
      });
    };

    const closePhotoModal = () => {
      modal.classList.remove('show');
      // Limpiar event listeners
      confirmBtn.removeEventListener('click', confirmChange);
      cancelBtn.removeEventListener('click', closePhotoModal);
      closeBtn.removeEventListener('click', closePhotoModal);
      
      // Reset file input
      document.getElementById('profilePhotoInput').value = '';
    };

    // Configurar event listeners
    confirmBtn.addEventListener('click', confirmChange);
    cancelBtn.addEventListener('click', closePhotoModal);
    closeBtn.addEventListener('click', closePhotoModal);

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closePhotoModal();
      }
    });
  }

  // Función para mostrar notificaciones temporales
  function showNotification(message, type = 'info') {
    // Colores según el tipo
    const colors = {
      success: '#00A859',
      error: '#E74C3C',
      warning: '#F39C12',
      info: '#3498DB'
    };
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
      position: fixed;
      top: 90px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar después de 4 segundos (más tiempo para leer)
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 4000);
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

  // ===== FUNCIONES PARA MANEJAR REPORTES =====

  function loadPlayerReports() {
    try {
      const allReports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
      
      // Filtrar reportes que corresponden a este futbolista
      const playerReports = allReports.filter(report => {
        // Comparar por nombre del jugador ya que usamos datos mock
        return report.playerName === playerData.name || 
               report.playerId === playerData.id ||
               report.playerId === playerData.id.toString();
      });

      console.log('📊 Reportes encontrados para', playerData.name + ':', playerReports.length);
      
      updateReportsStats(playerReports);
      renderReports(playerReports);
      
    } catch (error) {
      console.error('❌ Error al cargar reportes:', error);
      showEmptyReportsState();
    }
  }

  function updateReportsStats(reports) {
    const totalCount = reports.length;
    const avgRating = totalCount > 0 ? 
      (reports.reduce((sum, r) => sum + (r.overallRating || 0), 0) / totalCount).toFixed(1) : '-';
    const lastDate = totalCount > 0 ? 
      new Date(Math.max(...reports.map(r => new Date(r.date)))).toLocaleDateString('es-ES') : '-';

    document.getElementById('totalReportsCount').textContent = totalCount;
    document.getElementById('averageRating').textContent = avgRating !== '-' ? avgRating + '/10' : '-';
    document.getElementById('lastReportDate').textContent = lastDate;
  }

  function renderReports(reports) {
    const container = document.getElementById('reportsContainer');
    const emptyState = document.getElementById('emptyReportsState');
    const actions = document.getElementById('reportsActions');
    
    if (reports.length === 0) {
      showEmptyReportsState();
      return;
    }

    emptyState.style.display = 'none';
    container.style.display = 'grid';
    actions.style.display = 'flex';

    // Mostrar los últimos 3 reportes
    const recentReports = reports.slice(-3).reverse();
    
    container.innerHTML = recentReports.map(report => createReportCard(report)).join('');
  }

  function createReportCard(report) {
    const ratings = [
      { label: 'Técnico', value: report.technicalRating || 0 },
      { label: 'Físico', value: report.physicalRating || 0 },
      { label: 'Mental', value: report.mentalRating || 0 },
      { label: 'Táctico', value: report.tacticalRating || 0 }
    ];

    return `
      <div class="report-card" onclick="viewReportDetails('${report.id}')">
        <div class="report-header">
          <div>
            <h4 class="report-title">${report.title || 'Reporte de Scouting'}</h4>
          </div>
          <div class="report-meta">
            <span class="report-date">${new Date(report.date).toLocaleDateString('es-ES')}</span>
            <span class="report-scout">por ${report.scoutName}</span>
          </div>
        </div>
        
        <div class="report-ratings">
          ${ratings.map(rating => `
            <div class="rating-item">
              <span class="rating-label">${rating.label}</span>
              <div class="rating-value">
                ${rating.value}/10
                <div class="rating-bar">
                  <div class="rating-fill" style="width: ${(rating.value / 10) * 100}%"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="report-summary">
          ${report.summary || 'Evaluación completa del rendimiento del jugador en diferentes aspectos técnicos, físicos, mentales y tácticos.'}
        </div>

        <div class="report-actions">
          <button class="report-btn secondary" onclick="event.stopPropagation(); shareReport('${report.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16,6 12,2 8,6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Compartir
          </button>
          <button class="report-btn primary" onclick="event.stopPropagation(); viewReportDetails('${report.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Ver Detalles
          </button>
        </div>
      </div>
    `;
  }

  function showEmptyReportsState() {
    document.getElementById('reportsContainer').style.display = 'none';
    document.getElementById('emptyReportsState').style.display = 'block';
    document.getElementById('reportsActions').style.display = 'none';
  }

  function viewReportDetails(reportId) {
    // Redirigir a la página dedicada de visualización de reporte
    window.location.href = `ver-reporte.html?id=${reportId}`;
  }

  function showReportModal(report) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content report-modal">
        <div class="modal-header">
          <h3>${report.title || 'Reporte de Scouting'}</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="report-details-grid">
            <div class="detail-item">
              <div class="detail-label">Fecha de Evaluación</div>
              <div class="detail-value">${new Date(report.date).toLocaleDateString('es-ES')}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Scout Evaluador</div>
              <div class="detail-value">${report.scoutName}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Rating General</div>
              <div class="detail-value">${report.overallRating || 0}/10</div>
            </div>
          </div>
          
          <div class="ratings-breakdown">
            <h4>Evaluaciones Detalladas</h4>
            
            <div class="rating-category">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4"></path>
                  <path d="M15 11h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4"></path>
                  <path d="M11 5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V5z"></path>
                </svg>
                Aspectos Técnicos (${report.technicalRating || 0}/10)
              </h5>
              <div class="skills-grid">
                ${report.technicalEvals ? Object.entries(report.technicalEvals).map(([skill, rating]) => 
                  `<div class="skill-item"><span>${skill}</span><span>${rating}/10</span></div>`
                ).join('') : '<p>No hay evaluaciones técnicas registradas</p>'}
              </div>
            </div>
            
            <div class="rating-category">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13.5 3H12h1.5zM13.5 3L14.46 2.04a1.5 1.5 0 0 1 2.12 0l1.04 1.04a1.5 1.5 0 0 1 0 2.12L16.5 6.5 13.5 3z"></path>
                  <path d="M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m1.5-5.5L21 3"></path>
                </svg>
                Aspectos Físicos (${report.physicalRating || 0}/10)
              </h5>
              <div class="skills-grid">
                ${report.physicalEvals ? Object.entries(report.physicalEvals).map(([skill, rating]) => 
                  `<div class="skill-item"><span>${skill}</span><span>${rating}/10</span></div>`
                ).join('') : '<p>No hay evaluaciones físicas registradas</p>'}
              </div>
            </div>
            
            <div class="rating-category">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                </svg>
                Aspectos Mentales (${report.mentalRating || 0}/10)
              </h5>
              <div class="skills-grid">
                ${report.mentalEvals ? Object.entries(report.mentalEvals).map(([skill, rating]) => 
                  `<div class="skill-item"><span>${skill}</span><span>${rating}/10</span></div>`
                ).join('') : '<p>No hay evaluaciones mentales registradas</p>'}
              </div>
            </div>

            <div class="rating-category">
              <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="7.5,4.21 12,6.81 16.5,4.21"></polyline>
                  <polyline points="7.5,19.79 7.5,14.6 3,12"></polyline>
                  <polyline points="16.5,19.79 16.5,14.6 21,12"></polyline>
                </svg>
                Aspectos Tácticos (${report.tacticalRating || 0}/10)
              </h5>
              <div class="skills-grid">
                ${report.tacticalEvals ? Object.entries(report.tacticalEvals).map(([skill, rating]) => 
                  `<div class="skill-item"><span>${skill}</span><span>${rating}/10</span></div>`
                ).join('') : '<p>No hay evaluaciones tácticas registradas</p>'}
              </div>
            </div>
          </div>

          ${report.summary ? `
            <div class="report-summary-full">
              <h4>Resumen del Scout</h4>
              <p>${report.summary}</p>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
            Cerrar
          </button>
          <button class="btn btn-primary" onclick="shareReport('${report.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16,6 12,2 8,6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            Compartir Reporte
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  function shareReport(reportId) {
    // Función para compartir reporte (implementar según necesidades)
    const shareUrl = `${window.location.origin}/reporte.html?id=${reportId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Reporte de Scouting',
        text: 'Mira mi reporte de scouting en ScoutConnect',
        url: shareUrl
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('success', 'Enlace copiado al portapapeles');
      });
    }
  }

  function refreshPlayerReports() {
    console.log('🔄 Actualizando reportes...');
    loadPlayerReports();
    showNotification('success', 'Reportes actualizados');
  }

  // Event listeners para reportes
  document.getElementById('refreshReportsBtn')?.addEventListener('click', refreshPlayerReports);
  document.getElementById('viewAllReportsBtn')?.addEventListener('click', () => {
    // Redirigir a página de todos los reportes o mostrar modal expandido
    console.log('📄 Ver todos los reportes');
  });

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
            <input type="text" id="editFirstName" value="${playerData.firstName}" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
            <small class="text-muted">El nombre no puede ser modificado</small>
          </div>
          <div class="form-group">
            <label for="editLastName">Apellido</label>
            <input type="text" id="editLastName" value="${playerData.lastName}" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
            <small class="text-muted">El apellido no puede ser modificado</small>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="editAge">Edad</label>
            <input type="number" id="editAge" value="${playerData.age}" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
            <small class="text-muted">Se calcula automáticamente desde la fecha de nacimiento</small>
          </div>
          <div class="form-group">
            <label for="editBirthDate">Fecha de Nacimiento</label>
            <input type="date" id="editBirthDate" value="${playerData.birthDate}" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
            <small class="text-muted">La fecha de nacimiento no puede ser modificada</small>
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
            <input type="text" id="editNationality" value="${playerData.nationality}" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
            <small class="text-muted">La nacionalidad no puede ser modificada</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editSecondNationality">Segunda Nacionalidad</label>
            <input type="text" id="editSecondNationality" value="${playerData.second_nationality || 'Sin segunda nacionalidad'}" readonly style="background-color: #f5f5f5; cursor: not-allowed;">
            <small class="text-muted">La segunda nacionalidad no puede ser modificada</small>
          </div>
          <div class="form-group">
            <label for="editLocation">Ubicación</label>
            <input type="text" id="editLocation" value="${playerData.location}" placeholder="Ciudad, País">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editLevel">Nivel de Juego</label>
            <select id="editLevel">
              <option value="Amateur">Amateur</option>
              <option value="Semi-profesional">Semi-profesional</option>
              <option value="Profesional">Profesional</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
          <div class="form-group">
            <!-- Espacio vacío para mantener el layout -->
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
    // NOTA: firstName, lastName, birthDate y age NO se modifican (son readonly)
    // Estos datos vienen del registro y no se pueden cambiar
    
    const position = document.getElementById('editPosition').value;
    const secondaryPosition = document.getElementById('editSecondaryPosition').value;
    const dominantFoot = document.getElementById('editDominantFoot').value;
    // nationality y secondNationality son readonly, no se leen ni se guardan
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
    
    // Actualizar solo los datos modificables
    // firstName, lastName, name, age y birthDate NO se modifican (vienen del registro)
    playerData.position = position;
    playerData.secondaryPosition = secondaryPosition;
    playerData.dominantFoot = dominantFoot;
    // nationality y second_nationality NO se actualizan (readonly)
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

  // ===== FUNCIONES DE CHAT =====
  
  // Datos de conversaciones (simulado - en producción vendría de API)
  let conversations = [
    {
      id: 1,
      user: {
        name: 'Carlos Mendoza',
        role: 'Scout - FC Barcelona',
        avatar: 'imagenes/imagen2.png',
        status: 'En línea'
      },
      lastMessage: '¿Podrías enviarme un video de tus mejores jugadas de los últimos 6 meses?',
      time: 'Ahora',
      unread: 3,
      messages: [
        {
          id: 1,
          sender: 'scout',
          content: 'Hola Santiago, he visto tu perfil y me ha llamado mucho la atención tu técnica.',
          time: '10:30 AM',
          timestamp: new Date('2024-10-16 10:30:00')
        },
        {
          id: 2,
          sender: 'player',
          content: '¡Hola Carlos! Muchas gracias por contactarme. Es un honor que el FC Barcelona se interese en mi perfil.',
          time: '10:35 AM',
          timestamp: new Date('2024-10-16 10:35:00')
        },
        {
          id: 3,
          sender: 'scout',
          content: 'He revisado tus videos y tu posicionamiento defensivo es excelente. Me recuerda a algunos de nuestros mejores centrales.',
          time: '10:40 AM',
          timestamp: new Date('2024-10-16 10:40:00')
        },
        {
          id: 4,
          sender: 'scout',
          content: '¿Podrías enviarme un video de tus mejores jugadas de los últimos 6 meses?',
          time: '10:45 AM',
          timestamp: new Date('2024-10-16 10:45:00')
        },
        {
          id: 5,
          sender: 'scout',
          content: 'También nos gustaría saber si tienes disponibilidad para una prueba presencial en Barcelona.',
          time: '10:46 AM',
          timestamp: new Date('2024-10-16 10:46:00')
        }
      ]
    },
    {
      id: 2,
      user: {
        name: 'Ana García',
        role: 'Directora - Academia Elite Madrid',
        avatar: 'imagenes/imagen3.png',
        status: 'En línea'
      },
      lastMessage: 'Tenemos una beca completa disponible para jugadores de tu perfil.',
      time: '5 min',
      unread: 2,
      messages: [
        {
          id: 1,
          sender: 'scout',
          content: 'Hola Santiago, somos una academia en Madrid y nos gustaría hablar contigo sobre una oportunidad.',
          time: '9:15 AM',
          timestamp: new Date('2024-10-16 09:15:00')
        },
        {
          id: 2,
          sender: 'player',
          content: 'Hola Ana, me encantaría conocer más sobre la academia y la oportunidad.',
          time: '9:20 AM',
          timestamp: new Date('2024-10-16 09:20:00')
        },
        {
          id: 3,
          sender: 'scout',
          content: 'Somos una de las academias más prestigiosas de España. Hemos formado jugadores que ahora juegan en La Liga.',
          time: '9:25 AM',
          timestamp: new Date('2024-10-16 09:25:00')
        },
        {
          id: 4,
          sender: 'scout',
          content: 'Tenemos una beca completa disponible para jugadores de tu perfil.',
          time: 'Hace 5 min',
          timestamp: new Date('2024-10-16 11:40:00')
        }
      ]
    },
    {
      id: 3,
      user: {
        name: 'Roberto Silva',
        role: 'Scout - Real Madrid Castilla',
        avatar: 'imagenes/imagen4.png',
        status: 'Hace 30 min'
      },
      lastMessage: '¿Tienes pasaporte europeo? Esto facilitaría mucho el proceso.',
      time: '30 min',
      unread: 1,
      messages: [
        {
          id: 1,
          sender: 'scout',
          content: 'Hola Santiago, soy Roberto Silva del Real Madrid Castilla. Tu perfil nos ha llamado mucho la atención.',
          time: '8:00 AM',
          timestamp: new Date('2024-10-16 08:00:00')
        },
        {
          id: 2,
          sender: 'player',
          content: '¡Increíble! No puedo creer que el Real Madrid se haya fijado en mí. Es mi sueño desde niño.',
          time: '8:05 AM',
          timestamp: new Date('2024-10-16 08:05:00')
        },
        {
          id: 3,
          sender: 'scout',
          content: 'Tu técnica defensiva y capacidad de anticipación son excepcionales para tu edad.',
          time: '8:10 AM',
          timestamp: new Date('2024-10-16 08:10:00')
        },
        {
          id: 4,
          sender: 'scout',
          content: 'Estamos organizando una prueba para el mes que viene. ¿Estarías interesado?',
          time: '8:15 AM',
          timestamp: new Date('2024-10-16 08:15:00')
        },
        {
          id: 5,
          sender: 'player',
          content: '¡Por supuesto! Estaría encantado de participar. ¿Qué necesito preparar?',
          time: '8:20 AM',
          timestamp: new Date('2024-10-16 08:20:00')
        },
        {
          id: 6,
          sender: 'scout',
          content: '¿Tienes pasaporte europeo? Esto facilitaría mucho el proceso.',
          time: '11:15 AM',
          timestamp: new Date('2024-10-16 11:15:00')
        }
      ]
    },
    {
      id: 4,
      user: {
        name: 'Marco Pérez',
        role: 'Agente FIFA',
        avatar: 'imagenes/imagen5.png',
        status: 'Hace 2 horas'
      },
      lastMessage: 'He hablado con varios clubes europeos interesados en tu perfil.',
      time: '2h',
      unread: 1,
      messages: [
        {
          id: 1,
          sender: 'scout',
          content: 'Hola Santiago, soy Marco Pérez, agente FIFA. Me han recomendado tu perfil varios scouts.',
          time: 'Ayer 6:30 PM',
          timestamp: new Date('2024-10-15 18:30:00')
        },
        {
          id: 2,
          sender: 'player',
          content: 'Hola Marco, me interesa mucho saber más sobre las oportunidades que maneja.',
          time: 'Ayer 7:00 PM',
          timestamp: new Date('2024-10-15 19:00:00')
        },
        {
          id: 3,
          sender: 'scout',
          content: 'Represento jugadores en La Liga, Serie A y Bundesliga. Tu perfil encaja perfectamente.',
          time: 'Ayer 7:15 PM',
          timestamp: new Date('2024-10-15 19:15:00')
        },
        {
          id: 4,
          sender: 'scout',
          content: 'He hablado con varios clubes europeos interesados en tu perfil.',
          time: '9:45 AM',
          timestamp: new Date('2024-10-16 09:45:00')
        }
      ]
    }
  ];

  let activeConversationId = null;

  function openChatModal() {
    console.log('🔄 Abriendo modal de chat...');
    const chatModal = document.getElementById('chatModal');
    if (chatModal) {
      chatModal.classList.add('show');
      console.log('✅ Modal mostrado');
      loadConversations();
      updateChatBadge();
    } else {
      console.error('❌ No se encontró el elemento chatModal');
    }
  }

  function loadConversations() {
    console.log('🔄 Cargando conversaciones...');
    const conversationsList = document.getElementById('conversationsList');
    
    if (!conversationsList) {
      console.error('❌ No se encontró el elemento conversationsList');
      // Intentar encontrar elementos similares
      console.log('🔍 Buscando elementos similares...');
      const allElements = document.querySelectorAll('[id*="conversation"], [class*="conversation"]');
      console.log('📋 Elementos encontrados:', allElements);
      return;
    }
    
    console.log('📊 Número de conversaciones:', conversations.length);
    console.log('📍 Elemento conversationsList encontrado:', conversationsList);
    
    // Limpiar contenido existente
    conversationsList.innerHTML = '';
    
    // Agregar un elemento de prueba primero
    const testElement = document.createElement('div');
    testElement.innerHTML = '<p style="padding: 10px; color: red;">PRUEBA - Si ves esto, el contenedor funciona</p>';
    conversationsList.appendChild(testElement);

    if (conversations.length === 0) {
      console.warn('⚠️ No hay conversaciones para mostrar');
      conversationsList.innerHTML = '<p style="padding: 20px; text-align: center;">No hay conversaciones</p>';
      return;
    }

    // Remover elemento de prueba
    conversationsList.innerHTML = '';

    conversations.forEach((conversation, index) => {
      console.log(`➕ Agregando conversación ${index + 1}:`, conversation.user.name);
      
      const conversationElement = document.createElement('div');
      conversationElement.className = 'conversation-item';
      conversationElement.style.cssText = 'padding: 16px; border-bottom: 1px solid #eee; cursor: pointer; background: white;';
      conversationElement.onclick = () => selectConversation(conversation.id);
      
      // Crear HTML más simple para debug
      conversationElement.innerHTML = `
        <div class="conversation-info" style="display: flex; align-items: center; gap: 12px;">
          <img src="${conversation.user.avatar}" alt="${conversation.user.name}" class="conversation-avatar" style="width: 48px; height: 48px; border-radius: 12px; object-fit: cover;">
          <div class="conversation-details" style="flex: 1;">
            <h5 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #2d3748;">${conversation.user.name}</h5>
            <p class="conversation-preview" style="font-size: 13px; color: #718096; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${conversation.lastMessage}</p>
            <div class="conversation-time" style="font-size: 11px; color: #a0aec0; margin-top: 4px;">${conversation.time}</div>
            ${conversation.unread > 0 ? `<span class="unread-count" style="background: #ff4757; color: white; border-radius: 12px; padding: 4px 8px; font-size: 11px; font-weight: 600; position: absolute; bottom: 0; right: 0;">${conversation.unread}</span>` : ''}
          </div>
        </div>
      `;
      
      conversationsList.appendChild(conversationElement);
      console.log(`✅ Conversación ${index + 1} agregada al DOM`);
    });
    
    console.log('✅ Todas las conversaciones cargadas');
    console.log('📏 Altura del contenedor:', conversationsList.scrollHeight, 'px');
  }

  function selectConversation(conversationId) {
    activeConversationId = conversationId;
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) return;

    // Marcar conversación como activa
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.classList.remove('active');
    });
    event.target.closest('.conversation-item').classList.add('active');

    // Actualizar header del chat
    document.getElementById('chatAvatar').src = conversation.user.avatar;
    document.getElementById('chatUserName').textContent = conversation.user.name;
    document.getElementById('chatUserStatus').textContent = conversation.user.status;

    // Cargar mensajes
    loadMessages(conversation);

    // Mostrar área de input
    document.getElementById('chatInputArea').style.display = 'block';
    document.querySelector('.no-chat-selected').style.display = 'none';

    // Marcar mensajes como leídos
    conversation.unread = 0;
    updateChatBadge();
    loadConversations();
  }

  function loadMessages(conversation) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    conversation.messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${message.sender === 'player' ? 'own' : ''}`;
      
      messageElement.innerHTML = `
        <img src="${message.sender === 'player' ? playerData.avatar : conversation.user.avatar}" 
             alt="Avatar" class="message-avatar">
        <div class="message-content">
          <div class="message-bubble">${message.content}</div>
          <div class="message-time">${message.time}</div>
        </div>
      `;
      
      chatMessages.appendChild(messageElement);
    });

    // Scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function setupChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (chatInput && sendBtn) {
      const sendMessage = () => {
        const message = chatInput.value.trim();
        if (!message || !activeConversationId) return;

        // Encontrar conversación activa
        const conversation = conversations.find(c => c.id === activeConversationId);
        if (!conversation) return;

        // Crear nuevo mensaje
        const newMessage = {
          id: conversation.messages.length + 1,
          sender: 'player',
          content: message,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date()
        };

        // Añadir mensaje a la conversación
        conversation.messages.push(newMessage);
        conversation.lastMessage = message;
        conversation.time = 'Ahora';

        // Recargar mensajes y conversaciones
        loadMessages(conversation);
        loadConversations();

        // Limpiar input
        chatInput.value = '';
        
        // Simular respuesta automática después de 2 segundos
        setTimeout(() => {
          simulateAutoReply(conversation);
        }, 2000);
      };

      sendBtn.addEventListener('click', sendMessage);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }
  }

  function simulateAutoReply(conversation) {
    const autoReplies = [
      'Gracias por tu mensaje, te responderé pronto.',
      'Interesante, déjame revisar tu perfil en detalle.',
      'Perfecto, estaremos en contacto.',
      '¿Podrías contarme más sobre tu experiencia?',
      'Excelente, eso es justo lo que buscamos.'
    ];

    const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
    
    const autoMessage = {
      id: conversation.messages.length + 1,
      sender: 'scout',
      content: randomReply,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date()
    };

    conversation.messages.push(autoMessage);
    conversation.lastMessage = randomReply;
    conversation.time = 'Ahora';

    // Solo recargar si esta conversación está activa
    if (activeConversationId === conversation.id) {
      loadMessages(conversation);
    }
    
    loadConversations();
  }

  function updateChatBadge() {
    const totalUnread = conversations.reduce((total, conv) => total + conv.unread, 0);
    const chatBadge = document.getElementById('chatBadge');
    if (chatBadge) {
      chatBadge.textContent = totalUnread;
      chatBadge.style.display = totalUnread > 0 ? 'block' : 'none';
    }
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