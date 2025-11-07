// ===== BÚSQUEDA AVANZADA - JAVASCRIPT COMPLETO =====

class AdvancedSearch {
  constructor() {
    this.players = [];
    this.searchResults = [];
    this.countriesData = null;
    this.selectedStates = [];
    this.selectedTags = [];
    this.currentUserId = null;
    this.watchlist = [];
  }

  async init() {
    
    await this.getCurrentUser();
    await this.loadWatchlistFromSupabase();
    await this.loadCountriesData();
    await this.loadPlayerData();
    this.setupEventListeners();
    this.populateCountrySelects();
    this.setupTags();
    
    // Mostrar todos los jugadores al cargar la página
    this.performSearch();
    
    
  }

  async loadWatchlistFromSupabase() {
    try {
      if (!this.currentUserId) {
        
        this.watchlist = [];
        return;
      }

      

      // Primero obtener los IDs de la watchlist
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlist')
        .select('*')
        .eq('scout_id', this.currentUserId)
        .order('added_date', { ascending: false });

      if (watchlistError) {
        console.error('❌ Error al cargar watchlist:', watchlistError);
        this.watchlist = [];
        return;
      }

      

      if (!watchlistData || watchlistData.length === 0) {
        
        this.watchlist = [];
        return;
      }

      // Obtener los IDs de jugadores
      const playerIds = watchlistData.map(item => item.player_id);

      // Obtener los datos de los jugadores
      const { data: playersData, error: playersError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', playerIds);

      if (playersError) {
        console.error('❌ Error al cargar jugadores:', playersError);
        this.watchlist = [];
        return;
      }

      

      // Combinar los datos
      this.watchlist = watchlistData.map(item => {
        const player = playersData.find(p => p.id === item.player_id);
        if (!player) return null;

        return {
          id: player.id,
          player_id: item.player_id,
          name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          first_name: player.first_name,
          last_name: player.last_name,
          primaryPosition: player.position,
          secondaryPosition: player.secondary_position,
          age: player.age,
          nationality: player.nationality,
          height: player.height,
          weight: player.weight,
          club: player.current_club || 'Sin club',
          league: player.league || 'Sin liga',
          city: player.city || '',
          state: player.state || '',
          addedDate: item.added_date,
          addedTimestamp: new Date(item.added_date).getTime()
        };
      }).filter(item => item !== null);

    } catch (error) {
      console.error('❌ Error al cargar watchlist:', error);
      this.watchlist = [];
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        this.currentUserId = user.id;
        
      }
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
    }
  }

  async loadCountriesData() {
    try {
      const response = await fetch('JS/countries-states.json');
      this.countriesData = await response.json();
      
    } catch (error) {
      console.error('❌ Error al cargar datos de países:', error);
      // Fallback a datos básicos
      this.countriesData = {
        countries: {
          'Argentina': { states: ['Buenos Aires', 'Córdoba', 'Santa Fe'] },
          'Brasil': { states: ['São Paulo', 'Río de Janeiro', 'Minas Gerais'] },
          'España': { states: ['Madrid', 'Cataluña', 'Andalucía'] }
        }
      };
    }
  }

