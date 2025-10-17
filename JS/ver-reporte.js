// ===== VER REPORTE - JAVASCRIPT =====

class ReportViewer {
  constructor() {
    this.reportId = null;
    this.report = null;
    this.currentUser = null;
    this.init();
  }

  init() {
    console.log('🎯 Iniciando visualizador de reportes...');
    
    // Cargar usuario actual
    this.currentUser = this.loadCurrentUser();
    
    // Obtener ID del reporte desde URL
    this.reportId = this.getReportIdFromURL();
    
    if (!this.reportId) {
      this.showNotFound();
      return;
    }

    // Cargar reporte
    this.loadReport();
  }

  getReportIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  loadCurrentUser() {
    try {
      const userStr = localStorage.getItem('scoutConnectUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al cargar usuario actual:', error);
      return null;
    }
  }

  loadReport() {
    try {
      // Cargar todos los reportes desde localStorage
      const reportsStr = localStorage.getItem('generatedReports');
      const reports = reportsStr ? JSON.parse(reportsStr) : [];
      
      // Buscar el reporte específico
      this.report = reports.find(r => r.id === this.reportId);
      
      if (!this.report) {
        console.error('Reporte no encontrado:', this.reportId);
        this.showNotFound();
        return;
      }

      // Validar acceso: solo el scout que creó el reporte puede verlo
      if (!this.validateAccess()) {
        console.warn('Acceso denegado al reporte:', this.reportId);
        this.showAccessDenied();
        return;
      }

      // Renderizar el reporte
      this.renderReport();
      this.showContent();

    } catch (error) {
      console.error('Error al cargar reporte:', error);
      this.showNotFound();
    }
  }

  validateAccess() {
    // Si no hay usuario actual, denegar acceso
    if (!this.currentUser) {
      console.log('❌ No hay usuario actual');
      return false;
    }

    // Si no hay reporte, denegar
    if (!this.report) {
      console.log('❌ No hay reporte cargado');
      return false;
    }

    // Validar que el usuario actual sea el scout autor
    const scoutIdentifier = this.currentUser.name || this.currentUser.email || this.currentUser.id;
    const isAuthor = 
      this.report.scoutName === scoutIdentifier ||
      this.report.scoutId == this.currentUser.id ||
      this.report.scoutEmail === this.currentUser.email;

    console.log('🔐 Validación de acceso:', {
      currentUser: scoutIdentifier,
      reportScout: this.report.scoutName,
      isAuthor: isAuthor
    });

    return isAuthor;
  }

  renderReport() {
    if (!this.report) return;

    console.log('📊 Renderizando reporte:', this.report);

    // Título y meta información
    document.getElementById('reportTitle').textContent = this.report.title || 'Reporte de Scouting';
    document.getElementById('reportDate').textContent = new Date(this.report.date).toLocaleDateString('es-ES');
    document.getElementById('reportScout').textContent = this.report.scoutName || 'Scout';
    document.getElementById('reportPlayer').textContent = this.report.playerName || 'Jugador';

    // Usuario actual en navbar
    if (this.currentUser) {
      document.getElementById('currentUserName').textContent = this.currentUser.name || 'Scout';
    }

    // Rating general
    const overallRating = this.report.overallRating || 0;
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
    document.getElementById('footerDate').textContent = new Date(this.report.date).toLocaleDateString('es-ES');

    // Actualizar título de página
    document.title = `${this.report.title} - ${this.report.playerName} - ScoutConnect`;
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
    
    const playerInfo = [
      { label: 'Nombre', value: this.report.playerName || '-' },
      { label: 'Posición', value: this.report.playerPosition || '-' },
      { label: 'Edad', value: this.report.playerAge || '-' },
      { label: 'Club', value: this.report.playerClub || '-' },
      { label: 'Nacionalidad', value: this.report.playerNationality || '-' },
      { label: 'Fecha del reporte', value: new Date(this.report.date).toLocaleDateString('es-ES') }
    ];

    infoGrid.innerHTML = playerInfo.map(info => `
      <div class="info-item">
        <span class="info-label">${info.label}</span>
        <span class="info-value">${info.value}</span>
      </div>
    `).join('');
  }

