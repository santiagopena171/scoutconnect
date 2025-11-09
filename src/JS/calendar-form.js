/**
 * Calendar Form - Formulario dinámico según tipo de evento
 * Extensión de CalendarManager con métodos de formulario
 */

/**
 * Close event modal
 */
function closeEventModal() {
	const modal = document.getElementById('event-modal');
	modal.classList.remove('active');
	modal.style.display = 'none';
	document.getElementById('event-form').reset();
	document.getElementById('event-type-fields').style.display = 'none';
	document.getElementById('event-type-fields').innerHTML = '';
}

/**
 * Add reminder to form
 */
function addReminder() {
	const container = document.getElementById('event-reminders');
	const reminderId = 'reminder-' + Date.now();
	
	const reminderHtml = `
		<div class="reminder-item" id="${reminderId}">
			<select name="reminder_method[]" class="form-select form-select-sm" style="flex: 1;">
				<option value="inapp">🔔 In-app</option>
				<option value="email">📧 Email</option>
				<option value="whatsapp">💬 WhatsApp</option>
			</select>
			<select name="reminder_offset[]" class="form-select form-select-sm" style="flex: 1;">
				<option value="5m">5 minutos antes</option>
				<option value="15m">15 minutos antes</option>
				<option value="30m">30 minutos antes</option>
				<option value="1h" selected>1 hora antes</option>
				<option value="2h">2 horas antes</option>
				<option value="1d">1 día antes</option>
				<option value="2d">2 días antes</option>
				<option value="1w">1 semana antes</option>
			</select>
			<button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('${reminderId}').remove()">
				🗑️
			</button>
		</div>
	`;
	
	// Insert before the add button
	const addButton = container.querySelector('.btn');
	addButton.insertAdjacentHTML('beforebegin', reminderHtml);
}

/**
 * Submit event form
 */
