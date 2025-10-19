// ===== PERFIL SCOUT - JAVASCRIPT =====

class ScoutProfile {
  constructor() {
    this.currentUser = null;
    this.currentTab = 'overview';
    this.init();
  }

  init() {
    console.log('🚀 Inicializando Perfil Scout...');
    this.loadUserData();
    this.setupEventListeners();
    this.loadOverviewData();
    this.loadRecentActivity();
    console.log('✅ Perfil Scout inicializado');
  }

  loadUserData() {
    // Cargar datos del usuario desde localStorage
    const savedUser = localStorage.getItem('scoutConnectUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    } else {
      // Datos por defecto
      this.currentUser = {
        id: 'scout1',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@scoutconnect.com',
        role: 'Scout Senior - FC Barcelona',
        phone: '+34 612 345 678',
        birthDate: '1985-03-15',
        nationality: 'España',
        city: 'Barcelona',
        organization: 'FC Barcelona',
        position: 'Scout Senior',
        experience: 15,
        bio: 'Scout profesional especializado en la identificación y evaluación de talentos emergentes en Sudamérica. Con más de 15 años de experiencia en el fútbol profesional.',
        memberSince: 'Enero 2020',
        specialization: 'Mediocampistas',
        region: 'Sudamérica',
        languages: 'Español, Inglés, Portugués',
        avatar: 'imagenes/scout-avatar.png'
      };
    }

    this.updateProfileDisplay();
  }

  updateProfileDisplay() {
    document.getElementById('scoutName').textContent = this.currentUser.name;
    document.getElementById('scoutRole').textContent = this.currentUser.role;
    
    // Actualizar avatar si existe
    if (this.currentUser.avatar) {
      const avatarImg = document.getElementById('avatarImage');
      if (avatarImg) {
        avatarImg.src = this.currentUser.avatar;
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
    console.log(`📑 Cambiando a pestaña: ${tabName}`);
    
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
    // Cargar información rápida
    document.getElementById('memberSince').textContent = this.currentUser.memberSince;
    document.getElementById('specialization').textContent = this.currentUser.specialization;
    document.getElementById('region').textContent = this.currentUser.region;
    document.getElementById('languages').textContent = this.currentUser.languages;

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

  loadRecentActivity() {
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
    // Cargar datos del usuario en el formulario
    document.getElementById('fullName').value = this.currentUser.name || '';
    document.getElementById('email').value = this.currentUser.email || '';
    document.getElementById('phone').value = this.currentUser.phone || '';
    document.getElementById('birthDate').value = this.currentUser.birthDate || '';
    document.getElementById('nationality').value = this.currentUser.nationality || '';
    document.getElementById('city').value = this.currentUser.city || '';
    document.getElementById('organization').value = this.currentUser.organization || '';
    document.getElementById('position').value = this.currentUser.position || '';
    document.getElementById('experience').value = this.currentUser.experience || '';
    document.getElementById('bio').value = this.currentUser.bio || '';
  }

  savePersonalInfo() {
    const formData = {
      name: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      birthDate: document.getElementById('birthDate').value,
      nationality: document.getElementById('nationality').value,
      city: document.getElementById('city').value,
      organization: document.getElementById('organization').value,
      position: document.getElementById('position').value,
      experience: document.getElementById('experience').value,
      bio: document.getElementById('bio').value
    };

    // Actualizar datos del usuario
    Object.assign(this.currentUser, formData);
    this.currentUser.role = `${formData.position} - ${formData.organization}`;

    // Guardar en localStorage
    localStorage.setItem('scoutConnectUser', JSON.stringify(this.currentUser));

    // Actualizar display
    this.updateProfileDisplay();

    this.showNotification('Información actualizada correctamente', 'success');
  }

  cancelEdit() {
    // Recargar datos originales en el formulario
    this.loadPersonalInfoForm();
    this.showNotification('Cambios cancelados', 'info');
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

  loadActivityTimeline() {
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
        this.newAvatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveAvatar() {
    if (this.newAvatar) {
      this.currentUser.avatar = this.newAvatar;
      document.getElementById('avatarImage').src = this.newAvatar;
      localStorage.setItem('scoutConnectUser', JSON.stringify(this.currentUser));
      this.closeAvatarModal();
      this.showNotification('Foto de perfil actualizada', 'success');
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
