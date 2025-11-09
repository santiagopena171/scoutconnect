/**
 * Calendar Views - Renderizado de diferentes vistas del calendario
 * Extensión de CalendarManager con métodos de renderizado
 */

/**
 * Render Month View
 */
CalendarManager.prototype.renderMonthView = function(container) {
	const { start } = this.getDateRange();
	const monthStart = new Date(this.currentDate);
	monthStart.setDate(1);
	
	let html = '<div class="calendar-month-view">';
	
	// Header with day names
	html += '<div class="calendar-month-header">';
	['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(day => {
		html += `<div class="calendar-day-name">${day}</div>`;
	});
	html += '</div>';
	
	// Days grid
	html += '<div class="calendar-month-grid">';
	
	const currentDay = new Date(start);
	for (let i = 0; i < 42; i++) { // 6 weeks
		const isToday = this.isSameDay(currentDay, new Date());
		const isCurrentMonth = currentDay.getMonth() === this.currentDate.getMonth();
		const dayEvents = this.getEventsForDay(currentDay);
		
		html += `
			<div class="calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}"
			     data-date="${currentDay.toISOString()}"
			     onclick="calendarManager.handleDayClick(this)">
				<div class="calendar-day-number">${currentDay.getDate()}</div>
				<div class="calendar-day-events">
		`;
		
		// Show up to 3 events
		dayEvents.slice(0, 3).forEach(event => {
			html += this.renderEventChip(event);
		});
		
		// More indicator
		if (dayEvents.length > 3) {
			html += `<div class="calendar-more-events">+${dayEvents.length - 3} más</div>`;
		}
		
		html += `
				</div>
			</div>
		`;
		
		currentDay.setDate(currentDay.getDate() + 1);
	}
	
	html += '</div></div>';
	
	container.innerHTML = html;
	this.attachEventListeners();
};

/**
 * Render Week View (work week or full week)
 */
CalendarManager.prototype.renderWeekView = function(container, workWeekOnly = false) {
	const { start } = this.getDateRange();
	const hours = Array.from({ length: 24 }, (_, i) => i);
	const days = workWeekOnly ? 5 : 7;
	
	let html = '<div class="calendar-week-view">';
	
	// Time column + day columns
	html += '<div class="calendar-week-grid">';
	
	// Header with dates
	html += '<div class="calendar-week-header">';
	html += '<div class="calendar-time-header">Hora</div>';
	
	const currentDay = new Date(start);
	if (workWeekOnly) currentDay.setDate(currentDay.getDate() + 1); // Skip Sunday
	
	for (let d = 0; d < days; d++) {
		const isToday = this.isSameDay(currentDay, new Date());
		html += `
			<div class="calendar-day-header ${isToday ? 'today' : ''}">
				<div class="calendar-day-name">${this.formatDate(currentDay, { weekday: 'short' })}</div>
				<div class="calendar-day-date">${currentDay.getDate()}</div>
			</div>
		`;
		currentDay.setDate(currentDay.getDate() + 1);
	}
	html += '</div>';
	
	// Time slots
	html += '<div class="calendar-week-body">';
	
	hours.forEach(hour => {
		html += '<div class="calendar-week-row">';
		
		// Time label
		html += `<div class="calendar-time-label">${hour.toString().padStart(2, '0')}:00</div>`;
		
		// Day slots
		currentDay.setTime(start.getTime());
		if (workWeekOnly) currentDay.setDate(currentDay.getDate() + 1);
		
		for (let d = 0; d < days; d++) {
			const slotStart = new Date(currentDay);
			slotStart.setHours(hour, 0, 0, 0);
			const slotEnd = new Date(slotStart);
			slotEnd.setHours(hour + 1);
			
			html += `
				<div class="calendar-time-slot"
				     data-date="${slotStart.toISOString()}"
				     onclick="calendarManager.handleSlotClick(this)"
				     ondragover="event.preventDefault()"
				     ondrop="calendarManager.handleDrop(event, this)">
			`;
			
			// Render events that start in this slot
			const slotEvents = this.getEventsInSlot(slotStart, slotEnd);
			slotEvents.forEach(event => {
				html += this.renderEventBlock(event, slotStart);
			});
			
			html += '</div>';
			currentDay.setDate(currentDay.getDate() + 1);
		}
		
		html += '</div>';
	});
	
	html += '</div></div></div>';
	
	container.innerHTML = html;
	this.attachEventListeners();
};

/**
 * Render Day View
 */
