// ===== DASHBOARD SCOUT - JAVASCRIPT COMPLETO =====

class ScoutDashboard {
  constructor() {
    this.activeSection = 'dashboard';
    this.players = [];
    this.reports = [];
    this.watchlist = [];
    this.currentUser = {
      id: 'scout1',
      name: 'Carlos Mendoza',
      role: 'Scout Senior - FC Barcelona',
      avatar: 'imagenes/scout-avatar.png'
    };
    
    this.init();
  }

  init() {
    
    this.loadMockData();
    this.loadWatchlistCount();
    this.setupEventListeners();
    this.setupNavigation();
    this.setupAdvancedSearch();
    this.hideAllSectionsExceptDashboard();
    this.updateStats();
    this.initializeRealTimeUpdates();
    this.loadUserProfile();
    
  }

  async loadUserProfile() {
    try {
      // Esperar a que Supabase esté inicializado
      await new Promise(resolve => {
        if (window.supabase) {
          resolve();
        } else {
          const checkSupabase = setInterval(() => {
            if (window.supabase) {
              clearInterval(checkSupabase);
              resolve();
            }
          }, 100);
        }
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          // Actualizar avatar en el navbar
          const profileToggle = document.getElementById('profileToggle');
          if (profileToggle && profile.avatar_url) {
            profileToggle.src = profile.avatar_url;
          }

          // Actualizar nombre si existe
          this.currentUser.name = profile.full_name || profile.email?.split('@')[0] || 'Scout';
          this.currentUser.avatar = profile.avatar_url || 'imagenes/scout-avatar.png';
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  loadMockData() {
    // Datos simulados de jugadores
    this.players = [
      {
        id: 1,
        name: 'Miguel Rodríguez',
        position: 'Mediocampista Ofensivo',
        age: 22,
        location: 'Buenos Aires, ARG',
        country: 'Argentina',
        club: 'Club Atlético River',
        league: 'Liga Profesional Argentina',
        rating: 8.5,
        status: 'recommended',
        avatar: 'imagenes/player1.jpg',
        height: 180,
        weight: 75,
        foot: 'Derecho',
        contract: {
          expires: '2025-12-31',
          value: '2.8M'
        },
        evaluation: {
          technical: 8.5,
          physical: 7.8,
          mental: 8.2,
          tactical: 8.0
        },
        detailedStats: {
          speed: 7.5,
          strength: 7.2,
          finishing: 8.1,
          passing: 9.0,
          crossing: 7.8,
          dribbling: 8.7,
          defending: 6.5,
          heading: 7.0,
          freeKicks: 8.3,
          penalties: 7.5
        },
        videos: {
          'Control de Balón': 'https://youtube.com/watch?v=example1',
          'Visión de Juego': 'https://youtube.com/watch?v=example2',
          'Pases Largos': 'https://youtube.com/watch?v=example3'
        },
        notes: 'Excelente técnica y visión de juego. Recomendado para fichaje inmediato.',
        dateAdded: new Date('2024-10-15'),
        languages: ['Español', 'Inglés'],
        injuries: [],
        marketValue: 2800000
      },
      {
        id: 2,
        name: 'Andrés Silva',
        position: 'Defensa Central',
        age: 25,
        location: 'Montevideo, URU',
        country: 'Uruguay',
        club: 'Club Nacional',
        league: 'Primera División Uruguay',
        rating: 7.2,
        status: 'watching',
        avatar: 'imagenes/player2.jpg',
        height: 188,
        weight: 82,
        foot: 'Derecho',
        contract: {
          expires: '2025-06-30',
          value: '1.2M'
        },
        evaluation: {
          technical: 7.0,
          physical: 8.5,
          mental: 7.5,
          tactical: 7.8
        },
        detailedStats: {
          speed: 6.8,
          strength: 9.0,
          finishing: 5.2,
          passing: 7.5,
          crossing: 6.0,
          dribbling: 6.5,
          defending: 8.8,
          heading: 9.2,
          freeKicks: 6.8,
          penalties: 6.0
        },
        videos: {
          'Marcaje': 'https://youtube.com/watch?v=example4',
          'Anticipación': 'https://youtube.com/watch?v=example5',
          'Salida de Balón': 'https://youtube.com/watch?v=example6'
        },
        notes: 'Buen defensor físico, necesita mejorar técnica.',
        dateAdded: new Date('2024-10-14'),
        languages: ['Español', 'Portugués'],
        injuries: [{ type: 'Contusión', date: '2024-09-20', duration: '1 semana' }],
        marketValue: 1200000
      },
      {
        id: 3,
        name: 'Luis Gómez',
        position: 'Delantero Centro',
        age: 19,
        location: 'São Paulo, BRA',
        country: 'Brasil',
        club: 'Santos FC',
        league: 'Campeonato Brasileiro',
        rating: 9.1,
        status: 'priority',
        avatar: 'imagenes/player3.jpg',
        height: 185,
        weight: 78,
        foot: 'Derecho',
        contract: {
          expires: '2025-12-31',
          value: '2.5M'
        },
        evaluation: {
          technical: 9.0,
          physical: 8.0,
          mental: 8.5,
          tactical: 8.8
        },
        detailedStats: {
          speed: 8.7,
          strength: 7.5,
          finishing: 9.2,
          passing: 7.8,
          crossing: 6.5,
          dribbling: 8.9,
          defending: 4.2,
          heading: 8.3,
          freeKicks: 7.1,
          penalties: 8.8
        },
        videos: {
          'Definición': 'https://youtube.com/watch?v=example7',
          'Desmarque': 'https://youtube.com/watch?v=example8',
          'Presión': 'https://youtube.com/watch?v=example9'
        },
        notes: 'Talento excepcional. Fichar urgentemente.',
        dateAdded: new Date('2024-10-16'),
        languages: ['Portugués', 'Español'],
        injuries: [],
        marketValue: 3000000
      },
      {
        id: 4,
        name: 'Carlos Mendoza',
        position: 'Lateral Derecho',
        age: 24,
        location: 'Madrid, ESP',
        country: 'España',
        club: 'Rayo Vallecano',
        league: 'LaLiga',
        rating: 7.8,
        status: 'watching',
        avatar: 'imagenes/player4.jpg',
        height: 178,
        weight: 72,
        foot: 'Derecho',
        contract: {
          expires: '2026-06-30',
          value: '1.8M'
        },
        evaluation: {
          technical: 7.5,
          physical: 8.2,
          mental: 7.0,
          tactical: 8.1
        },
        detailedStats: {
          speed: 9.0,
          strength: 7.2,
          finishing: 5.5,
          passing: 8.1,
          crossing: 8.5,
          dribbling: 7.8,
          defending: 8.0,
          heading: 6.8,
          freeKicks: 6.2,
          penalties: 5.0
        },
        videos: {
          'Velocidad': 'https://youtube.com/watch?v=example10',
          'Centros': 'https://youtube.com/watch?v=example11',
          'Defensa': 'https://youtube.com/watch?v=example12'
        },
        notes: 'Muy veloz por la banda. Buena proyección ofensiva.',
        dateAdded: new Date('2024-10-14'),
        languages: ['Español', 'Inglés'],
        injuries: [{ type: 'Lesión muscular', date: '2024-08-15', duration: '3 semanas' }],
        marketValue: 1500000
      },
      {
        id: 5,
        name: 'Giovanni Rossi',
        position: 'Mediocampista Defensivo',
        age: 27,
        location: 'Milán, ITA',
        country: 'Italia',
        club: 'AC Milan',
        league: 'Serie A',
        rating: 8.7,
        status: 'recommended',
        avatar: 'imagenes/player5.jpg',
        height: 182,
        weight: 76,
        foot: 'Ambidiestro',
        contract: {
          expires: '2025-06-30',
          value: '4.2M'
        },
        evaluation: {
          technical: 8.8,
          physical: 8.0,
          mental: 9.2,
          tactical: 9.0
        },
        detailedStats: {
          speed: 7.0,
          strength: 8.5,
          finishing: 6.8,
          passing: 9.1,
          crossing: 7.2,
          dribbling: 8.0,
          defending: 9.0,
          heading: 8.2,
          freeKicks: 8.5,
          penalties: 7.8
        },
        videos: {
          'Recuperación': 'https://youtube.com/watch?v=example13',
          'Pase Largo': 'https://youtube.com/watch?v=example14',
          'Liderazgo': 'https://youtube.com/watch?v=example15'
        },
        notes: 'Líder natural. Excelente distribución de balón.',
        dateAdded: new Date('2024-10-13'),
        languages: ['Italiano', 'Español', 'Inglés'],
        injuries: [],
        marketValue: 8500000
      },
      {
        id: 6,
        name: 'Jamal Thompson',
        position: 'Extremo Izquierdo',
        age: 20,
        location: 'Londres, ENG',
        country: 'Inglaterra',
        club: 'Crystal Palace',
        league: 'Premier League',
        rating: 8.2,
        status: 'priority',
        avatar: 'imagenes/player6.jpg',
        height: 175,
        weight: 68,
        foot: 'Izquierdo',
        contract: {
          expires: '2027-05-31',
          value: '3.1M'
        },
        evaluation: {
          technical: 8.9,
          physical: 8.3,
          mental: 7.5,
          tactical: 7.8
        },
        detailedStats: {
          speed: 9.5,
          strength: 6.8,
          finishing: 7.9,
          passing: 8.2,
          crossing: 8.8,
          dribbling: 9.3,
          defending: 5.2,
          heading: 6.0,
          freeKicks: 7.5,
          penalties: 6.8
        },
        videos: {
          'Regates': 'https://youtube.com/watch?v=example16',
          'Velocidad': 'https://youtube.com/watch?v=example17',
          'Asistencias': 'https://youtube.com/watch?v=example18'
        },
        notes: 'Extremo muy prometedor. Gran potencial de crecimiento.',
        dateAdded: new Date('2024-10-12'),
        languages: ['Inglés', 'Francés'],
        injuries: [],
        marketValue: 4200000
      }
    ];

    // Datos simulados de reportes
    this.reports = [
      {
        id: 1,
        playerId: 1,
        playerName: 'Miguel Rodríguez',
        status: 'completed',
        date: new Date('2024-10-16T10:30:00'),
        recommendation: 'recommend',
        rating: 8.5
      },
      {
        id: 2,
        playerId: 2,
        playerName: 'Andrés Silva',
        status: 'completed',
        date: new Date('2024-10-15T14:20:00'),
        recommendation: 'follow',
        rating: 7.2
      }
    ];

    // Calendario de actividades
    this.activities = [
      {
        id: 1,
        type: 'evaluation',
        title: 'Evaluación en vivo',
        description: 'Partido Juventud vs. Central',
        date: new Date('2024-10-16T14:00:00'),
        location: 'Estadio Municipal',
        urgent: true
      },
      {
        id: 2,
        type: 'meeting',
        title: 'Reunión con representante',
        description: 'Discutir contrato de Pedro López',
        date: new Date('2024-10-17T10:30:00'),
        location: 'Oficinas del club',
        urgent: false
      }
    ];
  }

  setupEventListeners() {
    // Dropdown del perfil
    const profileToggle = document.getElementById('profileToggle');
    const profileMenu = document.getElementById('profileMenu');
    
    if (profileToggle && profileMenu) {
      profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        profileMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        profileMenu.classList.remove('show');
      });
    }

    // Botones de acción del header
    const newReportBtn = document.getElementById('newReportBtn');
    if (newReportBtn) {
      newReportBtn.addEventListener('click', () => {
        window.location.href = 'nuevo-reporte.html';
      });
    }

    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportData());
    }

    // Filtros de jugadores
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        filterChips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.filterPlayers(e.target.dataset.filter);
      });
    });

    // Acciones de jugadores
    this.setupPlayerActions();

    // Búsqueda global
    const globalSearch = document.querySelector('.global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        this.globalSearch(e.target.value);
      });
    }

    // Filtros de búsqueda avanzada
    this.setupAdvancedSearch();

    // Slider de rating
    const ratingSlider = document.getElementById('ratingSlider');
    const sliderValue = document.querySelector('.slider-value');
    
    if (ratingSlider && sliderValue) {
      ratingSlider.addEventListener('input', (e) => {
        sliderValue.textContent = parseFloat(e.target.value).toFixed(1);
      });
    }
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const sections = document.querySelectorAll('.content-section, .section');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;
        
        // Actualizar navegación activa
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Mostrar sección correspondiente
        sections.forEach(section => {
          section.style.display = 'none';
          section.classList.remove('active');
          if (section.id === sectionId) {
            section.style.display = 'block';
            section.classList.add('active');
          }
        });
        
        this.activeSection = sectionId;
        this.loadSectionContent(sectionId);
      });
    });
  }

  loadSectionContent(sectionId) {
    switch(sectionId) {
      case 'players':
        this.renderPlayers();
        break;
      case 'search':
        this.setupAdvancedSearch();
        break;
      case 'reports':
        this.renderReports();
        break;
      case 'watchlist':
        this.renderWatchlist();
        break;
      case 'calendar':
        this.renderCalendar();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
      case 'comparisons':
        this.renderComparisons();
        break;
      case 'team':
        this.renderTeam();
        break;
      case 'notifications':
        this.renderNotifications();
        break;
      case 'advanced-search':
        this.loadAdvancedSearchSection();
        break;
      default:
        this.renderDashboard();
    }
  }

  renderPlayers() {
    const playersGrid = document.querySelector('.players-grid');
    if (!playersGrid) return;

    playersGrid.innerHTML = '';

    this.players.forEach(player => {
      const playerCard = this.createPlayerCard(player);
      playersGrid.appendChild(playerCard);
    });
  }

  createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = `player-card ${player.status}`;
    card.dataset.playerId = player.id;

    const statusBadges = {
      'recommended': '<span class="badge recommended">Recomendado</span>',
      'watching': '<span class="badge watching">En Seguimiento</span>',
      'priority': '<span class="badge priority">Prioridad Alta</span><span class="badge talent">Talento</span>',
      'evaluated': '<span class="badge evaluated">Evaluado</span>'
    };

    const ratingClass = player.rating >= 8.5 ? 'excellent' : player.rating >= 7 ? 'good' : 'average';

    card.innerHTML = `
      <div class="player-header">
        <img src="${player.avatar}" alt="${player.name}" class="player-photo">
        <div class="player-badges">
          ${statusBadges[player.status] || ''}
        </div>
      </div>
      <div class="player-info">
        <h3>${player.name}</h3>
        <p class="player-position">${player.position}</p>
        <div class="player-details">
          <span><i class="fas fa-birthday-cake"></i> ${player.age} años</span>
          <span><i class="fas fa-map-marker-alt"></i> ${player.location}</span>
          <span><i class="fas fa-futbol"></i> ${player.club}</span>
        </div>
        <div class="player-rating">
          <span class="rating-label">Evaluación:</span>
          <span class="rating-value ${ratingClass}">${player.rating}</span>
        </div>
      </div>
      <div class="player-actions">
        <button class="btn-action view" title="Ver Perfil" onclick="scoutDashboard.viewPlayerProfile(${player.id})">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-action star ${player.status === 'priority' ? 'active' : ''}" title="Favorito" onclick="scoutDashboard.toggleFavorite(${player.id})">
          <i class="fas fa-star"></i>
        </button>
      </div>
    `;

    return card;
  }

  setupPlayerActions() {
    // Las acciones se manejan mediante onclick en los botones generados
  }

  viewPlayerProfile(playerId) {
    // Redirigir a la página de perfil del jugador
    window.location.href = `perfil-jugador.html?id=${playerId}`;
  }

  showPlayerProfileModal(player) {
    const modalOverlay = document.getElementById('modalOverlay');
    
    const modalHTML = `
      <div class="modal player-profile-modal">
        <div class="modal-header">
          <h2><i class="fas fa-user"></i> Perfil del Jugador</h2>
          <button class="modal-close" onclick="scoutDashboard.closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="player-profile-grid">
            <div class="profile-sidebar">
              <img src="${player.avatar}" alt="${player.name}" class="profile-photo">
              <h3>${player.name}</h3>
              <p class="profile-position">${player.position}</p>
              <div class="profile-rating">
                <span class="rating-large ${player.rating >= 8.5 ? 'excellent' : 'good'}">${player.rating}</span>
                <span class="rating-label">Evaluación General</span>
              </div>
              <div class="profile-info">
                <div class="info-item">
                  <i class="fas fa-birthday-cake"></i>
                  <span>${player.age} años</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${player.location}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-futbol"></i>
                  <span>${player.club}</span>
                </div>
              </div>
            </div>
            
            <div class="profile-content">
              <div class="evaluation-section">
                <h4><i class="fas fa-chart-radar"></i> Evaluación Técnica</h4>
                <div class="skills-grid">
                  <div class="skill-item">
                    <span class="skill-name">Técnica</span>
                    <div class="skill-bar">
                      <div class="skill-progress" style="width: ${player.evaluation.technical * 10}%"></div>
                    </div>
                    <span class="skill-value">${player.evaluation.technical}</span>
                  </div>
                  <div class="skill-item">
                    <span class="skill-name">Físico</span>
                    <div class="skill-bar">
                      <div class="skill-progress" style="width: ${player.evaluation.physical * 10}%"></div>
                    </div>
                    <span class="skill-value">${player.evaluation.physical}</span>
                  </div>
                  <div class="skill-item">
                    <span class="skill-name">Mental</span>
                    <div class="skill-bar">
                      <div class="skill-progress" style="width: ${player.evaluation.mental * 10}%"></div>
                    </div>
                    <span class="skill-value">${player.evaluation.mental}</span>
                  </div>
                  <div class="skill-item">
                    <span class="skill-name">Táctico</span>
                    <div class="skill-bar">
                      <div class="skill-progress" style="width: ${player.evaluation.tactical * 10}%"></div>
                    </div>
                    <span class="skill-value">${player.evaluation.tactical}</span>
                  </div>
                </div>
              </div>
              
              <div class="videos-section">
                <h4><i class="fas fa-video"></i> Videos de Evaluación</h4>
                <div class="videos-grid">
                  ${Object.entries(player.videos).map(([skill, url]) => `
                    <div class="video-item">
                      <i class="fas fa-play-circle"></i>
                      <span>${skill}</span>
                      <a href="${url}" target="_blank" class="video-link">Ver Video</a>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="notes-section">
                <h4><i class="fas fa-sticky-note"></i> Notas del Scout</h4>
                <div class="notes-content">
                  <p>${player.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="scoutDashboard.closeModal()">Cerrar</button>
          <button class="btn btn-primary" onclick="scoutDashboard.createReport(${player.id})">
            <i class="fas fa-clipboard"></i> Nuevo Reporte
          </button>
        </div>
      </div>
    `;
    
    modalOverlay.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  editPlayer(playerId) {
    
    // Implementar modal de edición
  }

  toggleFavorite(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    // Toggle el estado de prioridad
    const wasPriority = player.status === 'priority';
    player.status = wasPriority ? 'evaluated' : 'priority';

    // Cargar la lista de seguimiento actual
    let watchlist = [];
    try {
      const saved = localStorage.getItem('scoutconnect_watchlist');
      watchlist = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al cargar watchlist:', error);
      watchlist = [];
    }

    if (wasPriority) {
      // Remover de la lista de seguimiento
      watchlist = watchlist.filter(p => p.id != playerId);
      localStorage.setItem('scoutconnect_watchlist', JSON.stringify(watchlist));
      this.showNotification('Jugador removido de la lista de seguimiento', 'info');
    } else {
      // Agregar a la lista de seguimiento si no está ya
      const isInWatchlist = watchlist.some(p => p.id == playerId);
      
      if (!isInWatchlist) {
        const watchlistPlayer = {
          ...player,
          addedDate: new Date().toISOString(),
          addedTimestamp: Date.now()
        };
        watchlist.push(watchlistPlayer);
        localStorage.setItem('scoutconnect_watchlist', JSON.stringify(watchlist));
        this.showNotification(`${player.name} agregado a la lista de seguimiento ⭐`, 'success');
      } else {
        this.showNotification(`${player.name} ya está en la lista de seguimiento`, 'info');
      }
    }

    this.renderPlayers();
    this.updateStats();
  }

  createReport(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    this.showNewReportModal(player);
  }

  showNewReportModal(player = null) {
    const modalOverlay = document.getElementById('modalOverlay');
    
    const positions = {
      'Portero': ['Atajadas', 'Salidas', 'Distribución', 'Penales'],
      'Defensa Central': ['Marcaje', 'Anticipación', 'Salida de Balón', 'Duelos Aéreos'],
      'Defensa Lateral': ['Marcaje', 'Proyección', 'Centros', 'Velocidad'],
      'Mediocampista': ['Pases', 'Recuperación', 'Visión', 'Llegada al Área'],
      'Mediocampista Ofensivo': ['Pases', 'Creatividad', 'Finalización', 'Regate'],
      'Delantero Centro': ['Definición', 'Control', 'Presión', 'Desmarque', 'Cabeceo']
    };

    const modalHTML = `
      <div class="modal new-report-modal">
        <div class="modal-header">
          <h2><i class="fas fa-clipboard-list"></i> ${player ? 'Nuevo Reporte - ' + player.name : 'Nuevo Reporte'}</h2>
          <button class="modal-close" onclick="scoutDashboard.closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <form class="report-form" onsubmit="scoutDashboard.submitReport(event)">
            ${!player ? `
              <div class="form-group">
                <label for="playerSelect">Seleccionar Jugador</label>
                <select id="playerSelect" class="form-select" required>
                  <option value="">Selecciona un jugador...</option>
                  ${this.players.map(p => `<option value="${p.id}">${p.name} - ${p.position}</option>`).join('')}
                </select>
              </div>
            ` : `
              <input type="hidden" id="playerId" value="${player.id}">
            `}
            
            <div class="form-group">
              <label for="reportDate">Fecha de Evaluación</label>
              <input type="date" id="reportDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <div class="form-group">
              <label for="matchType">Tipo de Evaluación</label>
              <select id="matchType" class="form-select" required>
                <option value="match">Partido Oficial</option>
                <option value="training">Entrenamiento</option>
                <option value="trial">Prueba</option>
                <option value="friendly">Amistoso</option>
              </select>
            </div>

            <div class="evaluation-grid">
              <h4>Evaluación por Categorías</h4>
              
              <div class="category-section">
                <h5><i class="fas fa-cog"></i> Habilidades Técnicas</h5>
                <div class="rating-group">
                  <label>Técnica Individual</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="technical">
                  <span class="rating-display">5.0</span>
                </div>
                <div class="rating-group">
                  <label>Habilidad con Balón</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="ballSkill">
                  <span class="rating-display">5.0</span>
                </div>
              </div>

              <div class="category-section">
                <h5><i class="fas fa-dumbbell"></i> Aspectos Físicos</h5>
                <div class="rating-group">
                  <label>Velocidad</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="speed">
                  <span class="rating-display">5.0</span>
                </div>
                <div class="rating-group">
                  <label>Resistencia</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="stamina">
                  <span class="rating-display">5.0</span>
                </div>
                <div class="rating-group">
                  <label>Fuerza</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="strength">
                  <span class="rating-display">5.0</span>
                </div>
              </div>

              <div class="category-section">
                <h5><i class="fas fa-brain"></i> Aspectos Mentales</h5>
                <div class="rating-group">
                  <label>Concentración</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="concentration">
                  <span class="rating-display">5.0</span>
                </div>
                <div class="rating-group">
                  <label>Toma de Decisiones</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="decisions">
                  <span class="rating-display">5.0</span>
                </div>
              </div>

              <div class="category-section">
                <h5><i class="fas fa-chess"></i> Aspectos Tácticos</h5>
                <div class="rating-group">
                  <label>Posicionamiento</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="positioning">
                  <span class="rating-display">5.0</span>
                </div>
                <div class="rating-group">
                  <label>Visión de Juego</label>
                  <input type="range" min="1" max="10" step="0.1" value="5" class="rating-slider" id="vision">
                  <span class="rating-display">5.0</span>
                </div>
              </div>
            </div>

            <div class="videos-section">
              <h4><i class="fas fa-video"></i> Videos por Posición</h4>
              <p class="section-description">Agrega enlaces de YouTube que muestren las habilidades específicas de la posición</p>
              
              ${player ? `
                <div class="position-videos">
                  <h5>${player.position} - Videos Requeridos:</h5>
                  ${positions[player.position] ? positions[player.position].map(skill => `
                    <div class="video-input-group">
                      <label>${skill}</label>
                      <input type="url" class="form-input" placeholder="https://youtube.com/watch?v=..." name="video_${skill.toLowerCase().replace(' ', '_')}">
                    </div>
                  `).join('') : ''}
                </div>
              ` : `
                <div class="video-input-group">
                  <label>Video Principal</label>
                  <input type="url" class="form-input" placeholder="https://youtube.com/watch?v=..." name="video_main">
                </div>
              `}
            </div>

            <div class="form-group">
              <label for="reportNotes">Notas y Observaciones</label>
              <textarea id="reportNotes" class="form-textarea" rows="4" placeholder="Describe fortalezas, debilidades y recomendaciones específicas..."></textarea>
            </div>

            <div class="form-group">
              <label for="recommendation">Recomendación Final</label>
              <select id="recommendation" class="form-select" required>
                <option value="">Selecciona una recomendación...</option>
                <option value="sign">Fichar Inmediatamente</option>
                <option value="recommend">Recomendar para Fichaje</option>
                <option value="follow">Continuar Seguimiento</option>
                <option value="trial">Invitar a Prueba</option>
                <option value="discard">Descartar</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="scoutDashboard.closeModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="document.querySelector('.report-form').requestSubmit()">
            <i class="fas fa-save"></i> Guardar Reporte
          </button>
        </div>
      </div>
    `;
    
    modalOverlay.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Setup rating sliders
    this.setupRatingSliders();
  }

  setupRatingSliders() {
    const sliders = document.querySelectorAll('.rating-slider');
    sliders.forEach(slider => {
      const display = slider.nextElementSibling;
      
      slider.addEventListener('input', (e) => {
        display.textContent = parseFloat(e.target.value).toFixed(1);
      });
    });
  }

  submitReport(event) {
    event.preventDefault();
    
    // Aquí procesarías los datos del formulario
    
    
    // Simular guardado
    setTimeout(() => {
      this.closeModal();
      this.showSuccessMessage('Reporte guardado exitosamente');
      this.updateStats();
    }, 1000);
  }

  closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.style.display = 'none';
    modalOverlay.innerHTML = '';
    document.body.style.overflow = 'auto';
  }

  showSuccessMessage(message) {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  filterPlayers(filter) {
    // Implementar filtrado de jugadores
    
  }

  globalSearch(query) {
    // Implementar búsqueda global
    
  }

  setupAdvancedSearch() {
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => this.applyAdvancedFilters());
    }

    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => this.resetAdvancedFilters());
    }
  }

  applyAdvancedFilters() {
    
    // Implementar lógica de filtros
  }

  resetAdvancedFilters() {
    
    // Implementar reset de filtros
  }

  exportData() {
    
    // Implementar exportación
  }

  updateStats() {
    // Actualizar estadísticas del dashboard
    const stats = {
      totalPlayers: this.players.length,
      completedReports: this.reports.filter(r => r.status === 'completed').length,
      pendingEvaluations: 12, // Simulado
      recommended: this.players.filter(p => p.status === 'recommended' || p.status === 'priority').length
    };

    // Actualizar valores en las tarjetas de estadísticas
    document.querySelectorAll('.stat-content h3').forEach((element, index) => {
      const values = [stats.totalPlayers, stats.completedReports, stats.pendingEvaluations, stats.recommended];
      if (values[index] !== undefined) {
        element.textContent = values[index];
      }
    });
  }

  renderDashboard() {
    this.updateStats();
    // Renderizar contenido específico del dashboard principal
  }

  renderReports() {
    
    this.loadGeneratedReports();
  }

  async loadGeneratedReports() {
    
    
    try {
      // Obtener el usuario actual autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Error obteniendo usuario:', authError);
        this.updateReportsStats([]);
        this.renderReportsList([]);
        return;
      }

      

      // Cargar reportes del scout desde Supabase
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('scout_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando reportes desde Supabase:', error);
        this.updateReportsStats([]);
        this.renderReportsList([]);
        return;
      }

      

      // Convertir formato de Supabase al formato esperado por el dashboard
      const formattedReports = reports.map(r => ({
        id: r.id,
        playerId: r.player_id,
        playerName: r.player_name,
        playerPosition: r.player_position,
        observationDate: r.match_date,
        createdAt: r.created_at,
        ratings: {
          technical: r.technical_rating || 0,
          physical: r.physical_rating || 0,
          mental: r.mental_rating || 0,
          tactical: r.tactical_rating || 0
        },
        overall: r.overall_rating || 0,
        recommendation: r.recommendation || 'pending',
        status: 'completed', // Todos los reportes guardados están completados
        isFavorite: false
      }));

      // Actualizar estadísticas
      this.updateReportsStats(formattedReports);
      
      // Renderizar lista de reportes
      this.renderReportsList(formattedReports);
      
    } catch (error) {
      console.error('❌ Error en loadGeneratedReports:', error);
      this.updateReportsStats([]);
      this.renderReportsList([]);
    }
  }

  updateReportsStats(reports) {
    const totalCount = reports.length;
    const pendingCount = reports.filter(r => r.status === 'pending').length;
    const completedCount = reports.filter(r => r.status === 'completed').length;
    const favoriteCount = reports.filter(r => r.isFavorite).length;

    document.getElementById('totalReportsCount').textContent = totalCount;
    document.getElementById('pendingReportsCount').textContent = pendingCount;
    document.getElementById('completedReportsCount').textContent = completedCount;
    document.getElementById('favoriteReportsCount').textContent = favoriteCount;
  }

  renderReportsList(reports) {
    const reportsGrid = document.getElementById('reportsGrid');
    const emptyState = document.getElementById('emptyReportsState');

    if (reports.length === 0) {
      reportsGrid.style.display = 'none';
      emptyState.style.display = 'flex';
      return;
    }

    reportsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Ordenar reportes por fecha (más recientes primero)
    const sortedReports = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    reportsGrid.innerHTML = sortedReports.map(report => `
      <div class="report-card ${report.status}" data-report-id="${report.id}">
        <div class="report-header">
          <div class="report-player">
            <img src="${report.playerAvatar || 'imagenes/default-avatar.png'}" alt="${report.playerName}" class="player-avatar">
            <div class="player-info">
              <h4>${report.playerName}</h4>
              <span class="player-position">${report.playerPosition || 'N/A'}</span>
            </div>
          </div>
          <div class="report-actions">
            <button class="btn-icon ${report.isFavorite ? 'active' : ''}" onclick="dashboard.toggleReportFavorite('${report.id}')" title="Marcar como favorito">
              <i class="fas fa-star"></i>
            </button>
            <div class="dropdown">
              <button class="btn-icon dropdown-toggle">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div class="dropdown-menu">
                <a href="#" onclick="dashboard.viewReport('${report.id}')" class="dropdown-item">
                  <i class="fas fa-eye"></i> Ver reporte
                </a>
                <a href="#" onclick="dashboard.editReport('${report.id}')" class="dropdown-item">
                  <i class="fas fa-edit"></i> Editar
                </a>
                <a href="#" onclick="dashboard.shareReport('${report.id}')" class="dropdown-item">
                  <i class="fas fa-share"></i> Compartir
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" onclick="dashboard.deleteReport('${report.id}')" class="dropdown-item text-danger">
                  <i class="fas fa-trash"></i> Eliminar
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="report-content">
          <div class="report-meta">
            <span class="report-date">
              <i class="fas fa-calendar"></i>
              ${new Date(report.createdAt).toLocaleDateString('es-ES')}
            </span>
            <span class="report-status status-${report.status}">
              ${this.getStatusText(report.status)}
            </span>
          </div>
          
          <div class="report-summary">
            <h5>Resumen del Reporte</h5>
            <p>${report.summary || 'Sin resumen disponible'}</p>
          </div>
          
          <div class="report-ratings">
            <div class="rating-item">
              <span>Técnica</span>
              <div class="rating-bar">
                <div class="rating-fill" style="width: ${(report.ratings?.technical || 0) * 10}%"></div>
              </div>
              <span class="rating-value">${report.ratings?.technical || 'N/A'}</span>
            </div>
            <div class="rating-item">
              <span>Física</span>
              <div class="rating-bar">
                <div class="rating-fill" style="width: ${(report.ratings?.physical || 0) * 10}%"></div>
              </div>
              <span class="rating-value">${report.ratings?.physical || 'N/A'}</span>
            </div>
            <div class="rating-item">
              <span>Mental</span>
              <div class="rating-bar">
                <div class="rating-fill" style="width: ${(report.ratings?.mental || 0) * 10}%"></div>
              </div>
              <span class="rating-value">${report.ratings?.mental || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div class="report-footer">
          <button class="btn btn-primary btn-sm" onclick="dashboard.viewReport('${report.id}')">
            <i class="fas fa-eye"></i> Ver Completo
          </button>
          <button class="btn btn-secondary btn-sm" onclick="dashboard.downloadReport('${report.id}')">
            <i class="fas fa-download"></i> Descargar
          </button>
        </div>
      </div>
    `).join('');
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'completed': 'Completado',
      'draft': 'Borrador',
      'reviewed': 'Revisado'
    };
    return statusMap[status] || status;
  }

  toggleReportFavorite(reportId) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
      reports[reportIndex].isFavorite = !reports[reportIndex].isFavorite;
      localStorage.setItem('generatedReports', JSON.stringify(reports));
      this.loadGeneratedReports(); // Recargar la vista
      
      // Mostrar notificación
      this.showNotification(
        reports[reportIndex].isFavorite ? 'Reporte marcado como favorito' : 'Reporte removido de favoritos',
        'success'
      );
    }
  }

  viewReport(reportId) {
    // Redirigir a la página dedicada de visualización de reporte
    window.location.href = `ver-reporte.html?id=${reportId}`;
  }

  editReport(reportId) {
    // Implementar edición de reporte
    this.showNotification('Función de edición en desarrollo', 'info');
  }

  shareReport(reportId) {
    // Implementar compartir reporte
    this.showNotification('Función de compartir en desarrollo', 'info');
  }

  deleteReport(reportId) {
    if (confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
      const updatedReports = reports.filter(r => r.id !== reportId);
      localStorage.setItem('generatedReports', JSON.stringify(updatedReports));
      this.loadGeneratedReports();
      this.showNotification('Reporte eliminado correctamente', 'success');
    }
  }

  downloadReport(reportId) {
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
      // Crear contenido del reporte para descarga
      const reportContent = this.generateReportPDF(report);
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Reporte_${report.playerName}_${new Date(report.createdAt).toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('Reporte descargado correctamente', 'success');
    }
  }

  generateReportPDF(report) {
    return `
REPORTE DE EVALUACIÓN - SCOUTCONNECT
=====================================

Jugador: ${report.playerName}
Posición: ${report.playerPosition}
Fecha de creación: ${new Date(report.createdAt).toLocaleDateString('es-ES')}
Estado: ${this.getStatusText(report.status)}

RESUMEN
-------
${report.summary || 'Sin resumen disponible'}

EVALUACIONES
------------
Técnica: ${report.ratings?.technical || 'N/A'}/10
Física: ${report.ratings?.physical || 'N/A'}/10
Mental: ${report.ratings?.mental || 'N/A'}/10

OBSERVACIONES
-------------
${report.observations || 'Sin observaciones adicionales'}

---
Generado por ScoutConnect
    `.trim();
  }

  showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  renderWatchlist() {
    
    // Implementar renderizado de watchlist
  }

  renderCalendar() {
    
    // Implementar renderizado de calendario
  }

  renderAnalytics() {
    
    this.loadAnalyticsCharts();
    this.loadTopPerformers();
  }

  loadAnalyticsCharts() {
    // Simular carga de gráficos (en producción se integraría con Chart.js)
    const charts = ['trendsChart', 'positionChart', 'ratingDistributionChart'];
    charts.forEach(chartId => {
      const canvas = document.getElementById(chartId);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        // Crear gráfico placeholder
        this.createPlaceholderChart(ctx, chartId);
      }
    });
  }

  createPlaceholderChart(ctx, type) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.fillStyle = '#667eea';
    ctx.font = '16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(`Gráfico ${type} cargado`, ctx.canvas.width/2, ctx.canvas.height/2);
  }

  loadTopPerformers() {
    const tableBody = document.getElementById('topPerformersTable');
    if (!tableBody) return;

    const topPlayers = this.players
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    tableBody.innerHTML = topPlayers.map(player => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${player.avatar}" style="width: 32px; height: 32px; border-radius: 50%;">
            <span>${player.name}</span>
          </div>
        </td>
        <td>${player.position}</td>
        <td><span class="rating-badge ${player.rating >= 8.5 ? 'excellent' : 'good'}">${player.rating}</span></td>
        <td>${(player.rating + Math.random() * 0.5).toFixed(1)}</td>
        <td><span class="status-badge ${player.status}">${this.getStatusText(player.status)}</span></td>
        <td>
          <button class="btn-icon" onclick="scoutDashboard.viewPlayerProfile(${player.id})" title="Ver perfil">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  getStatusText(status) {
    const statusMap = {
      'recommended': 'Recomendado',
      'watching': 'Siguiendo',
      'priority': 'Prioridad',
      'evaluated': 'Evaluado'
    };
    return statusMap[status] || 'Sin estado';
  }

  renderComparisons() {
    
    this.setupComparisonSelectors();
  }

  setupComparisonSelectors() {
    const playerA = document.getElementById('playerA');
    const playerB = document.getElementById('playerB');

    if (playerA && playerB) {
      // Llenar selectores con jugadores disponibles
      const options = this.players.map(player => 
        `<option value="${player.id}">${player.name} - ${player.position}</option>`
      ).join('');

      playerA.innerHTML = '<option value="">Seleccionar jugador...</option>' + options;
      playerB.innerHTML = '<option value="">Seleccionar jugador...</option>' + options;

      // Event listeners para comparación
      playerA.addEventListener('change', () => this.updateComparison());
      playerB.addEventListener('change', () => this.updateComparison());
    }
  }

  updateComparison() {
    const playerAId = document.getElementById('playerA')?.value;
    const playerBId = document.getElementById('playerB')?.value;

    if (playerAId && playerBId) {
      const playerA = this.players.find(p => p.id == playerAId);
      const playerB = this.players.find(p => p.id == playerBId);

      if (playerA && playerB) {
        this.showComparison(playerA, playerB);
      }
    }
  }

  showComparison(playerA, playerB) {
    // Actualizar previsualizaciones
    this.updatePlayerPreview('previewA', playerA);
    this.updatePlayerPreview('previewB', playerB);

    // Mostrar resultados de comparación
    const resultsContainer = document.getElementById('comparisonResults');
    if (resultsContainer) {
      resultsContainer.style.display = 'grid';
      this.generateComparisonChart(playerA, playerB);
      this.generateComparisonTable(playerA, playerB);
    }
  }

  updatePlayerPreview(previewId, player) {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.innerHTML = `
        <div style="text-align: center;">
          <img src="${player.avatar}" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px;">
          <h4 style="margin: 0; font-size: 14px;">${player.name}</h4>
          <p style="margin: 5px 0; color: #666; font-size: 12px;">${player.position}</p>
          <span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${player.rating}</span>
        </div>
      `;
    }
  }

  generateComparisonChart(playerA, playerB) {
    const canvas = document.getElementById('radarComparisonChart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      // Placeholder para gráfico radar
      this.createRadarChart(ctx, playerA, playerB);
    }
  }

  createRadarChart(ctx, playerA, playerB) {
    // Limpiar canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Configuración del gráfico
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    // Categorías
    const categories = ['Técnica', 'Físico', 'Mental', 'Táctico'];
    const angleStep = (2 * Math.PI) / categories.length;
    
    // Dibujar ejes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < categories.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Etiquetas
      ctx.fillStyle = '#4a5568';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(categories[i], x + Math.cos(angle) * 20, y + Math.sin(angle) * 20);
    }
    
    // Dibujar datos del jugador A
    this.drawPlayerData(ctx, playerA, centerX, centerY, radius, angleStep, '#667eea', 0.3);
    
    // Dibujar datos del jugador B
    this.drawPlayerData(ctx, playerB, centerX, centerY, radius, angleStep, '#f093fb', 0.3);
    
    // Leyenda
    ctx.fillStyle = '#667eea';
    ctx.fillRect(20, 20, 15, 15);
    ctx.fillStyle = '#4a5568';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(playerA.name, 40, 32);
    
    ctx.fillStyle = '#f093fb';
    ctx.fillRect(20, 40, 15, 15);
    ctx.fillStyle = '#4a5568';
    ctx.fillText(playerB.name, 40, 52);
  }

  drawPlayerData(ctx, player, centerX, centerY, radius, angleStep, color, alpha) {
    const values = [
      player.evaluation.technical / 10,
      player.evaluation.physical / 10,
      player.evaluation.mental / 10,
      player.evaluation.tactical / 10
    ];
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < values.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const distance = values[i] * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  generateComparisonTable(playerA, playerB) {
    const tableBody = document.getElementById('comparisonTableBody');
    if (!tableBody) return;

    const comparisons = [
      { attribute: 'Rating General', valueA: playerA.rating, valueB: playerB.rating },
      { attribute: 'Técnica', valueA: playerA.evaluation.technical, valueB: playerB.evaluation.technical },
      { attribute: 'Físico', valueA: playerA.evaluation.physical, valueB: playerB.evaluation.physical },
      { attribute: 'Mental', valueA: playerA.evaluation.mental, valueB: playerB.evaluation.mental },
      { attribute: 'Táctico', valueA: playerA.evaluation.tactical, valueB: playerB.evaluation.tactical },
      { attribute: 'Edad', valueA: playerA.age, valueB: playerB.age }
    ];

    tableBody.innerHTML = comparisons.map(comp => {
      const diff = (comp.valueA - comp.valueB).toFixed(1);
      const diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
      
      return `
        <tr>
          <td><strong>${comp.attribute}</strong></td>
          <td>${comp.valueA}</td>
          <td>${comp.valueB}</td>
          <td class="difference ${diffClass}">${diff > 0 ? '+' : ''}${diff}</td>
        </tr>
      `;
    }).join('');
  }

  renderTeam() {
    
    this.setupTeamCollaboration();
  }

  setupTeamCollaboration() {
    // Event listeners para acciones del equipo
    const inviteBtn = document.getElementById('inviteTeamBtn');
    if (inviteBtn) {
      inviteBtn.addEventListener('click', () => this.showInviteModal());
    }

    // Configurar notificaciones de equipo
    this.loadTeamNotifications();
  }

  showInviteModal() {
    const modalHTML = `
      <div class="modal invite-modal">
        <div class="modal-header">
          <h2><i class="fas fa-user-plus"></i> Invitar Scout al Equipo</h2>
          <button class="modal-close" onclick="scoutDashboard.closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <form class="invite-form" onsubmit="scoutDashboard.sendInvite(event)">
            <div class="form-group">
              <label for="inviteEmail">Email del Scout</label>
              <input type="email" id="inviteEmail" class="form-input" placeholder="scout@ejemplo.com" required>
            </div>
            
            <div class="form-group">
              <label for="inviteRole">Rol en el Equipo</label>
              <select id="inviteRole" class="form-select" required>
                <option value="">Seleccionar rol...</option>
                <option value="scout_junior">Scout Junior</option>
                <option value="scout_senior">Scout Senior</option>
                <option value="analyst">Analista</option>
                <option value="coordinator">Coordinador</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="inviteMessage">Mensaje (opcional)</label>
              <textarea id="inviteMessage" class="form-textarea" rows="3" placeholder="Te invitamos a unirte a nuestro equipo de scouting..."></textarea>
            </div>
            
            <div class="permissions-section">
              <h4>Permisos</h4>
              <div class="permissions-grid">
                <label class="permission-item">
                  <input type="checkbox" name="permissions" value="view_players" checked>
                  <span>Ver jugadores</span>
                </label>
                <label class="permission-item">
                  <input type="checkbox" name="permissions" value="create_reports">
                  <span>Crear reportes</span>
                </label>
                <label class="permission-item">
                  <input type="checkbox" name="permissions" value="edit_reports">
                  <span>Editar reportes</span>
                </label>
                <label class="permission-item">
                  <input type="checkbox" name="permissions" value="share_reports">
                  <span>Compartir reportes</span>
                </label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="scoutDashboard.closeModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="document.querySelector('.invite-form').requestSubmit()">
            <i class="fas fa-paper-plane"></i> Enviar Invitación
          </button>
        </div>
      </div>
    `;

    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.innerHTML = modalHTML;
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  sendInvite(event) {
    event.preventDefault();
    
    const email = document.getElementById('inviteEmail').value;
    const role = document.getElementById('inviteRole').value;
    const message = document.getElementById('inviteMessage').value;
    
    
    
    // Simular envío
    setTimeout(() => {
      this.closeModal();
      this.showSuccessMessage(`Invitación enviada a ${email}`);
    }, 1000);
  }

  loadTeamNotifications() {
    // Simular notificaciones de equipo
    
  }

  renderNotifications() {
    
    this.setupNotificationFilters();
    this.loadNotificationSettings();
  }

  setupNotificationFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const filter = e.target.dataset.filter;
        this.filterNotifications(filter);
      });
    });
  }

  filterNotifications(filter) {
    
    // Implementar lógica de filtrado
  }

  loadNotificationSettings() {
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => this.markAllNotificationsRead());
    }

    const settingsBtn = document.getElementById('notificationSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showNotificationSettings());
    }
  }

  markAllNotificationsRead() {
    
    
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
      item.classList.remove('unread');
    });
    
    this.showSuccessMessage('Todas las notificaciones marcadas como leídas');
  }

  showNotificationSettings() {
    
    // Implementar modal de configuración avanzada
  }

  // Funciones de exportación de datos
  exportData() {
    
    
    const data = {
      players: this.players,
      reports: this.reports,
      analytics: this.generateAnalyticsData(),
      exportDate: new Date().toISOString(),
      scout: this.currentUser
    };
    
    this.downloadJSON(data, `scout-data-${new Date().toISOString().split('T')[0]}.json`);
    this.showSuccessMessage('Datos exportados exitosamente');
  }

  // ===== FUNCIONES ADICIONALES Y UTILIDADES =====

  // Función para mostrar mensajes de éxito
  showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: var(--success-color);
      color: white;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      max-width: 400px;
    `;
    alertDiv.innerHTML = `
      <i class="fas fa-check-circle"></i>
      ${message}
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  // Función para mostrar mensajes de error
  showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-error';
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: var(--danger-color);
      color: white;
      padding: var(--spacing-md);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      max-width: 400px;
    `;
    alertDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      ${message}
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  // Función para actualizar estadísticas en tiempo real
  updateRealTimeStats() {
    // Simular actualizaciones en tiempo real
    const statsElements = document.querySelectorAll('.metric-card .value');
    statsElements.forEach(element => {
      const currentValue = parseInt(element.textContent);
      if (!isNaN(currentValue)) {
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, o 1
        const newValue = Math.max(0, currentValue + variation);
        
        if (variation !== 0) {
          element.textContent = newValue;
          element.style.color = variation > 0 ? 'var(--success-color)' : 'var(--warning-color)';
          
          setTimeout(() => {
            element.style.color = '';
          }, 1000);
        }
      }
    });
  }

  // Función para actualizar el badge de notificaciones
  updateNotificationBadge() {
    const unreadCount = this.sampleNotifications ? this.sampleNotifications.filter(n => !n.read).length : 0;
    const badge = document.querySelector('[data-section="notifications"] .nav-badge');
    
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      
      // Añadir clase urgent para notificaciones de alta prioridad
      const hasUrgent = this.sampleNotifications ? this.sampleNotifications.some(n => !n.read && n.priority === 'high') : false;
      badge.classList.toggle('urgent', hasUrgent);
    }
  }

  // Función para mostrar notificaciones toast
  showToastNotification(notification) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      padding: var(--spacing-md);
      box-shadow: var(--shadow-lg);
      z-index: 10001;
      max-width: 300px;
    `;
    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: var(--spacing-sm);">
        <i class="fas fa-bell" style="color: var(--primary-color); margin-top: 2px;"></i>
        <div style="flex: 1;">
          <h6 style="margin: 0 0 4px 0; font-weight: 600;">${notification.title}</h6>
          <p style="margin: 0; font-size: 14px; color: var(--text-secondary);">${notification.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer;">×</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  }

  // Inicializar actualizaciones en tiempo real
  initializeRealTimeUpdates() {
    // Actualizar estadísticas cada 30 segundos
    setInterval(() => {
      this.updateRealTimeStats();
    }, 30000);

    // Actualizar badge inicialmente
    this.updateNotificationBadge();
  }

  // ===== SISTEMA DE WATCHLIST =====

  // Cargar contador de watchlist
  loadWatchlistCount() {
    try {
      const saved = localStorage.getItem('scoutconnect_watchlist');
      const watchlist = saved ? JSON.parse(saved) : [];
      this.updateWatchlistCounter(watchlist.length);
    } catch (error) {
      console.error('Error al cargar watchlist count:', error);
      this.updateWatchlistCounter(0);
    }
  }

  updateWatchlistCounter(count) {
    const counter = document.getElementById('dashboardWatchlistCount');
    if (counter) {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  // ===== SISTEMA DE BÚSQUEDA AVANZADA =====

  // Configurar eventos de búsqueda avanzada
  setupAdvancedSearch() {
    const searchForm = document.getElementById('advancedSearchForm');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const sortSelect = document.getElementById('sortResults');

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performAdvancedSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearSearchFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.sortSearchResults();
      });
    }
  }

  // Realizar búsqueda avanzada
  performAdvancedSearch() {
    const filters = this.collectSearchFilters();
    const results = this.filterPlayers(filters);
    this.displaySearchResults(results);
    
    // Mostrar sección de resultados
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('resultsCount').textContent = `${results.length} jugador${results.length !== 1 ? 'es' : ''} encontrado${results.length !== 1 ? 's' : ''}`;
  }

  // Recopilar todos los filtros del formulario
  collectSearchFilters() {
    return {
      name: document.getElementById('playerName')?.value?.toLowerCase() || '',
      ageMin: parseInt(document.getElementById('ageMin')?.value) || null,
      ageMax: parseInt(document.getElementById('ageMax')?.value) || null,
      position: Array.from(document.getElementById('position')?.selectedOptions || []).map(opt => opt.value).filter(v => v),
      foot: document.getElementById('foot')?.value || '',
      country: document.getElementById('country')?.value || '',
      league: document.getElementById('league')?.value || '',
      club: document.getElementById('club')?.value?.toLowerCase() || '',
      heightMin: parseInt(document.getElementById('heightMin')?.value) || null,
      heightMax: parseInt(document.getElementById('heightMax')?.value) || null,
      weightMin: parseInt(document.getElementById('weightMin')?.value) || null,
      weightMax: parseInt(document.getElementById('weightMax')?.value) || null,
      ratingMin: parseFloat(document.getElementById('ratingMin')?.value) || null,
      ratingMax: parseFloat(document.getElementById('ratingMax')?.value) || null,
      status: document.getElementById('status')?.value || '',
      technicalMin: parseFloat(document.getElementById('technicalMin')?.value) || null,
      technicalMax: parseFloat(document.getElementById('technicalMax')?.value) || null,
      physicalMin: parseFloat(document.getElementById('physicalMin')?.value) || null,
      physicalMax: parseFloat(document.getElementById('physicalMax')?.value) || null,
      mentalMin: parseFloat(document.getElementById('mentalMin')?.value) || null,
      mentalMax: parseFloat(document.getElementById('mentalMax')?.value) || null,
      tacticalMin: parseFloat(document.getElementById('tacticalMin')?.value) || null,
      tacticalMax: parseFloat(document.getElementById('tacticalMax')?.value) || null,
      speedMin: parseFloat(document.getElementById('speedMin')?.value) || null,
      speedMax: parseFloat(document.getElementById('speedMax')?.value) || null,
      finishingMin: parseFloat(document.getElementById('finishingMin')?.value) || null,
      finishingMax: parseFloat(document.getElementById('finishingMax')?.value) || null,
      passingMin: parseFloat(document.getElementById('passingMin')?.value) || null,
      passingMax: parseFloat(document.getElementById('passingMax')?.value) || null,
      dribblingMin: parseFloat(document.getElementById('dribblingMin')?.value) || null,
      dribblingMax: parseFloat(document.getElementById('dribblingMax')?.value) || null,
      defendingMin: parseFloat(document.getElementById('defendingMin')?.value) || null,
      defendingMax: parseFloat(document.getElementById('defendingMax')?.value) || null,
      marketValueMin: parseFloat(document.getElementById('marketValueMin')?.value) || null,
      marketValueMax: parseFloat(document.getElementById('marketValueMax')?.value) || null,
      contractExpiry: document.getElementById('contractExpiry')?.value || ''
    };
  }

  // Filtrar jugadores según los criterios
  filterPlayers(filters) {
    return this.players.filter(player => {
      // Filtro por nombre
      if (filters.name && !player.name.toLowerCase().includes(filters.name)) {
        return false;
      }

      // Filtro por edad
      if (filters.ageMin !== null && player.age < filters.ageMin) return false;
      if (filters.ageMax !== null && player.age > filters.ageMax) return false;

      // Filtro por posición
      if (filters.position.length > 0 && !filters.position.includes(player.position)) return false;

      // Filtro por pierna hábil
      if (filters.foot && player.foot !== filters.foot) return false;

      // Filtro por país
      if (filters.country && player.country !== filters.country) return false;

      // Filtro por liga
      if (filters.league && player.league !== filters.league) return false;

      // Filtro por club
      if (filters.club && !player.club.toLowerCase().includes(filters.club)) return false;

      // Filtros físicos
      if (filters.heightMin !== null && player.height < filters.heightMin) return false;
      if (filters.heightMax !== null && player.height > filters.heightMax) return false;
      if (filters.weightMin !== null && player.weight < filters.weightMin) return false;
      if (filters.weightMax !== null && player.weight > filters.weightMax) return false;

      // Filtro por rating
      if (filters.ratingMin !== null && player.rating < filters.ratingMin) return false;
      if (filters.ratingMax !== null && player.rating > filters.ratingMax) return false;

      // Filtro por estado
      if (filters.status && player.status !== filters.status) return false;

      // Filtros de habilidades generales
      if (filters.technicalMin !== null && player.evaluation.technical < filters.technicalMin) return false;
      if (filters.technicalMax !== null && player.evaluation.technical > filters.technicalMax) return false;
      if (filters.physicalMin !== null && player.evaluation.physical < filters.physicalMin) return false;
      if (filters.physicalMax !== null && player.evaluation.physical > filters.physicalMax) return false;
      if (filters.mentalMin !== null && player.evaluation.mental < filters.mentalMin) return false;
      if (filters.mentalMax !== null && player.evaluation.mental > filters.mentalMax) return false;
      if (filters.tacticalMin !== null && player.evaluation.tactical < filters.tacticalMin) return false;
      if (filters.tacticalMax !== null && player.evaluation.tactical > filters.tacticalMax) return false;

      // Filtros de habilidades específicas
      if (player.detailedStats) {
        if (filters.speedMin !== null && player.detailedStats.speed < filters.speedMin) return false;
        if (filters.speedMax !== null && player.detailedStats.speed > filters.speedMax) return false;
        if (filters.finishingMin !== null && player.detailedStats.finishing < filters.finishingMin) return false;
        if (filters.finishingMax !== null && player.detailedStats.finishing > filters.finishingMax) return false;
        if (filters.passingMin !== null && player.detailedStats.passing < filters.passingMin) return false;
        if (filters.passingMax !== null && player.detailedStats.passing > filters.passingMax) return false;
        if (filters.dribblingMin !== null && player.detailedStats.dribbling < filters.dribblingMin) return false;
        if (filters.dribblingMax !== null && player.detailedStats.dribbling > filters.dribblingMax) return false;
        if (filters.defendingMin !== null && player.detailedStats.defending < filters.defendingMin) return false;
        if (filters.defendingMax !== null && player.detailedStats.defending > filters.defendingMax) return false;
      }

      // Filtros contractuales
      if (filters.marketValueMin !== null && player.marketValue < filters.marketValueMin) return false;
      if (filters.marketValueMax !== null && player.marketValue > filters.marketValueMax) return false;
      if (filters.contractExpiry && player.contract) {
        const contractYear = new Date(player.contract.expires).getFullYear();
        if (filters.contractExpiry === '2027') {
          if (contractYear < 2027) return false;
        } else {
          if (contractYear.toString() !== filters.contractExpiry) return false;
        }
      }

      return true;
    });
  }

  // Mostrar resultados de búsqueda
  displaySearchResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (results.length === 0) {
      resultsGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 48px; color: var(--text-muted); margin-bottom: var(--spacing-md);"></i>
          <h3>No se encontraron jugadores</h3>
          <p>Intenta ajustar los filtros para obtener más resultados.</p>
        </div>
      `;
      return;
    }

    resultsGrid.innerHTML = results.map(player => this.createPlayerResultCard(player)).join('');
  }

  // Crear tarjeta de resultado para un jugador
  createPlayerResultCard(player) {
    const statusLabels = {
      priority: { text: 'Prioridad', class: 'priority' },
      recommended: { text: 'Recomendado', class: 'recommended' },
      watching: { text: 'Seguimiento', class: 'watching' },
      evaluated: { text: 'Evaluado', class: 'evaluated' }
    };

    const status = statusLabels[player.status] || { text: 'Evaluado', class: 'evaluated' };
    
    return `
      <div class="search-result-card" onclick="scoutDashboard.showPlayerProfile(${player.id})">
        <div class="result-card-rating">${player.rating}</div>
        <div class="result-card-status">
          <span class="status-badge ${status.class}">${status.text}</span>
        </div>
        
        <div class="result-card-header">
          <div class="result-card-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="result-card-info">
            <h3 class="result-card-name">${player.name}</h3>
            <p class="result-card-position">${player.position}</p>
          </div>
        </div>
        
        <div class="result-card-details">
          <div class="result-detail-item">
            <span class="result-detail-label">Edad:</span>
            <span class="result-detail-value">${player.age} años</span>
          </div>
          <div class="result-detail-item">
            <span class="result-detail-label">Club:</span>
            <span class="result-detail-value">${player.club}</span>
          </div>
          <div class="result-detail-item">
            <span class="result-detail-label">País:</span>
            <span class="result-detail-value">${player.country}</span>
          </div>
          <div class="result-detail-item">
            <span class="result-detail-label">Valor:</span>
            <span class="result-detail-value">€${(player.marketValue / 1000000).toFixed(1)}M</span>
          </div>
        </div>
        
        <div class="result-card-actions">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); scoutDashboard.showPlayerProfile(${player.id})">
            <i class="fas fa-eye"></i> Ver Perfil
          </button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); scoutDashboard.addToWatchlist(${player.id})">
            <i class="fas fa-star"></i> Seguir
          </button>
        </div>
      </div>
    `;
  }

  // Mostrar perfil completo del jugador
  showPlayerProfile(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    const modal = document.getElementById('playerProfileModal');
    const content = document.getElementById('playerProfileContent');
    
    content.innerHTML = this.createPlayerProfileContent(player);
    modal.style.display = 'flex';
    
    document.getElementById('modalPlayerName').textContent = player.name;
  }

  // Crear contenido del perfil completo
  createPlayerProfileContent(player) {
    const formatCurrency = (amount) => `€${(amount / 1000000).toFixed(1)}M`;
    
    return `
      <div class="player-profile-content">
        <div class="player-profile-sidebar">
          <div class="player-profile-avatar">
            <i class="fas fa-user"></i>
          </div>
          
          <div class="player-basic-info">
            <h2 class="player-name">${player.name}</h2>
            <p class="player-position">${player.position}</p>
            <p class="player-club">${player.club}</p>
          </div>
          
          <div class="profile-info-grid">
            <div class="profile-info-item">
              <span class="profile-info-label">Edad:</span>
              <span class="profile-info-value">${player.age} años</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">País:</span>
              <span class="profile-info-value">${player.country}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Liga:</span>
              <span class="profile-info-value">${player.league}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Altura:</span>
              <span class="profile-info-value">${player.height} cm</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Peso:</span>
              <span class="profile-info-value">${player.weight} kg</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Pierna:</span>
              <span class="profile-info-value">${player.foot}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Valor:</span>
              <span class="profile-info-value">${formatCurrency(player.marketValue)}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Contrato:</span>
              <span class="profile-info-value">${player.contract.expires}</span>
            </div>
          </div>
        </div>
        
        <div class="player-profile-main">
          <!-- Evaluación General -->
          <div class="player-stats-section">
            <h3 class="stats-section-title">
              <i class="fas fa-chart-bar"></i> Evaluación General
            </h3>
            <div class="stats-grid">
              ${Object.entries(player.evaluation).map(([key, value]) => `
                <div class="stat-item">
                  <span class="stat-label">${this.translateStatKey(key)}</span>
                  <span class="stat-value">${value.toFixed(1)}</span>
                  <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(value / 10) * 100}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Habilidades Específicas -->
          <div class="player-stats-section">
            <h3 class="stats-section-title">
              <i class="fas fa-futbol"></i> Habilidades Específicas
            </h3>
            <div class="stats-grid">
              ${Object.entries(player.detailedStats || {}).map(([key, value]) => `
                <div class="stat-item">
                  <span class="stat-label">${this.translateStatKey(key)}</span>
                  <span class="stat-value">${value.toFixed(1)}</span>
                  <div class="stat-bar">
                    <div class="stat-fill" style="width: ${(value / 10) * 100}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Videos -->
          ${player.videos ? `
            <div class="player-stats-section">
              <h3 class="stats-section-title">
                <i class="fas fa-video"></i> Videos de Análisis
              </h3>
              <div class="videos-grid">
                ${Object.entries(player.videos).map(([title, url]) => `
                  <div class="video-item">
                    <i class="fas fa-play-circle"></i>
                    <span>${title}</span>
                    <a href="${url}" target="_blank" class="btn btn-sm btn-primary">Ver</a>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- Notas -->
          ${player.notes ? `
            <div class="player-stats-section">
              <h3 class="stats-section-title">
                <i class="fas fa-sticky-note"></i> Notas del Scout
              </h3>
              <p>${player.notes}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Traducir claves de estadísticas
  translateStatKey(key) {
    const translations = {
      technical: 'Técnica',
      physical: 'Físico',
      mental: 'Mental',
      tactical: 'Táctico',
      speed: 'Velocidad',
      strength: 'Fuerza',
      finishing: 'Definición',
      passing: 'Pases',
      crossing: 'Centros',
      dribbling: 'Regate',
      defending: 'Defensa',
      heading: 'Juego Aéreo',
      freeKicks: 'Tiros Libres',
      penalties: 'Penales'
    };
    return translations[key] || key;
  }

  // Limpiar todos los filtros
  clearSearchFilters() {
    const form = document.getElementById('advancedSearchForm');
    if (form) {
      form.reset();
    }
    
    // Ocultar resultados
    document.getElementById('searchResults').style.display = 'none';
  }

  // Ordenar resultados de búsqueda
  sortSearchResults() {
    const sortBy = document.getElementById('sortResults').value;
    const resultsGrid = document.getElementById('resultsGrid');
    
    // Obtener resultados actuales y reordenar
    // Esta es una implementación simplificada
    
  }

  // Añadir a lista de seguimiento
  addToWatchlist(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player && !this.watchlist.find(w => w.id === playerId)) {
      this.watchlist.push(player);
      this.showSuccessMessage(`${player.name} añadido a lista de seguimiento`);
    }
  }

  // Cargar sección de búsqueda avanzada
  loadAdvancedSearchSection() {
    
    // La sección ya está en el HTML, solo necesitamos configurar los eventos
    this.setupAdvancedSearch();
  }

  // Ocultar todas las secciones excepto el dashboard
  hideAllSectionsExceptDashboard() {
    const sections = document.querySelectorAll('.content-section, .section');
    sections.forEach(section => {
      if (section.id !== 'dashboard' && section.id !== 'main-dashboard') {
        section.style.display = 'none';
      }
    });
  }

  generateAnalyticsData() {
    return {
      totalEvaluations: this.reports.length,
      averageRating: this.players.reduce((sum, p) => sum + p.rating, 0) / this.players.length,
      positionDistribution: this.getPositionDistribution(),
      monthlyTrends: this.getMonthlyTrends(),
      conversionRate: this.calculateConversionRate()
    };
  }

  getPositionDistribution() {
    const distribution = {};
    this.players.forEach(player => {
      distribution[player.position] = (distribution[player.position] || 0) + 1;
    });
    return distribution;
  }

  getMonthlyTrends() {
    // Simular datos de tendencias mensuales
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      evaluations: Math.floor(Math.random() * 50) + 10,
      conversions: Math.floor(Math.random() * 15) + 2
    }));
  }

  calculateConversionRate() {
    const recommended = this.players.filter(p => p.status === 'recommended' || p.status === 'priority').length;
    return this.players.length > 0 ? (recommended / this.players.length * 100).toFixed(1) : 0;
  }

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  renderAnalytics() {
    
    // Implementar renderizado de analytics
  }
}

