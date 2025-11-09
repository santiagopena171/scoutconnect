/**
 * Calendar Interactions - Drag & drop, clicks, modales
 * Extensión de CalendarManager con métodos de interacción
 */

/**
 * Handle day click in month view
 */
CalendarManager.prototype.handleDayClick = function(element) {
	const dateStr = element.dataset.date;
	if (!dateStr) return;
	
	const date = new Date(dateStr);
	this.currentDate = date;
	this.switchView('day');
};

/**
 * Handle time slot click (create event)
 */
CalendarManager.prototype.handleSlotClick = function(element) {
	const dateStr = element.dataset.date;
	if (!dateStr) return;
	
	const startDate = new Date(dateStr);
	const endDate = new Date(startDate);
	endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration
	
	this.openCreateModal({ start: startDate, end: endDate });
};

/**
 * Handle drag start
 */
CalendarManager.prototype.handleDragStart = function(event, eventId) {
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('eventId', eventId);
	this.isDragging = true;
};

/**
 * Handle drop (move event)
 */
CalendarManager.prototype.handleDrop = async function(event, element) {
	event.preventDefault();
	
	const eventId = event.dataTransfer.getData('eventId');
	const newStartStr = element.dataset.date;
	
	if (!eventId || !newStartStr) return;
	
	const calEvent = this.events.find(e => e.id === eventId);
	if (!calEvent) return;
	
	const newStart = new Date(newStartStr);
	const duration = calEvent.end - calEvent.start;
	const newEnd = new Date(newStart.getTime() + duration);
	
	// Check for conflicts
	const conflicts = await this.checkConflicts(eventId, newStart, newEnd);
	
	if (conflicts.length > 0) {
		const proceed = confirm(
			`Este evento se solapa con:\n${conflicts.map(c => `- ${c.title} (${this.formatTime(c.start_at)} - ${this.formatTime(c.end_at)})`).join('\n')}\n\n¿Mover de todas formas?`
		);
		if (!proceed) {
			this.isDragging = false;
			return;
		}
	}
	
	// Update event
	await this.updateEvent(eventId, {
		start_at_utc: newStart.toISOString(),
		end_at_utc: newEnd.toISOString()
	});
	
	this.isDragging = false;
};

/**
 * Handle resize start
 */
CalendarManager.prototype.handleResizeStart = function(event, eventId) {
	event.stopPropagation();
	
	const calEvent = this.events.find(e => e.id === eventId);
	if (!calEvent) return;
	
	this.resizingEvent = {
		id: eventId,
		originalEnd: calEvent.end,
		startY: event.clientY
	};
	
	// Add mousemove and mouseup listeners
	document.addEventListener('mousemove', this.handleResizeMove.bind(this));
	document.addEventListener('mouseup', this.handleResizeEnd.bind(this));
};

/**
 * Handle resize move
 */
CalendarManager.prototype.handleResizeMove = function(event) {
	if (!this.resizingEvent) return;
	
	const deltaY = event.clientY - this.resizingEvent.startY;
	const deltaMinutes = Math.round(deltaY / 2); // 2px per minute
	
	// Update visual feedback
	// (Implementation depends on DOM structure)
};

/**
 * Handle resize end
 */
CalendarManager.prototype.handleResizeEnd = async function(event) {
	if (!this.resizingEvent) return;
	
	const deltaY = event.clientY - this.resizingEvent.startY;
	const deltaMinutes = Math.round(deltaY / 2);
	
	const calEvent = this.events.find(e => e.id === this.resizingEvent.id);
	if (!calEvent) return;
	
	const newEnd = new Date(calEvent.end);
	newEnd.setMinutes(newEnd.getMinutes() + deltaMinutes);
	
	// Validate minimum duration (15 minutes)
	if ((newEnd - calEvent.start) < 15 * 60 * 1000) {
		alert('La duración mínima es de 15 minutos');
		this.resizingEvent = null;
		document.removeEventListener('mousemove', this.handleResizeMove);
		document.removeEventListener('mouseup', this.handleResizeEnd);
		return;
	}
	
	// Update event
	await this.updateEvent(this.resizingEvent.id, {
		end_at_utc: newEnd.toISOString()
	});
	
	this.resizingEvent = null;
	document.removeEventListener('mousemove', this.handleResizeMove);
	document.removeEventListener('mouseup', this.handleResizeEnd);
};

/**
 * Open create event modal
 */
CalendarManager.prototype.openCreateModal = function(prefill = {}) {
	const modal = document.getElementById('event-modal');
	if (!modal) return;
	
	// Reset form
	const form = document.getElementById('event-form');
	if (form) form.reset();
	
	// Set modal title
	document.getElementById('event-modal-title').textContent = 'Crear evento';
	
	// Prefill data
	if (prefill.start) {
		document.getElementById('event-start').value = this.formatDateTimeLocal(prefill.start);
	}
	if (prefill.end) {
		document.getElementById('event-end').value = this.formatDateTimeLocal(prefill.end);
	}
	
	// Show modal
	modal.classList.add('active');
	
	// Focus first input
	document.getElementById('event-title')?.focus();
};

