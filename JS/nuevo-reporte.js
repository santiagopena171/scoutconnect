// ===== NUEVO REPORTE - JAVASCRIPT =====

class ReportGenerator {
  constructor() {
    this.currentStep = 1;
    this.maxSteps = 4;
    this.selectedPlayer = null;
    this.reportData = {};
    this.watchedPlayers = [];
    
    this.init();
  }

  init() {
    this.loadWatchedPlayers();
    this.checkPreselectedPlayer();
    this.setupEventListeners();
    this.setupRatingSliders();
    this.displayPlayers();
  }

  async checkPreselectedPlayer() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('playerId');
    
    if (playerId) {
      console.log('🎯 Jugador preseleccionado detectado:', playerId);
      
      // Buscar el jugador en la lista de seguimiento
      let player = this.watchedPlayers.find(p => p.id == playerId);
      
      if (player) {
        // El jugador ya está en la lista de seguimiento
        console.log('✅ Jugador encontrado en lista de seguimiento');
        setTimeout(() => {
          this.selectPlayerById(playerId);
          // Avanzar automáticamente al paso 2
          setTimeout(() => this.goToStep(2), 300);
        }, 100);
      } else {
        // Si el jugador no está en seguimiento, cargarlo desde Supabase o datos mock
        console.log('📥 Cargando jugador desde base de datos...');
        await this.loadPlayerFromId(playerId);
      }
    }
  }

  async loadPlayerFromId(playerId) {
    try {
      console.log('🔍 Buscando jugador con ID:', playerId);
      
      // Primero intentar buscar en Supabase si el ID parece ser un UUID
      if (typeof supabase !== 'undefined' && playerId && playerId.length > 10) {
        console.log('📊 Buscando en Supabase...');
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', playerId)
          .eq('user_type', 'jugador')
          .single();

        if (!error && profile) {
          console.log('✅ Jugador encontrado en Supabase:', profile);
          
          // Convertir perfil de Supabase al formato esperado
          const playerData = {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.full_name || 'Jugador',
            position: profile.position || 'No especificado',
            age: profile.birth_date ? this.calculateAge(profile.birth_date) : null,
            location: profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.country || '',
            country: profile.nationality || profile.country || '',
            club: profile.current_club || 'Sin club',
            rating: 0, // Se calculará con el reporte
            avatar: profile.avatar_url || 'imagenes/player-default.jpg'
          };
          
          // Agregar temporalmente a la lista para poder seleccionarlo
          if (!this.watchedPlayers.find(p => p.id == playerId)) {
            this.watchedPlayers.push(playerData);
          }
          
          // Actualizar la vista con el jugador agregado
          this.displayPlayers();
          
          // Seleccionar el jugador automáticamente
          setTimeout(() => {
            this.selectPlayerById(playerId);
            // Avanzar automáticamente al paso 2 después de un breve delay
            setTimeout(() => this.goToStep(2), 300);
          }, 100);
          
          return;
        } else if (error) {
          console.warn('⚠️ Error buscando en Supabase:', error);
        }
      }
      
      // Fallback: Buscar en datos mock
      console.log('📦 Buscando en datos mock...');
      const mockPlayers = [
        {
          id: 1,
          name: 'Miguel Rodríguez',
          position: 'Mediocampista Ofensivo',
          age: 22,
          location: 'Buenos Aires, ARG',
          country: 'Argentina',
          club: 'Club Atlético River',
          rating: 8.5,
          avatar: 'imagenes/player1.jpg'
        },
        {
          id: 2,
          name: 'Andrés Silva',
          position: 'Defensa Central',
          age: 25,
          location: 'Montevideo, URU',
          country: 'Uruguay',
          club: 'Club Nacional',
          rating: 7.2,
          avatar: 'imagenes/player2.jpg'
        },
        {
          id: 3,
          name: 'Luis Gómez',
          position: 'Delantero Centro',
          age: 19,
          location: 'São Paulo, BRA',
          country: 'Brasil',
          club: 'Santos FC',
          rating: 9.1,
          avatar: 'imagenes/player3.jpg'
        }
      ];

      // Buscar el jugador por ID
      const playerData = mockPlayers.find(p => p.id == playerId);
      
      if (playerData) {
        // Agregar temporalmente a la lista para poder seleccionarlo
        if (!this.watchedPlayers.find(p => p.id == playerId)) {
          this.watchedPlayers.push(playerData);
        }
        
        // Actualizar la vista con el jugador agregado
        this.displayPlayers();
        
        // Seleccionar el jugador automáticamente
        setTimeout(() => {
          this.selectPlayerById(playerId);
          // Avanzar automáticamente al paso 2 después de un breve delay
          setTimeout(() => this.goToStep(2), 300);
        }, 100);
      } else {
        console.error('❌ Jugador no encontrado con ID:', playerId);
        alert('No se pudo cargar la información del jugador seleccionado.');
      }
    } catch (error) {
      console.error('❌ Error al cargar jugador:', error);
      alert('Error al cargar la información del jugador: ' + error.message);
    }
  }

  calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  loadWatchedPlayers() {
    try {
      const saved = localStorage.getItem('scoutconnect_watchlist');
      this.watchedPlayers = saved ? JSON.parse(saved) : [];
      console.log('📊 Jugadores cargados:', this.watchedPlayers.length);
    } catch (error) {
      console.error('❌ Error al cargar jugadores:', error);
      this.watchedPlayers = [];
    }
  }

  setupEventListeners() {
    // Navegación entre pasos
    document.getElementById('continueToStep2')?.addEventListener('click', () => this.goToStep(2));
    document.getElementById('continueToStep3')?.addEventListener('click', () => this.goToStep(3));
    document.getElementById('continueToStep4')?.addEventListener('click', () => this.goToStep(4));
    document.getElementById('backToStep1')?.addEventListener('click', () => this.goToStep(1));
    document.getElementById('backToStep2')?.addEventListener('click', () => this.goToStep(2));
    document.getElementById('backToStep3')?.addEventListener('click', () => this.goToStep(3));

    // Búsqueda de jugadores
    document.getElementById('playerSearch')?.addEventListener('input', (e) => {
      this.filterPlayers(e.target.value);
    });

    // Actualizar lista de jugadores
    document.getElementById('refreshPlayers')?.addEventListener('click', () => {
      this.loadWatchedPlayers();
      this.displayPlayers();
    });

    // Generar reporte final
    document.getElementById('generateReport')?.addEventListener('click', () => {
      this.generateFinalReport();
    });

    // Validación en tiempo real del formulario
    this.setupFormValidation();
  }

  setupRatingSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      const valueSpan = slider.parentElement.querySelector('.rating-value');
      
      slider.addEventListener('input', (e) => {
        if (valueSpan) {
          valueSpan.textContent = e.target.value;
          this.updateSliderColor(slider, e.target.value);
        }
      });

      // Inicializar colores
      this.updateSliderColor(slider, slider.value);
    });
  }

  updateSliderColor(slider, value) {
    const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percentage}%, var(--border-color) ${percentage}%, var(--border-color) 100%)`;
  }

  displayPlayers() {
    const playersGrid = document.getElementById('playersGrid');
    const emptyState = document.getElementById('emptyPlayersState');

    if (this.watchedPlayers.length === 0) {
      playersGrid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    playersGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    playersGrid.innerHTML = this.watchedPlayers.map(player => `
      <div class="player-card" data-player-id="${player.id}" onclick="reportGenerator.selectPlayer(${player.id})">
        <div class="player-header">
          <img src="${player.avatar || 'imagenes/default-avatar.png'}" alt="${player.name}" class="player-avatar">
          <div class="player-info">
            <h3>${player.name}</h3>
            <p>${player.position} • ${player.age} años</p>
            <p>${player.club}</p>
          </div>
        </div>
        <div class="player-stats">
          <div class="stat-item">
            <div class="stat-value">${player.rating || 'N/A'}</div>
            <div class="stat-label">Rating</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${player.matches || '0'}</div>
            <div class="stat-label">Partidos</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${player.goals || '0'}</div>
            <div class="stat-label">Goles</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  filterPlayers(searchTerm) {
    const playerCards = document.querySelectorAll('.player-card');
    const term = searchTerm.toLowerCase();

    playerCards.forEach(card => {
      const playerName = card.querySelector('h3').textContent.toLowerCase();
      const playerPosition = card.querySelector('p').textContent.toLowerCase();
      
      if (playerName.includes(term) || playerPosition.includes(term)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  selectPlayer(playerId) {
    // Remover selección anterior
    document.querySelectorAll('.player-card').forEach(card => {
      card.classList.remove('selected');
    });

    // Seleccionar nuevo jugador
    const playerCard = document.querySelector(`[data-player-id="${playerId}"]`);
    if (playerCard) {
      playerCard.classList.add('selected');
    }

    this.selectedPlayer = this.watchedPlayers.find(p => p.id == playerId);
    
    // Habilitar botón de continuar
    const continueBtn = document.getElementById('continueToStep2');
    if (continueBtn) {
      continueBtn.disabled = false;
    }

    console.log('✅ Jugador seleccionado:', this.selectedPlayer?.name);
  }

  // Función auxiliar para seleccionar jugador por ID (usado en precarga)
  selectPlayerById(playerId) {
    this.selectPlayer(playerId);
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.maxSteps) return;

    // Validar antes de continuar
    if (!this.validateCurrentStep()) return;

    // Ocultar paso actual
    document.querySelector(`#step${this.currentStep}`).classList.remove('active');
    document.querySelector(`[data-step="${this.currentStep}"]`).classList.remove('active');

    // Mostrar nuevo paso
    this.currentStep = stepNumber;
    document.querySelector(`#step${this.currentStep}`).classList.add('active');
    document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

    // Actualizar contenido específico del paso
    this.updateStepContent();

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        if (!this.selectedPlayer) {
          alert('Por favor selecciona un jugador para continuar.');
          return false;
        }
        break;
      case 2:
        if (!this.validateBasicForm()) {
          return false;
        }
        break;
      case 3:
        // Las evaluaciones son opcionales pero se guardan
        this.collectEvaluations();
        break;
    }
    return true;
  }

  validateBasicForm() {
    const title = document.getElementById('reportTitle').value.trim();
    const type = document.getElementById('reportType').value;

    if (!title) {
      alert('Por favor ingresa un título para el reporte.');
      document.getElementById('reportTitle').focus();
      return false;
    }

    if (!type) {
      alert('Por favor selecciona un tipo de reporte.');
      document.getElementById('reportType').focus();
      return false;
    }

    return true;
  }

  updateStepContent() {
    switch (this.currentStep) {
      case 2:
        this.showSelectedPlayerInfo();
        break;
      case 4:
        this.generateReportSummary();
        break;
    }
  }

  showSelectedPlayerInfo() {
    const selectedPlayerInfo = document.getElementById('selectedPlayerInfo');
    if (this.selectedPlayer) {
      selectedPlayerInfo.innerHTML = `
        <div class="player-header">
          <img src="${this.selectedPlayer.avatar || 'imagenes/default-avatar.png'}" alt="${this.selectedPlayer.name}" class="player-avatar">
          <div class="player-info">
            <h3>${this.selectedPlayer.name}</h3>
            <p>${this.selectedPlayer.position} • ${this.selectedPlayer.age} años • ${this.selectedPlayer.club}</p>
          </div>
        </div>
      `;
    }
  }

  collectEvaluations() {
    const evaluations = {};
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
      evaluations[slider.id] = parseInt(slider.value);
    });

    this.reportData.evaluations = evaluations;
    
    // Calcular promedios por categoría
    const technical = ['ballControl', 'shortPass', 'longPass', 'finishing', 'dribbling', 'firstTouch'];
    const physical = ['speed', 'stamina', 'strength', 'agility', 'jumping', 'balance'];
    const mental = ['concentration', 'decisions', 'leadership', 'teamwork', 'pressure', 'motivation'];
    const tactical = ['positioning', 'vision', 'marking', 'anticipation'];

    this.reportData.averages = {
      technical: this.calculateAverage(technical, evaluations),
      physical: this.calculateAverage(physical, evaluations),
      mental: this.calculateAverage(mental, evaluations),
      tactical: this.calculateAverage(tactical, evaluations)
    };
  }

  calculateAverage(skills, evaluations) {
    const values = skills.map(skill => evaluations[skill] || 5);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
  }

  generateReportSummary() {
    this.collectBasicInfo();
    this.collectEvaluations();

    const summary = document.getElementById('reportSummary');
    summary.innerHTML = `
      <div class="summary-section">
        <h4><i class="fas fa-user"></i> Información del Jugador</h4>
        <p><strong>Nombre:</strong> ${this.selectedPlayer.name}</p>
        <p><strong>Posición:</strong> ${this.selectedPlayer.position}</p>
        <p><strong>Edad:</strong> ${this.selectedPlayer.age} años</p>
        <p><strong>Club:</strong> ${this.selectedPlayer.club}</p>
      </div>

      <div class="summary-section">
        <h4><i class="fas fa-info-circle"></i> Datos del Reporte</h4>
        <p><strong>Título:</strong> ${this.reportData.title}</p>
        <p><strong>Tipo:</strong> ${this.reportData.type}</p>
        <p><strong>Prioridad:</strong> ${this.reportData.priority}</p>
        <p><strong>Fecha:</strong> ${this.reportData.date || 'No especificada'}</p>
        <p><strong>Lugar:</strong> ${this.reportData.location || 'No especificado'}</p>
      </div>

      <div class="summary-section">
        <h4><i class="fas fa-chart-bar"></i> Evaluación General</h4>
        <div class="rating-summary">
          <div class="rating-summary-item">
            <h5>Técnica</h5>
            <div class="score">${this.reportData.averages.technical}</div>
          </div>
          <div class="rating-summary-item">
            <h5>Física</h5>
            <div class="score">${this.reportData.averages.physical}</div>
          </div>
          <div class="rating-summary-item">
            <h5>Mental</h5>
            <div class="score">${this.reportData.averages.mental}</div>
          </div>
          <div class="rating-summary-item">
            <h5>Táctica</h5>
            <div class="score">${this.reportData.averages.tactical}</div>
          </div>
        </div>
      </div>
    `;
  }

  collectBasicInfo() {
    this.reportData = {
      ...this.reportData,
      title: document.getElementById('reportTitle').value.trim(),
      type: document.getElementById('reportType').value,
      date: document.getElementById('reportDate').value,
      priority: document.getElementById('reportPriority').value,
      location: document.getElementById('reportLocation').value.trim(),
      context: document.getElementById('reportContext').value.trim()
    };
  }

  setupFormValidation() {
    // Auto-completar fecha actual
    document.getElementById('reportDate').value = new Date().toISOString().split('T')[0];
  }

  addStrength() {
    const container = document.getElementById('strengthsContainer');
    const newInput = document.createElement('div');
    newInput.className = 'item-input-wrapper';
    newInput.innerHTML = `
      <input type="text" class="strength-input" placeholder="Ej: Excelente visión de juego" />
      <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(newInput);
    // Focus en el nuevo input
    newInput.querySelector('input').focus();
  }

  addWeakness() {
    const container = document.getElementById('weaknessesContainer');
    const newInput = document.createElement('div');
    newInput.className = 'item-input-wrapper';
    newInput.innerHTML = `
      <input type="text" class="weakness-input" placeholder="Ej: Mejorar juego aéreo" />
      <button type="button" class="btn-remove-item" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(newInput);
    // Focus en el nuevo input
    newInput.querySelector('input').focus();
  }

  collectStrengths() {
    const inputs = document.querySelectorAll('.strength-input');
    const strengths = [];
    inputs.forEach(input => {
      const value = input.value.trim();
      if (value) {
        strengths.push(value);
      }
    });
    return strengths;
  }

  collectWeaknesses() {
    const inputs = document.querySelectorAll('.weakness-input');
    const weaknesses = [];
    inputs.forEach(input => {
      const value = input.value.trim();
      if (value) {
        weaknesses.push(value);
      }
    });
    return weaknesses;
  }

  generateFinalReport() {
    this.collectBasicInfo();
    this.collectEvaluations();

    const finalObservations = document.getElementById('finalObservations').value.trim();
    const finalStrengths = this.collectStrengths();
    const finalWeaknesses = this.collectWeaknesses();
    const finalRecommendationSelect = document.getElementById('finalRecommendation');
    const finalRecommendation = finalRecommendationSelect.value;
    const finalRecommendationText = finalRecommendationSelect.options[finalRecommendationSelect.selectedIndex].text;

    console.log('📝 Datos recolectados del formulario:');
    console.log('Fortalezas:', finalStrengths);
    console.log('Debilidades:', finalWeaknesses);
    console.log('Observaciones:', finalObservations);

    // Crear objeto de reporte completo
    const report = {
      id: Date.now().toString(),
      playerId: this.selectedPlayer.id,
      playerName: this.selectedPlayer.name,
      playerPosition: this.selectedPlayer.position,
      playerAvatar: this.selectedPlayer.avatar || 'imagenes/default-avatar.png',
      playerAge: this.selectedPlayer.age,
      playerClub: this.selectedPlayer.club,
      playerNationality: this.selectedPlayer.country || this.selectedPlayer.nationality || 'No especificado',
      title: this.reportData.title,
      type: this.reportData.type,
      priority: this.reportData.priority,
      observationDate: this.reportData.date,
      location: this.reportData.location,
      context: this.reportData.context,
      evaluations: this.reportData.evaluations,
      ratings: {
        technical: this.reportData.averages.technical,
        physical: this.reportData.averages.physical,
        mental: this.reportData.averages.mental,
        tactical: this.reportData.averages.tactical
      },
      summary: finalObservations,
      observations: finalObservations,
      strengths: finalStrengths, // No usar valor por defecto, guardar array vacío si no hay
      weaknesses: finalWeaknesses, // No usar valor por defecto, guardar array vacío si no hay
      recommendation: finalRecommendation,
      recommendationText: finalRecommendationText || 'Sin recomendación específica',
      status: 'completed',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      ...this.getScoutInfo()
    };

    // Guardar reporte
    this.saveReport(report);
    
    // Mostrar confirmación
    this.showConfirmation();
  }

  getScoutInfo() {
    try {
      console.log('🔍 Buscando información del scout...');
      
      // 1. Buscar en localStorage (clave del login)
      const scoutConnectUser = JSON.parse(localStorage.getItem('scoutConnectUser') || 'null');
      if (scoutConnectUser) {
        console.log('✅ Usuario encontrado en scoutConnectUser:', scoutConnectUser);
        return {
          scoutId: scoutConnectUser.userId || scoutConnectUser.id,
          scoutName: scoutConnectUser.fullName || scoutConnectUser.full_name || scoutConnectUser.name || scoutConnectUser.email?.split('@')[0] || 'Scout',
          scoutEmail: scoutConnectUser.email
        };
      }

      // 2. Intentar obtener desde Supabase Auth directamente
      if (typeof supabase !== 'undefined' && supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            console.log('✅ Usuario encontrado en Supabase Auth:', user);
            return {
              scoutId: user.id,
              scoutName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Scout',
              scoutEmail: user.email
            };
          }
        });
      }

      // 3. Alternativa: buscar en localStorage del perfil (clave alternativa)
      const userProfile = JSON.parse(localStorage.getItem('scoutconnect_user') || 'null');
      if (userProfile) {
        console.log('✅ Usuario encontrado en scoutconnect_user:', userProfile);
        return {
          scoutId: userProfile.id || userProfile.userId || Date.now().toString(),
          scoutName: userProfile.name || userProfile.fullName || userProfile.email?.split('@')[0] || 'Scout',
          scoutEmail: userProfile.email
        };
      }

      // Fallback: información por defecto
      console.warn('⚠️ No se pudo obtener información del scout, usando valores por defecto');
      console.log('💡 Tip: Ejecuta en consola: setTestScout("Tu Nombre", "tu@email.com")');
      return {
        scoutId: 'scout_' + Date.now(),
        scoutName: 'Scout Profesional',
        scoutEmail: 'scout@scoutconnect.com'
      };
    } catch (error) {
      console.error('❌ Error al obtener información del scout:', error);
      return {
        scoutId: 'scout_' + Date.now(),
        scoutName: 'Scout Profesional',
        scoutEmail: 'scout@scoutconnect.com'
      };
    }
  }

  async saveReport(report) {
    try {
      // 1. Guardar en localStorage (fallback)
      const existingReports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
      existingReports.push(report);
      localStorage.setItem('generatedReports', JSON.stringify(existingReports));
      console.log('✅ Reporte guardado en localStorage');
      
      // 2. Guardar en Supabase si está disponible
      if (typeof supabase !== 'undefined') {
        await this.saveReportToSupabase(report);
      } else {
        console.warn('⚠️ Supabase no disponible, reporte solo guardado en localStorage');
      }
      
    } catch (error) {
      console.error('❌ Error al guardar reporte:', error);
      alert('Error al guardar el reporte. Por favor, intenta nuevamente.');
    }
  }

  async saveReportToSupabase(report) {
    try {
      console.log('☁️ Guardando reporte en Supabase...');
      
      // Obtener el usuario actual (scout)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.warn('⚠️ No hay usuario autenticado en Supabase');
        return false;
      }
      
      // Preparar datos para Supabase (tabla reports)
      const reportData = {
        scout_id: user.id,
        player_id: report.playerId,
        player_name: report.playerName,
        player_position: report.playerPosition,
        player_age: report.playerAge,
        player_club: report.playerClub,
        player_nationality: report.playerNationality,
        title: report.title || 'Reporte de Scouting',
        type: report.type || 'Reporte General',
        match_date: report.observationDate || null,
        match_competition: report.context || '',
        match_teams: report.location || '',
        overall_rating: this.calculateOverallRating(report.ratings),
        technical_rating: report.ratings.technical || 0,
        physical_rating: report.ratings.physical || 0,
        tactical_rating: report.ratings.tactical || 0,
        mental_rating: report.ratings.mental || 0,
        strengths: report.strengths || [], // Usar las fortalezas del reporte directamente
        weaknesses: report.weaknesses || [], // Usar las debilidades del reporte directamente
        detailed_analysis: report.observations || report.summary || '',
        recommendation: report.recommendation || 'pending',
        visibility: 'private',
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('reports')
        .insert([reportData]);
      
      if (insertError) {
        console.error('❌ Error insertando en Supabase:', insertError);
        return false;
      }
      
      console.log('✅ Reporte guardado en Supabase correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error en saveReportToSupabase:', error);
      return false;
    }
  }

  calculateOverallRating(ratings) {
    const values = Object.values(ratings).filter(v => v > 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return parseFloat((sum / values.length).toFixed(1));
  }

  extractStrengths(evaluations) {
    const strengths = [];
    if (evaluations) {
      Object.entries(evaluations).forEach(([category, skills]) => {
        if (typeof skills === 'object') {
          Object.entries(skills).forEach(([skill, rating]) => {
            if (rating >= 7) {
              strengths.push(`${skill}: ${rating}/10`);
            }
          });
        }
      });
    }
    return strengths.join(', ') || 'No especificado';
  }

  extractWeaknesses(evaluations) {
    const weaknesses = [];
    if (evaluations) {
      Object.entries(evaluations).forEach(([category, skills]) => {
        if (typeof skills === 'object') {
          Object.entries(skills).forEach(([skill, rating]) => {
            if (rating > 0 && rating < 5) {
              weaknesses.push(`${skill}: ${rating}/10`);
            }
          });
        }
      });
    }
    return weaknesses.join(', ') || 'No especificado';
  }

  showConfirmation() {
    document.getElementById('confirmationModal').classList.add('active');
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.reportGenerator = new ReportGenerator();
  console.log('🚀 Generador de reportes iniciado');
});

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
  const modal = document.getElementById('confirmationModal');
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});