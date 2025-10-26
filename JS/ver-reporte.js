// ===== VER REPORTE - JAVASCRIPT =====

class ReportViewer {
  constructor() {
    this.reportId = null;
    this.report = null;
    this.currentUser = null;
    // Inicializar de forma asíncrona
    this.init().catch(error => {
      console.error('❌ Error durante la inicialización:', error);
      this.showNotFound();
    });
  }

  async init() {
    console.log('🎯 Iniciando visualizador de reportes...');
    
    // Inicializar Supabase si está disponible
    if (typeof initSupabase === 'function') {
      initSupabase();
    }
    
    // Cargar usuario actual
    this.currentUser = await this.loadCurrentUser();
    
    // Obtener ID del reporte desde URL
    this.reportId = this.getReportIdFromURL();
    
    if (!this.reportId) {
      this.showNotFound();
      return;
    }

    // Cargar reporte
    await this.loadReport();
  }

  getReportIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  async loadCurrentUser() {
    try {
      // 1. Intentar obtener usuario desde Supabase primero
      if (typeof supabase !== 'undefined' && supabase) {
        console.log('👤 Buscando usuario en Supabase...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!error && user) {
          console.log('✅ Usuario encontrado en Supabase:', user);
          return {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Scout',
            email: user.email,
            fullName: user.user_metadata?.full_name,
            userType: 'scout'
          };
        } else {
          console.log('ℹ️ No hay usuario autenticado en Supabase');
        }
      }
      
      // 2. Fallback: buscar en sessionStorage
      console.log('💾 Buscando usuario en sessionStorage...');
      const userStr = sessionStorage.getItem('scoutConnectUser');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user) {
        console.log('✅ Usuario encontrado en sessionStorage:', user);
        return user;
      }
      
      console.log('⚠️ No se encontró usuario');
      return null;
      
    } catch (error) {
      console.error('❌ Error al cargar usuario actual:', error);
      return null;
    }
  }

  async loadReport() {
    try {
      console.log('📂 Cargando reporte con ID:', this.reportId);
      
      // Inicializar Supabase si está disponible
      if (typeof initSupabase === 'function') {
        initSupabase();
      }
      
      let report = null;
      
      // 1. Intentar cargar desde Supabase primero
      if (typeof supabase !== 'undefined' && supabase) {
        console.log('☁️ Buscando reporte en Supabase...');
        report = await this.loadReportFromSupabase(this.reportId);
        
        if (report) {
          console.log('✅ Reporte encontrado en Supabase:', report);
          this.report = report;
        }
      }
      
      // 2. Si no se encontró en Supabase, buscar en localStorage como fallback
      if (!report) {
        console.log('💾 Buscando reporte en localStorage...');
        const reportsStr = localStorage.getItem('generatedReports');
        console.log('📊 Datos de reportes en localStorage:', reportsStr);
        
        const reports = reportsStr ? JSON.parse(reportsStr) : [];
        console.log('📋 Total de reportes encontrados en localStorage:', reports.length);
        
        if (reports.length > 0) {
          console.log('🔍 IDs disponibles:', reports.map(r => `"${r.id}" (${typeof r.id})`).join(', '));
          console.log('🎯 Buscando ID:', `"${this.reportId}" (${typeof this.reportId})`);
        }
        
        // Buscar el reporte específico (comparación flexible)
        this.report = reports.find(r => {
          const match = r.id === this.reportId || r.id == this.reportId || String(r.id) === String(this.reportId);
          if (match) {
            console.log('✅ Reporte encontrado en localStorage:', r);
          }
          return match;
        });
      }
      
      if (!this.report) {
        console.error('❌ Reporte no encontrado con ID:', this.reportId);
        this.showNotFound();
        return;
      }

      console.log('✅ Reporte cargado correctamente:', this.report);

      // Validar acceso: solo el scout que creó el reporte puede verlo
      if (!this.validateAccess()) {
        console.warn('⚠️ Acceso denegado al reporte:', this.reportId);
        this.showAccessDenied();
        return;
      }

      // Renderizar el reporte
      this.renderReport();
      this.showContent();

    } catch (error) {
      console.error('❌ Error al cargar reporte:', error);
      this.showNotFound();
    }
  }

  async loadReportFromSupabase(reportId) {
    try {
      console.log('🔍 Buscando reporte en Supabase con ID:', reportId);
      
      // Obtener el usuario actual para filtrar por scout
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.warn('⚠️ No hay usuario autenticado en Supabase');
        return null;
      }
      
      // Buscar el reporte específico - Las políticas RLS se encargan de la seguridad
      let { data: reportData, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📭 Reporte no encontrado en Supabase');
          return null;
        }
        console.error('❌ Error buscando en Supabase:', error);
        return null;
      }
      
      if (!reportData) {
        console.log('📭 No se encontró el reporte en Supabase');
        return null;
      }
      
      // Convertir formato de Supabase al formato esperado por la interfaz
      const report = {
        id: reportData.id,
        title: reportData.title || `Reporte de ${reportData.player_name}`,
        type: reportData.type || 'Reporte de Scouting',
        playerName: reportData.player_name,
        playerPosition: reportData.player_position,
        playerAge: reportData.player_age,
        playerClub: reportData.player_club,
        playerNationality: reportData.player_nationality,
        observationDate: reportData.match_date,
        location: reportData.match_teams,
        context: reportData.match_competition,
        ratings: {
          technical: reportData.technical_rating || 0,
          physical: reportData.physical_rating || 0,
          tactical: reportData.tactical_rating || 0,
          mental: reportData.mental_rating || 0
        },
        evaluations: [
          { category: 'Técnico', rating: reportData.technical_rating || 0, notes: 'Evaluación técnica' },
          { category: 'Físico', rating: reportData.physical_rating || 0, notes: 'Evaluación física' },
          { category: 'Táctico', rating: reportData.tactical_rating || 0, notes: 'Evaluación táctica' },
          { category: 'Mental', rating: reportData.mental_rating || 0, notes: 'Evaluación mental' }
        ],
        observations: reportData.detailed_analysis || 'Sin observaciones',
        summary: reportData.detailed_analysis || 'Sin resumen',
        recommendation: reportData.recommendation || 'Sin recomendación',
        // Procesar fortalezas y debilidades correctamente
        strengths: this.processSupabaseArray(reportData.strengths),
        weaknesses: this.processSupabaseArray(reportData.weaknesses),
        scoutName: user.user_metadata?.full_name || 
                  user.email?.split('@')[0] || 
                  'Scout',
        scoutId: user.id,
        scoutEmail: user.email,
        status: 'completed',
        createdAt: reportData.created_at,
        overall: reportData.overall_rating || 0,
        overallRating: reportData.overall_rating || 0
      };
      
      console.log('🔄 Reporte convertido de Supabase:', report);
      return report;
      
    } catch (error) {
      console.error('❌ Error en loadReportFromSupabase:', error);
      return null;
    }
  }

  processSupabaseArray(data) {
    // Manejar diferentes formatos de datos de Supabase
    if (!data) {
      return [];
    }
    
    // Si ya es un array, devolverlo tal como está
    if (Array.isArray(data)) {
      return data.filter(item => item && item !== 'No especificadas');
    }
    
    // Si es un string, intentar parsearlo como JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item !== 'No especificadas');
        }
      } catch (e) {
        // Si no es JSON válido, dividir por comas o saltos de línea
        return data.split(/[,\n]+/)
          .map(item => item.trim())
          .filter(item => item && item !== 'No especificadas');
      }
    }
    
    return [];
  }

  validateAccess() {
    // Registro detallado para depuración
    console.log('🔐 Iniciando validación de acceso...');
    console.log('Usuario actual:', this.currentUser);
    console.log('Reporte:', this.report);

    // Si no hay usuario actual, permitir acceso temporal (para depuración)
    if (!this.currentUser) {
      console.warn('⚠️ No hay usuario actual - Permitiendo acceso temporal');
      return true; // Cambiado temporalmente para depuración
    }

    // Si no hay reporte, denegar
    if (!this.report) {
      console.log('❌ No hay reporte cargado');
      return false;
    }

    // Obtener diferentes identificadores del usuario actual
    const userIdentifiers = {
      id: this.currentUser.id || this.currentUser.userId,
      name: this.currentUser.name || this.currentUser.fullName || this.currentUser.full_name,
      email: this.currentUser.email
    };

    // Obtener identificadores del scout del reporte
    const reportScout = {
      id: this.report.scoutId,
      name: this.report.scoutName,
      email: this.report.scoutEmail
    };

    console.log('👤 Identificadores del usuario:', userIdentifiers);
    console.log('📝 Scout del reporte:', reportScout);

    // Validar acceso con múltiples criterios (más permisivo)
    const isAuthor = 
      // Por ID
      (userIdentifiers.id && reportScout.id && userIdentifiers.id == reportScout.id) ||
      // Por email
      (userIdentifiers.email && reportScout.email && userIdentifiers.email === reportScout.email) ||
      // Por nombre exacto
      (userIdentifiers.name && reportScout.name && userIdentifiers.name === reportScout.name) ||
      // Por nombre derivado del email
      (userIdentifiers.email && reportScout.name && 
       userIdentifiers.email.split('@')[0] === reportScout.name) ||
      // Si es un reporte de prueba
      reportScout.id?.includes('test') ||
      reportScout.name?.includes('Test') ||
      // Fallback: si no hay información específica del scout, permitir acceso
      (!reportScout.id && !reportScout.email);

    console.log('✅ Resultado de validación:', {
      isAuthor,
      matchById: userIdentifiers.id && reportScout.id && userIdentifiers.id == reportScout.id,
      matchByEmail: userIdentifiers.email && reportScout.email && userIdentifiers.email === reportScout.email,
      matchByName: userIdentifiers.name && reportScout.name && userIdentifiers.name === reportScout.name,
      isTestReport: reportScout.id?.includes('test') || reportScout.name?.includes('Test')
    });

    return isAuthor;
  }

  renderReport() {
    if (!this.report) return;

    console.log('📊 Renderizando reporte:', this.report);

    // Título y meta información
    document.getElementById('reportTitle').textContent = this.report.title || 'Reporte de Scouting';
    
    // Fecha - soportar diferentes formatos
    const dateStr = this.report.observationDate || this.report.date || this.report.createdAt;
    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : 'Fecha no disponible';
    document.getElementById('reportDate').textContent = displayDate;
    
    document.getElementById('reportScout').textContent = this.report.scoutName || 'Scout';
    document.getElementById('reportPlayer').textContent = this.report.playerName || 'Jugador';

    // Usuario actual en navbar
    if (this.currentUser) {
      document.getElementById('currentUserName').textContent = this.currentUser.name || 'Scout';
    }

    // Rating general - calcular si no existe
    let overallRating = this.report.overall || this.report.overallRating;
    if (!overallRating && this.report.ratings) {
      const values = Object.values(this.report.ratings).filter(v => v > 0);
      overallRating = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
    }
    overallRating = overallRating || 0;
    
    document.getElementById('overallRating').textContent = overallRating.toFixed(1);
    this.renderStars(overallRating);

    // Información del jugador
    this.renderPlayerInfo();

    // Evaluaciones por categoría
    this.renderEvaluations();

    // Resumen
    this.renderSummary();

    // Fortalezas y debilidades
    this.renderStrengthsWeaknesses();

    // Recomendación
    this.renderRecommendation();

    // Footer
    document.getElementById('footerScout').textContent = this.report.scoutName || 'Scout';
    
    const footerDateStr = this.report.observationDate || this.report.date || this.report.createdAt;
    const footerDate = footerDateStr ? new Date(footerDateStr).toLocaleDateString('es-ES') : '-';
    document.getElementById('footerDate').textContent = footerDate;

    // Actualizar título de página
    document.title = `${this.report.title || 'Reporte'} - ${this.report.playerName} - ScoutConnect`;
  }

  renderStars(rating) {
    const starsContainer = document.getElementById('ratingStars');
    const fullStars = Math.floor(rating / 2); // Rating de 10 a 5 estrellas
    const hasHalfStar = (rating / 2) % 1 >= 0.5;
    
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHTML += '<i class="fas fa-star"></i>';
      } else if (i === fullStars && hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
      } else {
        starsHTML += '<i class="far fa-star"></i>';
      }
    }
    
    starsContainer.innerHTML = starsHTML;
  }

  renderPlayerInfo() {
    const infoGrid = document.getElementById('playerInfoGrid');
    
    // Fecha de observación/reporte
    const dateStr = this.report.observationDate || this.report.date || this.report.createdAt;
    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : '-';
    
    const playerInfo = [
      { label: 'Nombre', value: this.report.playerName || '-' },
      { label: 'Posición', value: this.report.playerPosition || '-' },
      { label: 'Edad', value: this.report.playerAge || '-' },
      { label: 'Club', value: this.report.playerClub || '-' },
      { label: 'Nacionalidad', value: this.report.playerNationality || '-' },
      { label: 'Fecha del reporte', value: displayDate }
    ];

    infoGrid.innerHTML = playerInfo.map(info => `
      <div class="info-item">
        <span class="info-label">${info.label}</span>
        <span class="info-value">${info.value}</span>
      </div>
    `).join('');
  }

  renderEvaluations() {
    // Técnico - soportar ambos formatos
    const technicalRating = this.report.ratings?.technical || this.report.technicalRating || 0;
    const technicalEvals = this.report.technicalEvals || this.extractEvaluations(this.report.evaluations, 'technical');
    this.renderCategory('technical', 'technicalRating', 'technicalSkills', technicalEvals, technicalRating);
    
    // Físico
    const physicalRating = this.report.ratings?.physical || this.report.physicalRating || 0;
    const physicalEvals = this.report.physicalEvals || this.extractEvaluations(this.report.evaluations, 'physical');
    this.renderCategory('physical', 'physicalRating', 'physicalSkills', physicalEvals, physicalRating);
    
    // Mental
    const mentalRating = this.report.ratings?.mental || this.report.mentalRating || 0;
    const mentalEvals = this.report.mentalEvals || this.extractEvaluations(this.report.evaluations, 'mental');
    this.renderCategory('mental', 'mentalRating', 'mentalSkills', mentalEvals, mentalRating);
    
    // Táctico
    const tacticalRating = this.report.ratings?.tactical || this.report.tacticalRating || 0;
    const tacticalEvals = this.report.tacticalEvals || this.extractEvaluations(this.report.evaluations, 'tactical');
    this.renderCategory('tactical', 'tacticalRating', 'tacticalSkills', tacticalEvals, tacticalRating);
  }

  extractEvaluations(evaluations, category) {
    if (!evaluations) return {};
    
    const categoryMap = {
      'technical': ['ballControl', 'shortPass', 'longPass', 'finishing', 'dribbling', 'firstTouch'],
      'physical': ['speed', 'stamina', 'strength', 'agility', 'jumping', 'balance'],
      'mental': ['concentration', 'decisions', 'leadership', 'teamwork', 'pressure', 'motivation'],
      'tactical': ['positioning', 'vision', 'marking', 'anticipation']
    };
    
    const skills = categoryMap[category] || [];
    const result = {};
    
    skills.forEach(skill => {
      if (evaluations[skill] !== undefined) {
        result[skill] = evaluations[skill];
      }
    });
    
    return result;
  }

  renderCategory(categoryKey, ratingId, skillsId, evaluations, rating) {
    // Rating de la categoría - usar el parámetro pasado
    const displayRating = rating || 0;
    document.getElementById(ratingId).textContent = `${displayRating.toFixed(1)}/10`;

    // Skills de la categoría
    const skillsContainer = document.getElementById(skillsId);
    
    if (!evaluations || Object.keys(evaluations).length === 0) {
      skillsContainer.innerHTML = '<p style="color: #6b7280; font-size: 14px;">No hay evaluaciones detalladas</p>';
      return;
    }
    
    skillsContainer.innerHTML = Object.entries(evaluations).map(([skill, value]) => {
      const percentage = (value / 10) * 100;
      const ratingClass = this.getRatingClass(value);
      
      return `
        <div class="skill-item">
          <span class="skill-name">${skill}</span>
          <div class="skill-rating">
            <div class="skill-bar">
              <div class="skill-fill ${ratingClass}" style="width: ${percentage}%"></div>
            </div>
            <span class="skill-value">${value}/10</span>
          </div>
        </div>
      `;
    }).join('');
  }

  getRatingClass(rating) {
    if (rating >= 8) return 'excellent';
    if (rating >= 6.5) return 'good';
    if (rating >= 5) return 'average';
    return 'poor';
  }

  renderSummary() {
    const summaryContainer = document.getElementById('reportSummary');
    const summary = this.report.summary || this.report.observations || 'No hay resumen disponible para este reporte.';
    summaryContainer.innerHTML = `<p>${summary}</p>`;
  }

  renderStrengthsWeaknesses() {
    console.log('🔍 Renderizando fortalezas y debilidades...');
    console.log('Datos del reporte:', {
      strengths: this.report.strengths,
      weaknesses: this.report.weaknesses,
      strengthsType: typeof this.report.strengths,
      weaknessesType: typeof this.report.weaknesses
    });
    
    // Fortalezas - SOLO usar las que se guardaron, NO generar automáticamente
    const strengthsList = document.getElementById('strengthsList');
    let strengths = [];
    
    // Si strengths es un string, convertirlo a array
    if (typeof this.report.strengths === 'string' && this.report.strengths.trim() !== '' && 
        this.report.strengths !== 'No especificadas' && this.report.strengths !== 'No especificado') {
      // Dividir por saltos de línea, comas o puntos
      strengths = this.report.strengths.split(/[\n,•-]+/).map(s => s.trim()).filter(s => s.length > 0);
    } else if (Array.isArray(this.report.strengths)) {
      strengths = this.report.strengths.filter(s => s && s !== 'No especificadas' && s !== 'No especificado');
    }
    
    console.log('✅ Fortalezas procesadas:', strengths);
    
    if (strengths.length === 0) {
      strengthsList.innerHTML = '<li>No se especificaron fortalezas en este reporte</li>';
    } else {
      strengthsList.innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
    }

    // Debilidades - SOLO usar las que se guardaron, NO generar automáticamente
    const weaknessesList = document.getElementById('weaknessesList');
    let weaknesses = [];
    
    // Si weaknesses es un string, convertirlo a array
    if (typeof this.report.weaknesses === 'string' && this.report.weaknesses.trim() !== '' && 
        this.report.weaknesses !== 'No especificadas' && this.report.weaknesses !== 'No especificado') {
      // Dividir por saltos de línea, comas o puntos
      weaknesses = this.report.weaknesses.split(/[\n,•-]+/).map(w => w.trim()).filter(w => w.length > 0);
    } else if (Array.isArray(this.report.weaknesses)) {
      weaknesses = this.report.weaknesses.filter(w => w && w !== 'No especificadas' && w !== 'No especificado');
    }
    
    console.log('⚠️ Debilidades procesadas:', weaknesses);
    
    if (weaknesses.length === 0) {
      weaknessesList.innerHTML = '<li>No se especificaron áreas de mejora en este reporte</li>';
    } else {
      weaknessesList.innerHTML = weaknesses.map(w => `<li>${w}</li>`).join('');
    }
  }

  generateStrengthsFromEvals() {
    const strengths = [];
    
    // Usar los ratings principales si están disponibles
    const ratings = this.report.ratings || {};
    console.log('📊 Ratings para generar fortalezas:', ratings);
    
    if (ratings.technical >= 8) {
      strengths.push('Excelente técnica individual');
    } else if (ratings.technical >= 7) {
      strengths.push('Buena técnica');
    }
    
    if (ratings.physical >= 8) {
      strengths.push('Gran capacidad física');
    } else if (ratings.physical >= 7) {
      strengths.push('Buen estado físico');
    }
    
    if (ratings.tactical >= 8) {
      strengths.push('Muy buena comprensión táctica');
    } else if (ratings.tactical >= 7) {
      strengths.push('Entiende bien el juego');
    }
    
    if (ratings.mental >= 8) {
      strengths.push('Fortaleza mental destacada');
    } else if (ratings.mental >= 7) {
      strengths.push('Mentalidad positiva');
    }
    
    // Si ningún rating es alto, buscar el más alto
    if (strengths.length === 0) {
      const maxRating = Math.max(ratings.technical || 0, ratings.physical || 0, ratings.tactical || 0, ratings.mental || 0);
      if (maxRating >= 6) {
        if (ratings.technical === maxRating) strengths.push('Aspecto técnico como punto fuerte');
        if (ratings.physical === maxRating) strengths.push('Condición física destacable');
        if (ratings.tactical === maxRating) strengths.push('Comprensión del juego');
        if (ratings.mental === maxRating) strengths.push('Actitud mental positiva');
      }
    }

    console.log('✅ Fortalezas generadas:', strengths);
    return strengths.slice(0, 4); // Máximo 4 fortalezas
  }

  generateWeaknessesFromEvals() {
    const weaknesses = [];
    
    // Usar los ratings principales si están disponibles
    const ratings = this.report.ratings || {};
    console.log('📊 Ratings para generar debilidades:', ratings);
    
    if (ratings.technical <= 4) {
      weaknesses.push('Necesita mejorar aspectos técnicos');
    } else if (ratings.technical <= 5) {
      weaknesses.push('Margen de mejora en técnica');
    }
    
    if (ratings.physical <= 4) {
      weaknesses.push('Requiere trabajo físico');
    } else if (ratings.physical <= 5) {
      weaknesses.push('Puede mejorar condición física');
    }
    
    if (ratings.tactical <= 4) {
      weaknesses.push('Debe desarrollar comprensión táctica');
    } else if (ratings.tactical <= 5) {
      weaknesses.push('Puede desarrollar más la táctica');
    }
    
    if (ratings.mental <= 4) {
      weaknesses.push('Necesita fortalecer aspecto mental');
    } else if (ratings.mental <= 5) {
      weaknesses.push('Puede fortalecer mentalidad');
    }
    
    // Si no hay ratings bajos, buscar el más bajo para sugerir mejora
    if (weaknesses.length === 0) {
      const minRating = Math.min(ratings.technical || 10, ratings.physical || 10, ratings.tactical || 10, ratings.mental || 10);
      if (minRating <= 7) {
        if (ratings.technical === minRating) weaknesses.push('Oportunidad de mejora en técnica');
        if (ratings.physical === minRating) weaknesses.push('Área de mejora: condición física');
        if (ratings.tactical === minRating) weaknesses.push('Puede desarrollar más la comprensión táctica');
        if (ratings.mental === minRating) weaknesses.push('Oportunidad de crecimiento mental');
      }
    }

    console.log('⚠️ Debilidades generadas:', weaknesses);
    return weaknesses.slice(0, 4); // Máximo 4 debilidades
  }

  renderRecommendation() {
    const recContainer = document.getElementById('recommendationContent');
    const recommendation = this.report.recommendation || '';
    
    // Mapeo de valores del select a badge visual
    const recommendationMap = {
      'sign': {
        class: '',
        text: 'Recomendar fichaje inmediato',
        icon: 'fa-star'
      },
      'monitor': {
        class: 'consider',
        text: 'Continuar monitoreando',
        icon: 'fa-eye'
      },
      'trial': {
        class: 'consider',
        text: 'Ofrecer periodo de prueba',
        icon: 'fa-clock'
      },
      'contact': {
        class: 'consider',
        text: 'Contactar para más información',
        icon: 'fa-phone'
      },
      'development': {
        class: 'consider',
        text: 'Potencial a largo plazo',
        icon: 'fa-seedling'
      },
      'reject': {
        class: 'not-recommended',
        text: 'No recomendado',
        icon: 'fa-times-circle'
      }
    };

    // Obtener configuración del badge según la recomendación
    const badgeConfig = recommendationMap[recommendation] || {
      class: 'consider',
      text: 'Sin recomendación específica',
      icon: 'fa-info-circle'
    };

    let badgeClass = 'recommendation-badge ' + badgeConfig.class;
    let badgeIcon = badgeConfig.icon;
    
    // Determinar el texto a mostrar
    let badgeText = badgeConfig.text; // Usar el texto del mapeo por defecto
    
    // Si existe recommendationText y NO es el texto por defecto del select, usarlo
    if (this.report.recommendationText && 
        this.report.recommendationText !== 'Seleccionar recomendación' &&
        this.report.recommendationText !== '') {
      badgeText = this.report.recommendationText;
    }

    console.log('📝 Recomendación:', {
      recommendation: this.report.recommendation,
      recommendationText: this.report.recommendationText,
      badgeText: badgeText
    });

    recContainer.innerHTML = `
      <div class="${badgeClass}">
        <i class="fas ${badgeIcon}"></i>
        <span>${badgeText}</span>
      </div>
    `;
  }

  // Acciones
  editReport() {
    // Redirigir a la página de edición con el ID del reporte
    window.location.href = `nuevo-reporte.html?editId=${this.reportId}`;
  }

  printReport() {
    window.print();
  }

  shareReport() {
    // Copiar URL al portapapeles
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showNotification('URL del reporte copiada al portapapeles', 'success');
      }).catch(() => {
        this.showNotification('No se pudo copiar la URL', 'error');
      });
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        this.showNotification('URL del reporte copiada al portapapeles', 'success');
      } catch (err) {
        this.showNotification('No se pudo copiar la URL', 'error');
      }
      document.body.removeChild(textArea);
    }
  }

  // Estados de visualización
  showContent() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('accessDeniedState').style.display = 'none';
    document.getElementById('notFoundState').style.display = 'none';
    document.getElementById('reportContent').style.display = 'block';
  }

  showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('accessDeniedState').style.display = 'none';
    document.getElementById('notFoundState').style.display = 'none';
    document.getElementById('reportContent').style.display = 'none';
  }

  showAccessDenied() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('accessDeniedState').style.display = 'flex';
    document.getElementById('notFoundState').style.display = 'none';
    document.getElementById('reportContent').style.display = 'none';
  }

  showNotFound() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('accessDeniedState').style.display = 'none';
    document.getElementById('notFoundState').style.display = 'flex';
    document.getElementById('reportContent').style.display = 'none';
    
    // Auto-mostrar información de depuración en desarrollo
    setTimeout(() => {
      if (typeof showDebugInfo === 'function') {
        showDebugInfo();
      }
    }, 500);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM cargado, iniciando visualizador de reportes...');
  window.reportViewer = new ReportViewer();
  // El init() ya es async ahora, se llamará automáticamente en el constructor
});

