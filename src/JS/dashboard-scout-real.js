// =============================================
// DASHBOARD SCOUT - ESTADÍSTICAS REALES CON SUPABASE
// =============================================

class DashboardScout {
  constructor() {
    this.currentUser = null;
    this.supabase = null;
    this.stats = {
      totalPlayers: 0,
      completedReports: 0,
      pendingEvaluations: 0,
      recommendedForSigning: 0,
      watchlistCount: 0,
      unreadMessages: 0
    };
    
    this.init();
  }

  async init() {
    // Asegurar que Supabase esté inicializado
    try {
      if (typeof getSupabaseClient === 'function') {
        this.supabase = await getSupabaseClient();
      } else if (typeof initSupabase === 'function') {
        this.supabase = await initSupabase();
      } else if (typeof window.supabase !== 'undefined') {
        this.supabase = window.supabase;
      } else {
        throw new Error('Supabase no disponible');
      }
    } catch (error) {
      console.error('❌ Error inicializando Supabase:', error);
      window.location.href = 'login.html';
      return;
    }

    // Verificar autenticación
    const { data: { session } } = await this.supabase.auth.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }

    // Cargar perfil del usuario actual
    await this.loadCurrentUserProfile(session.user.id);
    
    // Cargar estadísticas
    await this.loadAllStats();
    
    // Cargar últimas evaluaciones
    await this.loadRecentEvaluations();
    
    // Cargar watchlist
    await this.loadWatchlist();
    
    // Actualizar badge de mensajes
    await this.updateMessagesBadge();
    
    // Inicializar notificaciones
    await this.initNotifications();
    
    // Configurar dropdown de notificaciones
    this.setupNotificationsDropdown();
    
    // Configurar dropdown de perfil
    this.setupProfileDropdown();
    
    // Configurar navegación del sidebar
    this.setupNavigation();
    