/**
 * Open event details modal
 */
CalendarManager.prototype.openEventDetails = function(eventId) {
	const event = this.events.find(e => e.id === eventId);
	if (!event) return;
	
	const modal = document.getElementById('event-details-modal');
	if (!modal) return;
	
	// Populate modal with event data
	modal.innerHTML = `
		<div class="modal-content">
			<div class="modal-header" style="border-left: 4px solid ${event.color}">
				<h2>
					<span class="calendar-event-icon">${event.icon}</span>
					${this.escapeHtml(event.title)}
				</h2>
				<button class="modal-close" onclick="calendarManager.closeModal('event-details-modal')">&times;</button>
			</div>
			
			<div class="modal-body">
				<div class="event-detail-section">
					<div class="event-detail-label">📅 Fecha y hora</div>
					<div class="event-detail-value">
						${event.allDay 
							? this.formatDate(event.start, { dateStyle: 'full' })
							: `${this.formatDate(event.start, { dateStyle: 'full' })}<br>${this.formatTime(event.start)} - ${this.formatTime(event.end)}`
						}
					</div>
				</div>
				
				${event.location ? `
					<div class="event-detail-section">
						<div class="event-detail-label">📍 Ubicación</div>
						<div class="event-detail-value">
							${this.escapeHtml(event.location)}
							${event.locationUrl ? `<br><a href="${event.locationUrl}" target="_blank" class="btn-link">Ver en mapa</a>` : ''}
						</div>
					</div>
				` : ''}
				
				<div class="event-detail-section">
					<div class="event-detail-label">🏷️ Tipo</div>
					<div class="event-detail-value">
						<span class="calendar-event-badge calendar-event-type-${event.type}">
							${this.eventConfig[event.type]?.label || event.type}
						</span>
					</div>
				</div>
				
				<div class="event-detail-section">
					<div class="event-detail-label">📊 Estado</div>
					<div class="event-detail-value">
						<span class="calendar-event-badge calendar-event-badge-${event.status}">
							${event.status}
						</span>
					</div>
				</div>
				
				${event.description ? `
					<div class="event-detail-section">
						<div class="event-detail-label">📝 Descripción</div>
						<div class="event-detail-value">${this.escapeHtml(event.description)}</div>
					</div>
				` : ''}
				
				${event.participants.length > 0 ? `
					<div class="event-detail-section">
						<div class="event-detail-label">👥 Participantes</div>
						<div class="event-detail-value">
							<div class="event-participants-list">
								${event.participants.map(p => `
									<div class="event-participant">
										<img src="${p.profile?.avatar_url || '/imagenes/default-avatar.png'}" class="participant-avatar">
										<span>${p.profile?.full_name || 'Usuario'}</span>
										<span class="participant-role">(${p.role})</span>
									</div>
								`).join('')}
							</div>
						</div>
					</div>
				` : ''}
				
				${event.reminders.length > 0 ? `
					<div class="event-detail-section">
						<div class="event-detail-label">🔔 Recordatorios</div>
						<div class="event-detail-value">
							${event.reminders.map(r => `
								<div class="event-reminder">
									${r.method === 'email' ? '📧' : r.method === 'whatsapp' ? '📱' : '🔔'} 
									${r.offset}
								</div>
							`).join('')}
						</div>
					</div>
				` : ''}
				
				${event.attachments.length > 0 ? `
					<div class="event-detail-section">
						<div class="event-detail-label">📎 Adjuntos</div>
						<div class="event-detail-value">
							${event.attachments.map(a => `
								<a href="${a.url}" target="_blank" class="event-attachment">
									${a.type === 'video' ? '🎥' : a.type === 'map' ? '🗺️' : '📄'} 
									${a.title || 'Ver archivo'}
								</a>
							`).join('')}
						</div>
					</div>
				` : ''}
				
				<div class="event-detail-section">
					<div class="event-detail-label">👤 Creado por</div>
					<div class="event-detail-value">
						<div class="event-participant">
							<img src="${event.createdBy?.avatar_url || '/imagenes/default-avatar.png'}" class="participant-avatar">
							<span>${event.createdBy?.full_name || 'Usuario'}</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="modal-footer">
				${event.type === 'tryout' && event.status === 'scheduled' ? `
					<button class="btn btn-success" onclick="calendarManager.markEventAsDone('${event.id}')">
						✓ Marcar como realizado
					</button>
					<button class="btn btn-primary" onclick="calendarManager.createReportFromEvent('${event.id}')">
						📝 Generar informe
					</button>
				` : ''}
				
				${event.status === 'scheduled' ? `
					<button class="btn btn-warning" onclick="calendarManager.postponeEvent('${event.id}')">
						⏸️ Postponer
					</button>
				` : ''}
				
				<button class="btn btn-secondary" onclick="calendarManager.openEditModal('${event.id}')">
					✏️ Editar
				</button>
				
				<button class="btn btn-danger" onclick="calendarManager.deleteEvent('${event.id}')">
					🗑️ Eliminar
				</button>
			</div>
		</div>
	`;
	
	modal.classList.add('active');
};