  renderEvaluations() {
    // Técnico
    this.renderCategory('technical', 'technicalRating', 'technicalSkills', this.report.technicalEvals);
    
    // Físico
    this.renderCategory('physical', 'physicalRating', 'physicalSkills', this.report.physicalEvals);
    
    // Mental
    this.renderCategory('mental', 'mentalRating', 'mentalSkills', this.report.mentalEvals);
    
    // Táctico
    this.renderCategory('tactical', 'tacticalRating', 'tacticalSkills', this.report.tacticalEvals);
  }

  renderCategory(categoryKey, ratingId, skillsId, evaluations) {
    // Rating de la categoría
    const rating = this.report[categoryKey + 'Rating'] || 0;
    document.getElementById(ratingId).textContent = `${rating.toFixed(1)}/10`;

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
    const summary = this.report.summary || 'No hay resumen disponible para este reporte.';
    summaryContainer.innerHTML = `<p>${summary}</p>`;
  }

  renderStrengthsWeaknesses() {
    // Fortalezas
    const strengthsList = document.getElementById('strengthsList');
    const strengths = this.report.strengths || this.generateStrengthsFromEvals();
    
    if (strengths.length === 0) {
      strengthsList.innerHTML = '<li>No hay fortalezas identificadas</li>';
    } else {
      strengthsList.innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
    }

    // Debilidades
    const weaknessesList = document.getElementById('weaknessesList');
    const weaknesses = this.report.weaknesses || this.generateWeaknessesFromEvals();
    
    if (weaknesses.length === 0) {
      weaknessesList.innerHTML = '<li>No hay áreas de mejora identificadas</li>';
    } else {
      weaknessesList.innerHTML = weaknesses.map(w => `<li>${w}</li>`).join('');
    }
  }

  generateStrengthsFromEvals() {
    const strengths = [];
    const allEvals = {
      ...this.report.technicalEvals,
      ...this.report.physicalEvals,
      ...this.report.mentalEvals,
      ...this.report.tacticalEvals
    };

    Object.entries(allEvals).forEach(([skill, rating]) => {
      if (rating >= 8) {
        strengths.push(`Excelente ${skill.toLowerCase()}`);
      }
    });

    return strengths.slice(0, 5); // Máximo 5 fortalezas
  }

  generateWeaknessesFromEvals() {
    const weaknesses = [];
    const allEvals = {
      ...this.report.technicalEvals,
      ...this.report.physicalEvals,
      ...this.report.mentalEvals,
      ...this.report.tacticalEvals
    };

    Object.entries(allEvals).forEach(([skill, rating]) => {
      if (rating <= 5) {
        weaknesses.push(`Mejorar ${skill.toLowerCase()}`);
      }
    });

    return weaknesses.slice(0, 5); // Máximo 5 debilidades
  }

  renderRecommendation() {
    const recContainer = document.getElementById('recommendationContent');
    const recommendation = this.report.recommendation || '';
    const overallRating = this.report.overallRating || 0;

    let badgeClass = 'recommendation-badge';
    let badgeText = 'Recomendado';
    let badgeIcon = 'fa-thumbs-up';

    if (overallRating >= 7.5) {
      badgeClass += '';
      badgeText = 'Altamente Recomendado';
      badgeIcon = 'fa-star';
    } else if (overallRating >= 6) {
      badgeClass += ' consider';
      badgeText = 'A Considerar';
      badgeIcon = 'fa-check-circle';
    } else {
      badgeClass += ' not-recommended';
      badgeText = 'No Recomendado';
      badgeIcon = 'fa-times-circle';
    }

    recContainer.innerHTML = `
      <div class="${badgeClass}">
        <i class="fas ${badgeIcon}"></i>
        <span>${badgeText}</span>
      </div>
      <p class="recommendation-text">${recommendation || 'El scout no ha dejado una recomendación específica.'}</p>
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM cargado, iniciando visualizador de reportes...');
  window.reportViewer = new ReportViewer();
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