CalendarManager.prototype.renderDayView = function(container) {
	const hours = Array.from({ length: 24 }, (_, i) => i);
	const dayStart = new Date(this.currentDate);
	dayStart.setHours(0, 0, 0, 0);
	
	let html = '<div class="calendar-day-view">';
	
	hours.forEach(hour => {
		const slotStart = new Date(dayStart);
		slotStart.setHours(hour, 0, 0, 0);
		const slotEnd = new Date(slotStart);
		slotEnd.setHours(hour + 1);
		
		html += `
			<div class="calendar-day-slot">
				<div class="calendar-time-label">${hour.toString().padStart(2, '0')}:00</div>
				<div class="calendar-slot-content"
				     data-date="${slotStart.toISOString()}"
				     onclick="calendarManager.handleSlotClick(this)">
		`;
		
		const slotEvents = this.getEventsInSlot(slotStart, slotEnd);
		slotEvents.forEach(event => {
			html += this.renderEventBlock(event, slotStart);
		});
		
		html += '</div></div>';
	});
	
	html += '</div>';
	
	container.innerHTML = html;
	this.attachEventListeners();
};

/**
 * Render Agenda/List View
 */
CalendarManager.prototype.renderAgendaView = function(container) {
	let html = '<div class="calendar-agenda-view">';
	
	// Group events by date
	const eventsByDate = {};
	this.events.forEach(event => {
		const dateKey = this.formatDate(event.start, { dateStyle: 'full' });
		if (!eventsByDate[dateKey]) {
			eventsByDate[dateKey] = [];
		}
		eventsByDate[dateKey].push(event);
	});
	
	// Render grouped events
	Object.entries(eventsByDate).forEach(([dateStr, events]) => {
		html += `
			<div class="calendar-agenda-date">
				<h3 class="calendar-agenda-date-title">${dateStr}</h3>
				<div class="calendar-agenda-events">
		`;
		
		events.forEach(event => {
			html += `
				<div class="calendar-agenda-event" 
				     style="border-left: 4px solid ${event.color}"
				     onclick="calendarManager.openEventDetails('${event.id}')">
					<div class="calendar-agenda-event-time">
						${event.allDay ? 'Todo el día' : `${this.formatTime(event.start)} - ${this.formatTime(event.end)}`}
					</div>
					<div class="calendar-agenda-event-content">
						<div class="calendar-agenda-event-header">
							<span class="calendar-event-icon">${event.icon}</span>
							<span class="calendar-event-title">${this.escapeHtml(event.title)}</span>
							<span class="calendar-event-badge calendar-event-badge-${event.status}">${event.status}</span>
						</div>
						${event.location ? `<div class="calendar-event-location">📍 ${this.escapeHtml(event.location)}</div>` : ''}
						${event.participants.length > 0 ? `
							<div class="calendar-event-participants">
								${event.participants.slice(0, 3).map(p => `
									<img src="${p.profile?.avatar_url || '/imagenes/default-avatar.png'}" 
									     class="calendar-participant-avatar" 
									     title="${p.profile?.full_name || 'Usuario'}">
								`).join('')}
								${event.participants.length > 3 ? `<span class="calendar-more-participants">+${event.participants.length - 3}</span>` : ''}
							</div>
						` : ''}
					</div>
				</div>
			`;
		});
		
		html += '</div></div>';
	});
	
	// Empty state
	if (Object.keys(eventsByDate).length === 0) {
		html += `
			<div class="calendar-empty-state">
				<div class="calendar-empty-icon">📅</div>
				<p>No tenés eventos programados</p>
				<button class="btn btn-primary" onclick="calendarManager.openCreateModal()">
					Crear evento
				</button>
			</div>
		`;
	}
	
	html += '</div>';
	
	container.innerHTML = html;
};

/**
 * Render Timeline View (by team/scout)
 */
