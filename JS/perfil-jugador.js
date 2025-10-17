// ===== PERFIL DE JUGADOR - JAVASCRIPT COMPLETO =====

class PlayerProfile {
  constructor() {
    this.playerId = null;
    this.playerData = null;
    this.watchlist = this.loadWatchlist();
    this.reports = this.loadReports();
    this.activeSection = 'overview';
    this.init();
  }

  init() {
    console.log('🎯 Iniciando Perfil de Jugador...');
    this.playerId = this.getPlayerIdFromURL();
    
    if (!this.playerId) {
      this.showError();
      return;
    }

    this.loadPlayerData();
    this.updateCounters();
    this.setupEventListeners();
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
    // Mock data - en implementación real esto vendría de una API
    const mockPlayers = {
      '1': {
        id: 1,
        name: 'Martin Silva',
        age: 28,
        primaryPosition: 'Portero',
        secondaryPosition: null,
        nationality: 'Uruguayo',
        club: 'Club Nacional de Football',
        league: 'Primera División - Uruguay',
        height: 188,
        weight: 82,
        foot: 'Derecho',
        country: 'Uruguay',
        state: 'Montevideo',
        city: 'Montevideo',
        birthDate: '1995-03-15',
        birthPlace: 'Montevideo, Uruguay',
        contract: {
          status: 'professional',
          expires: '2025-12-31',
          value: '2.5M USD'
        },
        tags: ['técnico', 'líder', 'clínico', 'elegante', 'confiable'],
        skills: {
          technical: {
            'Paradas': 92,
            'Distribución': 85,
            'Reflejos': 90,
            'Juego Aéreo': 88,
            'Salida': 87
          },
          mental: {
            'Liderazgo': 95,
            'Comunicación': 92,
            'Concentración': 90,
            'Decisión': 88,
            'Compostura': 93
          },
          physical: {
            'Agilidad': 85,
            'Flexibilidad': 88,
            'Salto': 82,
            'Velocidad': 70,
            'Resistencia': 78
          }
        },
        careerHistory: [
          { year: '2023-2024', team: 'Club Nacional', league: 'Primera División', matches: 34, goals: 0 },
          { year: '2022-2023', team: 'Club Nacional', league: 'Primera División', matches: 32, goals: 0 },
          { year: '2021-2022', team: 'Defensor Sporting', league: 'Primera División', matches: 28, goals: 0 }
        ],
        videos: [
          { title: 'Mejores Paradas 2024', description: 'Compilación de las mejores paradas de la temporada', url: 'https://youtube.com/watch?v=example1' },
          { title: 'Distribución y Salidas', description: 'Video técnico mostrando distribución desde el arco', url: 'https://youtube.com/watch?v=example2' }
        ],
        stats: {
          matches: 34,
          cleanSheets: 18,
          saves: 127,
          savePercentage: 78.5,
          goalsAgainst: 28
        }
      },
      '2': {
        id: 2,
        name: 'Carlos Rodriguez',
        age: 22,
        primaryPosition: 'Extremo Derecho',
        secondaryPosition: 'Mediocampista Ofensivo',
        nationality: 'Argentino',
        club: 'River Plate',
        league: 'Primera División - Argentina',
        height: 175,
        weight: 68,
        foot: 'Izquierdo',
        country: 'Argentina',
        state: 'Buenos Aires',
        city: 'Buenos Aires',
        birthDate: '2001-08-20',
        birthPlace: 'Rosario, Argentina',
        contract: {
          status: 'professional',
          expires: '2026-06-30',
          value: '5.2M USD'
        },
        tags: ['veloz', 'driblador', 'creativo', 'ofensivo', 'joven talento'],
        skills: {
          technical: {
            'Dribbling': 88,
            'Pase': 82,
            'Centros': 85,
            'Finalización': 75,
            'Control': 87
          },
          mental: {
            'Visión': 84,
            'Creatividad': 90,
            'Decisión': 78,
            'Concentración': 80,
            'Presión': 76
          },
          physical: {
            'Velocidad': 92,
            'Aceleración': 90,
            'Agilidad': 89,
            'Resistencia': 82,
            'Salto': 70
          }
        },
        careerHistory: [
          { year: '2024', team: 'River Plate', league: 'Primera División', matches: 28, goals: 8, assists: 12 },
          { year: '2023', team: 'River Plate', league: 'Primera División', matches: 22, goals: 5, assists: 7 },
          { year: '2022', team: 'River Plate Reserva', league: 'Reserva', matches: 35, goals: 15, assists: 18 }
        ],
        videos: [
          { title: 'Goles y Asistencias 2024', description: 'Los mejores momentos ofensivos de la temporada', url: 'https://youtube.com/watch?v=example3' },
          { title: 'Habilidades de Dribbling', description: 'Muestra de velocidad y técnica individual', url: 'https://youtube.com/watch?v=example4' }
        ],
        stats: {
          matches: 28,
          goals: 8,
          assists: 12,
          keyPasses: 45,
          successfulDribbles: 68
        }
      }
      // Agregar más jugadores según sea necesario
    };

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return mockPlayers[playerId] || null;
  }