  populateCountrySelects() {
    const nationalitySelect = document.getElementById('nationality');
    const countrySelect = document.getElementById('country');
    
    if (!this.countriesData) return;

    const countries = Object.keys(this.countriesData.countries).sort();
    
    // Llenar select de nacionalidad
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      nationalitySelect.appendChild(option);
    });
    
    // Llenar select de país de residencia
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  }

  async loadPlayerData() {
    
    
    // Cargar jugadores reales desde Supabase
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'jugador');

      if (error) {
        console.error('❌ Error al cargar perfiles:', error);
      } else if (profiles && profiles.length > 0) {
        
        
        // Convertir perfiles de Supabase al formato esperado
        const realPlayers = profiles.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Jugador',
          primaryPosition: profile.position || 'No especificado',
          secondaryPosition: profile.secondary_position || '',
          age: profile.birth_date ? this.calculateAge(profile.birth_date) : null,
          nationality: profile.nationality || 'No especificado',
          country: profile.country || profile.nationality || 'No especificado',
          state: profile.state || '',
          city: profile.city || '',
          club: profile.current_club || 'Sin club',
          league: profile.league || '',
          height: profile.height || null,
          weight: profile.weight || null,
          foot: profile.preferred_foot || '',
          contract: {
            status: profile.contract_status || 'amateur',
            expires: profile.contract_expiry || '',
            value: profile.market_value || ''
          },
          tags: this.extractTags(profile),
          notes: profile.bio || '',
          marketValue: this.parseMarketValue(profile.market_value),
          email: profile.email,
          phone: profile.phone
        }));

        this.players = [...realPlayers, ...this.getDemoPlayers()];
        
      } else {
        
        this.players = this.getDemoPlayers();
        
      }
    } catch (error) {
      console.error('❌ Error inesperado al cargar jugadores:', error);
      this.players = this.getDemoPlayers();
      
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

  extractTags(profile) {
    const tags = [];
    
    // Agregar características físicas
    if (profile.preferred_foot === 'Izquierdo') tags.push('zurdo');
    if (profile.preferred_foot === 'Ambidiestro') tags.push('ambidiestro');
    if (profile.height && profile.height > 185) tags.push('altura');
    if (profile.speed) tags.push('veloz');
    
    // Agregar características técnicas
    if (profile.technical_skills) tags.push('técnico');
    if (profile.dribbling) tags.push('driblador');
    if (profile.passing) tags.push('pases largos');
    
    // Agregar características mentales
    if (profile.leadership) tags.push('líder');
    if (profile.creativity) tags.push('creativo');
    
    return tags;
  }

  parseMarketValue(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    
    const str = value.toString().toUpperCase();
    if (str.includes('M')) {
      return parseFloat(str) * 1000000;
    } else if (str.includes('K')) {
      return parseFloat(str) * 1000;
    }
    return parseFloat(value) || 0;
  }

  getDemoPlayers() {
    // Datos demo de jugadores para testing
    return [
      {
        id: 'demo-1',
        name: 'Miguel Rodríguez',
        primaryPosition: 'Mediocampista Ofensivo',
        secondaryPosition: 'Extremo Derecho',
        age: 22,
        nationality: 'Argentina',
        country: 'Argentina',
        state: 'Buenos Aires',
        city: 'Buenos Aires',
        club: 'Club Atlético River',
        league: 'Liga Profesional Argentina',
        height: 180,
        weight: 75,
        foot: 'Derecho',
        contract: {
          status: 'professional',
          expires: '2025-12-31',
          value: '2.8M'
        },
        tags: ['técnico', 'veloz', 'creativo', 'líder', 'versátil', 'zurdo'],
        notes: 'Excelente técnica y visión de juego. Recomendado para fichaje inmediato.',
        marketValue: 2800000
      },
      {
        id: 'demo-2',
        name: 'Andrés Silva',
        primaryPosition: 'Defensa Central',
        secondaryPosition: 'Mediocampista Defensivo',
        age: 25,
        nationality: 'Uruguay',
        country: 'Uruguay',
        state: 'Montevideo',
        city: 'Montevideo',
        club: 'Club Nacional',
        league: 'Primera División Uruguay',
        height: 188,
        weight: 82,
        foot: 'Derecho',
        contract: {
          status: 'professional',
          expires: '2025-06-30',
          value: '1.2M'
        },
        tags: ['fuerte', 'aéreo', 'aguerrido', 'experimentado', 'confiable'],
        notes: 'Buen defensor físico, experiencia internacional.',
        marketValue: 1200000
      },
      {
        id: 3,
        name: 'Luis Gómez',
        primaryPosition: 'Delantero Centro',
        secondaryPosition: 'Segundo Delantero',
        age: 19,
        nationality: 'Brasil',
        country: 'Brasil',
        state: 'São Paulo',
        city: 'São Paulo',
        club: 'Santos FC',
        league: 'Campeonato Brasileiro',
        height: 185,
        weight: 78,
        foot: 'Derecho',
        contract: {
          status: 'professional',
          expires: '2025-12-31',
          value: '2.5M'
        },
        tags: ['goleador', 'instinto', 'veloz', 'ambicioso', 'joven talento', 'clínico'],
        notes: 'Talento excepcional. Gran proyección.',
        marketValue: 3000000
      },
      {
        id: 4,
        name: 'Carlos Mendoza',
        primaryPosition: 'Lateral Derecho',
        secondaryPosition: 'Extremo Derecho',
        age: 24,
        nationality: 'España',
        country: 'España',
        state: 'Madrid',
        city: 'Madrid',
        club: 'Rayo Vallecano',
        league: 'LaLiga',
        height: 178,
        weight: 72,
        foot: 'Derecho',
        contract: {
          status: 'professional',
          expires: '2026-06-30',
          value: '1.8M'
        },
        tags: ['veloz', 'ofensivo', 'centros', 'resistente', 'polivalente'],
        notes: 'Muy veloz por la banda. Buena proyección ofensiva.',
        marketValue: 1500000
      },
      {
        id: 5,
        name: 'Giovanni Rossi',
        primaryPosition: 'Mediocampista Defensivo',
        secondaryPosition: 'Defensa Central',
        age: 27,
        nationality: 'Italia',
        country: 'Italia',
        state: 'Lombardía',
        city: 'Milán',
        club: 'AC Milan',
        league: 'Serie A',
        height: 182,
        weight: 76,
        foot: 'Ambidiestro',
        contract: {
          status: 'professional',
          expires: '2025-06-30',
          value: '4.2M'
        },
        tags: ['líder', 'pases largos', 'elegante', 'inteligente', 'ambidiestro', 'experimentado'],
        notes: 'Líder natural. Excelente distribución de balón.',
        marketValue: 8500000
      },
      {
        id: 6,
        name: 'Jamal Thompson',
        primaryPosition: 'Extremo Izquierdo',
        secondaryPosition: 'Mediocampista Ofensivo',
        age: 20,
        nationality: 'Inglaterra',
        country: 'Inglaterra',
        state: 'Londres',
        city: 'Londres',
        club: 'Crystal Palace',
        league: 'Premier League',
        height: 175,
        weight: 68,
        foot: 'Izquierdo',
        contract: {
          status: 'professional',
          expires: '2027-05-31',
          value: '3.1M'
        },
        tags: ['driblador', 'veloz', 'creativo', 'zurdo', 'joven talento', 'espectacular'],
        notes: 'Extremo muy prometedor. Gran potencial de crecimiento.',
        marketValue: 4200000
      },
      {
        id: 7,
        name: 'Roberto Martínez',
        primaryPosition: 'Portero',
        secondaryPosition: '',
        age: 21,
        nationality: 'Colombia',
        country: 'Colombia',
        state: 'Antioquia',
        city: 'Medellín',
        club: 'Atlético Nacional',
        league: 'Liga BetPlay',
        height: 190,
        weight: 85,
        foot: 'Derecho',
        contract: {
          status: 'semiprofessional',
          expires: '2024-12-31',
          value: '800K'
        },
        tags: ['reflejos', 'agilidad', 'confiable', 'joven talento', 'altura'],
        notes: 'Portero con gran potencial, reflexos excepcionales.',
        marketValue: 600000
      },
      {
        id: 8,
        name: 'Pedro Silva',
        primaryPosition: 'Mediocampista Central',
        secondaryPosition: '',
        age: 18,
        nationality: 'Brasil',
        country: 'Brasil',
        state: 'Río de Janeiro',
        city: 'Río de Janeiro',
        club: 'Flamengo Sub-20',
        league: 'Campeonato Carioca Sub-20',
        height: 176,
        weight: 70,
        foot: 'Izquierdo',
        contract: {
          status: 'amateur',
          expires: '',
          value: ''
        },
        tags: ['técnico', 'zurdo', 'joven talento', 'inteligente', 'promesa', 'elegante'],
        notes: 'Juvenil muy prometedor, técnica depurada.',
        marketValue: 0
      },
      {
        id: 9,
        name: 'Kylian Dubois',
        primaryPosition: 'Extremo Derecho',
        secondaryPosition: 'Delantero Centro',
        age: 23,
        nationality: 'Francia',
        country: 'Francia',
        state: 'Île-de-France',
        city: 'París',
        club: 'Paris FC',
        league: 'Ligue 2',
        height: 180,
        weight: 73,
        foot: 'Derecho',
        contract: {
          status: 'professional',
          expires: '2026-06-30',
          value: '1.5M'
        },
        tags: ['veloz', 'driblador', 'polivalente', 'técnico', 'espectacular'],
        notes: 'Extremo veloz con gran técnica individual.',
        marketValue: 1800000
      },
      {
        id: 10,
        name: 'James Wilson',
        primaryPosition: 'Defensa Central',
        secondaryPosition: 'Mediocampista Defensivo',
        age: 26,
        nationality: 'Estados Unidos',
        country: 'Estados Unidos',
        state: 'California',
        city: 'Los Angeles',
        club: 'LA Galaxy',
        league: 'MLS',
        height: 188,
        weight: 83,
        foot: 'Izquierdo',
        contract: {
          status: 'professional',
          expires: '2025-12-31',
          value: '2.2M'
        },
        tags: ['fuerte', 'aéreo', 'experimentado', 'polivalente', 'zurdo', 'líder'],
        notes: 'Defensor sólido con experiencia en selección.',
        marketValue: 2500000
      },
      {
        id: 11,
        name: 'Kwame Asante',
        primaryPosition: 'Mediocampista Ofensivo',
        secondaryPosition: 'Extremo Izquierdo',
        age: 22,
        nationality: 'Ghana',
        country: 'Ghana',
        state: 'Gran Accra',
        city: 'Accra',
        club: 'Hearts of Oak',
        league: 'Ghana Premier League',
        height: 175,
        weight: 68,
        foot: 'Derecho',
        contract: {
          status: 'semiprofessional',
          expires: '2025-06-30',
          value: '400K'
        },
        tags: ['creativo', 'inteligente', 'polivalente', 'ambicioso', 'promesa'],
        notes: 'Talento africano emergente, gran visión de juego.',
        marketValue: 800000
      },
      {
        id: 12,
        name: 'Hiroshi Tanaka',
        primaryPosition: 'Lateral Derecho',
        secondaryPosition: 'Mediocampista Defensivo',
        age: 24,
        nationality: 'Japón',
        country: 'Japón',
        state: 'Tokyo',
        city: 'Tokyo',
        club: 'FC Tokyo',
        league: 'J1 League',
        height: 172,
        weight: 65,
        foot: 'Derecho',
        contract: {
          status: 'professional',
          expires: '2026-01-31',
          value: '1.1M'
        },
        tags: ['resistente', 'técnico', 'polivalente', 'disciplinado', 'ofensivo'],
        notes: 'Lateral técnico con gran resistencia física.',
        marketValue: 1400000
      }
    ];
  }

  setupEventListeners() {
    const searchForm = document.getElementById('advancedSearchForm');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const sortSelect = document.getElementById('sortResults');

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.sortResults();
      });
    }

    // Event listeners adicionales para nuevas funcionalidades
    window.updateStates = () => this.updateStates();
    window.toggleContractFields = () => this.toggleContractFields();
    window.toggleStateDropdown = () => this.toggleStateDropdown();
    window.selectState = (stateName) => this.selectState(stateName);

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      const dropdown = document.querySelector('.multi-select-dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        this.closeStateDropdown();
      }
    });

    // Inicializar estados seleccionados y etiquetas
    this.selectedStates = [];
    this.selectedTags = [];
  }

  collectFilters() {
    return {
      name: document.getElementById('playerName')?.value?.toLowerCase() || '',
      ageMin: parseInt(document.getElementById('ageMin')?.value) || null,
      ageMax: parseInt(document.getElementById('ageMax')?.value) || null,
      primaryPosition: document.getElementById('primaryPosition')?.value || '',
      secondaryPosition: document.getElementById('secondaryPosition')?.value || '',
      foot: document.getElementById('foot')?.value || '',
      nationality: document.getElementById('nationality')?.value || '',
      country: document.getElementById('country')?.value || '',
      states: this.selectedStates || [],
      tags: this.selectedTags || [],
      league: document.getElementById('league')?.value || '',
      club: document.getElementById('club')?.value?.toLowerCase() || '',
      heightMin: parseInt(document.getElementById('heightMin')?.value) || null,
      heightMax: parseInt(document.getElementById('heightMax')?.value) || null,
      weightMin: parseInt(document.getElementById('weightMin')?.value) || null,
      weightMax: parseInt(document.getElementById('weightMax')?.value) || null,
      contractStatus: document.getElementById('contractStatus')?.value || '',
      contractExpiry: document.getElementById('contractExpiry')?.value || ''
    };
  }

  performSearch() {
    const filters = this.collectFilters();
    this.searchResults = this.filterPlayers(filters);
    this.displayResults();
  }

  filterPlayers(filters) {
    return this.players.filter(player => {
      // Filtro por nombre
      if (filters.name && !player.name.toLowerCase().includes(filters.name)) {
        return false;
      }

      // Filtro por edad
      if (filters.ageMin !== null && player.age < filters.ageMin) return false;
      if (filters.ageMax !== null && player.age > filters.ageMax) return false;

      // Filtro por posición primaria
      if (filters.primaryPosition && player.primaryPosition !== filters.primaryPosition) {
        // Si no coincide con la primaria, verificar si coincide con la secundaria
        if (filters.primaryPosition !== player.secondaryPosition) return false;
      }

      // Filtro por posición secundaria
      if (filters.secondaryPosition && 
          player.secondaryPosition !== filters.secondaryPosition &&
          player.primaryPosition !== filters.secondaryPosition) return false;

      // Filtro por pierna hábil
      if (filters.foot && player.foot !== filters.foot) return false;

      // Filtro por nacionalidad
      if (filters.nationality && player.nationality !== filters.nationality) return false;

      // Filtro por país de residencia
      if (filters.country && player.country !== filters.country) return false;

      // Filtro por estados/departamentos (múltiples)
      if (filters.states && filters.states.length > 0 && !filters.states.includes(player.state)) return false;

      // Filtro por etiquetas/características
      if (filters.tags && filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => player.tags && player.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      // Filtro por liga
      if (filters.league && player.league !== filters.league) return false;

      // Filtro por club
      if (filters.club && !player.club.toLowerCase().includes(filters.club)) return false;

      // Filtros físicos
      if (filters.heightMin !== null && player.height < filters.heightMin) return false;
      if (filters.heightMax !== null && player.height > filters.heightMax) return false;
      if (filters.weightMin !== null && player.weight < filters.weightMin) return false;
      if (filters.weightMax !== null && player.weight > filters.weightMax) return false;

      // Filtro por estado contractual
      if (filters.contractStatus && player.contract.status !== filters.contractStatus) return false;

      // Filtros contractuales
      if (filters.contractExpiry && player.contract.expires) {
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

  displayResults() {
    const container = document.getElementById('searchResults');
    const countElement = document.getElementById('resultsCount');
    
    if (countElement) {
      countElement.textContent = `${this.searchResults.length} jugador${this.searchResults.length !== 1 ? 'es' : ''} encontrado${this.searchResults.length !== 1 ? 's' : ''}`;
    }

    if (this.searchResults.length === 0) {
      container.innerHTML = `
        <div class="search-placeholder">
          <i class="fas fa-search"></i>
          <h3>No se encontraron jugadores</h3>
          <p>Intenta ajustar los filtros para obtener más resultados</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="results-grid">
        ${this.searchResults.map(player => this.createPlayerCard(player)).join('')}
      </div>
    `;
  }

  renderFollowButton(playerId) {
    const isFollowing = this.watchlist.some(p => {
      const pid = p.player_id || p.id;
      return pid === playerId;
    });
    
    if (isFollowing) {
      return `<button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); advancedSearch.toggleFollow('${playerId}')">
                <i class="fas fa-star"></i> Siguiendo
              </button>`;
    } else {
      return `<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); advancedSearch.toggleFollow('${playerId}')">
                <i class="far fa-star"></i> Seguir
              </button>`;
    }
  }

  createPlayerCard(player) {
    const contractStatusLabels = {
      professional: { text: 'Profesional', class: 'professional' },
      semiprofessional: { text: 'Semi-profesional', class: 'semiprofessional' },
      amateur: { text: 'Amateur', class: 'amateur' },
      'free-agent': { text: 'Agente libre', class: 'free-agent' },
      youth: { text: 'Juvenil', class: 'youth' }
    };

    const contractStatus = contractStatusLabels[player.contract.status] || { text: 'No definido', class: 'undefined' };
    
    return `
      <div class="player-card" data-player-id="${player.id}" onclick="advancedSearch.showPlayerProfile('${player.id}')">
        <div class="player-contract-status">
          <span class="contract-badge ${contractStatus.class}">${contractStatus.text}</span>
        </div>
        
        <div class="player-card-header">
          <div class="player-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="player-info">
            <h3 class="player-name">${player.name}</h3>
            <p class="player-position">${player.primaryPosition}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ''}</p>
          </div>
        </div>
        
        <div class="player-details">
          <div class="detail-item">
            <span class="detail-label">Edad:</span>
            <span class="detail-value">${player.age} años</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Nacionalidad:</span>
            <span class="detail-value">${player.nationality}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Club:</span>
            <span class="detail-value">${player.club}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Liga:</span>
            <span class="detail-value">${player.league}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Ubicación:</span>
            <span class="detail-value">${player.city}, ${player.state}</span>
          </div>
        </div>
        
        ${player.tags && player.tags.length > 0 ? `
        <div class="player-tags">
          ${player.tags.slice(0, 4).map(tag => `<span class="player-tag">${this.getTagEmoji(tag)} ${tag}</span>`).join('')}
          ${player.tags.length > 4 ? `<span class="more-tags">+${player.tags.length - 4}</span>` : ''}
        </div>
        ` : ''}
        
        <div class="player-actions">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); advancedSearch.showPlayerProfile('${player.id}')">
            <i class="fas fa-eye"></i> Ver Perfil
          </button>
          ${this.renderFollowButton(player.id)}
        </div>
      </div>
    `;
  }

  showPlayerProfile(playerId) {
    // Redirigir a la página dedicada del perfil
    window.location.href = `perfil-jugador.html?id=${playerId}`;
  }

  createPlayerProfileContent(player) {
    const formatCurrency = (amount) => amount > 0 ? `€${(amount / 1000000).toFixed(1)}M` : 'No definido';
    const contractStatusLabels = {
      professional: 'Profesional',
      semiprofessional: 'Semi-profesional',
      amateur: 'Amateur',
      'free-agent': 'Agente libre',
      youth: 'Juvenil'
    };
    
    return `
      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="profile-avatar">
            <i class="fas fa-user"></i>
          </div>
          
          <div class="profile-basic-info">
            <h2 class="profile-name">${player.name}</h2>
            <p class="profile-position">${player.primaryPosition}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ''}</p>
            <p class="profile-club">${player.club}</p>
          </div>
          
          <div class="profile-info-grid">
            <div class="profile-info-item">
              <span class="profile-info-label">Edad:</span>
              <span class="profile-info-value">${player.age} años</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Nacionalidad:</span>
              <span class="profile-info-value">${player.nationality}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">País:</span>
              <span class="profile-info-value">${player.country}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Estado:</span>
              <span class="profile-info-value">${player.state}</span>
            </div>
            <div class="profile-info-item">
              <span class="profile-info-label">Ciudad:</span>
              <span class="profile-info-value">${player.city}</span>
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
              <span class="profile-info-label">Estado Contractual:</span>
              <span class="profile-info-value">${contractStatusLabels[player.contract.status] || 'No definido'}</span>
            </div>
            ${player.contract.expires ? `
            <div class="profile-info-item">
              <span class="profile-info-label">Contrato vence:</span>
              <span class="profile-info-value">${player.contract.expires}</span>
            </div>
            ` : ''}
            <div class="profile-info-item">
              <span class="profile-info-label">Valor de Mercado:</span>
              <span class="profile-info-value">${formatCurrency(player.marketValue)}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-main">
          <!-- Información Básica -->
          <div class="stats-section">
            <h3 class="stats-title">
              <i class="fas fa-info-circle"></i> Información Detallada
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Posición Primaria:</strong> ${player.primaryPosition}
              </div>
              ${player.secondaryPosition ? `
              <div class="info-item">
                <strong>Posición Secundaria:</strong> ${player.secondaryPosition}
              </div>
              ` : ''}
              <div class="info-item">
                <strong>Pierna Hábil:</strong> ${player.foot}
              </div>
              <div class="info-item">
                <strong>Edad:</strong> ${player.age} años
              </div>
              <div class="info-item">
                <strong>Altura/Peso:</strong> ${player.height}cm / ${player.weight}kg
              </div>
              <div class="info-item">
                <strong>Nacionalidad:</strong> ${player.nationality}
              </div>
            </div>
          </div>
          
          <!-- Información Contractual -->
          <div class="stats-section">
            <h3 class="stats-title">
              <i class="fas fa-file-contract"></i> Información Contractual
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <strong>Estado:</strong> ${contractStatusLabels[player.contract.status] || 'No definido'}
              </div>
              ${player.contract.expires ? `
              <div class="info-item">
                <strong>Contrato vence:</strong> ${player.contract.expires}
              </div>
              ` : ''}
              <div class="info-item">
                <strong>Valor de Mercado:</strong> ${formatCurrency(player.marketValue)}
              </div>
              <div class="info-item">
                <strong>Liga:</strong> ${player.league}
              </div>
              <div class="info-item">
                <strong>Club Actual:</strong> ${player.club}
              </div>
            </div>
          </div>
          
          <!-- Notas -->
          ${player.notes ? `
            <div class="stats-section">
              <h3 class="stats-title">
                <i class="fas fa-sticky-note"></i> Notas del Scout
              </h3>
              <p style="color: var(--text-secondary); line-height: 1.6;">${player.notes}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

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



  sortResults() {
    const sortBy = document.getElementById('sortResults').value;
    
    this.searchResults.sort((a, b) => {
      switch(sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'age':
          return a.age - b.age;
        case 'marketValue':
          return b.marketValue - a.marketValue;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.rating - a.rating;
      }
    });
    
    this.displayResults();
  }

  async toggleFollow(playerId) {
    const isFollowing = this.watchlist.some(p => {
      const pid = p.player_id || p.id;
      return pid === playerId;
    });
    
    
    
    if (isFollowing) {
      await this.removeFromWatchlist(playerId);
    } else {
      await this.addToWatchlist(playerId);
    }
  }

  async addToWatchlist(playerId) {
    try {
      // Verificar que tenemos el userId
      if (!this.currentUserId) {
        console.error('❌ No hay usuario logueado. Esperando...');
        await this.getCurrentUser();
        if (!this.currentUserId) {
          this.showMessage('Error: No se pudo obtener el usuario', 'error');
          return;
        }
      }

      

      // Buscar el jugador en los resultados de búsqueda
      const player = this.searchResults.find(p => p.id === playerId);
      
      if (!player) {
        console.error('❌ Jugador no encontrado en resultados');
        return;
      }

      // Verificar si ya está en la lista
      const isAlreadyFollowing = this.watchlist.some(p => p.player_id === playerId || p.id === playerId);
      if (isAlreadyFollowing) {
        this.showMessage('Este jugador ya está en tu lista de seguimiento', 'info');
        return;
      }

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('watchlist')
        .insert([
          {
            scout_id: this.currentUserId,
            player_id: playerId,
            added_date: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('❌ Error al guardar en Supabase:', error);
        this.showMessage('Error al añadir a la lista de seguimiento', 'error');
        return;
      }

      

      // Registrar actividad
      if (window.logPlayerAddedToWatchlist) {
        const playerPosition = player.primaryPosition || player.position || 'Posición no especificada';
        await window.logPlayerAddedToWatchlist(
          playerId,
          player.name || `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          playerPosition
        );
      }

      // Agregar a la lista local
      this.watchlist.push({
        ...player,
        player_id: playerId,
        addedDate: new Date().toISOString(),
        addedTimestamp: Date.now()
      });
      
      // Actualizar el botón
      this.updateFollowButton(playerId);
      
      // Mostrar mensaje de éxito
      const playerName = player.name || `${player.first_name} ${player.last_name}`;
      this.showMessage(`✓ ${playerName} añadido a tu lista de seguimiento`, 'success');
      
      
    } catch (error) {
      console.error('❌ Error al añadir a lista de seguimiento:', error);
      this.showMessage('Error al añadir a la lista de seguimiento', 'error');
    }
  }

  async removeFromWatchlist(playerId) {
    try {
      // Encontrar el jugador antes de eliminarlo
      const player = this.watchlist.find(p => p.player_id === playerId || p.id === playerId);
      
      if (!player) {
        console.error('❌ Jugador no encontrado en lista de seguimiento');
        return;
      }

      // Eliminar de Supabase
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('scout_id', this.currentUserId)
        .eq('player_id', playerId);

      if (error) {
        console.error('❌ Error al eliminar de Supabase:', error);
        this.showMessage('Error al eliminar de la lista de seguimiento', 'error');
        return;
      }

      // Eliminar de la lista local
      this.watchlist = this.watchlist.filter(p => {
        const pid = p.player_id || p.id;
        return pid !== playerId;
      });
      
      // Actualizar el botón
      this.updateFollowButton(playerId);
      
      // Mostrar mensaje
      const playerName = player.name || `${player.first_name} ${player.last_name}`;
      this.showMessage(`✓ ${playerName} eliminado de tu lista de seguimiento`, 'success');
      
      
    } catch (error) {
      console.error('❌ Error al eliminar de lista de seguimiento:', error);
      this.showMessage('Error al eliminar de la lista de seguimiento', 'error');
    }
  }

  saveWatchlist() {
    try {
      localStorage.setItem('scoutconnect_watchlist', JSON.stringify(this.watchlist));
      
    } catch (error) {
      console.error('❌ Error al guardar lista de seguimiento:', error);
    }
  }

  updateFollowButton(playerId) {
    // Buscar todas las cards del jugador y actualizar el botón
    const cards = document.querySelectorAll(`[data-player-id="${playerId}"]`);
    
    cards.forEach(card => {
      const buttonContainer = card.querySelector('.player-actions');
      if (buttonContainer) {
        const newButton = this.renderFollowButton(playerId);
        const oldButton = buttonContainer.querySelector('button[onclick*="toggleFollow"]');
        if (oldButton) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newButton;
          oldButton.replaceWith(tempDiv.firstElementChild);
        }
      }
    });
  }

  showMessage(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      background: ${type === 'success' ? 'var(--success-color)' : 'var(--info-color)'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 400px;
    `;
    alertDiv.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      ${message}
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  // Función para actualizar estados basado en el país seleccionado
  updateStates() {
    const countrySelect = document.getElementById('country');
    const stateDropdownList = document.getElementById('stateDropdownList');
    const stateButtonText = document.getElementById('stateButtonText');
    
    const selectedCountry = countrySelect.value;
    
    // Limpiar estados seleccionados
    this.selectedStates = [];
    this.updateStateButtonText();
    
    // Limpiar lista
    stateDropdownList.innerHTML = '';
    
    if (!selectedCountry) {
      stateButtonText.textContent = 'Selecciona primero un país';
      stateDropdownList.innerHTML = '<div class="multi-select-item disabled"><span>Selecciona primero un país</span></div>';
      return;
    }
    
    if (this.countriesData && this.countriesData.countries[selectedCountry]) {
      const states = this.countriesData.countries[selectedCountry].states;
      
      stateButtonText.textContent = 'Seleccionar estados...';
      
      states.forEach(state => {
        const item = document.createElement('div');
        item.className = 'multi-select-item';
        item.onclick = (e) => {
          e.stopPropagation();
          this.selectState(state);
        };
        
        item.innerHTML = `
          <div class="multi-select-checkbox" id="checkbox-${state.replace(/\s+/g, '-')}">
            <i class="fas fa-check"></i>
          </div>
          <div class="multi-select-label">${state}</div>
        `;
        
        stateDropdownList.appendChild(item);
      });
    } else {
      stateButtonText.textContent = 'No hay estados disponibles';
      stateDropdownList.innerHTML = '<div class="multi-select-item disabled"><span>No hay estados disponibles</span></div>';
    }
  }

  // Función para mostrar/ocultar campos de contrato basado en el estado contractual
  toggleContractFields() {
    const contractStatus = document.getElementById('contractStatus').value;
    const contractExpiryContainer = document.getElementById('contractExpiryContainer');
    
    if (contractStatus === 'amateur') {
      contractExpiryContainer.style.display = 'none';
      document.getElementById('contractExpiry').value = '';
    } else {
      contractExpiryContainer.style.display = 'block';
    }
  }

  // Función para mostrar/ocultar dropdown de estados
  toggleStateDropdown() {
    const dropdown = document.getElementById('stateDropdownList');
    const button = document.querySelector('.multi-select-button');
    
    if (dropdown.classList.contains('show')) {
      this.closeStateDropdown();
    } else {
      dropdown.classList.add('show');
      button.classList.add('active');
    }
  }

  // Función para cerrar dropdown de estados
  closeStateDropdown() {
    const dropdown = document.getElementById('stateDropdownList');
    const button = document.querySelector('.multi-select-button');
    
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }

  // Función para seleccionar/deseleccionar un estado
  selectState(stateName) {
    const checkbox = document.getElementById(`checkbox-${stateName.replace(/\s+/g, '-')}`);
    
    if (this.selectedStates.includes(stateName)) {
      // Deseleccionar
      this.selectedStates = this.selectedStates.filter(s => s !== stateName);
      checkbox.classList.remove('checked');
    } else {
      // Seleccionar
      this.selectedStates.push(stateName);
      checkbox.classList.add('checked');
    }
    
    this.updateStateButtonText();
  }

  // Función para actualizar el texto del botón de estados
  updateStateButtonText() {
    const stateButtonText = document.getElementById('stateButtonText');
    
    if (this.selectedStates.length === 0) {
      const countrySelect = document.getElementById('country');
      if (countrySelect.value) {
        stateButtonText.innerHTML = 'Seleccionar estados...';
      } else {
        stateButtonText.innerHTML = 'Selecciona primero un país';
      }
    } else if (this.selectedStates.length === 1) {
      stateButtonText.innerHTML = this.selectedStates[0];
    } else if (this.selectedStates.length <= 3) {
      stateButtonText.innerHTML = this.selectedStates.join(', ');
    } else {
      stateButtonText.innerHTML = `${this.selectedStates.slice(0, 2).join(', ')} <span class="states-count">+${this.selectedStates.length - 2}</span>`;
    }
  }



  // Sistema de Etiquetas
  setupTags() {
    this.predefinedTags = {
      physical: {
        name: 'Físico',
        icon: 'fas fa-dumbbell',
        tags: [
          { id: 'fuerte', name: 'Fuerte', icon: '💪' },
          { id: 'veloz', name: 'Veloz', icon: '⚡' },
          { id: 'resistente', name: 'Resistente', icon: '🏃' },
          { id: 'aéreo', name: 'Aéreo', icon: '🦅' },
          { id: 'agilidad', name: 'Ágil', icon: '🤸' },
          { id: 'altura', name: 'Alto', icon: '📏' },
          { id: 'potencia', name: 'Potente', icon: '🔥' }
        ]
      },
      technical: {
        name: 'Técnico',
        icon: 'fas fa-futbol',
        tags: [
          { id: 'técnico', name: 'Técnico', icon: '⚽' },
          { id: 'driblador', name: 'Driblador', icon: '🎯' },
          { id: 'goleador', name: 'Goleador', icon: '⚽' },
          { id: 'pases largos', name: 'Pases Largos', icon: '🎯' },
          { id: 'centros', name: 'Centros', icon: '📐' },
          { id: 'clínico', name: 'Clínico', icon: '🎯' },
          { id: 'elegante', name: 'Elegante', icon: '✨' },
          { id: 'reflejos', name: 'Reflejos', icon: '🧤' }
        ]
      },
      mental: {
        name: 'Mental',
        icon: 'fas fa-brain',
        tags: [
          { id: 'líder', name: 'Líder', icon: '👑' },
          { id: 'inteligente', name: 'Inteligente', icon: '🧠' },
          { id: 'creativo', name: 'Creativo', icon: '🎨' },
          { id: 'aguerrido', name: 'Aguerrido', icon: '⚔️' },
          { id: 'ambicioso', name: 'Ambicioso', icon: '🎯' },
          { id: 'disciplinado', name: 'Disciplinado', icon: '📚' },
          { id: 'confiable', name: 'Confiable', icon: '🛡️' },
          { id: 'instinto', name: 'Instinto', icon: '🔮' }
        ]
      },
      tactical: {
        name: 'Táctico',
        icon: 'fas fa-chess',
        tags: [
          { id: 'polivalente', name: 'Polivalente', icon: '🔄' },
          { id: 'ofensivo', name: 'Ofensivo', icon: '⚔️' },
          { id: 'defensivo', name: 'Defensivo', icon: '🛡️' },
          { id: 'posicional', name: 'Posicional', icon: '📍' },
          { id: 'pressing', name: 'Pressing', icon: '🔥' },
          { id: 'contraataque', name: 'Contraataque', icon: '⚡' }
        ]
      },
      special: {
        name: 'Especiales',
        icon: 'fas fa-star',
        tags: [
          { id: 'joven talento', name: 'Joven Talento', icon: '🌟' },
          { id: 'experimentado', name: 'Experimentado', icon: '🏆' },
          { id: 'versátil', name: 'Versátil', icon: '🔧' },
          { id: 'zurdo', name: 'Zurdo', icon: '👈' },
          { id: 'ambidiestro', name: 'Ambidiestro', icon: '👐' },
          { id: 'espectacular', name: 'Espectacular', icon: '🎪' },
          { id: 'promesa', name: 'Promesa', icon: '💎' }
        ]
      }
    };

    this.renderTags();
  }

  renderTags() {
    Object.keys(this.predefinedTags).forEach(categoryKey => {
      const category = this.predefinedTags[categoryKey];
      const container = document.getElementById(`${categoryKey}Tags`);
      
      if (container) {
        container.innerHTML = '';
        
        category.tags.forEach(tag => {
          const tagElement = document.createElement('div');
          tagElement.className = `tag-checkbox-item ${categoryKey}`;
          
          tagElement.innerHTML = `
            <label class="tag-checkbox-label">
              <input type="checkbox" 
                     class="tag-checkbox" 
                     value="${tag.id}"
                     onchange="advancedSearch.handleTagCheckbox('${tag.id}', '${categoryKey}', this)">
              <span class="tag-checkmark"></span>
              <span class="tag-icon">${tag.icon}</span>
              <span class="tag-text">${tag.name}</span>
            </label>
          `;
          
          container.appendChild(tagElement);
        });
      }
    });
  }

  handleTagCheckbox(tagId, category, checkbox) {
    if (checkbox.checked) {
      // Agregar etiqueta si no está seleccionada
      if (!this.selectedTags.includes(tagId)) {
        this.selectedTags.push(tagId);
      }
    } else {
      // Remover etiqueta
      this.selectedTags = this.selectedTags.filter(t => t !== tagId);
    }
    
    this.updateTagsSummary();
    
  }

  updateTagsSummary() {
    const count = this.selectedTags.length;
    const summaryElement = document.querySelector('.tags-summary');
    
    if (summaryElement) {
      if (count > 0) {
        summaryElement.innerHTML = `
          <span class="tags-count">
            <i class="fas fa-tags"></i>
            ${count} etiqueta${count > 1 ? 's' : ''} seleccionada${count > 1 ? 's' : ''}
          </span>
          <button class="clear-selected-tags" onclick="advancedSearch.clearSelectedTags()">
            <i class="fas fa-times"></i> Limpiar etiquetas
          </button>
        `;
        summaryElement.style.display = 'flex';
      } else {
        summaryElement.style.display = 'none';
      }
    }
    
    
  }

  clearSelectedTags() {
    this.selectedTags = [];
    document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    this.updateTagsSummary();
  }

  getTagEmoji(tagName) {
    const tagEmojis = {
      'fuerte': '💪',
      'veloz': '⚡',
      'resistente': '🏃',
      'aéreo': '🦅',
      'ágil': '🤸',
      'alto': '📏',
      'potente': '🔥',
      'técnico': '⚽',
      'driblador': '🎯',
      'goleador': '⚽',
      'pases largos': '🎯',
      'centros': '📐',
      'clínico': '🎯',
      'elegante': '✨',
      'reflejos': '🧤',
      'líder': '👑',
      'inteligente': '🧠',
      'creativo': '🎨',
      'aguerrido': '⚔️',
      'ambicioso': '🎯',
      'disciplinado': '📚',
      'confiable': '🛡️',
      'instinto': '🔮',
      'polivalente': '🔄',
      'ofensivo': '⚔️',
      'defensivo': '🛡️',
      'posicional': '📍',
      'pressing': '🔥',
      'contraataque': '⚡',
      'joven talento': '🌟',
      'experimentado': '🏆',
      'versátil': '🔧',
      'zurdo': '👈',
      'ambidiestro': '👐',
      'espectacular': '🎪',
      'promesa': '💎'
    };
    
    return tagEmojis[tagName] || '🏈';
  }



  // Actualizar clearFilters para incluir etiquetas
  clearFilters() {
    const form = document.getElementById('advancedSearchForm');
    if (form) {
      form.reset();
    }
    
    // Limpiar estados seleccionados
    this.selectedStates = [];
    this.updateStateButtonText();
    
    // Limpiar etiquetas seleccionadas (checkboxes)
    this.selectedTags = [];
    document.querySelectorAll('.tag-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    this.updateTagsSummary();
    
    // Resetear dropdown de estados
    const stateDropdownList = document.getElementById('stateDropdownList');
    stateDropdownList.innerHTML = '<div class="multi-select-item disabled"><span>Selecciona primero un país</span></div>';
    
    // Resetear resultados
    const container = document.getElementById('searchResults');
    container.innerHTML = `
      <div class="search-placeholder">
        <i class="fas fa-search"></i>
        <h3>Utiliza los filtros para buscar jugadores</h3>
        <p>Ajusta los criterios en el panel izquierdo para encontrar el talento perfecto</p>
      </div>
    `;
    
    document.getElementById('resultsCount').textContent = 'Use los filtros para buscar jugadores';
  }

  // ================ SISTEMA DE LISTA DE SEGUIMIENTO ================
  
  loadWatchlist() {
    try {
      if (!this.currentUserId) {
        
        return [];
      }
      const key = `scoutconnect_watchlist_${this.currentUserId}`;
      const saved = localStorage.getItem(key);
      
      
      const parsed = saved ? JSON.parse(saved) : [];
      
      return parsed;
    } catch (error) {
      console.error('Error al cargar watchlist:', error);
      return [];
    }
  }

  saveWatchlist() {
    try {
      if (!this.currentUserId) {
        console.error('⚠️ No se puede guardar: no hay usuario logueado');
        return;
      }
      const key = `scoutconnect_watchlist_${this.currentUserId}`;
      localStorage.setItem(key, JSON.stringify(this.watchlist));
      
      
      
    } catch (error) {
      console.error('Error al guardar watchlist:', error);
    }
  }

  // Método addToWatchlist movido arriba (async version con Supabase)

  updateFollowButton(playerId, isFollowing) {
    // Actualizar botones en resultados de búsqueda
    const buttons = document.querySelectorAll(`button[onclick*="addToWatchlist(${playerId})"]`);
    buttons.forEach(button => {
      if (isFollowing) {
        button.innerHTML = '<i class="fas fa-star-of-life"></i> Siguiendo';
        button.classList.remove('btn-secondary');
        button.classList.add('btn-warning');
      } else {
        button.innerHTML = '<i class="fas fa-star"></i> Seguir';
        button.classList.remove('btn-warning');
        button.classList.add('btn-secondary');
      }
    });
  }

  updateWatchlistUI() {
    // Actualizar contador en navegación si existe
    const watchlistCount = document.getElementById('watchlistCount');
    if (watchlistCount) {
      watchlistCount.textContent = this.watchlist.length;
      watchlistCount.style.display = this.watchlist.length > 0 ? 'inline' : 'none';
    }
  }

  getWatchlistCount() {
    return this.watchlist.length;
  }

  clearWatchlist() {
    if (confirm('¿Estás seguro de que quieres limpiar toda la lista de seguimiento?')) {
      this.watchlist = [];
      this.saveWatchlist();
      this.showNotification('Lista de seguimiento limpiada', 'info');
      this.updateWatchlistUI();
      // Actualizar todos los botones
      this.players.forEach(player => {
        this.updateFollowButton(player.id, false);
      });
    }
  }

  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Función global para cerrar modales
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  
  
  // Verificar que Supabase esté disponible
  if (typeof supabase === 'undefined') {
    console.error('❌ Error: Supabase no está definido. Verifica que supabase-config.js se haya cargado correctamente.');
    
    // Mostrar mensaje de error en la UI
    const container = document.getElementById('searchResults');
    if (container) {
      container.innerHTML = `
        <div class="search-placeholder" style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
          <h3 style="color: #dc3545;">Error de Configuración</h3>
          <p>No se pudo conectar con la base de datos.</p>
          <p style="color: #6c757d; margin-top: 10px;">
            Verifica que el archivo <code>JS/supabase-config.js</code> exista y esté configurado correctamente.
          </p>
        </div>
      `;
    }
    return;
  }
  
  
  window.advancedSearch = new AdvancedSearch();
  await window.advancedSearch.init();
});
