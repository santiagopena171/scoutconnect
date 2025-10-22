// ===== PERFIL DE JUGADOR - JAVASCRIPT COMPLETO =====

class PlayerProfile {
  constructor() {
    this.playerId = null;
    this.playerData = null;
    this.watchlist = this.loadWatchlist();
    this.reports = [];
    this.activeSection = 'overview';
    // NO llamar init() aquí - se llama después de crear la instancia
  }

  async init() {
    console.log('🎯 Iniciando Perfil de Jugador...');
    this.playerId = this.getPlayerIdFromURL();
    
    if (!this.playerId) {
      this.showError();
      return;
    }

    await this.loadPlayerData();
    this.reports = await this.loadReports();
    this.updateCounters();
    this.setupEventListeners();
    // Estado inicial de filtro de reportes: 'mine' para mostrar solo reportes del scout actual
    this.reportsFilter = 'mine';
    // Intentar detectar scout/usuario actual
    this.currentUser = this.loadCurrentUser();
    // Aplicar filtro inicial (actualiza botones y lista)
    this.setReportsFilter(this.reportsFilter);
    console.log('✅ Perfil de Jugador inicializado');
  }

  getPlayerIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  async loadPlayerData() {
    try {
      this.showLoading();
      
      // Simular carga de datos (en implementación real sería una API call)
      const response = await this.fetchPlayerData(this.playerId);
      
      if (!response) {
        this.showError();
        return;
      }

      this.playerData = response;
      this.renderPlayerProfile();
      this.hideLoading();
      
    } catch (error) {
      console.error('Error al cargar datos del jugador:', error);
      this.showError();
    }
  }

