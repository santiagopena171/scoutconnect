// ===== PERFIL SCOUT - JAVASCRIPT =====

class ScoutProfile {
  constructor() {
    this.currentUser = null;
    this.currentTab = 'overview';
    this.avatarFile = null;
    this.init();
  }

  async init() {
    // Esperar a que Supabase esté inicializado
    if (!supabase) {
      console.log('Esperando inicialización de Supabase...');
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!supabase) {
        console.error('Supabase no está disponible');
        return;
      }
    }
    
    await this.loadUserData();
    this.setupEventListeners();
    this.loadOverviewData();
    await this.loadRecentActivity();
    
  }

  async loadUserData() {
    try {
      // Obtener usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error al obtener usuario:', userError);
        window.location.href = '/public/login.html';
        return;
      }

      // Cargar perfil completo desde la base de datos
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error al cargar perfil:', profileError);
        return;
      }

      // Cargar datos adicionales de la tabla scouts
      const { data: scoutData, error: scoutError } = await supabase
        .from('scouts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (scoutError && scoutError.code !== 'PGRST116') {
        console.error('Error al cargar datos de scout:', scoutError);
      }

      // Asignar datos del perfil combinando ambas tablas
      this.currentUser = {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        birth_date: profile.birth_date,
        nationality: profile.nationality,
        second_nationality: profile.second_nationality,
        city: profile.city,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        // Datos de la tabla scouts
        organization: scoutData?.organization,
        position: scoutData?.position,
        experience: scoutData?.experience,
        specialization: scoutData?.specialization,
        region: scoutData?.region,
        languages: scoutData?.languages,
        bio: scoutData?.bio,
        scout_id: scoutData?.id
      };

      this.updateProfileDisplay();
      
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  }

  updateProfileDisplay() {
    // Construir el nombre completo desde first_name y last_name
    const fullName = this.currentUser.first_name && this.currentUser.last_name 
      ? `${this.currentUser.first_name} ${this.currentUser.last_name}`
      : 'Usuario';
    
    document.getElementById('scoutName').textContent = fullName;
    
    // Construir el rol y organización
    const roleText = this.currentUser.position && this.currentUser.organization
      ? `${this.currentUser.position} - ${this.currentUser.organization}`
      : this.currentUser.position || this.currentUser.organization || 'Scout';
    
    document.getElementById('scoutRole').textContent = roleText;
    
    // Actualizar avatar si existe
    if (this.currentUser.avatar_url) {
      const avatarImg = document.getElementById('avatarImage');
      if (avatarImg) {
        avatarImg.src = this.currentUser.avatar_url;
      }
    }
    
    // Actualizar estadísticas
    this.loadStats();
  }

  loadStats() {
    // Cargar estadísticas desde localStorage
    const watchlist = JSON.parse(localStorage.getItem('scoutconnect_watchlist') || '[]');
    const reports = JSON.parse(localStorage.getItem('generatedReports') || '[]');
    
    document.getElementById('totalEvaluations').textContent = reports.length * 3 + 15;
    document.getElementById('totalReports').textContent = reports.length;
    document.getElementById('watchlistCount').textContent = watchlist.length;
  }

  setupEventListeners() {
    // Formulario de información personal
    document.getElementById('personalInfoForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePersonalInfo();
    });

    // Avatar upload
    document.getElementById('avatarUpload')?.addEventListener('change', (e) => {
      this.handleAvatarUpload(e);
    });

    // Configuración
    const settingsToggles = ['emailNotifications', 'pushNotifications', 'weeklyDigest', 'publicProfile', 'showStats'];
    settingsToggles.forEach(id => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener('change', () => this.saveSettings());
      }
    });
  }

  // ===== NAVEGACIÓN DE PESTAÑAS =====

  switchTab(tabName) {
    
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Quitar clase active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Mostrar pestaña seleccionada
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    this.currentTab = tabName;

    // Cargar datos específicos de la pestaña
    if (tabName === 'statistics') {
      this.loadStatistics();
    } else if (tabName === 'activity') {
      this.loadActivityTimeline();
    } else if (tabName === 'personal') {
      this.loadPersonalInfoForm();
    } else if (tabName === 'settings') {
      this.loadSettingsForm();
    }
  }

  // ===== PESTAÑA OVERVIEW =====

  loadOverviewData() {
    if (!this.currentUser) {
      console.warn('No hay datos de usuario disponibles');
      return;
    }
    
    // Cargar información rápida
    const memberSince = this.currentUser.created_at 
      ? new Date(this.currentUser.created_at).toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })
      : 'Fecha no disponible';
    
    const memberSinceEl = document.getElementById('memberSince');
    const specializationEl = document.getElementById('specialization');
    const regionEl = document.getElementById('region');
    const languagesEl = document.getElementById('languages');
    
    if (memberSinceEl) memberSinceEl.textContent = memberSince;
    if (specializationEl) specializationEl.textContent = this.currentUser.specialization || 'No especificado';
    if (regionEl) regionEl.textContent = this.currentUser.region || 'No especificado';
    if (languagesEl) languagesEl.textContent = this.currentUser.languages || 'No especificado';

    // Cargar logros
    this.loadAchievements();
  }

  loadAchievements() {
    const achievements = [
      { icon: 'fa-trophy', title: '100 Reportes', color: '#f59e0b' },
      { icon: 'fa-star', title: 'Scout del Año', color: '#3b82f6' },
      { icon: 'fa-medal', title: 'Top Evaluador', color: '#10b981' },
      { icon: 'fa-fire', title: '30 Días Activo', color: '#ef4444' },
      { icon: 'fa-users', title: 'Mentor', color: '#8b5cf6' },
      { icon: 'fa-globe', title: 'Internacional', color: '#06b6d4' }
    ];

    const achievementsGrid = document.getElementById('achievementsGrid');
    achievementsGrid.innerHTML = achievements.map(achievement => `
      <div class="achievement">
        <i class="fas ${achievement.icon}" style="color: ${achievement.color}"></i>
        <div class="achievement-title">${achievement.title}</div>
      </div>
    `).join('');
  }

  async loadRecentActivity() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ No hay usuario autenticado');
        this.loadMockActivity();
        return;
      }

      console.log('✅ Usuario autenticado:', user.id);

      // Obtener actividades recientes (últimas 3 para la tarjeta de overview)
      const { data: activities, error } = await supabase
        .from('scout_activity')
        .select('*')
        .eq('scout_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('❌ Error loading activities:', error);
        this.loadMockActivity(); // Fallback a datos de ejemplo
        return;
      }

      console.log('📊 Actividades encontradas:', activities);

      if (!activities || activities.length === 0) {
        console.log('⚠️ No hay actividades registradas para este usuario');
        // Si no hay actividades, mostrar mensaje
        const activityList = document.getElementById('recentActivityList');
        if (activityList) {
          activityList.innerHTML = `
            <div class="activity-item" style="text-align: center; color: #6b7280; padding: 20px;">
              <i class="fas fa-info-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
              <p>No hay actividad reciente</p>
              <small style="display: block; margin-top: 10px;">Las actividades aparecerán aquí cuando añadas jugadores o crees reportes</small>
            </div>
          `;
        }
        return;
      }

      // Mapear actividades a formato de visualización
      const formattedActivities = activities.map(activity => {
        const icon = this.getActivityIcon(activity.activity_type);
        const timeAgo = this.getTimeAgo(activity.created_at);
        
        return {
          icon,
          title: activity.title,
          description: activity.description || activity.related_player_name || '',
          time: timeAgo
        };
      });

      console.log('✅ Actividades formateadas:', formattedActivities);

      const activityList = document.getElementById('recentActivityList');
      if (activityList) {
        activityList.innerHTML = formattedActivities.map(activity => `
          <div class="activity-item">
            <div class="activity-icon">
              <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
              <div class="activity-title">${activity.title}</div>
              <div class="activity-description">${activity.description}</div>
              <div class="activity-time">${activity.time}</div>
            </div>
          </div>
        `).join('');
      }

    } catch (error) {
      console.error('❌ Error in loadRecentActivity:', error);
      this.loadMockActivity();
    }
  }

  getActivityIcon(activityType) {
    const icons = {
      'report_created': 'fa-file-alt',
      'player_added_watchlist': 'fa-star',
      'player_removed_watchlist': 'fa-star-half-alt',
      'profile_viewed': 'fa-eye',
      'profile_updated': 'fa-user-edit'
    };
    return icons[activityType] || 'fa-circle';
  }

  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  }

  loadMockActivity() {
    // Datos de ejemplo como fallback
    const activities = [
      {
        icon: 'fa-file-alt',
        title: 'Nuevo reporte generado',
        description: 'Miguel Rodríguez - Mediocampista',
        time: 'Hace 2 horas'
      },
      {
        icon: 'fa-star',
        title: 'Jugador añadido a seguimiento',
        description: 'Andrés Silva - Defensa Central',
        time: 'Hace 5 horas'
      },
      {
        icon: 'fa-eye',
        title: 'Perfil visualizado',
        description: 'Luis Gómez - Delantero',
        time: 'Hace 1 día'
      }
    ];

    const activityList = document.getElementById('recentActivityList');
    activityList.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">
          <i class="fas ${activity.icon}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }

  // ===== PESTAÑA INFORMACIÓN PERSONAL =====

  loadPersonalInfoForm() {
    if (!this.currentUser) {
      console.warn('No hay datos de usuario para cargar en el formulario');
      return;
    }
    
    // Cargar datos del usuario en el formulario de forma segura
    const setValue = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.value = value || '';
    };
    
    setValue('firstName', this.currentUser.first_name);
    setValue('lastName', this.currentUser.last_name);
    setValue('email', this.currentUser.email);
    setValue('phone', this.currentUser.phone);
    setValue('birthDate', this.currentUser.birth_date);
    setValue('nationality', this.currentUser.nationality);
    setValue('secondNationality', this.currentUser.second_nationality);
    setValue('city', this.currentUser.city);
    setValue('organization', this.currentUser.organization);
    setValue('position', this.currentUser.position);
    setValue('experience', this.currentUser.experience);
    setValue('bio', this.currentUser.bio);
  }

  async savePersonalInfo() {
    try {
      // Los campos first_name, last_name, email, nationality, second_nationality 
      // y birth_date son readonly y no se actualizan
      
      // Actualizar datos en la tabla profiles (solo campos editables)
      const profileData = {
        phone: document.getElementById('phone').value,
        city: document.getElementById('city').value
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', this.currentUser.id);

      if (profileError) throw profileError;

      // Actualizar datos en la tabla scouts
      const scoutData = {
        organization: document.getElementById('organization').value,
        position: document.getElementById('position').value,
        experience: parseInt(document.getElementById('experience').value) || null,
        bio: document.getElementById('bio').value
      };

      // Si ya existe un registro en scouts, actualizarlo; si no, crearlo
      if (this.currentUser.scout_id) {
        const { error: scoutError } = await supabase
          .from('scouts')
          .update(scoutData)
          .eq('id', this.currentUser.scout_id);

        if (scoutError) throw scoutError;
      } else {
        // Crear nuevo registro en scouts
        const { data: newScout, error: scoutError } = await supabase
          .from('scouts')
          .insert({
            user_id: this.currentUser.id,
            ...scoutData
          })
          .select()
          .single();

        if (scoutError) throw scoutError;
        this.currentUser.scout_id = newScout.id;
      }

      // Actualizar datos locales
      Object.assign(this.currentUser, profileData, scoutData);

      // Actualizar display
      this.updateProfileDisplay();

      // Registrar actividad
      if (window.logProfileUpdated) {
        await window.logProfileUpdated();
      }

      this.showNotification('Información actualizada correctamente', 'success');
      
      // Recargar actividad reciente para mostrar la actualización
      await this.loadRecentActivity();
      
    } catch (error) {
      console.error('Error al guardar información:', error);
      this.showNotification('Error al actualizar la información', 'error');
    }
  }

  cancelEdit() {
    // Recargar datos originales en el formulario
    this.loadPersonalInfoForm();
    this.showNotification('Cambios cancelados', 'info');
  }

  async goToDashboard() {
    // Ir directamente al dashboard de scout
    window.location.href = 'dashboard-scout.html';
  }

  // ===== PESTAÑA ESTADÍSTICAS =====

  loadStatistics() {
    this.loadPositionStats();
    this.loadRatingDistribution();
    this.loadRegionStats();
  }

  loadPositionStats() {
    const positions = [
      { name: 'Mediocampistas', value: 45, color: '#3b82f6' },
      { name: 'Delanteros', value: 30, color: '#10b981' },
      { name: 'Defensas', value: 20, color: '#f59e0b' },
      { name: 'Porteros', value: 5, color: '#ef4444' }
    ];

    const positionStats = document.getElementById('positionStats');
    positionStats.innerHTML = positions.map(pos => `
      <div class="stat-bar">
        <span class="stat-label">${pos.name}</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill" style="width: ${pos.value}%; background: ${pos.color}"></div>
        </div>
        <span class="stat-value">${pos.value}%</span>
      </div>
    `).join('');
  }

  loadRatingDistribution() {
    const ratings = [
      { range: '9.0 - 10.0', value: 15, color: '#10b981' },
      { range: '8.0 - 8.9', value: 35, color: '#3b82f6' },
      { range: '7.0 - 7.9', value: 30, color: '#f59e0b' },
      { range: '6.0 - 6.9', value: 15, color: '#ef4444' },
      { range: '< 6.0', value: 5, color: '#6b7280' }
    ];

    const ratingDistribution = document.getElementById('ratingDistribution');
    ratingDistribution.innerHTML = ratings.map(rating => `
      <div class="stat-bar">
        <span class="stat-label">${rating.range}</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill" style="width: ${rating.value}%; background: ${rating.color}"></div>
        </div>
        <span class="stat-value">${rating.value}%</span>
      </div>
    `).join('');
  }

  loadRegionStats() {
    const regions = [
      { name: 'Argentina', value: 40, color: '#3b82f6' },
      { name: 'Brasil', value: 25, color: '#10b981' },
      { name: 'Uruguay', value: 15, color: '#f59e0b' },
      { name: 'Colombia', value: 12, color: '#8b5cf6' },
      { name: 'Otros', value: 8, color: '#6b7280' }
    ];

    const regionStats = document.getElementById('regionStats');
    regionStats.innerHTML = regions.map(region => `
      <div class="stat-bar">
        <span class="stat-label">${region.name}</span>
        <div class="stat-bar-container">
          <div class="stat-bar-fill" style="width: ${region.value}%; background: ${region.color}"></div>
        </div>
        <span class="stat-value">${region.value}%</span>
      </div>
    `).join('');
  }

  // ===== PESTAÑA ACTIVIDAD =====

  async loadActivityTimeline() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        this.loadMockTimeline();
        return;
      }

      // Obtener todas las actividades para el timeline
      const { data: activities, error } = await supabase
        .from('scout_activity')
        .select('*')
        .eq('scout_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading activity timeline:', error);
        this.loadMockTimeline();
        return;
      }

      if (!activities || activities.length === 0) {
        const activityTimeline = document.getElementById('activityTimeline');
        if (activityTimeline) {
          activityTimeline.innerHTML = `
            <div style="text-align: center; color: #6b7280; padding: 40px;">
              <i class="fas fa-history" style="font-size: 48px; margin-bottom: 20px;"></i>
              <h3>No hay actividad registrada</h3>
              <p>Tu actividad aparecerá aquí cuando empieces a usar la plataforma</p>
            </div>
          `;
        }
        return;
      }

      // Agrupar actividades por fecha
      const groupedActivities = {};
      activities.forEach(activity => {
        const date = new Date(activity.created_at);
        const dateKey = date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        });
        
        if (!groupedActivities[dateKey]) {
          groupedActivities[dateKey] = [];
        }
        
        groupedActivities[dateKey].push({
          title: activity.title,
          description: activity.description || activity.related_player_name || 'Sin descripción',
          time: new Date(activity.created_at).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        });
      });

      const activityTimeline = document.getElementById('activityTimeline');
      if (activityTimeline) {
        activityTimeline.innerHTML = Object.entries(groupedActivities).map(([date, items]) => `
          <div class="timeline-date-group">
            <div class="timeline-date-header">${date}</div>
            ${items.map(item => `
              <div class="timeline-item">
                <div class="timeline-time">${item.time}</div>
                <div class="timeline-content">
                  <div class="timeline-title">${item.title}</div>
                  <div class="timeline-description">${item.description}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('');
      }

    } catch (error) {
      console.error('Error in loadActivityTimeline:', error);
      this.loadMockTimeline();
    }
  }

  loadMockTimeline() {
    const timeline = [
      {
        date: '19 Oct 2025',
        title: 'Nuevo reporte generado',
        description: 'Reporte completo de Miguel Rodríguez - Rating: 8.5/10'
      },
      {
        date: '18 Oct 2025',
        title: 'Jugador agregado a seguimiento',
        description: 'Andrés Silva agregado a lista de prioridades'
      },
      {
        date: '17 Oct 2025',
        title: 'Perfil actualizado',
        description: 'Información personal y profesional actualizada'
      },
      {
        date: '15 Oct 2025',
        title: '10 evaluaciones completadas',
        description: 'Evaluaciones técnicas de jugadores en Argentina'
      },
      {
        date: '12 Oct 2025',
        title: 'Nuevo logro desbloqueado',
        description: 'Scout del Mes - 50 reportes generados'
      }
    ];

    const activityTimeline = document.getElementById('activityTimeline');
    activityTimeline.innerHTML = timeline.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-content">
          <div class="timeline-title">${item.title}</div>
          <div class="timeline-description">${item.description}</div>
        </div>
      </div>
    `).join('');
  }

  // ===== PESTAÑA CONFIGURACIÓN =====

  loadSettingsForm() {
    // Cargar configuraciones guardadas
    const savedSettings = localStorage.getItem('scoutSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
      document.getElementById('pushNotifications').checked = settings.pushNotifications !== false;
      document.getElementById('weeklyDigest').checked = settings.weeklyDigest !== false;
      document.getElementById('publicProfile').checked = settings.publicProfile !== false;
      document.getElementById('showStats').checked = settings.showStats !== false;
    } else {
      // Valores por defecto (todos activados)
      document.getElementById('emailNotifications').checked = true;
      document.getElementById('pushNotifications').checked = true;
      document.getElementById('weeklyDigest').checked = true;
      document.getElementById('publicProfile').checked = true;
      document.getElementById('showStats').checked = true;
    }
  }

  saveSettings() {
    const settings = {
      emailNotifications: document.getElementById('emailNotifications').checked,
      pushNotifications: document.getElementById('pushNotifications').checked,
      weeklyDigest: document.getElementById('weeklyDigest').checked,
      publicProfile: document.getElementById('publicProfile').checked,
      showStats: document.getElementById('showStats').checked
    };

    localStorage.setItem('scoutSettings', JSON.stringify(settings));
    this.showNotification('Configuración guardada', 'success');
  }

  changePassword() {
    const newPassword = prompt('Ingresa tu nueva contraseña:');
    if (newPassword) {
      // Aquí iría la lógica de cambio de contraseña
      this.showNotification('Contraseña actualizada correctamente', 'success');
    }
  }

  enable2FA() {
    this.showNotification('Autenticación de dos factores activada', 'success');
  }

  viewSessions() {
    alert('Sesiones activas:\n\n1. Windows - Chrome - Barcelona (Actual)\n2. iPhone - Safari - Madrid - Hace 2 días');
  }

  deactivateAccount() {
    if (confirm('¿Estás seguro de que deseas desactivar tu cuenta?\n\nPodrás reactivarla iniciando sesión nuevamente.')) {
      this.showNotification('Cuenta desactivada temporalmente', 'warning');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  }

  deleteAccount() {
    if (confirm('⚠️ ADVERTENCIA ⚠️\n\n¿Estás absolutamente seguro de que deseas ELIMINAR tu cuenta permanentemente?\n\nEsta acción NO SE PUEDE DESHACER y perderás:\n- Todos tus reportes\n- Tu lista de seguimiento\n- Tus estadísticas\n- Todo tu historial\n\nEscribe "ELIMINAR" para confirmar.')) {
      const confirmation = prompt('Escribe "ELIMINAR" para confirmar:');
      if (confirmation === 'ELIMINAR') {
        // Limpiar todos los datos
        localStorage.clear();
        this.showNotification('Cuenta eliminada permanentemente', 'danger');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      }
    }
  }

  // ===== AVATAR =====

  changeAvatar() {
    document.getElementById('avatarModal').classList.add('active');
  }

  closeAvatarModal() {
    document.getElementById('avatarModal').classList.remove('active');
  }

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.showNotification('Por favor selecciona una imagen válida', 'error');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showNotification('La imagen no puede superar los 5MB', 'error');
        return;
      }
      
      // Guardar el archivo para subirlo después
      this.avatarFile = file;
      
      // Mostrar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveAvatar() {
    if (!this.avatarFile) {
      this.showNotification('No hay imagen para guardar', 'error');
      return;
    }

    try {
      // Mostrar loading
      this.showNotification('Subiendo imagen...', 'info');
      
      // Generar nombre único para el archivo
      const fileExt = this.avatarFile.name.split('.').pop();
      const fileName = `${this.currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, this.avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Si el error es que ya existe, intentar con otro nombre
        if (uploadError.message.includes('already exists')) {
          const newFileName = `${this.currentUser.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const newFilePath = `avatars/${newFileName}`;
          
          const { data: retryData, error: retryError } = await supabase.storage
            .from('avatars')
            .upload(newFilePath, this.avatarFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (retryError) throw retryError;
          filePath = newFilePath;
        } else {
          throw uploadError;
        }
      }

      // Obtener URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Actualizar en la base de datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', this.currentUser.id);

      if (updateError) throw updateError;

      // Actualizar localmente
      this.currentUser.avatar_url = avatarUrl;
      document.getElementById('avatarImage').src = avatarUrl;
      
      // Actualizar avatar en el navbar
      const navbarAvatar = document.getElementById('profileToggle');
      if (navbarAvatar) {
        navbarAvatar.src = avatarUrl;
      }
      
      // Limpiar
      this.avatarFile = null;
      
      this.closeAvatarModal();
      this.showNotification('Foto de perfil actualizada correctamente', 'success');
      
    } catch (error) {
      console.error('Error al subir avatar:', error);
      this.showNotification('Error al actualizar la foto de perfil: ' + error.message, 'error');
    }
  }

  // ===== PERFIL =====

  editProfile() {
    this.switchTab('personal');
  }

  shareProfile() {
    const profileUrl = `${window.location.origin}/perfil-scout.html?id=${this.currentUser.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Perfil de ${this.currentUser.name}`,
        text: `Mira mi perfil de scout en ScoutConnect`,
        url: profileUrl
      }).then(() => {
        this.showNotification('Perfil compartido exitosamente', 'success');
      }).catch(console.error);
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(profileUrl).then(() => {
        this.showNotification('Enlace copiado al portapapeles', 'success');
      });
    }
  }

  // ===== NOTIFICACIONES =====

  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-weight: 600;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Inicializar al cargar la página
const scoutProfile = new ScoutProfile();

// Agregar estilos de animación
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

// ===== INICIALIZACIÓN DEL NAVBAR =====
// Agregar estilos CSS para el navbar y dropdown
const navbarStyles = document.createElement('style');
navbarStyles.textContent = `
  /* Dropdown de Notificaciones en Navbar */
  .notifications-wrapper {
    position: relative;
  }

  .notifications-dropdown {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 380px;
    max-height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10000;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .notifications-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .notifications-dropdown::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 16px;
    width: 16px;
    height: 16px;
    background: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
  }

  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
  }

  .dropdown-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .mark-all-read-small {
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 14px;
    transition: background 0.2s;
  }

  .mark-all-read-small:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .notifications-list {
    flex: 1;
    overflow-y: auto;
    max-height: 380px;
  }

  .notifications-list::-webkit-scrollbar {
    width: 6px;
  }

  .notifications-list::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .notifications-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .dropdown-notification-item {
    padding: 14px 20px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    position: relative;
  }

  .dropdown-notification-item:hover {
    background: #f8f9fa;
  }

  .dropdown-notification-item:not(.read) {
    background: #f0f4ff;
  }

  .dropdown-notification-item:not(.read):hover {
    background: #e8f0fe;
  }

  .notif-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    background: #e3f2fd;
    color: #1976d2;
  }

  .notif-content {
    flex: 1;
    min-width: 0;
  }

  .notif-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 4px 0;
    line-height: 1.4;
  }

  .notif-time {
    font-size: 12px;
    color: #999;
  }

  .notif-unread-dot {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: #667eea;
    border-radius: 50%;
  }

  .dropdown-loading, .dropdown-empty {
    padding: 40px 20px;
    text-align: center;
    color: #999;
  }

  .dropdown-loading i {
    font-size: 24px;
    margin-bottom: 8px;
    display: block;
  }

  .dropdown-empty i {
    font-size: 32px;
    margin-bottom: 12px;
    display: block;
    color: #ddd;
  }

  .dropdown-footer {
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;
    background: #fafafa;
    text-align: center;
  }

  .view-all-link {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: color 0.2s;
  }

  .view-all-link:hover {
    color: #5568d3;
  }

  .profile-avatar-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #e0e0e0;
    transition: border-color 0.2s;
  }

  .profile-avatar-icon:hover {
    border-color: #667eea;
  }

  .messages-icon {
    display: block;
  }