async function submitEventForm(event) {
	event.preventDefault();
	
	const form = document.getElementById('event-form');
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	
	try {
		// Show loading state
		const submitBtn = form.querySelector('button[type="submit"]');
		const originalText = submitBtn.textContent;
		submitBtn.disabled = true;
		submitBtn.textContent = 'Guardando...';
		
		// Collect form data
		const formData = new FormData(form);
		
		// Combine date and time
		const startDate = formData.get('start-date');
		const startTime = formData.get('start-time');
		const endDate = formData.get('end-date');
		const endTime = formData.get('end-time');
		
		const startDateTime = `${startDate}T${startTime}`;
		const endDateTime = `${endDate}T${endTime}`;
		
		const eventData = {
			title: formData.get('title'),
			type: formData.get('event-type'),
			start_at_utc: new Date(startDateTime).toISOString(),
			end_at_utc: new Date(endDateTime).toISOString(),
			all_day: formData.get('all_day') === 'on',
			location: formData.get('location') || null,
			description: formData.get('description') || null,
			visibility: formData.get('visibility'),
			metadata: {},
			reminders: []
		};
		
		// Validate times
		const start = new Date(startDateTime);
		const end = new Date(endDateTime);
		
		if (end <= start) {
			alert('La hora de fin debe ser posterior a la hora de inicio');
			submitBtn.disabled = false;
			submitBtn.textContent = originalText;
			return;
		}
		
		// Minimum duration check (15 minutes)
		if (!eventData.all_day && (end - start) < 15 * 60 * 1000) {
			alert('La duración mínima es de 15 minutos');
			submitBtn.disabled = false;
			submitBtn.textContent = originalText;
			return;
		}
		
		// Collect metadata based on event type
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('metadata_')) {
				const metaKey = key.replace('metadata_', '');
				
				// Parse arrays (comma-separated)
				if (metaKey === 'tests' || metaKey === 'scouting_goals') {
					eventData.metadata[metaKey] = value.split(',').map(v => v.trim()).filter(v => v);
				} else {
					eventData.metadata[metaKey] = value;
				}
			}
		}
		
		// Collect reminders
		const methods = formData.getAll('reminder_method[]');
		const offsets = formData.getAll('reminder_offset[]');
		
		for (let i = 0; i < methods.length; i++) {
			eventData.reminders.push({
				method: methods[i],
				offset: offsets[i]
			});
		}
		
		// Get current user
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			alert('Debes iniciar sesión para crear eventos');
			return;
		}
		
		eventData.created_by = user.id;
		
		// Insert event
		const { data, error } = await supabase
			.from('calendar_events')
			.insert([eventData])
			.select()
			.single();
		
		if (error) {
			console.error('Error creating event:', error);
			alert('Error al crear el evento: ' + error.message);
			submitBtn.disabled = false;
			submitBtn.textContent = originalText;
			return;
		}
		
		// Success
		console.log('Event created:', data);
		closeEventModal();
		
		// Show success message
		showNotification('✅ Evento creado exitosamente', 'success');
		
		// Reload calendar if manager exists
		if (typeof calendarManager !== 'undefined' && calendarManager.loadEvents) {
			await calendarManager.loadEvents();
		}
		
	} catch (error) {
		console.error('Error submitting form:', error);
		alert('Error al guardar el evento');
		const submitBtn = form.querySelector('button[type="submit"]');
		submitBtn.disabled = false;
		submitBtn.textContent = 'Guardar evento';
	}
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.textContent = message;
	notification.style.cssText = `
		position: fixed;
		bottom: 24px;
		right: 24px;
		padding: 16px 24px;
		background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
		color: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 10000;
		animation: slideIn 0.3s ease-out;
	`;
	
	document.body.appendChild(notification);
	
	setTimeout(() => {
		notification.style.animation = 'slideOut 0.3s ease-out';
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}

/**
 * Handle event type change - show relevant fields
 */
document.addEventListener('change', function(e) {
	if (e.target.name === 'event-type') {
		const eventType = e.target.value;
		renderTypeSpecificFields(eventType);
	}
});

/**
 * Render fields specific to event type
 */
function renderTypeSpecificFields(eventType) {
	const container = document.getElementById('event-type-fields');
	if (!container) return;
	
	container.style.display = 'block';
	let html = '';
	
	switch (eventType) {
		case 'match':
			html = `
				<h3 class="form-section-title">Detalles del partido</h3>
				<div class="form-group">
					<label class="form-label">Rival</label>
					<input type="text" name="metadata_rival" class="form-input" placeholder="Ej: Club Nacional">
				</div>
				<div class="form-row">
					<div class="form-group">
						<label class="form-label">Competencia</label>
						<input type="text" name="metadata_competition" class="form-input" placeholder="Ej: Torneo Juvenil">
					</div>
					<div class="form-group">
						<label class="form-label">Categoría</label>
						<input type="text" name="metadata_category" class="form-input" placeholder="Ej: Sub-20">
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">Objetivos de scouting</label>
					<textarea name="metadata_scouting_goals" class="form-textarea" rows="2" 
					          placeholder="Ej: Observar mediocampista central y lateral derecho"></textarea>
				</div>
			`;
			break;
		
		case 'tryout':
			html = `
				<h3 class="form-section-title">Detalles de la prueba</h3>
				<div class="form-group">
					<label class="form-label">Pruebas a realizar</label>
					<input type="text" name="metadata_tests" class="form-input" 
					       placeholder="Ej: Sprint 30m, Conducción, Pase largo, Definición">
					<small class="form-help">Separar con comas</small>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label class="form-label">Duración por estación (min)</label>
						<input type="number" name="metadata_duration_per_station" class="form-input" value="20">
					</div>
					<div class="form-group">
						<label class="form-label">Capacidad</label>
						<input type="number" name="metadata_capacity" class="form-input" value="1">
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">Checklist de facetas</label>
					<textarea name="metadata_checklist" class="form-textarea" rows="3" 
					          placeholder="Facetas a evaluar según posición..."></textarea>
				</div>
			`;
			break;
		
		case 'meeting':
			html = `
				<h3 class="form-section-title">Detalles de la reunión</h3>
				<div class="form-group">
					<label class="form-label">Medio</label>
					<select name="metadata_medium" class="form-select">
						<option value="presencial">Presencial</option>
						<option value="meet">Google Meet</option>
						<option value="zoom">Zoom</option>
						<option value="teams">Microsoft Teams</option>
						<option value="whatsapp">WhatsApp Call</option>
					</select>
				</div>
				<div class="form-group">
					<label class="form-label">Link de reunión</label>
					<input type="url" name="metadata_link" class="form-input" placeholder="https://meet.google.com/...">
				</div>
				<div class="form-group">
					<label class="form-label">Agenda</label>
					<textarea name="metadata_agenda" class="form-textarea" rows="3" 
					          placeholder="Temas a tratar..."></textarea>
				</div>
			`;
			break;
		
		case 'travel':
			html = `
				<h3 class="form-section-title">Detalles del viaje</h3>
				<div class="form-row">
					<div class="form-group">
						<label class="form-label">Origen</label>
						<input type="text" name="metadata_origin" class="form-input" placeholder="Ej: Montevideo">
					</div>
					<div class="form-group">
						<label class="form-label">Destino</label>
						<input type="text" name="metadata_destination" class="form-input" placeholder="Ej: Buenos Aires">
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label class="form-label">Transporte</label>
						<select name="metadata_transport" class="form-select">
							<option value="avion">Avión</option>
							<option value="auto">Auto</option>
							<option value="bus">Ómnibus</option>
							<option value="tren">Tren</option>
							<option value="otro">Otro</option>
						</select>
					</div>
					<div class="form-group">
						<label class="form-label">Nº de vuelo/ómnibus</label>
						<input type="text" name="metadata_flight_number" class="form-input" placeholder="Ej: AR1234">
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">Buffer de traslado (minutos)</label>
					<input type="number" name="metadata_buffer_minutes" class="form-input" value="30">
					<small class="form-help">Tiempo adicional antes/después del evento</small>
				</div>
			`;
			break;
		
		case 'deadline':
			html = `
				<h3 class="form-section-title">Detalles del deadline</h3>
				<div class="form-group">
					<label class="form-label">Tipo de deadline</label>
					<select name="metadata_deadline_type" class="form-select">
						<option value="report">Informe</option>
						<option value="offer">Oferta</option>
						<option value="contract">Contrato</option>
						<option value="document">Documento</option>
						<option value="other">Otro</option>
					</select>
				</div>
				<div class="form-group">
					<label class="form-label">Relacionado con</label>
					<input type="text" name="metadata_related_to" class="form-input" 
					       placeholder="Ej: Informe de Juan Pérez">
				</div>
			`;
			break;
		
		case 'reminder':
			html = `
				<h3 class="form-section-title">Detalles del recordatorio</h3>
				<div class="form-group">
					<label class="form-label">Acción a recordar</label>
					<textarea name="metadata_action" class="form-textarea" rows="2" 
					          placeholder="Ej: Ver nuevo video de Matías Silva en Instagram"></textarea>
				</div>
				<div class="form-group">
					<label class="form-label">Prioridad</label>
					<select name="metadata_priority" class="form-select">
						<option value="low">Baja</option>
						<option value="medium" selected>Media</option>
						<option value="high">Alta</option>
					</select>
				</div>
			`;
			break;
		
		default:
			container.style.display = 'none';
			return;
	}
	
	container.innerHTML = html;
}

/**
 * Add reminder to event
 */
CalendarManager.prototype.addReminder = function() {
	const container = document.getElementById('event-reminders');
	if (!container) return;
	
	// Check limit
	const existingReminders = container.querySelectorAll('.reminder-item').length;
	if (existingReminders >= 3) {
		alert('Máximo 3 recordatorios por evento');
		return;
	}
	
	const reminderId = `reminder-${Date.now()}`;
	
	const reminderHtml = `
		<div class="reminder-item" id="${reminderId}">
			<select name="reminder_method[]" class="form-select form-select-sm">
				<option value="inapp">🔔 In-app</option>
				<option value="email">📧 Email</option>
				<option value="whatsapp">📱 WhatsApp</option>
			</select>
			<select name="reminder_offset[]" class="form-select form-select-sm">
				<option value="5m">5 minutos antes</option>
				<option value="15m">15 minutos antes</option>
				<option value="30m">30 minutos antes</option>
				<option value="1h" selected>1 hora antes</option>
				<option value="2h">2 horas antes</option>
				<option value="1d">1 día antes</option>
				<option value="2d">2 días antes</option>
				<option value="1w">1 semana antes</option>
			</select>
			<button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('${reminderId}').remove()">
				🗑️
			</button>
		</div>
	`;
	
	// Insert before the add button
	const addButton = container.querySelector('.btn');
	addButton.insertAdjacentHTML('beforebegin', reminderHtml);
};

/**
 * Submit event form
 */
CalendarManager.prototype.submitEventForm = async function() {
	const form = document.getElementById('event-form');
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	
	try {
		// Collect form data
		const formData = new FormData(form);
		const eventData = {
			title: formData.get('title'),
			type: formData.get('event-type'),
			start_at_local: formData.get('start'),
			end_at_local: formData.get('end'),
			all_day: formData.get('all_day') === 'on',
			location: formData.get('location'),
			description: formData.get('description'),
			visibility: formData.get('visibility'),
			metadata: {},
			reminders: []
		};
		
		// Validate times
		const start = new Date(eventData.start_at_local);
		const end = new Date(eventData.end_at_local);
		
		if (end <= start) {
			alert('La hora de fin debe ser posterior a la hora de inicio');
			return;
		}
		
		// Minimum duration check (15 minutes)
		if (!eventData.all_day && (end - start) < 15 * 60 * 1000) {
			alert('La duración mínima es de 15 minutos');
			return;
		}
		
		// Collect metadata based on event type
		for (const [key, value] of formData.entries()) {
			if (key.startsWith('metadata_')) {
				const metaKey = key.replace('metadata_', '');
				
				// Parse arrays (comma-separated)
				if (metaKey === 'tests' || metaKey === 'scouting_goals') {
					eventData.metadata[metaKey] = value.split(',').map(v => v.trim()).filter(v => v);
				} else {
					eventData.metadata[metaKey] = value;
				}
			}
		}
		
		// Collect reminders
		const methods = formData.getAll('reminder_method[]');
		const offsets = formData.getAll('reminder_offset[]');
		
		for (let i = 0; i < methods.length; i++) {
			eventData.reminders.push({
				method: methods[i],
				offset: offsets[i]
			});
		}
		
		// Create event
		await this.createEvent(eventData);
		
	} catch (error) {
		console.error('Error submitting form:', error);
		this.showError('Error al guardar evento');
	}
};

/**
 * Quick event parser - Natural language input
 * Example: "Vie 17 10:00 prueba con Juan Pérez en Los Céspedes, 90'"
 */
CalendarManager.prototype.parseQuickEvent = function(input) {
	// Simple regex patterns
	const dayPattern = /(?:lun|mar|mié|jue|vie|sáb|dom)\s+(\d{1,2})/i;
	const timePattern = /(\d{1,2}):(\d{2})/;
	const durationPattern = /(\d+)['′]/; // minutes
	const locationPattern = /\s+en\s+(.+?)(?:,|$)/i;
	
	const result = {
		title: input,
		start: new Date(),
		end: new Date(),
		location: null,
		type: 'reminder'
	};
	
	// Extract day
	const dayMatch = input.match(dayPattern);
	if (dayMatch) {
		const day = parseInt(dayMatch[1]);
		result.start.setDate(day);
		result.end.setDate(day);
	}
	
	// Extract time
	const timeMatch = input.match(timePattern);
	if (timeMatch) {
		const hours = parseInt(timeMatch[1]);
		const minutes = parseInt(timeMatch[2]);
		result.start.setHours(hours, minutes, 0, 0);
		result.end.setHours(hours, minutes, 0, 0);
	}
	
	// Extract duration
	const durationMatch = input.match(durationPattern);
	if (durationMatch) {
		const duration = parseInt(durationMatch[1]);
		result.end.setMinutes(result.end.getMinutes() + duration);
	} else {
		// Default 1 hour
		result.end.setHours(result.end.getHours() + 1);
	}
	
	// Extract location
	const locationMatch = input.match(locationPattern);
	if (locationMatch) {
		result.location = locationMatch[1].trim();
	}
	
	// Detect event type from keywords
	const lowerInput = input.toLowerCase();
	if (lowerInput.includes('prueba') || lowerInput.includes('tryout')) {
		result.type = 'tryout';
	} else if (lowerInput.includes('partido') || lowerInput.includes('match')) {
		result.type = 'match';
	} else if (lowerInput.includes('reunión') || lowerInput.includes('meeting')) {
		result.type = 'meeting';
	} else if (lowerInput.includes('viaje') || lowerInput.includes('vuelo')) {
		result.type = 'travel';
	}
	
	// Clean title (remove parsed parts)
	result.title = input
		.replace(dayPattern, '')
		.replace(timePattern, '')
		.replace(durationPattern, '')
		.replace(locationPattern, '')
		.replace(/^\s+|\s+$/g, '')
		.replace(/\s{2,}/g, ' ');
	
	return result;
};

/**
 * Open edit modal for existing event
 */
CalendarManager.prototype.openEditModal = function(eventId) {
	const event = this.events.find(e => e.id === eventId);
	if (!event) return;
	
	// Close details modal
	this.closeModal('event-details-modal');
	
	// Open create modal with event data
	this.openCreateModal();
	
	// Change title
	document.getElementById('event-modal-title').textContent = 'Editar evento';
	
	// Populate form
	document.getElementById('event-title').value = event.title;
	document.querySelector(`input[name="event-type"][value="${event.type}"]`).checked = true;
	renderTypeSpecificFields(event.type);
	
	document.getElementById('event-start').value = this.formatDateTimeLocal(event.start);
	document.getElementById('event-end').value = this.formatDateTimeLocal(event.end);
	document.getElementById('event-all-day').checked = event.allDay;
	document.getElementById('event-location').value = event.location || '';
	document.getElementById('event-description').value = event.description || '';
	document.getElementById('event-visibility').value = event.visibility;
	
	// Populate metadata
	if (event.metadata) {
		for (const [key, value] of Object.entries(event.metadata)) {
			const input = document.querySelector(`[name="metadata_${key}"]`);
			if (input) {
				if (Array.isArray(value)) {
					input.value = value.join(', ');
				} else {
					input.value = value;
				}
			}
		}
	}
	
	// Populate reminders
	event.reminders.forEach(reminder => {
		this.addReminder();
		const lastReminder = document.querySelector('.reminder-item:last-of-type');
		if (lastReminder) {
			lastReminder.querySelector('[name="reminder_method[]"]').value = reminder.method;
			lastReminder.querySelector('[name="reminder_offset[]"]').value = reminder.offset;
		}
	});
	
	// Change submit button to update
	const submitBtn = document.querySelector('#event-form button[type="submit"]');
	if (submitBtn) {
		submitBtn.textContent = 'Actualizar evento';
		submitBtn.onclick = () => this.updateEventFromForm(eventId);
	}
};

/**
 * Update event from form
 */
CalendarManager.prototype.updateEventFromForm = async function(eventId) {
	const form = document.getElementById('event-form');
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}
	
	// Similar to submitEventForm but calls updateEvent instead
	// ... (implementation similar to submitEventForm)
	
	this.showNotification('Implementación completa en próxima iteración', 'info');
};