    // Actualizar foto de perfil en navbar
    this.updateNavbarProfilePhoto();
  }

  updateNavbarProfilePhoto() {
    if (!this.currentUser) return;
    
    // Actualizar avatar en el navbar
    const profileDropdownImg = document.querySelector('.profile-dropdown img');
    if (profileDropdownImg && this.currentUser.avatar_url) {
      profileDropdownImg.src = this.currentUser.avatar_url;
      profileDropdownImg.onerror = () => {
        profileDropdownImg.src = 'imagenes/default-avatar.png';
      };
    }
    
    // Actualizar nombre si existe el elemento
    const profileName = document.querySelector('.profile-info .profile-name');
    if (profileName && this.currentUser.full_name) {
      profileName.textContent = this.currentUser.full_name;
    }
    
    // Actualizar email/rol si existe
    const profileRole = document.querySelector('.profile-info .profile-role');
    if (profileRole) {
      profileRole.textContent = this.currentUser.user_type === 'scout' ? 'Scout' : 'Usuario';
    }
  }

  async initNotifications() {
    // Verificar que el módulo de notificaciones esté cargado
    if (typeof window.Notifications !== 'undefined') {
      try {
        await window.Notifications.init({
          onNew: (notification) => {
            console.log('📨 Nueva notificación:', notification);
            this.updateNotificationBadge();
            this.loadNotificationsDropdown();
          }
        });
        
        // Cargar notificaciones en el dropdown
        await this.loadNotificationsDropdown();
        
        // Actualizar badge
        await this.updateNotificationBadge();
        
        console.log('✅ Notificaciones inicializadas');
      } catch (error) {
        console.error('❌ Error inicializando notificaciones:', error);
      }
    } else {
      console.warn('⚠️ Módulo de notificaciones no disponible');
    }
  }

  setupNotificationsDropdown() {
    const notifBtn = document.getElementById('notificationsBtn');
    const dropdown = document.getElementById('notificationsDropdown');
    const markAllSmall = document.getElementById('markAllReadSmall');
    
    if (!notifBtn || !dropdown) return;
    
    // Toggle dropdown
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      
      // Si se abre, recargar notificaciones
      if (dropdown.classList.contains('show')) {
        this.loadNotificationsDropdown();
      }
    });
    
    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== notifBtn) {
        dropdown.classList.remove('show');
      }
    });
    
    // Link "Ver todas" cierra el dropdown y navega
    const viewAllLink = dropdown.querySelector('.view-all-link');
    if (viewAllLink) {
      viewAllLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.remove('show');
        // Aquí puedes implementar navegación a página completa de notificaciones
      });
    }
    
    // Marcar todas como leídas
    if (markAllSmall) {
      markAllSmall.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (window.Notifications) {
          await window.Notifications.markAsRead(); // Sin ID marca todas
          await this.updateNotificationBadge();
          await this.loadNotificationsDropdown();
        }
      });
    }
  }

  setupProfileDropdown() {
    const profileToggle = document.getElementById('profileToggle');
    const profileMenu = document.getElementById('profileMenu');
    
    if (!profileToggle || !profileMenu) return;
    
    // Toggle dropdown al hacer clic en el avatar
    profileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('show');
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', () => {
      profileMenu.classList.remove('show');
    });
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
        
        // Cargar contenido de la sección si es necesario
        this.loadSectionContent(sectionId);
      });
    });
  }

  loadSectionContent(sectionId) {
    // Aquí puedes cargar contenido específico según la sección
    console.log('📄 Cargando sección:', sectionId);
    
    switch(sectionId) {
      case 'dashboard':
        // Ya está cargado en init()
        break;
      case 'players':
        // Cargar lista de jugadores
        console.log('📋 Cargar jugadores');
        break;
      case 'reports':
        // Cargar reportes
        console.log('📋 Cargar reportes');
        break;
      case 'calendar':
        // Cargar calendario
        console.log('📅 Cargar calendario');
        break;
      case 'analytics':
        // Cargar analytics
        console.log('📊 Cargar analytics');
        break;
      case 'notifications':
        // Cargar notificaciones
        console.log('🔔 Cargar notificaciones');
        break;
      default:
        console.log('⚠️ Sección no implementada:', sectionId);
    }
  }

  async loadNotificationsDropdown() {
    if (!window.Notifications) return;
    
    const dropdownList = document.getElementById('notificationsDropdownList');
    if (!dropdownList) return;
    
    // Mostrar loading
    dropdownList.innerHTML = `
      <div class="dropdown-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando...</p>
      </div>
    `;
    
    try {
      const notifications = await window.Notifications.fetchLatest(5);
      
      if (!notifications || notifications.length === 0) {
        dropdownList.innerHTML = `
          <div class="dropdown-empty">
            <i class="fas fa-bell-slash"></i>
            <p>No hay notificaciones</p>
          </div>
        `;
        return;
      }
      
      dropdownList.innerHTML = notifications.map(notif => 
        this.createDropdownNotificationHTML(notif)
      ).join('');
      
      // Agregar event listeners
      dropdownList.querySelectorAll('.dropdown-notification-item').forEach(item => {
        item.addEventListener('click', async () => {
          const id = item.dataset.id;
          const link = item.dataset.link;
          
          // Marcar como leída
          if (window.Notifications) {
            await window.Notifications.markAsRead(id);
            await this.updateNotificationBadge();
            await this.loadNotificationsDropdown();
          }
          
          // Cerrar dropdown
          document.getElementById('notificationsDropdown')?.classList.remove('show');
          
          // Navegar si hay link
          if (link && link !== 'null' && link !== '') {
            window.location.href = link;
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      dropdownList.innerHTML = `
        <div class="dropdown-empty">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error cargando notificaciones</p>
        </div>
      `;
    }
  }

  createDropdownNotificationHTML(notification) {
    const isUnread = !notification.read_at;
    const iconClass = this.getNotificationIcon(notification.type);
    const timeAgo = this.getTimeAgo(notification.created_at);
    
    return `
      <div class="dropdown-notification-item ${isUnread ? 'unread' : ''}" 
           data-id="${notification.id}" 
           data-link="${notification.link || ''}">
        <div class="dropdown-notif-icon ${notification.type}">
          <i class="fas ${iconClass}"></i>
        </div>
        <div class="dropdown-notif-content">
          <p class="dropdown-notif-title">${this.escapeHtml(notification.title || 'Notificación')}</p>
          <p class="dropdown-notif-body">${this.escapeHtml(notification.body || '')}</p>
          <span class="dropdown-notif-time">${timeAgo}</span>
        </div>
      </div>
    `;
  }

  getNotificationColor(type) {
    const colors = {
      'message': '#3b82f6',      // Azul
      'report': '#10b981',        // Verde
      'watchlist': '#f59e0b',     // Amarillo/Naranja
      'evaluation': '#8b5cf6',    // Púrpura
      'system': '#6b7280',        // Gris
      'alert': '#ef4444'          // Rojo
    };
    return colors[type] || '#6b7280';
  }

  getNotificationIconType(type) {
    // Devuelve la clase CSS para el tipo de notificación
    const types = {
      'message': 'message',
      'report': 'success',
      'watchlist': 'success',
      'evaluation': 'message',
      'system': 'message',
      'alert': 'urgent'
    };
    return types[type] || 'message';
  }

  getNotificationIcon(type) {
    const icons = {
      'message': 'fa-comment',
      'report': 'fa-file-alt',
      'watchlist': 'fa-star',
      'evaluation': 'fa-clipboard-check',
      'system': 'fa-info-circle',
      'alert': 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-bell';
  }

  getTimeAgo(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  async updateNotificationBadge() {
    if (!window.Notifications) return;
    
    try {
      const notifications = await window.Notifications.fetchLatest(50);
      const unreadCount = notifications.filter(n => !n.read_at).length;
      
      const badge = document.getElementById('notificationBadge');
      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          badge.style.display = 'flex';
        } else {
          badge.textContent = '0';
          badge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('❌ Error actualizando badge de notificaciones:', error);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async loadCurrentUserProfile(userId) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error cargando perfil:', error);
      return;
    }

    this.currentUser = profile;
    
    // Verificar que sea scout
    if (profile.user_type !== 'scout' && profile.user_type !== 'ojeador') {
      alert('Esta sección es solo para scouts');
      window.location.href = 'login.html';
      return;
    }
  }

  async loadAllStats() {
    await Promise.all([
      this.loadTotalPlayersCount(),
      this.loadCompletedReportsCount(),
      this.loadPendingEvaluationsCount(),
      this.loadRecommendedForSigningCount(),
      this.loadWatchlistCount()
    ]);

    this.renderStats();
  }

  async loadTotalPlayersCount() {
    // Contar todos los jugadores en la plataforma
    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .in('user_type', ['jugador', 'futbolista', 'player']);

    if (!error) {
      this.stats.totalPlayers = count || 0;
    }
  }

  async loadCompletedReportsCount() {
    // Contar reportes completados por este scout
    const { count, error } = await supabase
      .from('scout_reports')
      .select('id', { count: 'exact', head: true })
      .eq('scout_id', this.currentUser.id)
      .eq('status', 'completed');

    if (!error) {
      this.stats.completedReports = count || 0;
    }
  }

  async loadPendingEvaluationsCount() {
    // Contar reportes pendientes o en progreso
    const { count, error } = await supabase
      .from('scout_reports')
      .select('id', { count: 'exact', head: true })
      .eq('scout_id', this.currentUser.id)
      .in('status', ['draft', 'pending']);

    if (!error) {
      this.stats.pendingEvaluations = count || 0;
    }
  }

  async loadRecommendedForSigningCount() {
    // Contar jugadores recomendados para fichaje (rating >= 8.5)
    const { count, error } = await supabase
      .from('scout_reports')
      .select('id', { count: 'exact', head: true })
      .eq('scout_id', this.currentUser.id)
      .gte('overall_rating', 8.5)
      .eq('recommendation', 'sign');

    if (!error) {
      this.stats.recommendedForSigning = count || 0;
    }
  }

  async loadWatchlistCount() {
    // Contar jugadores en watchlist
    const { count, error } = await supabase
      .from('watchlist')
      .select('id', { count: 'exact', head: true })
      .eq('scout_id', this.currentUser.id);

    if (!error) {
      this.stats.watchlistCount = count || 0;
    }

    // Actualizar badge en sidebar
    const watchlistBadge = document.getElementById('dashboardWatchlistCount');
    if (watchlistBadge) {
      watchlistBadge.textContent = this.stats.watchlistCount;
    }
  }

  async updateMessagesBadge() {
    // Obtener conversaciones del usuario
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', this.currentUser.id);

    if (!participants || participants.length === 0) return;

    const conversationIds = participants.map(p => p.conversation_id);

    // Contar mensajes no leídos
    let totalUnread = 0;
    
    for (const convId of conversationIds) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .neq('sender_id', this.currentUser.id)
        .not('id', 'in', `(
          SELECT message_id FROM message_status 
          WHERE user_id = '${this.currentUser.id}' 
          AND status = 'seen'
        )`);
      
      totalUnread += (count || 0);
    }

    this.stats.unreadMessages = totalUnread;

    // Actualizar badge en navbar
    const messagesBadge = document.getElementById('messagesBadge');
    if (messagesBadge) {
      if (totalUnread > 0) {
        messagesBadge.textContent = totalUnread > 99 ? '99+' : totalUnread;
        messagesBadge.style.display = 'flex';
      } else {
        messagesBadge.style.display = 'none';
      }
    }

    // Actualizar badge en sidebar
    const navBadges = document.querySelectorAll('.nav-badge');
    navBadges.forEach(badge => {
      const navItem = badge.closest('.nav-item');
      if (navItem && navItem.textContent.includes('Mensajes')) {
        if (totalUnread > 0) {
          badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      }
    });
  }

  renderStats() {
    // Tarjetas principales del dashboard
    const statsCards = [
      {
        selector: '.stat-card.primary h3',
        value: this.stats.totalPlayers,
        trend: '+12 este mes' // TODO: calcular dinámicamente
      },
      {
        selector: '.stat-card.success h3',
        value: this.stats.completedReports,
        trend: '+5 esta semana' // TODO: calcular dinámicamente
      },
      {
        selector: '.stat-card.warning h3',
        value: this.stats.pendingEvaluations,
        trend: 'Revisar urgente'
      },
      {
        selector: '.stat-card.info h3',
        value: this.stats.recommendedForSigning,
        trend: 'Último mes'
      }
    ];

    statsCards.forEach(stat => {
      const element = document.querySelector(stat.selector);
      if (element) {
        element.textContent = stat.value;
      }
    });

    // Actualizar badges en filtros rápidos
    this.updateFilterBadges();
  }

  updateFilterBadges() {
    const filterChips = {
      'all': this.stats.totalPlayers,
      'recommended': this.stats.recommendedForSigning,
      'watching': this.stats.watchlistCount,
      'evaluated': this.stats.completedReports,
      'pending': this.stats.pendingEvaluations
    };

    document.querySelectorAll('.filter-chip[data-filter]').forEach(chip => {
      const filter = chip.getAttribute('data-filter');
      if (filterChips[filter] !== undefined) {
        const text = chip.textContent.replace(/\(\d+\)/, `(${filterChips[filter]})`);
        chip.textContent = text;
      }
    });
  }

  async loadRecentEvaluations() {
    // Cargar últimas 3 evaluaciones
    const { data: reports, error } = await supabase
      .from('scout_reports')
      .select(`
        id,
        overall_rating,
        recommendation,
        created_at,
        player:player_id (
          id,
          full_name,
          avatar_url,
          position,
          birth_date
        )
      `)
      .eq('scout_id', this.currentUser.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error cargando evaluaciones:', error);
      return;
    }

    this.renderRecentEvaluations(reports || []);
  }

  renderRecentEvaluations(reports) {
    const evaluationsList = document.querySelector('.evaluations-list');
    if (!evaluationsList) return;

    if (reports.length === 0) {
      evaluationsList.innerHTML = `
        <div class="empty-state-small">
          <p>No hay evaluaciones recientes</p>
          <a href="#players" class="btn btn-sm">Evaluar jugadores</a>
        </div>
      `;
      return;
    }

    evaluationsList.innerHTML = reports.map(report => {
      const player = report.player;
      const age = this.calculateAge(player.birth_date);
      const rating = report.overall_rating || 0;
      const ratingClass = rating >= 8.5 ? 'excellent' : rating >= 7 ? 'good' : 'average';
      const recommendationLabel = this.getRecommendationLabel(report.recommendation);
      const timeAgo = this.formatRelativeTime(report.created_at);

      return `
        <div class="evaluation-item" data-player-id="${player.id}">
          <img src="${player.avatar_url || 'imagenes/default-avatar.png'}" alt="${player.full_name}" class="player-thumb">
          <div class="evaluation-info">
            <h4>${player.full_name}</h4>
            <p>${player.position || 'Posición no especificada'} - ${age} años</p>
            <div class="evaluation-rating">
              <span class="rating ${ratingClass}">${rating.toFixed(1)}</span>
              <span class="recommendation ${report.recommendation}">${recommendationLabel}</span>
            </div>
          </div>
          <span class="evaluation-date">${timeAgo}</span>
        </div>
      `;
    }).join('');

    // Agregar event listeners
    document.querySelectorAll('.evaluation-item').forEach(item => {
      item.addEventListener('click', () => {
        const playerId = item.getAttribute('data-player-id');
        window.location.href = `perfil-jugador.html?id=${playerId}`;
      });
    });
  }

  calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  getRecommendationLabel(recommendation) {
    const labels = {
      'sign': 'Fichar Urgente',
      'recommend': 'Recomendar',
      'follow': 'Seguir',
      'watch': 'En Observación',
      'reject': 'No Recomendado'
    };
    return labels[recommendation] || 'Sin recomendación';
  }

  formatRelativeTime(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  }

  async loadWatchlist() {
    // Cargar jugadores en watchlist
    const { data: watchlist, error } = await supabase
      .from('watchlist')
      .select(`
        id,
        player_id,
        notes,
        priority,
        created_at,
        player:player_id (
          id,
          full_name,
          avatar_url,
          position,
          birth_date,
          current_club
        )
      `)
      .eq('scout_id', this.currentUser.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando watchlist:', error);
      return;
    }

    this.renderWatchlist(watchlist || []);
  }

  renderWatchlist(watchlist) {
    // Si existe una sección específica para watchlist, renderizarla
    const watchlistContainer = document.getElementById('watchlistContainer');
    if (!watchlistContainer) return;

    if (watchlist.length === 0) {
      watchlistContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fas fa-star"></i></div>
          <h3>Tu lista de seguimiento está vacía</h3>
          <p>Agrega jugadores a tu watchlist para hacer seguimiento</p>
          <a href="busqueda-avanzada.html" class="btn btn-primary">
            <i class="fas fa-search"></i> Buscar Jugadores
          </a>
        </div>
      `;
      return;
    }

    watchlistContainer.innerHTML = `
      <div class="watchlist-grid">
        ${watchlist.map(item => {
          const player = item.player;
          const age = this.calculateAge(player.birth_date);
          const priorityClass = item.priority || 'normal';

          return `
            <div class="watchlist-card ${priorityClass}" data-player-id="${player.id}">
              <div class="watchlist-header">
                <img src="${player.avatar_url || 'imagenes/default-avatar.png'}" alt="${player.full_name}">
                <span class="priority-badge ${priorityClass}">${priorityClass}</span>
              </div>
              <div class="watchlist-info">
                <h4>${player.full_name}</h4>
                <p class="position">${player.position || 'N/A'}</p>
                <div class="watchlist-details">
                  <span><i class="fas fa-birthday-cake"></i> ${age} años</span>
                  <span><i class="fas fa-futbol"></i> ${player.current_club || 'Sin club'}</span>
                </div>
                ${item.notes ? `<p class="notes">${item.notes}</p>` : ''}
              </div>
              <div class="watchlist-actions">
                <button class="btn-icon" onclick="dashboard.removeFromWatchlist('${item.id}')">
                  <i class="fas fa-trash"></i>
                </button>
                <button class="btn-icon" onclick="window.location.href='perfil-jugador.html?id=${player.id}'">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async removeFromWatchlist(watchlistId) {
    if (!confirm('¿Quitar este jugador de tu lista de seguimiento?')) return;

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', watchlistId);

    if (error) {
      console.error('Error eliminando de watchlist:', error);
      alert('Error al eliminar. Intenta nuevamente.');
      return;
    }

    // Recargar watchlist
    await this.loadWatchlist();
    await this.loadWatchlistCount();
    this.renderStats();
  }

  async loadPlayersList(filter = 'all') {
    // Cargar jugadores según filtro
    let query = supabase
      .from('profiles')
      .select('*')
      .in('user_type', ['jugador', 'futbolista', 'player']);

    // TODO: Aplicar filtros según el parámetro
    // 'recommended', 'watching', 'evaluated', 'pending'

    const { data: players, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error cargando jugadores:', error);
      return;
    }

    this.renderPlayersList(players || []);
  }

  renderPlayersList(players) {
    const playersGrid = document.querySelector('.players-grid');
    if (!playersGrid) return;

    if (players.length === 0) {
      playersGrid.innerHTML = `
        <div class="empty-state">
          <p>No se encontraron jugadores</p>
        </div>
      `;
      return;
    }

    // TODO: Renderizar tarjetas de jugadores con datos reales
    console.log('Jugadores a renderizar:', players);
  }
}

// Inicializar dashboard cuando el DOM esté listo
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
  dashboard = new DashboardScout();
});

// Exponer instancia globalmente para acceso desde HTML
window.dashboard = dashboard;