// Estilos adicionales para modales y notificaciones
const additionalStyles = `
  <style>
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }

    .modal {
      background: var(--bg-primary);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-light);
      background: var(--bg-secondary);
    }

    .modal-header h2 {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin: 0;
      color: var(--text-primary);
    }

    .modal-close {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      transition: var(--transition);
    }

    .modal-close:hover {
      background: var(--bg-light);
      color: var(--danger-color);
    }

    .modal-content {
      flex: 1;
      padding: var(--spacing-lg);
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      border-top: 1px solid var(--border-light);
      background: var(--bg-secondary);
    }

    .success-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success-color);
      color: white;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transform: translateX(100%);
      transition: var(--transition);
      z-index: 10001;
    }

    .success-notification.show {
      transform: translateX(0);
    }

    .player-profile-grid {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: var(--spacing-xl);
    }

    .profile-sidebar {
      text-align: center;
    }

    .profile-photo {
      width: 150px;
      height: 150px;
      border-radius: var(--radius-full);
      border: 4px solid var(--border-light);
      margin-bottom: var(--spacing-md);
    }

    .profile-rating {
      margin: var(--spacing-lg) 0;
    }

    .rating-large {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: var(--spacing-xs);
    }

    .rating-large.excellent { color: var(--success-color); }
    .rating-large.good { color: var(--info-color); }

    .profile-info {
      text-align: left;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
      color: var(--text-muted);
    }

    .evaluation-section,
    .videos-section,
    .notes-section {
      margin-bottom: var(--spacing-xl);
    }

    .skills-grid {
      display: grid;
      gap: var(--spacing-md);
    }

    .skill-item {
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      align-items: center;
      gap: var(--spacing-md);
    }

    .skill-name {
      font-weight: 500;
      color: var(--text-secondary);
    }

    .skill-bar {
      height: 8px;
      background: var(--bg-light);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .skill-progress {
      height: 100%;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: var(--radius-full);
      transition: var(--transition);
    }

    .skill-value {
      font-weight: 600;
      color: var(--primary-color);
    }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
    }

    .video-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--bg-light);
      border-radius: var(--radius-md);
    }

    .video-link {
      margin-left: auto;
      color: var(--primary-color);
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .form-textarea {
      width: 100%;
      padding: var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
    }

    .evaluation-grid {
      margin: var(--spacing-xl) 0;
    }

    .category-section {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--bg-light);
      border-radius: var(--radius-lg);
    }

    .category-section h5 {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      color: var(--text-primary);
    }

    .rating-group {
      display: grid;
      grid-template-columns: 1fr 2fr auto;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .rating-display {
      font-weight: 600;
      color: var(--primary-color);
      min-width: 30px;
      text-align: center;
    }

    .video-input-group {
      margin-bottom: var(--spacing-md);
    }

    .video-input-group label {
      font-size: 14px;
      color: var(--text-muted);
    }

    .section-description {
      color: var(--text-muted);
      font-size: 14px;
      margin-bottom: var(--spacing-lg);
    }

    @media (max-width: 768px) {
      .modal {
        margin: 0;
        width: 100%;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }

      .player-profile-grid {
        grid-template-columns: 1fr;
      }

      .rating-group {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
      }

      .skill-item {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;

// Insertar estilos adicionales
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// Función global para cerrar modales
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  
  window.scoutDashboard = new ScoutDashboard();
});