  renderPlayerProfile() {
    if (!this.playerData) return;

    this.renderBasicInfo();
    this.renderOverviewSection();
    this.renderPersonalSection();
    this.renderCareerSection();
    this.renderSkillsSection();
    this.renderPhysicalSection();
    this.renderVideosSection();
    this.renderPerformanceSection();
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
        <span class="data-label">Nombre completo</span>
        <span class="data-value">${player.name}</span>
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
        <span class="data-label">Nacionalidad</span>
        <span class="data-value">${player.nationality}</span>
      </div>
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

  renderSkillsSection() {
    const player = this.playerData;
    
    const technicalSkills = document.getElementById('technicalSkills');
    technicalSkills.innerHTML = Object.entries(player.skills.technical).map(([skill, value]) => `
      <div class="skill-item">
        <div class="skill-name">${skill}</div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: ${value}%"></div>
        </div>
        <div class="skill-value">${value}/100</div>
      </div>
    `).join('');
    
    const mentalSkills = document.getElementById('mentalSkills');
    mentalSkills.innerHTML = Object.entries(player.skills.mental).map(([skill, value]) => `
      <div class="skill-item">
        <div class="skill-name">${skill}</div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: ${value}%"></div>
        </div>
        <div class="skill-value">${value}/100</div>
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
    
    const physicalAttributes = document.getElementById('physicalAttributes');
    physicalAttributes.innerHTML = Object.entries(player.skills.physical).map(([skill, value]) => `
      <div class="skill-item">
        <div class="skill-name">${skill}</div>
        <div class="skill-bar">
          <div class="skill-progress" style="width: ${value}%"></div>
        </div>
        <div class="skill-value">${value}/100</div>
      </div>
    `).join('');
  }

  renderVideosSection() {
    const player = this.playerData;
    
    const videosGrid = document.getElementById('playerVideos');
    if (player.videos && player.videos.length > 0) {
      videosGrid.innerHTML = player.videos.map(video => `
        <div class="video-item">
          <div class="video-thumbnail" onclick="window.open('${video.url}', '_blank')">
            <i class="fas fa-play"></i>
          </div>
          <div class="video-info">
            <div class="video-title">${video.title}</div>
            <div class="video-description">${video.description}</div>
          </div>
        </div>
      `).join('');
    } else {
      videosGrid.innerHTML = '<p>No hay videos disponibles para este jugador.</p>';
    }
  }

  renderPerformanceSection() {
    const player = this.playerData;
    
    const seasonStats = document.getElementById('seasonStats');
    seasonStats.innerHTML = Object.entries(player.stats).map(([stat, value]) => `
      <div class="stat-card">
        <span class="stat-number">${value}</span>
        <span class="stat-label">${this.getStatLabel(stat)}</span>
      </div>
    `).join('');
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
      scoutName: 'Scout Pro' // En implementación real vendría del usuario actual
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

  loadReports() {
    try {
      const saved = localStorage.getItem('generatedReports');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      return [];
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

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado, iniciando Perfil de Jugador...');
  window.playerProfile = new PlayerProfile();
});
