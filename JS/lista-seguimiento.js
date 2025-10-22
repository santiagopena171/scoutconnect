// ===== LISTA DE SEGUIMIENTO - JAVASCRIPT =====

class WatchlistManager {
  constructor() {
    this.currentUserId = null;
    this.watchlist = [];
    this.filteredWatchlist = [];
  }

  async init() {
    console.log('🌟 Iniciando Lista de Seguimiento...');
    await this.getCurrentUser();
    await this.loadWatchlistFromSupabase();
    this.filteredWatchlist = [...this.watchlist];
    this.setupEventListeners();
    this.updateStats();
    this.renderWatchlist();
    this.updateNavCounter();
    console.log('✅ Lista de Seguimiento inicializada');
  }

  async loadWatchlistFromSupabase() {
    try {
      if (!this.currentUserId) {
        console.log('⚠️ No hay usuario para cargar watchlist');
        this.watchlist = [];
        return;
      }

      console.log('📥 Cargando watchlist desde Supabase...');

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

      console.log('📊 Watchlist entries:', watchlistData?.length || 0);

      if (!watchlistData || watchlistData.length === 0) {
        console.log('📭 No hay jugadores en la lista');
        this.watchlist = [];
        return;
      }

      // Obtener los IDs de jugadores
      const playerIds = watchlistData.map(item => item.player_id);
      console.log('🎯 Player IDs:', playerIds);

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

      console.log('✅ Jugadores cargados:', playersData?.length || 0);

      // Combinar los datos
      this.watchlist = watchlistData.map(item => {
        const player = playersData.find(p => p.id === item.player_id);
        if (!player) {
          console.warn('⚠️ Jugador no encontrado:', item.player_id);
          return null;
        }

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
          addedTimestamp: new Date(item.added_date).getTime(),
          tags: []
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
        console.log('👤 Usuario actual:', this.currentUserId);
      }
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
    }
  }

  loadWatchlist() {
    try {
      if (!this.currentUserId) {
        console.log('⚠️ No hay usuario logueado');
        return [];
      }
      const key = `scoutconnect_watchlist_${this.currentUserId}`;
      const saved = localStorage.getItem(key);
      console.log('📥 Cargando watchlist para usuario:', this.currentUserId);
      console.log('🔑 Clave utilizada:', key);
      console.log('💾 Datos guardados:', saved);
      const parsed = saved ? JSON.parse(saved) : [];
      console.log('📊 Jugadores cargados:', parsed.length);
      return parsed;
    } catch (error) {
      console.error('❌ Error al cargar watchlist:', error);
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
      console.log('💾 Watchlist guardada para usuario:', this.currentUserId, '- Items:', this.watchlist.length);
    } catch (error) {
      console.error('Error al guardar watchlist:', error);
    }
  }

  setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('watchlistSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterWatchlist();
      });
    }

    // Filtros
    const positionFilter = document.getElementById('positionFilter');
    const sortBy = document.getElementById('sortBy');

    if (positionFilter) {
      positionFilter.addEventListener('change', () => this.filterWatchlist());
    }

    if (sortBy) {
      sortBy.addEventListener('change', () => this.filterWatchlist());
    }
  }

  updateStats() {
    const totalElement = document.getElementById('totalFollowed');
    const recentElement = document.getElementById('recentlyAdded');

    if (totalElement) {
      totalElement.textContent = this.watchlist.length;
    }

    if (recentElement) {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recent = this.watchlist.filter(player => 
        player.addedTimestamp && player.addedTimestamp > sevenDaysAgo
      ).length;
      recentElement.textContent = recent;
    }
  }

  updateNavCounter() {
    const navCounter = document.getElementById('navWatchlistCount');
    if (navCounter) {
      navCounter.textContent = this.watchlist.length;
      navCounter.style.display = this.watchlist.length > 0 ? 'inline' : 'none';
    }
  }

  filterWatchlist() {
    const searchTerm = document.getElementById('watchlistSearch')?.value.toLowerCase() || '';
    const positionFilter = document.getElementById('positionFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'recent';

    // Aplicar filtros
    this.filteredWatchlist = this.watchlist.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm) ||
                           player.club.toLowerCase().includes(searchTerm) ||
                           player.nationality.toLowerCase().includes(searchTerm);
      
      const matchesPosition = !positionFilter || 
                             player.primaryPosition === positionFilter ||
                             player.secondaryPosition === positionFilter;

      return matchesSearch && matchesPosition;
    });

    // Aplicar ordenamiento
    this.filteredWatchlist.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return a.age - b.age;
        case 'position':
          return a.primaryPosition.localeCompare(b.primaryPosition);
        case 'recent':
        default:
          return (b.addedTimestamp || 0) - (a.addedTimestamp || 0);
      }
    });

    this.renderWatchlist();
  }

  renderWatchlist() {
    const container = document.getElementById('watchlistResults');
    const emptyState = document.getElementById('emptyWatchlist');

    if (!container) return;

    if (this.filteredWatchlist.length === 0) {
      container.style.display = 'none';
      if (emptyState) {
        emptyState.style.display = 'block';
      }
      return;
    }

    container.style.display = 'grid';
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    container.innerHTML = this.filteredWatchlist.map(player => 
      this.createWatchlistCard(player)
    ).join('');
  }

  createWatchlistCard(player) {
    const addedDate = player.addedDate ? 
      new Date(player.addedDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : 'Fecha desconocida';

    const tags = player.tags ? player.tags.slice(0, 3) : [];

    return `
      <div class="watchlist-player-card" onclick="watchlistManager.showPlayerProfile('${player.id}')"
        <div class="watchlist-card-header">
          <div class="watchlist-player-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="watchlist-player-info">
            <h3>${player.name}</h3>
            <p class="watchlist-player-position">
              ${player.primaryPosition}${player.secondaryPosition ? ` / ${player.secondaryPosition}` : ''}
            </p>
            <span class="watchlist-added-date">
              <i class="fas fa-calendar-plus"></i> ${addedDate}
            </span>
          </div>
        </div>

        <div class="watchlist-player-details">
          <div class="watchlist-detail-item">
            <span class="watchlist-detail-label">Edad:</span>
            <span class="watchlist-detail-value">${player.age} años</span>
          </div>
          <div class="watchlist-detail-item">
            <span class="watchlist-detail-label">Nacionalidad:</span>
            <span class="watchlist-detail-value">${player.nationality}</span>
          </div>
          <div class="watchlist-detail-item">
            <span class="watchlist-detail-label">Club:</span>
            <span class="watchlist-detail-value">${player.club}</span>
          </div>
          <div class="watchlist-detail-item">
            <span class="watchlist-detail-label">Liga:</span>
            <span class="watchlist-detail-value">${player.league}</span>
          </div>
        </div>

        ${tags.length > 0 ? `
        <div class="watchlist-player-tags">
          ${tags.map(tag => `<span class="watchlist-tag">${this.getTagEmoji(tag)} ${tag}</span>`).join('')}
          ${player.tags && player.tags.length > 3 ? `<span class="watchlist-tag">+${player.tags.length - 3}</span>` : ''}
        </div>
        ` : ''}

        <div class="watchlist-player-actions">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); watchlistManager.showPlayerProfile('${player.id}')">
            <i class="fas fa-eye"></i> Ver Perfil
          </button>
          <button class="btn btn-remove btn-sm" onclick="event.stopPropagation(); watchlistManager.removeFromWatchlist('${player.id}')">
            <i class="fas fa-star-of-life"></i> Quitar
          </button>
        </div>
      </div>
    `;
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

  async removeFromWatchlist(playerId) {
    const player = this.watchlist.find(p => p.id === playerId || p.player_id === playerId);
    if (!player) return;

    if (confirm(`¿Estás seguro de que quieres quitar a ${player.name} de tu lista de seguimiento?`)) {
      try {
        // Eliminar de Supabase
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('scout_id', this.currentUserId)
          .eq('player_id', playerId);

        if (error) {
          console.error('❌ Error al eliminar de Supabase:', error);
          this.showNotification('Error al eliminar de la lista', 'error');
          return;
        }

        // Eliminar de las listas locales
        this.watchlist = this.watchlist.filter(p => {
          const pid = p.player_id || p.id;
          return pid !== playerId;
        });
        this.filteredWatchlist = this.filteredWatchlist.filter(p => {
          const pid = p.player_id || p.id;
          return pid !== playerId;
        });
        
        this.updateStats();
        this.updateNavCounter();
        this.renderWatchlist();
        
        this.showNotification(`${player.name} removido de la lista de seguimiento`, 'info');
        console.log('✅ Jugador eliminado de watchlist');
      } catch (error) {
        console.error('❌ Error al eliminar:', error);
        this.showNotification('Error al eliminar de la lista', 'error');
      }
    }
  }

  clearAll() {
    if (this.watchlist.length === 0) {
      this.showNotification('La lista ya está vacía', 'info');
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar todos los ${this.watchlist.length} jugadores de tu lista de seguimiento?`)) {
      this.watchlist = [];
      this.filteredWatchlist = [];
      this.saveWatchlist();
      
      this.updateStats();
      this.updateNavCounter();
      this.renderWatchlist();
      
      this.showNotification('Lista de seguimiento limpiada completamente', 'success');
    }
  }

  exportWatchlist() {
    if (this.watchlist.length === 0) {
      this.showNotification('No hay jugadores para exportar', 'info');
      return;
    }

    const exportData = this.watchlist.map(player => ({
      name: player.name,
      age: player.age,
      position: player.primaryPosition,
      secondaryPosition: player.secondaryPosition,
      nationality: player.nationality,
      club: player.club,
      league: player.league,
      addedDate: player.addedDate,
      tags: player.tags?.join(', ') || ''
    }));

    const csv = this.convertToCSV(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `watchlist_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    window.URL.revokeObjectURL(url);
    this.showNotification('Lista exportada correctamente', 'success');
  }

  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  showPlayerProfile(playerId) {
    // Redirigir a la página dedicada del perfil
    window.location.href = `perfil-jugador.html?id=${playerId}`;
  }

  createPlayerProfileContent(player) {
    return `
      <div class="player-profile-content">
        <div class="profile-section">
          <h3>Información Personal</h3>
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">Edad:</span>
              <span class="profile-value">${player.age} años</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Nacionalidad:</span>
              <span class="profile-value">${player.nationality}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Altura:</span>
              <span class="profile-value">${player.height} cm</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Peso:</span>
              <span class="profile-value">${player.weight} kg</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Pie hábil:</span>
              <span class="profile-value">${player.foot}</span>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h3>Información Deportiva</h3>
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">Posición Principal:</span>
              <span class="profile-value">${player.primaryPosition}</span>
            </div>
            ${player.secondaryPosition ? `
            <div class="profile-item">
              <span class="profile-label">Posición Secundaria:</span>
              <span class="profile-value">${player.secondaryPosition}</span>
            </div>
            ` : ''}
            <div class="profile-item">
              <span class="profile-label">Club Actual:</span>
              <span class="profile-value">${player.club}</span>
            </div>
            <div class="profile-item">
              <span class="profile-label">Liga:</span>
              <span class="profile-value">${player.league}</span>
            </div>
          </div>
        </div>

        ${player.tags && player.tags.length > 0 ? `
        <div class="profile-section">
          <h3>Características</h3>
          <div class="profile-tags">
            ${player.tags.map(tag => `
              <span class="profile-tag">${this.getTagEmoji(tag)} ${tag}</span>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="profile-section">
          <h3>Información de Seguimiento</h3>
          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-label">Agregado el:</span>
              <span class="profile-value">${new Date(player.addedDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>
    `;
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

// Función global para cerrar modales
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM cargado, iniciando Lista de Seguimiento...');
  window.watchlistManager = new WatchlistManager();
  await window.watchlistManager.init();
});