/**
 * Close modal
 */
CalendarManager.prototype.closeModal = function(modalId) {
	const modal = document.getElementById(modalId);
	if (modal) {
		modal.classList.remove('active');
	}
};

/**
 * Format date for datetime-local input
 */
CalendarManager.prototype.formatDateTimeLocal = function(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	
	return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Check for event conflicts
 */
CalendarManager.prototype.checkConflicts = async function(excludeEventId, startDate, endDate) {
	try {
		const { data, error } = await this.supabase
			.rpc('check_event_conflicts', {
				p_user_id: this.currentUser.id,
				p_start_at: startDate.toISOString(),
				p_end_at: endDate.toISOString(),
				p_exclude_event_id: excludeEventId
			});
		
		if (error) throw error;
		return data || [];
		
	} catch (error) {
		console.error('Error checking conflicts:', error);
		return [];
	}
};

/**
 * Create new event
 */
CalendarManager.prototype.createEvent = async function(eventData) {
	try {
		// Convert local times to UTC
		const startUTC = new Date(eventData.start_at_local);
		const endUTC = new Date(eventData.end_at_local);
		
		// Check conflicts
		const conflicts = await this.checkConflicts(null, startUTC, endUTC);
		if (conflicts.length > 0) {
			const proceed = confirm(
				`Este evento se solapa con:\n${conflicts.map(c => `- ${c.title}`).join('\n')}\n\n¿Crear de todas formas?`
			);
			if (!proceed) return;
		}
		
		const { data, error } = await this.supabase
			.from('calendar_events')
			.insert({
				...eventData,
				start_at_utc: startUTC.toISOString(),
				end_at_utc: endUTC.toISOString(),
				created_by: this.currentUser.id,
				organization_id: this.userProfile.organization_id
			})
			.select()
			.single();
		
		if (error) throw error;
		
		this.showNotification('Evento creado exitosamente', 'success');
		this.closeModal('event-modal');
		await this.loadEvents();
		
		return data;
		
	} catch (error) {
		console.error('Error creating event:', error);
		this.showError('Error al crear evento');
	}
};

/**
 * Update event
 */
CalendarManager.prototype.updateEvent = async function(eventId, updates) {
	try {
		const { error } = await this.supabase
			.from('calendar_events')
			.update(updates)
			.eq('id', eventId);
		
		if (error) throw error;
		
		this.showNotification('Evento actualizado', 'success');
		await this.loadEvents();
		
	} catch (error) {
		console.error('Error updating event:', error);
		this.showError('Error al actualizar evento');
	}
};

/**
 * Delete event
 */
CalendarManager.prototype.deleteEvent = async function(eventId) {
	if (!confirm('¿Estás seguro de eliminar este evento?')) return;
	
	try {
		const { error } = await this.supabase
			.from('calendar_events')
			.delete()
			.eq('id', eventId);
		
		if (error) throw error;
		
		this.showNotification('Evento eliminado', 'success');
		this.closeModal('event-details-modal');
		await this.loadEvents();
		
	} catch (error) {
		console.error('Error deleting event:', error);
		this.showError('Error al eliminar evento');
	}
};

/**
 * Mark event as done
 */
CalendarManager.prototype.markEventAsDone = async function(eventId) {
	await this.updateEvent(eventId, { status: 'done' });
	this.closeModal('event-details-modal');
};

/**
 * Postpone event
 */
CalendarManager.prototype.postponeEvent = async function(eventId) {
	const newDate = prompt('Nueva fecha (formato: YYYY-MM-DD HH:MM):');
	if (!newDate) return;
	
	try {
		const postponedTo = new Date(newDate);
		const event = this.events.find(e => e.id === eventId);
		const duration = event.end - event.start;
		const newEnd = new Date(postponedTo.getTime() + duration);
		
		await this.updateEvent(eventId, {
			status: 'postponed',
			postponed_to_utc: postponedTo.toISOString(),
			start_at_utc: postponedTo.toISOString(),
			end_at_utc: newEnd.toISOString()
		});
		
		this.closeModal('event-details-modal');
		
	} catch (error) {
		this.showError('Formato de fecha inválido');
	}
};

/**
 * Create report from event (for tryouts)
 */
CalendarManager.prototype.createReportFromEvent = function(eventId) {
	const event = this.events.find(e => e.id === eventId);
	if (!event) return;
	
	// Redirect to report creation with event context
	localStorage.setItem('pendingReport', JSON.stringify({
		eventId: event.id,
		eventTitle: event.title,
		eventDate: event.start.toISOString()
	}));
	
	window.location.href = 'reports.html?create=true';
};