  async fetchPlayerData(playerId) {
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
          return {
            id: profile.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.full_name || 'Jugador',
            age: profile.birth_date ? this.calculateAge(profile.birth_date) : null,
            primaryPosition: profile.position || 'No especificado',
            secondaryPosition: profile.secondary_position || '',
            nationality: profile.nationality || 'No especificado',
            club: profile.current_club || 'Sin club',
            league: profile.league || '',
            height: profile.height || 0,
            weight: profile.weight || 0,
            foot: profile.preferred_foot || 'Derecho',
            country: profile.country || profile.nationality || '',
            state: profile.state || '',
            city: profile.city || '',
            birthDate: profile.birth_date || '',
            birthPlace: profile.city ? `${profile.city}, ${profile.country || ''}` : '',
            contract: {
              status: profile.contract_status || 'amateur',
              expires: profile.contract_expiry || '',
              value: profile.market_value || ''
            },
            tags: [],
            skills: {
              technical: {},
              mental: {},
              physical: {}
            },
            careerHistory: [],
            videos: {},
            physicalVideos: {},
            stats: {
              matches: 0,
              goals: 0,
              assists: 0
            },
            bio: profile.bio || '',
            email: profile.email,
            phone: profile.phone
          };
        } else if (error) {
          console.warn('⚠️ Error buscando en Supabase:', error);
        }
      }
      
      // Fallback a datos mock si no se encuentra en Supabase
      console.log('📦 Usando datos mock...');
      return this.getMockPlayerData(playerId);
      
    } catch (error) {
      console.error('❌ Error en fetchPlayerData:', error);
      return this.getMockPlayerData(playerId);
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

  getMockPlayerData(playerId) {
    // Mock data - datos de ejemplo para testing
    const mockPlayers = {
      '1': {
        id: 1,
        name: 'Miguel Rodríguez',
        age: 22,
        primaryPosition: 'Mediocampista Ofensivo',
        secondaryPosition: 'Extremo Derecho',
        nationality: 'Argentina',
        club: 'Club Atlético River',
        league: 'Liga Profesional Argentina',
        height: 180,
        weight: 75,
        foot: 'Derecho',
        country: 'Argentina',
        state: 'Buenos Aires',
        city: 'Buenos Aires',
        birthDate: '2003-04-12',
        birthPlace: 'Buenos Aires, Argentina',
        contract: {
          status: 'professional',
          expires: '2025-12-31',
          value: '2.8M USD'
        },
        tags: ['técnico', 'veloz', 'creativo', 'líder', 'versátil'],
        skills: {
          technical: {
            'Pase': 88,
            'Dribbling': 85,
            'Centros': 82,
            'Finalización': 79,
            'Control': 90
          },
          mental: {
            'Visión': 92,
            'Creatividad': 88,
            'Decisión': 85,
            'Concentración': 82,
            'Liderazgo': 80
          },
          physical: {
            'Velocidad': 85,
            'Aceleración': 87,
            'Agilidad': 89,
            'Resistencia': 83,
            'Salto': 75
          }
        },
        careerHistory: [
          { year: '2024', team: 'Club Atlético River', league: 'Liga Profesional', matches: 28, goals: 6, assists: 9 },
          { year: '2023', team: 'River Plate Reserva', league: 'Reserva', matches: 32, goals: 12, assists: 14 },
          { year: '2022', team: 'River Plate Juveniles', league: 'Juvenil', matches: 25, goals: 8, assists: 11 }
        ],
        videos: {
          'control-pase': 'https://youtube.com/watch?v=example1',
          'vision-juego': 'https://youtube.com/watch?v=example2',
          'remates': 'https://youtube.com/watch?v=example3',
          'regates': '',
          'asistencias': 'https://youtube.com/watch?v=example4'
        },
        physicalVideos: {
          'velocidad': 'https://youtube.com/watch?v=velocidad1',
          'aceleracion': 'https://youtube.com/watch?v=aceleracion1',
          'agilidad': 'https://youtube.com/watch?v=agilidad1',
          'resistencia': '',
          'salto': 'https://youtube.com/watch?v=salto1'
        },
        stats: {
          matches: 28,
          goals: 6,
          assists: 9,
          keyPasses: 52,
          passAccuracy: 87.5
        }
      },
      '2': {
        id: 2,
        name: 'Andrés Silva',
        age: 25,
        primaryPosition: 'Defensa Central',
        secondaryPosition: 'Mediocampista Defensivo',
        nationality: 'Uruguay',
        club: 'Club Nacional',
        league: 'Primera División Uruguay',
        height: 188,
        weight: 82,
        foot: 'Derecho',
        country: 'Uruguay',
        state: 'Montevideo',
        city: 'Montevideo',
        birthDate: '2000-01-15',
        birthPlace: 'Montevideo, Uruguay',
        contract: {
          status: 'professional',
          expires: '2025-06-30',
          value: '1.2M USD'
        },
        tags: ['fuerte', 'aéreo', 'aguerrido', 'experimentado', 'confiable'],
        skills: {
          technical: {
            'Pase': 78,
            'Marcaje': 88,
            'Tackle': 85,
            'Juego Aéreo': 90,
            'Control': 75
          },
          mental: {
            'Concentración': 88,
            'Decisión': 85,
            'Liderazgo': 82,
            'Anticipación': 87,
            'Agresión': 80
          },
          physical: {
            'Fuerza': 89,
            'Salto': 92,
            'Velocidad': 72,
            'Resistencia': 85,
            'Agilidad': 76
          }
        },
        careerHistory: [
          { year: '2024', team: 'Club Nacional', league: 'Primera División Uruguay', matches: 30, goals: 2, assists: 1 },
          { year: '2023', team: 'Club Nacional', league: 'Primera División Uruguay', matches: 28, goals: 3, assists: 0 },
          { year: '2022', team: 'Defensor Sporting', league: 'Primera División Uruguay', matches: 25, goals: 1, assists: 2 }
        ],
        videos: [
          { title: 'Defensa y Liderazgo 2024', description: 'Mejores jugadas defensivas y liderazgo en el campo', url: 'https://youtube.com/watch?v=example3' },
          { title: 'Juego Aéreo', description: 'Dominio en balones aéreos ofensivos y defensivos', url: 'https://youtube.com/watch?v=example4' }
        ],
        stats: {
          matches: 30,
          goals: 2,
          assists: 1,
          tackles: 78,
          interceptios: 45,
          aerialWins: 89
        }
      },
      '3': {
        id: 3,
        name: 'Luis Gómez',
        age: 19,
        primaryPosition: 'Delantero Centro',
        secondaryPosition: 'Segundo Delantero',
        nationality: 'Brasil',
        club: 'Santos FC',
        league: 'Campeonato Brasileiro',
        height: 185,
        weight: 78,
        foot: 'Derecho',
        country: 'Brasil',
        state: 'São Paulo',
        city: 'São Paulo',
        birthDate: '2006-02-28',
        birthPlace: 'São Paulo, Brasil',
        contract: {
          status: 'professional',
          expires: '2025-12-31',
          value: '2.5M USD'
        },
        tags: ['goleador', 'instinto', 'veloz', 'ambicioso', 'joven talento', 'clínico'],
        skills: {
          technical: {
            'Finalización': 88,
            'Dribbling': 82,
            'Control': 85,
            'Pase': 75,
            'Centros': 70
          },
          mental: {
            'Instinto Goleador': 90,
            'Concentración': 80,
            'Decisión': 78,
            'Agresión': 85,
            'Ambición': 92
          },
          physical: {
            'Velocidad': 87,
            'Aceleración': 89,
            'Salto': 82,
            'Resistencia': 80,
            'Fuerza': 75
          }
        },
        careerHistory: [
          { year: '2024', team: 'Santos FC', league: 'Série A', matches: 25, goals: 12, assists: 4 },
          { year: '2023', team: 'Santos Sub-20', league: 'Paulista Sub-20', matches: 30, goals: 22, assists: 8 },
          { year: '2022', team: 'Santos Juvenil', league: 'Juvenil', matches: 28, goals: 18, assists: 5 }
        ],
        videos: [
          { title: 'Goles Espectaculares 2024', description: 'Los mejores goles de la promesa brasileña', url: 'https://youtube.com/watch?v=example5' },
          { title: 'Instinto Goleador', description: 'Análisis de su capacidad para definir', url: 'https://youtube.com/watch?v=example6' }
        ],
        stats: {
          matches: 25,
          goals: 12,
          assists: 4,
          shotsOnTarget: 35,
          conversionRate: 34.3
        }
      },
      '4': {
        id: 4,
        name: 'Carlos Mendoza',
        age: 24,
        primaryPosition: 'Lateral Derecho',
        secondaryPosition: 'Extremo Derecho',
        nationality: 'España',
        club: 'Rayo Vallecano',
        league: 'LaLiga',
        height: 178,
        weight: 72,
        foot: 'Derecho',
        country: 'España',
        state: 'Madrid',
        city: 'Madrid',
        birthDate: '2001-07-10',
        birthPlace: 'Madrid, España',
        contract: {
          status: 'professional',
          expires: '2026-06-30',
          value: '1.8M USD'
        },
        tags: ['veloz', 'ofensivo', 'centros', 'resistente', 'polivalente'],
        skills: {
          technical: {
            'Centros': 86,
            'Pase': 82,
            'Dribbling': 80,
            'Control': 78,
            'Finalización': 68
          },
          mental: {
            'Decisión': 80,
            'Concentración': 78,
            'Visión': 75,
            'Trabajo en Equipo': 88,
            'Disciplina': 85
          },
          physical: {
            'Velocidad': 88,
            'Resistencia': 92,
            'Aceleración': 85,
            'Agilidad': 82,
            'Salto': 76
          }
        },
        careerHistory: [
          { year: '2024', team: 'Rayo Vallecano', league: 'LaLiga', matches: 32, goals: 3, assists: 8 },
          { year: '2023', team: 'Rayo Vallecano B', league: 'Segunda RFEF', matches: 28, goals: 2, assists: 12 },
          { year: '2022', team: 'Getafe Juvenil', league: 'División de Honor', matches: 25, goals: 4, assists: 10 }
        ],
        videos: [
          { title: 'Velocidad por Banda 2024', description: 'Jugadas ofensivas y defensivas por el lateral', url: 'https://youtube.com/watch?v=example7' },
          { title: 'Centros y Asistencias', description: 'Precisión en centros y creación de juego', url: 'https://youtube.com/watch?v=example8' }
        ],
        stats: {
          matches: 32,
          goals: 3,
          assists: 8,
          crosses: 156,
          crossAccuracy: 68.2
        }
      },
      '5': {
        id: 5,
        name: 'Giovanni Rossi',
        age: 27,
        primaryPosition: 'Mediocampista Defensivo',
        secondaryPosition: 'Defensa Central',
        nationality: 'Italia',
        club: 'AC Milan',
        league: 'Serie A',
        height: 182,
        weight: 76,
        foot: 'Ambidiestro',
        country: 'Italia',
        state: 'Lombardía',
        city: 'Milán',
        birthDate: '1998-05-22',
        birthPlace: 'Milán, Italia',
        contract: {
          status: 'professional',
          expires: '2025-06-30',
          value: '4.2M USD'
        },
        tags: ['líder', 'pases largos', 'elegante', 'inteligente', 'ambidiestro', 'experimentado'],
        skills: {
          technical: {
            'Pase': 92,
            'Pases Largos': 94,
            'Control': 88,
            'Tackle': 85,
            'Finalización': 72
          },
          mental: {
            'Liderazgo': 90,
            'Visión': 92,
            'Decisión': 89,
            'Concentración': 87,
            'Inteligencia': 94
          },
          physical: {
            'Resistencia': 85,
            'Fuerza': 82,
            'Velocidad': 76,
            'Agilidad': 80,
            'Salto': 78
          }
        },
        careerHistory: [
          { year: '2024', team: 'AC Milan', league: 'Serie A', matches: 28, goals: 3, assists: 7 },
          { year: '2023', team: 'AC Milan', league: 'Serie A', matches: 35, goals: 2, assists: 9 },
          { year: '2022', team: 'Atalanta', league: 'Serie A', matches: 32, goals: 4, assists: 6 }
        ],
        videos: [
          { title: 'Maestría en el Pase 2024', description: 'Los mejores pases y distribución de Giovanni', url: 'https://youtube.com/watch?v=example9' },
          { title: 'Liderazgo en el Campo', description: 'Análisis de su influencia como capitán', url: 'https://youtube.com/watch?v=example10' }
        ],
        stats: {
          matches: 28,
          goals: 3,
          assists: 7,
          passAccuracy: 91.8,
          longPasses: 245
        }
      }
      // Agregar más jugadores según sea necesario
    };
    
    return mockPlayers[playerId] || null;
  }

  renderPlayerProfile() {
    if (!this.playerData) return;

    this.renderBasicInfo();
    this.renderOverviewSection();
    this.renderPersonalSection();
    this.renderCareerSection();
    this.renderPhysicalSection();
    this.renderVideosSection();
    // NO renderizar reportes en la inicialización - solo cuando se selecciona la pestaña
    // this.renderReportsSection();
    this.updateFollowButton();
  }

  renderBasicInfo() {
    const player = this.playerData;
    
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('playerPosition').textContent = 
      player.secondaryPosition ? 
      `${player.primaryPosition} / ${player.secondaryPosition}` : 
      player.primaryPosition;
    document.getElementById('playerAge').textContent = player.age;
    document.getElementById('playerNationality').textContent = player.nationality;
    document.getElementById('playerClub').textContent = player.club;
    
    document.title = `${player.name} - Perfil de Jugador - ScoutConnect`;
  }

  renderOverviewSection() {
    const player = this.playerData;
    
    // Información básica
    const basicInfoGrid = document.getElementById('basicInfoGrid');
    basicInfoGrid.innerHTML = `
      <div class="info-item">
        <span class="info-label">Edad:</span>
        <span class="info-value">${player.age} años</span>
      </div>
      <div class="info-item">
        <span class="info-label">Altura:</span>
        <span class="info-value">${player.height} cm</span>
      </div>
      <div class="info-item">
        <span class="info-label">Peso:</span>
        <span class="info-value">${player.weight} kg</span>
      </div>
      <div class="info-item">
        <span class="info-label">Pie hábil:</span>
        <span class="info-value">${player.foot}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Liga:</span>
        <span class="info-value">${player.league}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Ubicación:</span>
        <span class="info-value">${player.city}, ${player.state}</span>
      </div>
    `;
    
    // Etiquetas
    const tagsContainer = document.getElementById('playerTags');
    tagsContainer.innerHTML = player.tags.map(tag => 
      `<span class="player-tag">${this.getTagEmoji(tag)} ${tag}</span>`
    ).join('');
    
    // Información del contrato
    const contractInfo = document.getElementById('contractInfo');
    const statusClass = player.contract.status;
    contractInfo.innerHTML = `
      <div class="info-item">
        <span class="info-label">Estado:</span>
        <span class="contract-status ${statusClass}">${this.getContractStatusText(player.contract.status)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Vence:</span>
        <span class="info-value">${new Date(player.contract.expires).toLocaleDateString('es-ES')}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Valor:</span>
        <span class="info-value">${player.contract.value}</span>
      </div>
    `;
  }

  renderPersonalSection() {
    const player = this.playerData;
    
    const personalData = document.getElementById('personalData');
    personalData.innerHTML = `
      <div class="data-item">
        <span class="data-label">Nombre</span>
        <span class="data-value">${player.firstName || player.first_name || player.name.split(' ')[0]}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Apellido</span>
        <span class="data-value">${player.lastName || player.last_name || player.name.split(' ').slice(1).join(' ')}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Fecha de nacimiento</span>
        <span class="data-value">${new Date(player.birthDate).toLocaleDateString('es-ES')}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Lugar de nacimiento</span>
        <span class="data-value">${player.birthPlace}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Nacionalidad principal</span>
        <span class="data-value">${player.nationality}</span>
      </div>
      ${player.secondNationality || player.second_nationality ? `
      <div class="data-item">
        <span class="data-label">Segunda nacionalidad</span>
        <span class="data-value">${player.secondNationality || player.second_nationality}</span>
      </div>` : ''}
      <div class="data-item">
        <span class="data-label">Pie hábil</span>
        <span class="data-value">${player.foot}</span>
      </div>
    `;
    
    const locationData = document.getElementById('locationData');
    locationData.innerHTML = `
      <div class="data-item">
        <span class="data-label">País de residencia</span>
        <span class="data-value">${player.country}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Estado/Provincia</span>
        <span class="data-value">${player.state}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Ciudad</span>
        <span class="data-value">${player.city}</span>
      </div>
    `;
  }

  renderCareerSection() {
    const player = this.playerData;
    
    const currentClubData = document.getElementById('currentClubData');
    currentClubData.innerHTML = `
      <div class="data-item">
        <span class="data-label">Club actual</span>
        <span class="data-value">${player.club}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Liga</span>
        <span class="data-value">${player.league}</span>
      </div>
      <div class="data-item">
        <span class="data-label">Posición principal</span>
        <span class="data-value">${player.primaryPosition}</span>
      </div>
      ${player.secondaryPosition ? `
      <div class="data-item">
        <span class="data-label">Posición secundaria</span>
        <span class="data-value">${player.secondaryPosition}</span>
      </div>
      ` : ''}
    `;
    
    const careerHistory = document.getElementById('careerHistory');
    careerHistory.innerHTML = player.careerHistory.map(season => `
      <div class="timeline-item">
        <div class="timeline-year">${season.year}</div>
        <div class="timeline-content">
          <strong>${season.team}</strong> - ${season.league}<br>
          Partidos: ${season.matches} | Goles: ${season.goals || 0}${season.assists ? ` | Asistencias: ${season.assists}` : ''}
        </div>
      </div>
    `).join('');
  }

  renderPhysicalSection() {
    const player = this.playerData;
    
    const physicalMeasures = document.getElementById('physicalMeasures');
    physicalMeasures.innerHTML = `
      <div class="data-item">
        <span class="data-label">Altura</span>
        <span class="data-value">${player.height} cm</span>
      </div>
      <div class="data-item">
        <span class="data-label">Peso</span>
        <span class="data-value">${player.weight} kg</span>
      </div>
      <div class="data-item">
        <span class="data-label">IMC</span>
        <span class="data-value">${(player.weight / Math.pow(player.height/100, 2)).toFixed(1)}</span>
      </div>
    `;
    
    // Características físicas con videos
    const physicalVideoAttributes = [
      { key: 'velocidad', title: '💨 Velocidad', icon: '💨' },
      { key: 'aceleracion', title: '🚀 Aceleración', icon: '🚀' },
      { key: 'agilidad', title: '🤸 Agilidad', icon: '🤸' },
      { key: 'resistencia', title: '💪 Resistencia', icon: '💪' },
      { key: 'salto', title: '⬆️ Salto', icon: '⬆️' }
    ];
    
    const physicalAttributes = document.getElementById('physicalAttributes');
    physicalAttributes.innerHTML = `
      <div class="physical-videos-grid">
        ${physicalVideoAttributes.map(attr => {
          const hasVideo = player.physicalVideos && player.physicalVideos[attr.key];
          return `
            <div class="physical-video-card ${hasVideo ? 'has-video' : 'no-video'}">
              <div class="physical-icon">${attr.icon}</div>
              <div class="physical-title">${attr.title}</div>
              <div class="physical-video-status">
                ${hasVideo ? 
                  `<a href="${player.physicalVideos[attr.key]}" target="_blank" class="btn-watch-video">
                    <i class="fas fa-play"></i> Ver video
                  </a>` : 
                  `<span class="no-video-label"><i class="fas fa-times"></i> Sin video</span>`
                }
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderVideosSection() {
    const player = this.playerData;
    const videosGrid = document.getElementById('playerVideos');
    
    // Definir las facetas de video según la posición
    const videoFacetsByPosition = {
      'Portero': [
        { key: 'reflejos', title: '🧤 Reflejos y atajadas', icon: '🧤' },
        { key: 'salidas', title: '🏃 Salidas y uno contra uno', icon: '🏃' },
        { key: 'pies', title: '⚽ Juego con los pies', icon: '⚽' },
        { key: 'aereo', title: '🏀 Juego aéreo y despejes', icon: '🏀' },
        { key: 'posicionamiento', title: '📍 Posicionamiento', icon: '📍' }
      ],
      'Defensa Central': [
        { key: 'marcaje', title: '👥 Marcaje y anticipación', icon: '👥' },
        { key: 'aereo', title: '🏀 Juego aéreo', icon: '🏀' },
        { key: 'tackles', title: '💥 Tackles y entradas', icon: '💥' },
        { key: 'pase-salida', title: '📡 Pase de salida', icon: '📡' },
        { key: 'posicionamiento', title: '📍 Posicionamiento', icon: '📍' }
      ],
      'Lateral Derecho': [
        { key: 'velocidad', title: '💨 Velocidad y recuperación', icon: '💨' },
        { key: 'centros', title: '📍 Centros y asistencias', icon: '📍' },
        { key: 'uno-vs-uno-def', title: '🎯 1vs1 defensivo', icon: '🎯' },
        { key: 'cambios-ritmo', title: '🔄 Cambios de ritmo', icon: '🔄' },
        { key: 'trabajo-equipo', title: '🤝 Trabajo con mediocampistas', icon: '🤝' }
      ],
      'Lateral Izquierdo': [
        { key: 'velocidad', title: '💨 Velocidad y recuperación', icon: '💨' },
        { key: 'centros', title: '📍 Centros y asistencias', icon: '📍' },
        { key: 'uno-vs-uno-def', title: '🎯 1vs1 defensivo', icon: '🎯' },
        { key: 'cambios-ritmo', title: '🔄 Cambios de ritmo', icon: '🔄' },
        { key: 'trabajo-equipo', title: '🤝 Trabajo con mediocampistas', icon: '🤝' }
      ],
      'Mediocentro Defensivo': [
        { key: 'recuperaciones', title: '⚙️ Recuperaciones y presión', icon: '⚙️' },
        { key: 'control-pase', title: '🎯 Control y pase', icon: '🎯' },
        { key: 'transiciones', title: '🔄 Transiciones', icon: '🔄' },
        { key: 'marcaje-volante', title: '👥 Marcaje de volantes', icon: '👥' },
        { key: 'pases-largos', title: '📡 Pases largos', icon: '📡' }
      ],
      'Mediocentro': [
        { key: 'control-pase', title: '🎯 Control y pase', icon: '🎯' },
        { key: 'recuperaciones', title: '⚙️ Recuperaciones y presión', icon: '⚙️' },
        { key: 'transiciones', title: '🔄 Transiciones', icon: '🔄' },
        { key: 'vision-juego', title: '👁️ Visión de juego', icon: '👁️' },
        { key: 'conduccion', title: '🎮 Conducción', icon: '🎮' }
      ],
      'Mediocampista Ofensivo': [
        { key: 'control-pase', title: '🎯 Control y pase', icon: '🎯' },
        { key: 'vision-juego', title: '👁️ Visión de juego', icon: '👁️' },
        { key: 'remates', title: '⚽ Remates y goles', icon: '⚽' },
        { key: 'regates', title: '🎪 Regates y dribles', icon: '🎪' },
        { key: 'asistencias', title: '🎁 Asistencias', icon: '🎁' }
      ],
      'Extremo Derecho': [
        { key: 'regates-velocidad', title: '💨 Regates y velocidad', icon: '💨' },
        { key: 'centros-asistencias', title: '📍 Centros y asistencias', icon: '📍' },
        { key: 'definicion', title: '⚡ Definición y remates', icon: '⚡' },
        { key: 'uno-contra-uno', title: '🎯 1vs1 ofensivo', icon: '🎯' },
        { key: 'contraataques', title: '⚡ Contraataques', icon: '⚡' }
      ],
      'Extremo Izquierdo': [
        { key: 'regates-velocidad', title: '💨 Regates y velocidad', icon: '💨' },
        { key: 'centros-asistencias', title: '📍 Centros y asistencias', icon: '📍' },
        { key: 'definicion', title: '⚡ Definición y remates', icon: '⚡' },
        { key: 'uno-contra-uno', title: '🎯 1vs1 ofensivo', icon: '🎯' },
        { key: 'contraataques', title: '⚡ Contraataques', icon: '⚡' }
      ],
      'Delantero Centro': [
        { key: 'definicion-area', title: '⚽ Definición en área', icon: '⚽' },
        { key: 'cabezazos', title: '🏀 Cabezazos y juego aéreo', icon: '🏀' },
        { key: 'movimientos-area', title: '📦 Movimientos en área', icon: '📦' },
        { key: 'control-espaldas', title: '🔄 Control de espaldas', icon: '🔄' },
        { key: 'remates-distancia', title: '🎯 Remates de distancia', icon: '🎯' }
      ]
    };

    // Obtener facetas según la posición principal del jugador
    const facets = videoFacetsByPosition[player.primaryPosition] || [];
    
    if (facets.length > 0) {
      videosGrid.innerHTML = `
        <div class="video-facets-grid">
          ${facets.map(facet => {
            const hasVideo = player.videos && player.videos[facet.key];
            return `
              <div class="video-facet-card ${hasVideo ? 'has-video' : 'no-video'}">
                <div class="facet-icon">${facet.icon}</div>
                <div class="facet-title">${facet.title}</div>
                <div class="facet-status">
                  ${hasVideo ? 
                    `<a href="${player.videos[facet.key]}" target="_blank" class="btn-watch-video">
                      <i class="fas fa-play"></i> Ver video
                    </a>` : 
                    `<span class="no-video-label"><i class="fas fa-times"></i> Sin video</span>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      videosGrid.innerHTML = '<p>No hay facetas de video definidas para esta posición.</p>';
    }
  }

  switchSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.profile-section').forEach(section => {
      section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Actualizar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    this.activeSection = sectionName;

    // Cargar contenido específico de la sección si es necesario
    if (sectionName === 'reports') {
      this.renderReportsSection();
    }
  }

  toggleFollow() {
    const isFollowing = this.watchlist.some(p => p.id == this.playerId);
    
    if (isFollowing) {
      this.removeFromWatchlist();
    } else {
      this.addToWatchlist();
    }
  }

  addToWatchlist() {
    if (!this.playerData) return;
    
    const watchlistPlayer = {
      ...this.playerData,
      addedDate: new Date().toISOString(),
      addedTimestamp: Date.now()
    };
    
    this.watchlist.push(watchlistPlayer);
    this.saveWatchlist();
    this.updateFollowButton();
    this.updateCounters();
    this.showNotification(`${this.playerData.name} agregado a la lista de seguimiento`, 'success');
  }

  removeFromWatchlist() {
    if (!this.playerData) return;
    
    this.watchlist = this.watchlist.filter(p => p.id != this.playerId);
    this.saveWatchlist();
    this.updateFollowButton();
    this.updateCounters();
    this.showNotification(`${this.playerData.name} removido de la lista de seguimiento`, 'info');
  }

  updateFollowButton() {
    const followBtn = document.getElementById('followBtn');
    const isFollowing = this.watchlist.some(p => p.id == this.playerId);
    
    if (isFollowing) {
      followBtn.innerHTML = '<i class="fas fa-star-of-life"></i> Siguiendo';
      followBtn.className = 'btn btn-warning';
    } else {
      followBtn.innerHTML = '<i class="fas fa-star"></i> Seguir';
      followBtn.className = 'btn btn-secondary';
    }
  }

  showReportModal() {
    if (!this.playerData) return;
    
    document.getElementById('reportTitle').value = `Reporte de ${this.playerData.name}`;
    document.getElementById('reportModal').style.display = 'flex';
  }

  closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportForm').reset();
  }

  generateReport(formData) {
    if (!this.playerData) return;
    
    const report = {
      id: Date.now().toString(),
      playerId: this.playerId,
      playerName: this.playerData.name,
      playerPosition: this.playerData.position,
      playerAvatar: this.playerData.avatar || 'imagenes/default-avatar.png',
      title: formData.get('reportTitle'),
      type: formData.get('reportType'),
      priority: formData.get('reportPriority'),
      summary: formData.get('reportNotes') || 'Sin resumen disponible',
      observations: formData.get('reportNotes'),
      recommendedAction: formData.get('recommendedAction'),
      ratings: {
        technical: parseInt(formData.get('technicalRating')) || 5,
        physical: parseInt(formData.get('physicalRating')) || 5,
        mental: parseInt(formData.get('mentalRating')) || 5,
        tactical: parseInt(formData.get('tacticalRating')) || 5
      },
      status: 'completed',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      createdDate: new Date().toISOString(), // Para compatibilidad
      scoutName: (this.currentUser && (this.currentUser.name || this.currentUser.email)) || 'Scout Pro' // En implementación real vendría del usuario actual
    };
    
    this.reports.push(report);
    this.saveReports();
    this.updateCounters();
    this.closeReportModal();
    this.showNotification('Reporte generado exitosamente', 'success');
  }

  showGeneratedReports() {
    this.renderReportsList();
    document.getElementById('reportsModal').style.display = 'flex';
  }

  closeReportsModal() {
    document.getElementById('reportsModal').style.display = 'none';
  }

  renderReportsList() {
    const reportsList = document.getElementById('reportsList');
    
    if (this.reports.length === 0) {
      reportsList.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>No hay reportes generados aún</p>
        </div>
      `;
      return;
    }
    
    reportsList.innerHTML = this.reports
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
      .map(report => `
        <div class="report-item" onclick="playerProfile.viewReport('${report.id}')">
          <div class="report-header">
            <h4 class="report-title">${report.title}</h4>
            <span class="priority-badge priority-${report.priority}">${report.priority}</span>
          </div>
          <div class="report-meta">
            <span><i class="fas fa-user"></i> ${report.playerName}</span>
            <span><i class="fas fa-calendar"></i> ${new Date(report.createdDate).toLocaleDateString('es-ES')}</span>
            <span><i class="fas fa-tag"></i> ${report.type}</span>
          </div>
          <div class="report-preview">
            ${report.notes ? report.notes.substring(0, 150) + (report.notes.length > 150 ? '...' : '') : 'Sin observaciones'}
          </div>
        </div>
      `).join('');
  }

  viewReport(reportId) {
    const report = this.reports.find(r => r.id == reportId);
    if (!report) return;
    
    alert(`Reporte: ${report.title}\n\nJugador: ${report.playerName}\nTipo: ${report.type}\nPrioridad: ${report.priority}\n\nObservaciones:\n${report.notes}\n\nAcción recomendada: ${report.recommendedAction || 'Ninguna'}`);
  }

  setupEventListeners() {
    // Formulario de reporte
    document.getElementById('reportForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      this.generateReport(formData);
    });
    
    // Filtros de reportes
    document.getElementById('reportsSearch').addEventListener('input', () => {
      this.filterReports();
    });
    
    document.getElementById('reportsFilter').addEventListener('change', () => {
      this.filterReports();
    });
  }

  filterReports() {
    // Implementar filtrado de reportes
    this.renderReportsList();
  }

  // Funciones auxiliares
  getTagEmoji(tagName) {
    const tagEmojis = {
      'fuerte': '💪', 'veloz': '⚡', 'resistente': '🏃', 'aéreo': '🦅',
      'ágil': '🤸', 'alto': '📏', 'potente': '🔥', 'técnico': '⚽',
      'driblador': '🎯', 'goleador': '⚽', 'pases largos': '🎯',
      'centros': '📐', 'clínico': '🎯', 'elegante': '✨', 'reflejos': '🧤',
      'líder': '👑', 'inteligente': '🧠', 'creativo': '🎨', 'aguerrido': '⚔️',
      'ambicioso': '🎯', 'disciplinado': '📚', 'confiable': '🛡️', 'instinto': '🔮',
      'polivalente': '🔄', 'ofensivo': '⚔️', 'defensivo': '🛡️', 'posicional': '📍',
      'pressing': '🔥', 'contraataque': '⚡', 'joven talento': '🌟',
      'experimentado': '🏆', 'versátil': '🔧', 'zurdo': '👈', 'ambidiestro': '👐',
      'espectacular': '🎪', 'promesa': '💎'
    };
    return tagEmojis[tagName] || '🏈';
  }

  getContractStatusText(status) {
    const statusTexts = {
      'professional': 'Profesional',
      'semiprofessional': 'Semi-profesional',
      'amateur': 'Amateur',
      'free-agent': 'Agente libre',
      'youth': 'Juvenil'
    };
    return statusTexts[status] || 'No definido';
  }

  getStatLabel(stat) {
    const labels = {
      'matches': 'Partidos',
      'goals': 'Goles',
      'assists': 'Asistencias',
      'cleanSheets': 'Vallas invictas',
      'saves': 'Atajadas',
      'savePercentage': '% Efectividad',
      'goalsAgainst': 'Goles en contra',
      'keyPasses': 'Pases clave',
      'successfulDribbles': 'Regates exitosos'
    };
    return labels[stat] || stat;
  }

  loadWatchlist() {
    try {
      const saved = localStorage.getItem('scoutconnect_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al cargar watchlist:', error);
      return [];
    }
  }

  saveWatchlist() {
    try {
      localStorage.setItem('scoutconnect_watchlist', JSON.stringify(this.watchlist));
    } catch (error) {
      console.error('Error al guardar watchlist:', error);
    }
  }

  async loadReports() {
    try {
      console.log('📊 Cargando reportes del jugador...');
      console.log('   - Player ID:', this.playerId);
      console.log('   - Supabase disponible:', typeof supabase !== 'undefined');
      
      // Intentar cargar desde Supabase primero
      if (typeof supabase !== 'undefined' && this.playerId) {
        const reports = await this.loadReportsFromSupabase();
        console.log('   - Reportes de Supabase:', reports);
        if (reports && reports.length > 0) {
          console.log(`✅ ${reports.length} reportes cargados desde Supabase`);
          return reports;
        } else {
          console.log('   - No hay reportes en Supabase para este jugador');
        }
      }
      
      // Fallback: cargar desde localStorage
      console.log('📦 Cargando reportes desde localStorage...');
      const localReports = localStorage.getItem('generatedReports');
      const allReports = localReports ? JSON.parse(localReports) : [];
      
      // Filtrar solo los reportes de este jugador
      const playerReports = allReports.filter(r => r.playerId == this.playerId);
      console.log(`✅ ${playerReports.length} reportes encontrados en localStorage`);
      
      return playerReports;
    } catch (error) {
      console.error('❌ Error al cargar reportes:', error);
      return [];
    }
  }

  async loadReportsFromSupabase() {
    try {
      console.log('📊 Cargando reportes del jugador desde Supabase...');
      console.log('🎯 Player ID:', this.playerId);

      // Obtener el usuario actual (scout)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.warn('⚠️ No hay usuario autenticado');
        return [];
      }

      console.log('👤 Scout ID:', user.id);

      // La política RLS ya filtra automáticamente por scout_id = auth.uid()
      // Solo necesitamos filtrar por player_id
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('player_id', this.playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('⚠️ Error cargando reportes desde Supabase:', error);
        return [];
      }

      console.log(`✅ ${reports.length} reportes cargados para este jugador (creados por ti)`);

      // Convertir formato de Supabase al formato esperado
      return reports.map(r => ({
        id: r.id,
        playerId: r.player_id,
        playerName: r.player_name,
        playerPosition: r.player_position,
        scoutId: r.scout_id, // ⭐ IMPORTANTE: mapear scout_id para el filtro
        scoutName: 'Scout', // Se podría obtener del profile del scout
        observationDate: r.match_date,
        createdAt: r.created_at,
        ratings: {
          technical: r.technical_rating || 0,
          physical: r.physical_rating || 0,
          mental: r.mental_rating || 0,
          tactical: r.tactical_rating || 0
        },
        overall: r.overall_rating || 0,
        observations: r.detailed_analysis || '',
        recommendation: r.recommendation || 'pending',
        strengths: r.strengths || '',
        weaknesses: r.weaknesses || ''
      }));
    } catch (error) {
      console.error('❌ Error en loadReportsFromSupabase:', error);
      return [];
    }
  }

  loadCurrentUser() {
    try {
      console.log('🔍 Cargando usuario actual...');
      
      // 1. Buscar en localStorage (clave del login)
      const scoutConnectUser = JSON.parse(localStorage.getItem('scoutConnectUser') || 'null');
      if (scoutConnectUser) {
        console.log('✅ Usuario encontrado en scoutConnectUser:', scoutConnectUser);
        return {
          id: scoutConnectUser.userId || scoutConnectUser.id,
          name: scoutConnectUser.fullName || scoutConnectUser.full_name || scoutConnectUser.name || scoutConnectUser.email?.split('@')[0],
          email: scoutConnectUser.email
        };
      }

      // 2. Alternativa: buscar en localStorage del perfil (clave alternativa)
      const userProfile = JSON.parse(localStorage.getItem('scoutconnect_user') || 'null');
      if (userProfile) {
        console.log('✅ Usuario encontrado en scoutconnect_user:', userProfile);
        return {
          id: userProfile.id || userProfile.userId,
          name: userProfile.name || userProfile.fullName || userProfile.email?.split('@')[0],
          email: userProfile.email
        };
      }

      console.warn('⚠️ No se encontró usuario en localStorage');
      console.log('💡 Tip: Inicia sesión o ejecuta en consola: setTestScout("Tu Nombre", "tu@email.com")');
      return null;
    } catch (e) {
      console.error('❌ Error al cargar usuario actual:', e);
      return null;
    }
  }

  getPlayerReports() {
    // Verificar que this.reports sea un array
    if (!Array.isArray(this.reports)) {
      console.warn('⚠️ this.reports no es un array:', this.reports);
      return [];
    }

    let results = this.reports.filter(report => {
      // Buscar por ID (numérico o string) o por nombre de jugador
      return report.playerId == this.playerId || 
             report.playerId === this.playerId.toString() ||
             (this.playerData && report.playerName === this.playerData.name);
    });

    // Si el filtro está en 'mine' y hay un usuario actual, filtrar por scout
    if (this.reportsFilter === 'mine' && this.currentUser) {
      results = results.filter(r => {
        // Comparar por ID, email o nombre
        const matchById = r.scoutId && this.currentUser.id && r.scoutId == this.currentUser.id;
        const matchByEmail = r.scoutEmail && this.currentUser.email && 
                            r.scoutEmail.toLowerCase() === this.currentUser.email.toLowerCase();
        const matchByName = r.scoutName && this.currentUser.name && 
                           r.scoutName.toLowerCase() === this.currentUser.name.toLowerCase();
        
        return matchById || matchByEmail || matchByName;
      });
    }

    // Ordenar por fecha de creación (más reciente primero)
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });

    return results;
  }

  renderReportsSection() {
    console.log('📊 Renderizando sección de reportes...');
    console.log('   - Player ID:', this.playerId);
    console.log('   - this.reports es array?', Array.isArray(this.reports));
    console.log('   - Total reportes cargados:', Array.isArray(this.reports) ? this.reports.length : 'NO ES ARRAY');
    console.log('   - Reportes:', this.reports);
    console.log('   - Usuario actual:', this.currentUser);
    console.log('   - Filtro activo:', this.reportsFilter);
    
    const sectionReports = document.getElementById('section-reports');
    
    // Si ya está renderizado, solo actualizar datos
    if (sectionReports.querySelector('.reports-header')) {
      const playerReports = this.getPlayerReports();
      console.log('   - Reportes del jugador (filtrados):', playerReports.length);
      this.updateReportsStats(playerReports);
      this.renderReportsList(playerReports);
      this.updateReportsCounter();
      return;
    }
    
    // Primera vez: generar TODO el HTML
    sectionReports.innerHTML = `
      <div class="reports-header">
        <h3><i class="fas fa-clipboard-list"></i> Reportes de Scouting</h3>
        <div class="reports-actions">
          <button class="btn btn-primary" onclick="playerProfile.createNewReport()">
            <i class="fas fa-plus"></i> Generar Nuevo Reporte
          </button>
          <button class="btn btn-secondary" onclick="playerProfile.refreshReports()">
            <i class="fas fa-sync-alt"></i> Actualizar
          </button>
        </div>
        <div class="reports-filter" style="margin-left: 16px; display: flex; gap:8px; align-items: center;">
          <label style="font-size:0.9rem; color: #374151;">Ver:</label>
          <div class="filter-buttons">
            <button id="filterAllReports" class="btn btn-outline small" onclick="playerProfile.setReportsFilter('all')">Todos</button>
            <button id="filterMyReports" class="btn btn-outline small active" onclick="playerProfile.setReportsFilter('mine')">Mis reportes</button>
          </div>
        </div>
      </div>

      <div class="reports-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <h4 id="totalReports">0</h4>
            <p>Total de Reportes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-content">
            <h4 id="avgRating">-</h4>
            <p>Rating Promedio</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h4 id="lastReportDate">-</h4>
            <p>Último Reporte</p>
          </div>
        </div>
      </div>

      <div class="reports-container">
        <div class="reports-list" id="playerReportsList">
          <!-- Los reportes se cargarán dinámicamente aquí -->
        </div>
        
        <div class="empty-reports-state" id="emptyReportsState" style="display: none;">
          <div class="empty-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h3>No hay reportes generados</h3>
          <p>Este jugador aún no tiene reportes de scouting. Genera el primer reporte para comenzar el seguimiento profesional.</p>
          <button class="btn btn-primary" onclick="playerProfile.createNewReport()">
            <i class="fas fa-plus"></i> Crear Primer Reporte
          </button>
        </div>
      </div>
    `;
    
    // Ahora renderizar los datos
    const playerReports = this.getPlayerReports();
    console.log('   - Reportes del jugador (primera carga):', playerReports.length);
    this.updateReportsStats(playerReports);
    this.renderReportsList(playerReports);
    this.updateReportsCounter();
  }

  updateReportsStats(reports) {
    const totalReports = reports.length;
    
    // Calcular rating promedio - soportar ambos formatos
    let avgRating = '-';
    if (totalReports > 0) {
      const validRatings = reports
        .map(r => {
          // Intentar obtener overall rating de diferentes formas
          if (r.overallRating) return r.overallRating;
          if (r.overall) return r.overall;
          // Calcular promedio de ratings individuales
          if (r.ratings) {
            const values = Object.values(r.ratings).filter(v => v > 0);
            return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
          }
          return 0;
        })
        .filter(r => r > 0);
      
      if (validRatings.length > 0) {
        avgRating = (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1);
      }
    }
    
    // Obtener última fecha de reporte - soportar diferentes formatos
    let lastReportDate = '-';
    if (totalReports > 0) {
      const validDates = reports
        .map(r => {
          const dateStr = r.observationDate || r.date || r.createdAt;
          return dateStr ? new Date(dateStr) : null;
        })
        .filter(d => d && !isNaN(d.getTime()));
      
      if (validDates.length > 0) {
        lastReportDate = new Date(Math.max(...validDates)).toLocaleDateString('es-ES');
      }
    }

    document.getElementById('totalReports').textContent = totalReports;
    document.getElementById('avgRating').textContent = avgRating !== '-' ? avgRating + '/10' : avgRating;
    document.getElementById('lastReportDate').textContent = lastReportDate;
  }

  renderReportsList(reports) {
    const container = document.getElementById('playerReportsList');
    const emptyState = document.getElementById('emptyReportsState');
    
    if (reports.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    emptyState.style.display = 'none';

    container.innerHTML = reports.map(report => this.createReportCard(report)).join('');
  }

  createReportCard(report) {
    // Extraer ratings - soportar ambos formatos (nuevo y legacy)
    const technical = report.ratings?.technical || report.technicalRating || 0;
    const physical = report.ratings?.physical || report.physicalRating || 0;
    const mental = report.ratings?.mental || report.mentalRating || 0;
    const tactical = report.ratings?.tactical || report.tacticalRating || 0;
    
    const ratings = [
      { label: 'Técnico', value: technical },
      { label: 'Físico', value: physical },
      { label: 'Mental', value: mental },
      { label: 'Táctico', value: tactical }
    ];

    // Extraer fecha - soportar diferentes formatos
    const dateStr = report.observationDate || report.date || report.createdAt;
    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : 'Invalid Date';
    
    // Extraer nombre del scout
    const scoutName = report.scoutName || 'Scout Desconocido';
    
    // Extraer título
    const title = report.title || 'Reporte de Scouting';
    
    // Extraer resumen/observaciones
    const summary = report.summary || report.observations || 'Evaluación completa del rendimiento del jugador en diferentes aspectos técnicos y tácticos.';

    return `
      <div class="report-card" onclick="playerProfile.viewReport('${report.id}')">
        <div class="report-header">
          <h4 class="report-title">${title}</h4>
          <span class="report-date">${displayDate}</span>
        </div>
        
        <div class="report-scout">
          <i class="fas fa-user"></i>
          <span>Scout: ${scoutName}</span>
        </div>

        <div class="report-ratings">
          ${ratings.map(rating => `
            <div class="rating-item">
              <span class="rating-label">${rating.label}</span>
              <div class="rating-value">
                <span>${rating.value}/10</span>
                <div class="rating-bar">
                  <div class="rating-fill ${this.getRatingClass(rating.value)}" 
                       style="width: ${(rating.value / 10) * 100}%"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="report-summary">
          ${summary}
        </div>

        <div class="report-actions">
          <button class="report-btn secondary" onclick="event.stopPropagation(); playerProfile.editReport('${report.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="report-btn primary" onclick="event.stopPropagation(); playerProfile.viewReport('${report.id}')">
            <i class="fas fa-eye"></i> Ver Completo
          </button>
        </div>
      </div>
    `;
  }

  async setReportsFilter(filter) {
    if (filter !== 'all' && filter !== 'mine') return;
    this.reportsFilter = filter;
    // actualizar botones UI
    document.getElementById('filterAllReports')?.classList.toggle('active', filter === 'all');
    document.getElementById('filterMyReports')?.classList.toggle('active', filter === 'mine');
    // recargar y renderizar
    this.reports = await this.loadReports();
    this.renderReportsSection();
  }

  getRatingClass(rating) {
    if (rating >= 8) return 'excellent';
    if (rating >= 6.5) return 'good';
    if (rating >= 5) return 'average';
    if (rating >= 3) return 'poor';
    return 'very-poor';
  }

  updateReportsCounter() {
    const counter = document.getElementById('reportsCount');
    if (counter) {
      const count = this.getPlayerReports().length;
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  createNewReport() {
    // Redirigir a la página de creación de reportes con el jugador preseleccionado
    const reportUrl = `nuevo-reporte.html?playerId=${this.playerId}`;
    window.location.href = reportUrl;
  }

  viewReport(reportId) {
    // Redirigir a la página dedicada de visualización de reporte
    window.location.href = `ver-reporte.html?id=${reportId}`;
  }

  editReport(reportId) {
    // Redirigir a edición con datos precargados
    const reportUrl = `nuevo-reporte.html?editId=${reportId}`;
    window.location.href = reportUrl;
  }

  showReportModal(report) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content report-modal">
        <div class="modal-header">
          <h3>${report.title}</h3>
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="report-details">
            <div class="detail-row">
              <strong>Fecha:</strong> ${new Date(report.date).toLocaleDateString('es-ES')}
            </div>
            <div class="detail-row">
              <strong>Scout:</strong> ${report.scoutName}
            </div>
            <div class="detail-row">
              <strong>Rating General:</strong> ${report.overallRating}/10
            </div>
          </div>
          
          <div class="ratings-breakdown">
            <h4>Evaluaciones Detalladas</h4>
            <div class="rating-category">
              <h5>Técnico (${report.technicalRating}/10)</h5>
              <div class="skills-grid">
                ${report.technicalEvals ? Object.entries(report.technicalEvals).map(([skill, rating]) => 
                  `<div class="skill-item">${skill}: ${rating}/10</div>`
                ).join('') : ''}
              </div>
            </div>
            
            <div class="rating-category">
              <h5>Físico (${report.physicalRating}/10)</h5>
              <div class="skills-grid">
                ${report.physicalEvals ? Object.entries(report.physicalEvals).map(([skill, rating]) => 
                  `<div class="skill-item">${skill}: ${rating}/10</div>`
                ).join('') : ''}
              </div>
            </div>
          </div>

          ${report.summary ? `
            <div class="report-summary-full">
              <h4>Resumen</h4>
              <p>${report.summary}</p>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
            Cerrar
          </button>
          <button class="btn btn-primary" onclick="playerProfile.editReport('${report.id}')">
            Editar Reporte
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
  }

  async refreshReports() {
    console.log('🔄 Actualizando reportes...');
    this.reports = await this.loadReports();
    this.currentUser = this.loadCurrentUser();
    console.log('   - Total reportes cargados:', this.reports.length);
    console.log('   - Usuario actual:', this.currentUser);
    this.renderReportsSection();
    this.showNotification('Reportes actualizados', 'success');
  }

  // Función para generar reportes de ejemplo (solo para desarrollo/demo)
  async generateSampleReports() {
    if (!this.playerData) return;

    const sampleReports = [
      {
        id: 'report_' + Date.now() + '_1',
        playerId: this.playerId,
        playerName: this.playerData.name,
        title: 'Evaluación Técnica Completa',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
        scoutName: 'Carlos Mendoza',
        overallRating: 7.8,
        technicalRating: 8.2,
        physicalRating: 7.5,
        mentalRating: 8.0,
        tacticalRating: 7.5,
        technicalEvals: {
          'Pase Corto': 8,
          'Pase Largo': 7,
          'Control': 9,
          'Dribbling': 8,
          'Finalización': 7
        },
        physicalEvals: {
          'Velocidad': 8,
          'Resistencia': 7,
          'Fuerza': 6,
          'Agilidad': 8,
          'Salto': 7
        },
        mentalEvals: {
          'Concentración': 8,
          'Decisión': 8,
          'Liderazgo': 7,
          'Presión': 8,
          'Creatividad': 9
        },
        tacticalEvals: {
          'Posicionamiento': 8,
          'Visión de Juego': 9,
          'Marcaje': 6,
          'Pressing': 7,
          'Transiciones': 8
        },
        summary: 'Jugador con excelente técnica individual y gran visión de juego. Destaca en la creación de jugadas y tiene buen control del balón. Necesita mejorar aspectos físicos como la fuerza. Muy recomendado para equipos que buscan creatividad en el mediocampo.'
      },
      {
        id: 'report_' + Date.now() + '_2',
        playerId: this.playerId,
        playerName: this.playerData.name,
        title: 'Seguimiento de Rendimiento',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
        scoutName: 'Ana Rodriguez',
        overallRating: 7.3,
        technicalRating: 7.8,
        physicalRating: 7.0,
        mentalRating: 7.5,
        tacticalRating: 7.0,
        technicalEvals: {
          'Pase Corto': 8,
          'Control': 8,
          'Dribbling': 7,
          'Centros': 7,
          'Finalización': 6
        },
        physicalEvals: {
          'Velocidad': 7,
          'Resistencia': 7,
          'Fuerza': 6,
          'Agilidad': 8,
          'Salto': 6
        },
        summary: 'Evolución positiva del jugador en los últimos meses. Muestra consistencia en su rendimiento y ha mejorado la toma de decisiones. Mantiene buen nivel técnico y está adaptándose bien al sistema táctico del equipo.'
      },
      {
        id: 'report_' + Date.now() + '_3',
        playerId: this.playerId,
        playerName: this.playerData.name,
        title: 'Reporte de Match Analysis',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
        scoutName: 'Roberto Silva',
        overallRating: 6.8,
        technicalRating: 7.5,
        physicalRating: 6.5,
        mentalRating: 7.0,
        tacticalRating: 6.5,
        summary: 'Análisis del partido contra Nacional. El jugador mostró buenos destellos técnicos pero necesita ser más consistente durante todo el partido. Buena participación en jugadas ofensivas, aunque debe mejorar la intensidad defensiva.'
      }
    ];

    // Cargar reportes existentes
    let existingReports = [];
    try {
      existingReports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    } catch (error) {
      console.error('Error al cargar reportes existentes:', error);
    }

    // Verificar si ya existen reportes para este jugador
    const playerHasReports = existingReports.some(report => 
      report.playerId == this.playerId || report.playerName === this.playerData.name
    );

    // Solo agregar reportes de ejemplo si no existen
    if (!playerHasReports) {
      existingReports.push(...sampleReports);
      localStorage.setItem('generatedReports', JSON.stringify(existingReports));
      console.log('📊 Reportes de ejemplo generados para', this.playerData.name);
      
      // Recargar reportes
      this.reports = await this.loadReports();
      this.renderReportsSection();
      
      this.showNotification('Reportes de ejemplo cargados para demostración', 'info');
    }
  }

  saveReports() {
    try {
      localStorage.setItem('generatedReports', JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error al guardar reportes:', error);
    }
  }

  updateCounters() {
    // Contador de watchlist
    const watchlistCount = document.getElementById('navWatchlistCount');
    if (watchlistCount) {
      watchlistCount.textContent = this.watchlist.length;
      watchlistCount.style.display = this.watchlist.length > 0 ? 'inline' : 'none';
    }
    
    // Contador de reportes
    const reportsCount = document.getElementById('navReportsCount');
    if (reportsCount) {
      reportsCount.textContent = this.reports.length;
      reportsCount.style.display = this.reports.length > 0 ? 'inline' : 'none';
    }
  }

  showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('playerContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('playerContent').style.display = 'block';
  }

  showError() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('playerContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'flex';
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// =============================================
// FUNCIONES AUXILIARES PARA DESARROLLO
// =============================================

// Función para establecer usuario de prueba (usar en consola del navegador)
function setTestScout(name = 'Scout Profesional', email = 'scout@test.com') {
  const testUser = {
    userId: 'test_scout_' + Date.now(),
    id: 'test_scout_' + Date.now(),
    fullName: name,
    full_name: name,
    name: name,
    email: email,
    userType: 'scout'
  };
  
  // Guardar en ambas claves para máxima compatibilidad
  localStorage.setItem('scoutConnectUser', JSON.stringify(testUser));
  localStorage.setItem('scoutconnect_user', JSON.stringify(testUser));
  
  console.log('✅ Usuario de prueba establecido:', testUser);
  console.log('💾 Guardado en: scoutConnectUser y scoutconnect_user');
  console.log('💡 Recarga la página o ejecuta: playerProfile.refreshReports()');
  return testUser;
}

// Función para ver información de debug de reportes
function debugReports() {
  const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
  
  // Mostrar usuario actual
  const scoutConnectUser = JSON.parse(localStorage.getItem('scoutConnectUser') || 'null');
  const scoutconnect_user = JSON.parse(localStorage.getItem('scoutconnect_user') || 'null');
  
  console.log('👤 Usuario Actual:');
  console.log('   scoutConnectUser:', scoutConnectUser);
  console.log('   scoutconnect_user:', scoutconnect_user);
  console.log('');
  
  console.log('📊 Debug de Reportes:');
  console.log('   Total reportes:', reports.length);
  console.log('   Reportes:', reports);
  console.log('');
  
  if (reports.length > 0) {
    console.log('📋 Desglose por reporte:');
    reports.forEach((r, i) => {
      console.log(`   [${i}] ${r.playerName || 'Sin nombre'}`);
      console.log(`       Scout: ${r.scoutName || 'No especificado'}`);
      console.log(`       Scout ID: ${r.scoutId || 'No especificado'}`);
      console.log(`       Email: ${r.scoutEmail || 'No especificado'}`);
      console.log(`       Fecha: ${r.date || r.createdAt || 'No especificado'}`);
      console.log('');
    });
  }
  
  return reports;
}

// Función para ver quién eres según el sistema
function whoAmI() {
  console.log('🔍 Verificando identidad del usuario...');
  console.log('');
  
  // Verificar scoutConnectUser (clave principal del login)
  const scoutConnectUser = JSON.parse(localStorage.getItem('scoutConnectUser') || 'null');
  console.log('1️⃣ scoutConnectUser (login principal):');
  if (scoutConnectUser) {
    console.log('   ✅ Encontrado');
    console.log('   ID:', scoutConnectUser.userId || scoutConnectUser.id);
    console.log('   Nombre:', scoutConnectUser.fullName || scoutConnectUser.full_name || scoutConnectUser.name);
    console.log('   Email:', scoutConnectUser.email);
  } else {
    console.log('   ❌ No encontrado');
  }
  console.log('');
  
  // Verificar scoutconnect_user (clave alternativa)
  const scoutconnect_user = JSON.parse(localStorage.getItem('scoutconnect_user') || 'null');
  console.log('2️⃣ scoutconnect_user (alternativo):');
  if (scoutconnect_user) {
    console.log('   ✅ Encontrado');
    console.log('   ID:', scoutconnect_user.id || scoutconnect_user.userId);
    console.log('   Nombre:', scoutconnect_user.name || scoutconnect_user.fullName);
    console.log('   Email:', scoutconnect_user.email);
  } else {
    console.log('   ❌ No encontrado');
  }
  console.log('');
  
  // Resumen
  if (scoutConnectUser || scoutconnect_user) {
    const activeUser = scoutConnectUser || scoutconnect_user;
    console.log('✅ RESUMEN: Estás identificado como');
    console.log('   👤', activeUser.fullName || activeUser.full_name || activeUser.name || 'Sin nombre');
    console.log('   📧', activeUser.email || 'Sin email');
    console.log('   🆔', activeUser.userId || activeUser.id || 'Sin ID');
  } else {
    console.log('❌ RESUMEN: No hay usuario identificado');
    console.log('');
    console.log('💡 Soluciones:');
    console.log('   1. Inicia sesión en la aplicación');
    console.log('   2. O ejecuta: setTestScout("Tu Nombre", "tu@email.com")');
  }
  
  return scoutConnectUser || scoutconnect_user;
}

// Exponer funciones globalmente para facilitar el debugging
window.setTestScout = setTestScout;
window.debugReports = debugReports;
window.whoAmI = whoAmI;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM cargado, iniciando Perfil de Jugador...');
  window.playerProfile = new PlayerProfile();
  await window.playerProfile.init();
  console.log('');
  console.log('💡 Funciones de debug disponibles:');
  console.log('   - whoAmI()         → Ver tu identidad actual');
  console.log('   - debugReports()   → Ver todos los reportes');
  console.log('   - setTestScout()   → Establecer usuario de prueba');
});