CalendarManager.prototype.renderTimelineView = function(container) {
	// Group events by participant
	const eventsByUser = {};
	
	this.events.forEach(event => {
		// Add to creator
		if (!eventsByUser[event.createdBy.id]) {
			eventsByUser[event.createdBy.id] = {
				user: event.createdBy,
				events: []
			};
		}
		eventsByUser[event.createdBy.id].events.push(event);
		
		// Add to participants
		event.participants.forEach(participant => {
			if (participant.entity_type === 'scout' && participant.profile) {
				if (!eventsByUser[participant.entity_id]) {
					eventsByUser[participant.entity_id] = {
						user: participant.profile,
						events: []
					};
				}
				if (!eventsByUser[participant.entity_id].events.find(e => e.id === event.id)) {
					eventsByUser[participant.entity_id].events.push(event);
				}
			}
		});
	});
	
	let html = '<div class="calendar-timeline-view">';
	
	// Render each user's timeline
	Object.values(eventsByUser).forEach(({ user, events }) => {
		html += `
			<div class="calendar-timeline-row">
				<div class="calendar-timeline-user">
					<img src="${user.avatar_url || '/imagenes/default-avatar.png'}" 
					     class="calendar-timeline-avatar" 
					     alt="${user.full_name}">
					<span class="calendar-timeline-name">${this.escapeHtml(user.full_name)}</span>
					<span class="calendar-timeline-count">${events.length} eventos</span>
				</div>
				<div class="calendar-timeline-events">
		`;
		
		events.sort((a, b) => a.start - b.start).forEach(event => {
			const duration = (event.end - event.start) / (1000 * 60); // minutes
			const width = Math.max(100, duration / 2); // min 100px
			
			html += `
				<div class="calendar-timeline-event" 
				     style="background: ${event.color}; width: ${width}px;"
				     onclick="calendarManager.openEventDetails('${event.id}')"
				     title="${event.title} - ${this.formatTime(event.start)}">
					<span class="calendar-timeline-event-icon">${event.icon}</span>
					<span class="calendar-timeline-event-title">${this.escapeHtml(event.title)}</span>
					<span class="calendar-timeline-event-time">${this.formatTime(event.start)}</span>
				</div>
			`;
		});
		
		html += '</div></div>';
	});
	
	html += '</div>';
	
	container.innerHTML = html;
};

/**
 * Render event chip (small, for month view)
 */
CalendarManager.prototype.renderEventChip = function(event) {
	return `
		<div class="calendar-event-chip" 
		     style="background: ${event.color}"
		     onclick="event.stopPropagation(); calendarManager.openEventDetails('${event.id}')"
		     title="${event.title}">
			<span class="calendar-event-icon">${event.icon}</span>
			<span class="calendar-event-title">${this.escapeHtml(event.title)}</span>
		</div>
	`;
};

/**
 * Render event block (for week/day views)
 */
CalendarManager.prototype.renderEventBlock = function(event, slotStart) {
	const duration = (event.end - event.start) / (1000 * 60); // minutes
	const height = duration; // 1px per minute
	
	return `
		<div class="calendar-event-block" 
		     style="background: ${event.color}; height: ${height}px; opacity: ${event.status === 'canceled' ? 0.5 : 1}"
		     draggable="true"
		     ondragstart="calendarManager.handleDragStart(event, '${event.id}')"
		     onclick="calendarManager.openEventDetails('${event.id}')">
			<div class="calendar-event-header">
				<span class="calendar-event-icon">${event.icon}</span>
				<span class="calendar-event-title">${this.escapeHtml(event.title)}</span>
			</div>
			<div class="calendar-event-time">
				${this.formatTime(event.start)} - ${this.formatTime(event.end)}
			</div>
			${event.location ? `<div class="calendar-event-location">📍 ${this.escapeHtml(event.location)}</div>` : ''}
			<div class="calendar-event-resize-handle" 
			     onmousedown="event.stopPropagation(); calendarManager.handleResizeStart(event, '${event.id}')"></div>
		</div>
	`;
};

/**
 * Helper: Get events for a specific day
 */
CalendarManager.prototype.getEventsForDay = function(date) {
	const dayStart = new Date(date);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(date);
	dayEnd.setHours(23, 59, 59, 999);
	
	return this.events.filter(event => {
		return (event.start >= dayStart && event.start <= dayEnd) ||
		       (event.end >= dayStart && event.end <= dayEnd) ||
		       (event.start < dayStart && event.end > dayEnd);
	});
};

/**
 * Helper: Get events in a time slot
 */
CalendarManager.prototype.getEventsInSlot = function(slotStart, slotEnd) {
	return this.events.filter(event => {
		return event.start >= slotStart && event.start < slotEnd;
	});
};

/**
 * Helper: Check if two dates are the same day
 */
CalendarManager.prototype.isSameDay = function(date1, date2) {
	return date1.getFullYear() === date2.getFullYear() &&
	       date1.getMonth() === date2.getMonth() &&
	       date1.getDate() === date2.getDate();
};

/**
 * Helper: Escape HTML
 */
CalendarManager.prototype.escapeHtml = function(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
};

/**
 * Helper: Attach event listeners to rendered elements
 */
CalendarManager.prototype.attachEventListeners = function() {
	// Add listeners for drag & drop, resize, etc.
	// (Will be implemented in calendar-interactions.js)
};