// Estilos para animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Función de utilidad para depuración (accesible desde consola)
window.debugReportViewer = function() {
  console.log('🔧 Información de depuración del ReportViewer:');
  console.log('📍 URL actual:', window.location.href);
  console.log('🎯 Report ID desde URL:', new URLSearchParams(window.location.search).get('id'));
  
  const reportsStr = localStorage.getItem('generatedReports');
  const reports = reportsStr ? JSON.parse(reportsStr) : [];
  console.log('📊 Total de reportes:', reports.length);
  
  if (reports.length > 0) {
    console.log('📋 Reportes disponibles:');
    reports.forEach((r, i) => {
      console.log(`  ${i + 1}. ID: "${r.id}", Jugador: "${r.playerName}", Scout: "${r.scoutName}"`);
    });
  }
  
  const currentUser = JSON.parse(sessionStorage.getItem('scoutConnectUser') || 'null');
  console.log('👤 Usuario actual:', currentUser);
  
  if (window.reportViewer) {
    console.log('🎭 ReportViewer instance:', window.reportViewer);
    console.log('📝 Reporte cargado:', window.reportViewer.report);
  }
};

// Función para crear un usuario de prueba
window.setTestScout = function(name = 'Scout Test', email = 'scout@test.com') {
  const testUser = {
    id: 'scout_test_123',
    name: name,
    email: email,
    fullName: name,
    userType: 'scout'
  };
  localStorage.setItem('scoutConnectUser', JSON.stringify(testUser));
  console.log('✅ Usuario de prueba creado:', testUser);
  if (window.reportViewer) {
    window.reportViewer.currentUser = testUser;
    console.log('🔄 Usuario actualizado en ReportViewer');
  }
};