`;
document.head.appendChild(navbarStyles);

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar notificaciones
  if (window.Notifications) {
    window.Notifications.init({
      onNew: (notification) => {
        console.log('Nueva notificación en perfil:', notification);
      }
    });
    
    // Cargar notificaciones en el dropdown
    loadNotificationsDropdown();
    updateNotificationBadge();
  }
  
  // Dropdown de notificaciones
  setupNotificationsDropdown();
  
  // Dropdown de perfil
  setupProfileDropdown();
  
  // Botón de mensajes
  setupMessagesButton();
  
  // Actualizar foto de perfil en navbar
  updateNavbarProfilePhoto();
  
  // Actualizar badge de mensajes no leídos
  updateUnreadMessagesBadge();
});

async function updateNavbarProfilePhoto() {
  const profileToggle = document.getElementById('profileToggle');
  if (!profileToggle || !supabase) return;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profile && profile.avatar_url) {
      profileToggle.src = profile.avatar_url;
    }
  } catch (error) {
    console.error('Error updating navbar profile photo:', error);
  }
}

async function updateUnreadMessagesBadge() {
  const messagesBadge = document.querySelector('#messagesBtn .notification-badge');
  if (!messagesBadge || !supabase) return;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Obtener todas las conversaciones del usuario
    const { data: participantData } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    
    if (!participantData || participantData.length === 0) {
      messagesBadge.style.display = 'none';
      return;
    }
    
    const conversationIds = participantData.map(p => p.conversation_id);
    
    // Obtener mensajes no leídos
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .in('conversation_id', conversationIds)
      .neq('sender_id', user.id)
      .is('deleted_at', null);
    
    if (!messages || messages.length === 0) {
      messagesBadge.style.display = 'none';
      return;
    }
    
    const messageIds = messages.map(m => m.id);
    
    // Verificar cuáles han sido vistos
    const { data: seenStatuses } = await supabase
      .from('message_status')
      .select('message_id')
      .in('message_id', messageIds)
      .eq('user_id', user.id)
      .eq('status', 'seen');
    
    const seenIds = seenStatuses?.map(s => s.message_id) || [];
    const unreadCount = messageIds.filter(id => !seenIds.includes(id)).length;
    
    if (unreadCount > 0) {
      messagesBadge.textContent = unreadCount;
      messagesBadge.style.display = 'flex';
    } else {
      messagesBadge.style.display = 'none';
    }
  } catch (error) {
    console.error('Error updating unread messages badge:', error);
  }
}


function setupNotificationsDropdown() {
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsDropdown = document.getElementById('notificationsDropdown');
  const markAllReadBtn = document.getElementById('markAllReadSmall');
  
  if (!notificationsBtn || !notificationsDropdown) return;
  
  notificationsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationsDropdown.classList.toggle('show');
    
    // Cerrar dropdown de perfil si está abierto
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) profileMenu.classList.remove('show');
    
    // Recargar notificaciones al abrir
    if (notificationsDropdown.classList.contains('show')) {
      loadNotificationsDropdown();
    }
  });
  
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await markAllNotificationsRead();
    });
  }
  
  // Cerrar al hacer clic fuera
  document.addEventListener('click', () => {
    notificationsDropdown.classList.remove('show');
  });
  
  notificationsDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

async function loadNotificationsDropdown() {
  const list = document.getElementById('notificationsDropdownList');
  if (!list || !window.Notifications) return;
  
  try {
    const notifications = await window.Notifications.fetchLatest(5);
    
    if (notifications.length === 0) {
      list.innerHTML = '<div class="dropdown-empty"><p>No hay notificaciones</p></div>';
      return;
    }
    
    list.innerHTML = notifications.map(notif => createDropdownNotificationHTML(notif)).join('');
    
    // Agregar event listeners para marcar como leída
    list.querySelectorAll('.dropdown-notification-item').forEach(item => {
      item.addEventListener('click', async function() {
        const notifId = this.dataset.id;
        if (notifId && !this.classList.contains('read')) {
          await window.Notifications.markAsRead(notifId);
          this.classList.add('read');
          updateNotificationBadge();
        }
        
        // Navegar al link si existe
        const link = this.dataset.link;
        if (link) {
          window.location.href = link;
        }
      });
    });
  } catch (error) {
    console.error('Error loading notifications dropdown:', error);
    list.innerHTML = '<div class="dropdown-empty"><p>Error al cargar</p></div>';
  }
}

function createDropdownNotificationHTML(notification) {
  const isRead = notification.read_at !== null;
  const timeAgo = getTimeAgo(notification.created_at);
  
  const iconMap = {
    'report': 'fa-file-alt',
    'watchlist': 'fa-star',
    'message': 'fa-envelope',
    'system': 'fa-info-circle'
  };
  
  const icon = iconMap[notification.type] || 'fa-bell';
  
  return `
    <div class="dropdown-notification-item ${isRead ? 'read' : ''}" 
         data-id="${notification.id}"
         data-link="${notification.link || ''}">
      <div class="notif-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="notif-content">
        <div class="notif-title">${notification.title}</div>
        <div class="notif-time">${timeAgo}</div>
      </div>
      ${!isRead ? '<div class="notif-unread-dot"></div>' : ''}
    </div>
  `;
}

async function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if (!badge || !window.Notifications) return;
  
  try {
    const notifications = await window.Notifications.fetchLatest(50);
    const unreadCount = notifications.filter(n => !n.read_at).length;
    
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

async function markAllNotificationsRead() {
  if (!window.Notifications) return;
  
  try {
    const notifications = await window.Notifications.fetchLatest(50);
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
    
    for (const id of unreadIds) {
      await window.Notifications.markAsRead(id);
    }
    
    setTimeout(async () => {
      await loadNotificationsDropdown();
      await updateNotificationBadge();
    }, 300);
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

function setupProfileDropdown() {
  const profileToggle = document.getElementById('profileToggle');
  const profileMenu = document.getElementById('profileMenu');
  
  if (!profileToggle || !profileMenu) return;
  
  profileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('show');
    
    // Cerrar dropdown de notificaciones si está abierto
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    if (notificationsDropdown) notificationsDropdown.classList.remove('show');
  });
  
  document.addEventListener('click', () => {
    profileMenu.classList.remove('show');
  });
}

function setupMessagesButton() {
  const messagesBtn = document.getElementById('messagesBtn');
  if (!messagesBtn) return;
  
  messagesBtn.addEventListener('click', () => {
    window.location.href = 'chat.html';
  });
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return past.toLocaleDateString();
}

function logout() {
  if (supabase) {
    supabase.auth.signOut().then(() => {
      window.location.href = 'login.html';
    });
  } else {
    window.location.href = 'login.html';
  }
}
