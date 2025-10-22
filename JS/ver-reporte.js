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
    
    // Fecha - soportar diferentes formatos
    const dateStr = this.report.observationDate || this.report.date || this.report.createdAt;
    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : 'Fecha no disponible';
    document.getElementById('reportDate').textContent = displayDate;
    
    document.getElementById('reportScout').textContent = this.report.scoutName || 'Scout';
    document.getElementById('reportPlayer').textContent = this.report.playerName || 'Jugador';

    // Usuario actual en navbar
    if (this.currentUser) {
      document.getElementById('currentUserName').textContent = this.currentUser.name || 'Scout';
    }

    // Rating general - calcular si no existe
    let overallRating = this.report.overall || this.report.overallRating;
    if (!overallRating && this.report.ratings) {
      const values = Object.values(this.report.ratings).filter(v => v > 0);
      overallRating = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
    }
    overallRating = overallRating || 0;
    
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
    
    const footerDateStr = this.report.observationDate || this.report.date || this.report.createdAt;
    const footerDate = footerDateStr ? new Date(footerDateStr).toLocaleDateString('es-ES') : '-';
    document.getElementById('footerDate').textContent = footerDate;

    // Actualizar título de página
    document.title = `${this.report.title || 'Reporte'} - ${this.report.playerName} - ScoutConnect`;
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
    
    // Fecha de observación/reporte
    const dateStr = this.report.observationDate || this.report.date || this.report.createdAt;
    const displayDate = dateStr ? new Date(dateStr).toLocaleDateString('es-ES') : '-';
    
    const playerInfo = [
      { label: 'Nombre', value: this.report.playerName || '-' },
      { label: 'Posición', value: this.report.playerPosition || '-' },
      { label: 'Edad', value: this.report.playerAge || '-' },
      { label: 'Club', value: this.report.playerClub || '-' },
      { label: 'Nacionalidad', value: this.report.playerNationality || '-' },
      { label: 'Fecha del reporte', value: displayDate }
    ];

    infoGrid.innerHTML = playerInfo.map(info => `
      <div class="info-item">
        <span class="info-label">${info.label}</span>
        <span class="info-value">${info.value}</span>
      </div>
    `).join('');
  }

  renderEvaluations() {
    // Técnico - soportar ambos formatos
    const technicalRating = this.report.ratings?.technical || this.report.technicalRating || 0;
    const technicalEvals = this.report.technicalEvals || this.extractEvaluations(this.report.evaluations, 'technical');
    this.renderCategory('technical', 'technicalRating', 'technicalSkills', technicalEvals, technicalRating);
    
    // Físico
    const physicalRating = this.report.ratings?.physical || this.report.physicalRating || 0;
    const physicalEvals = this.report.physicalEvals || this.extractEvaluations(this.report.evaluations, 'physical');
    this.renderCategory('physical', 'physicalRating', 'physicalSkills', physicalEvals, physicalRating);
    
    // Mental
    const mentalRating = this.report.ratings?.mental || this.report.mentalRating || 0;
    const mentalEvals = this.report.mentalEvals || this.extractEvaluations(this.report.evaluations, 'mental');
    this.renderCategory('mental', 'mentalRating', 'mentalSkills', mentalEvals, mentalRating);
    
    // Táctico
    const tacticalRating = this.report.ratings?.tactical || this.report.tacticalRating || 0;
    const tacticalEvals = this.report.tacticalEvals || this.extractEvaluations(this.report.evaluations, 'tactical');
    this.renderCategory('tactical', 'tacticalRating', 'tacticalSkills', tacticalEvals, tacticalRating);
  }

  extractEvaluations(evaluations, category) {
    if (!evaluations) return {};
    
    const categoryMap = {
      'technical': ['ballControl', 'shortPass', 'longPass', 'finishing', 'dribbling', 'firstTouch'],
      'physical': ['speed', 'stamina', 'strength', 'agility', 'jumping', 'balance'],
      'mental': ['concentration', 'decisions', 'leadership', 'teamwork', 'pressure', 'motivation'],
      'tactical': ['positioning', 'vision', 'marking', 'anticipation']
    };
    
    const skills = categoryMap[category] || [];
    const result = {};
    
    skills.forEach(skill => {
      if (evaluations[skill] !== undefined) {
        result[skill] = evaluations[skill];
      }
    });
    
    return result;
  }

  renderCategory(categoryKey, ratingId, skillsId, evaluations, rating) {
    // Rating de la categoría - usar el parámetro pasado
    const displayRating = rating || 0;
    document.getElementById(ratingId).textContent = `${displayRating.toFixed(1)}/10`;

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
    const summary = this.report.summary || this.report.observations || 'No hay resumen disponible para este reporte.';
    summaryContainer.innerHTML = `<p>${summary}</p>`;
  }

  renderStrengthsWeaknesses() {
    // Fortalezas
    const strengthsList = document.getElementById('strengthsList');
    let strengths = [];
    
    // Si strengths es un string, convertirlo a array
    if (typeof this.report.strengths === 'string' && this.report.strengths.trim() !== '' && this.report.strengths !== 'No especificadas') {
      // Dividir por saltos de línea, comas o puntos
      strengths = this.report.strengths.split(/[\n,•-]+/).map(s => s.trim()).filter(s => s.length > 0);
    } else if (Array.isArray(this.report.strengths)) {
      strengths = this.report.strengths;
    } else {
      strengths = this.generateStrengthsFromEvals();
    }
    
    if (strengths.length === 0) {
      strengthsList.innerHTML = '<li>No hay fortalezas identificadas</li>';
    } else {
      strengthsList.innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
    }

    // Debilidades
    const weaknessesList = document.getElementById('weaknessesList');
    let weaknesses = [];
    
    // Si weaknesses es un string, convertirlo a array
    if (typeof this.report.weaknesses === 'string' && this.report.weaknesses.trim() !== '' && this.report.weaknesses !== 'No especificadas') {
      // Dividir por saltos de línea, comas o puntos
      weaknesses = this.report.weaknesses.split(/[\n,•-]+/).map(w => w.trim()).filter(w => w.length > 0);
    } else if (Array.isArray(this.report.weaknesses)) {
      weaknesses = this.report.weaknesses;
    } else {
      weaknesses = this.generateWeaknessesFromEvals();
    }
    
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
    
    // Mapeo de valores del select a badge visual
    const recommendationMap = {
      'sign': {
        class: '',
        text: 'Recomendar fichaje inmediato',
        icon: 'fa-star'
      },
      'monitor': {
        class: 'consider',
        text: 'Continuar monitoreando',
        icon: 'fa-eye'
      },
      'trial': {
        class: 'consider',
        text: 'Ofrecer periodo de prueba',
        icon: 'fa-clock'
      },
      'contact': {
        class: 'consider',
        text: 'Contactar para más información',
        icon: 'fa-phone'
      },
      'development': {
        class: 'consider',
        text: 'Potencial a largo plazo',
        icon: 'fa-seedling'
      },
      'reject': {
        class: 'not-recommended',
        text: 'No recomendado',
        icon: 'fa-times-circle'
      }
    };

    // Obtener configuración del badge según la recomendación
    const badgeConfig = recommendationMap[recommendation] || {
      class: 'consider',
      text: 'Sin recomendación específica',
      icon: 'fa-info-circle'
    };

    let badgeClass = 'recommendation-badge ' + badgeConfig.class;
    let badgeIcon = badgeConfig.icon;
    
    // Determinar el texto a mostrar
    let badgeText = badgeConfig.text; // Usar el texto del mapeo por defecto
    
    // Si existe recommendationText y NO es el texto por defecto del select, usarlo
    if (this.report.recommendationText && 
        this.report.recommendationText !== 'Seleccionar recomendación' &&
        this.report.recommendationText !== '') {
      badgeText = this.report.recommendationText;
    }

    console.log('📝 Recomendación:', {
      recommendation: this.report.recommendation,
      recommendationText: this.report.recommendationText,
      badgeText: badgeText
    });

    recContainer.innerHTML = `
      <div class="${badgeClass}">
        <i class="fas ${badgeIcon}"></i>
        <span>${badgeText}</span>
      </div>
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
