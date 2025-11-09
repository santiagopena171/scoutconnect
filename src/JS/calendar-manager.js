/**
 * CalendarManager - Sistema completo de calendario para ScoutConnect
 * Maneja eventos, conflictos, notificaciones y múltiples vistas
 */

class CalendarManager {
	constructor() {
		this.supabase = null;
		this.currentUser = null;
		this.currentView = 'month'; // month, week, workweek, day, agenda, timeline
		this.currentDate = new Date();
		this.events = [];
		this.filters = {
			types: [],
			statuses: ['scheduled'],
			participants: [],
			search: ''
		};
		this.selectedEvent = null;
		this.isDragging = false;
		this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		
		// Event type configuration
		this.eventConfig = {
			match: { color: '#3B82F6', icon: '⚽', label: 'Partido' },
			tryout: { color: '#10B981', icon: '🎯', label: 'Prueba' },
			meeting: { color: '#8B5CF6', icon: '👥', label: 'Reunión' },
			travel: { color: '#F59E0B', icon: '✈️', label: 'Viaje' },
			deadline: { color: '#EF4444', icon: '⏰', label: 'Deadline' },
			reminder: { color: '#6B7280', icon: '🔔', label: 'Recordatorio' }
		};
		
		// Keyboard shortcuts
		this.shortcuts = {
			'KeyN': () => this.openCreateModal(),
			'ArrowLeft': () => this.navigatePrevious(),
			'ArrowRight': () => this.navigateNext(),
			'KeyT': () => this.goToToday(),
			'KeyF': () => this.focusSearch(),
			'KeyD': () => this.switchView('day'),
			'KeyW': () => this.switchView('week'),
			'KeyM': () => this.switchView('month'),
			'KeyA': () => this.switchView('agenda')
		};
	}

	/**
	 * Initialize calendar
	 */
	async init() {
		try {
			// Get Supabase client
			this.supabase = await this.getSupabaseClient();
			if (!this.supabase) {
				throw new Error('Supabase client not available');
			}

			// Get current user
			const { data: { session } } = await this.supabase.auth.getSession();
			if (!session) {
				window.location.href = '../login.html';
				return;
			}
			this.currentUser = session.user;

			// Load user profile
			const { data: profile } = await this.supabase
				.from('profiles')
				.select('*, organizations(name)')
				.eq('id', this.currentUser.id)
				.single();
			
			this.userProfile = profile;

			// Setup UI
			this.setupUI();
			this.setupKeyboardShortcuts();
			this.setupRealtimeSubscription();
			
			// Load initial data
			await this.loadEvents();
			this.renderCalendar();

		} catch (error) {
			console.error('Error initializing calendar:', error);
			this.showError('Error al inicializar el calendario');
		}
	}

	/**
	 * Get Supabase client with fallbacks
	 */
	async getSupabaseClient() {
		if (typeof getSupabaseClient === 'function') {
			return await getSupabaseClient();
		} else if (typeof initSupabase === 'function') {
			return await initSupabase();
		} else if (window.supabase) {
			return window.supabase;
		}
		return null;
	}

	/**
	 * Setup UI elements and event listeners
	 */
	setupUI() {
		// View switcher
		document.querySelectorAll('[data-view]').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const view = e.target.dataset.view;
				this.switchView(view);
			});
		});

		// Navigation buttons
		document.getElementById('cal-prev')?.addEventListener('click', () => this.navigatePrevious());
		document.getElementById('cal-next')?.addEventListener('click', () => this.navigateNext());
		document.getElementById('cal-today')?.addEventListener('click', () => this.goToToday());
		document.getElementById('cal-back-to-month')?.addEventListener('click', () => this.switchView('month'));

		// Create event button
		document.getElementById('cal-create-event')?.addEventListener('click', () => this.openCreateModal());

		// Search
		document.getElementById('cal-search')?.addEventListener('input', (e) => {
			this.filters.search = e.target.value;
			this.debounce(() => this.loadEvents(), 300);
		});

		// Filter toggles
		document.querySelectorAll('[data-filter-type]').forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				const type = e.target.dataset.filterType;
				if (e.target.checked) {
					this.filters.types.push(type);
				} else {
					this.filters.types = this.filters.types.filter(t => t !== type);
				}
				this.loadEvents();
			});
		});

		// Timezone selector
		document.getElementById('cal-timezone')?.addEventListener('change', (e) => {
			this.timezone = e.target.value;
			this.renderCalendar();
		});
	}

	/**
	 * Setup keyboard shortcuts
	 */
	setupKeyboardShortcuts() {
		document.addEventListener('keydown', (e) => {
			// Ignore if typing in input/textarea
			if (e.target.matches('input, textarea')) return;
			
			// Check for modifier keys (Ctrl/Cmd)
			if (e.ctrlKey || e.metaKey) {
				const handler = this.shortcuts[e.code];
				if (handler) {
					e.preventDefault();
					handler();
				}
			}
		});
	}

	/**
	 * Setup realtime subscription for live updates
	 */
	setupRealtimeSubscription() {
		// Subscribe to calendar_events changes
		this.supabase
			.channel('calendar_changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'calendar_events'
				},
				(payload) => {
					console.log('Calendar event changed:', payload);
					this.handleRealtimeUpdate(payload);
				}
			)
			.subscribe();
	}

	/**
	 * Handle realtime updates
	 */
	handleRealtimeUpdate(payload) {
		const { eventType, new: newRecord, old: oldRecord } = payload;

		switch (eventType) {
			case 'INSERT':
				this.events.push(this.transformEvent(newRecord));
				this.renderCalendar();
				this.showNotification(`Nuevo evento: ${newRecord.title}`);
				break;

			case 'UPDATE':
				const index = this.events.findIndex(e => e.id === newRecord.id);
				if (index !== -1) {
					this.events[index] = this.transformEvent(newRecord);
					this.renderCalendar();
					
					// Notify if time/location changed
					if (oldRecord.start_at_utc !== newRecord.start_at_utc || 
					    oldRecord.location !== newRecord.location) {
						this.showNotification(`Evento actualizado: ${newRecord.title}`);
					}
				}
				break;

			case 'DELETE':
				this.events = this.events.filter(e => e.id !== oldRecord.id);
				this.renderCalendar();
				this.showNotification(`Evento eliminado: ${oldRecord.title}`);
				break;
		}
	}

	/**
	 * Load events from database
	 */
	async loadEvents() {
		try {
			// Calculate date range based on current view
			const { start, end } = this.getDateRange();

			// Build query - simplified to avoid JOIN errors
			let query = this.supabase
				.from('calendar_events')
				.select('*')
				.gte('start_at_utc', start.toISOString())
				.lte('start_at_utc', end.toISOString())
				.order('start_at_utc', { ascending: true });

			// Apply filters
			if (this.filters.types.length > 0) {
				query = query.in('type', this.filters.types);
			}

			if (this.filters.statuses.length > 0) {
				query = query.in('status', this.filters.statuses);
			}

			if (this.filters.search) {
				query = query.or(`title.ilike.%${this.filters.search}%,location.ilike.%${this.filters.search}%`);
			}

			const { data, error } = await query;

			if (error) throw error;

			this.events = data.map(event => this.transformEvent(event));
			this.renderCalendar();

		} catch (error) {
			console.error('Error loading events:', error);
			this.showError('Error al cargar eventos');
		}
	}

	/**
	 * Transform database event to internal format
	 */
	transformEvent(dbEvent) {
		return {
			id: dbEvent.id,
			title: dbEvent.title,
			type: dbEvent.type,
			status: dbEvent.status,
			start: new Date(dbEvent.start_at_utc),
			end: new Date(dbEvent.end_at_utc),
			allDay: dbEvent.all_day,
			location: dbEvent.location,
			locationUrl: dbEvent.location_url,
			description: dbEvent.description,
			notes: dbEvent.notes,
			metadata: dbEvent.metadata || {},
			visibility: dbEvent.visibility,
			reminders: dbEvent.reminders || [],
			attachments: dbEvent.attachments || [],
			createdBy: dbEvent.created_by,
			color: this.eventConfig[dbEvent.type]?.color || '#6B7280',
			icon: this.eventConfig[dbEvent.type]?.icon || '📅'
		};
	}

	/**
	 * Get date range for current view
	 */
	getDateRange() {
		const start = new Date(this.currentDate);
		const end = new Date(this.currentDate);

		switch (this.currentView) {
			case 'day':
				start.setHours(0, 0, 0, 0);
				end.setHours(23, 59, 59, 999);
				break;

			case 'week':
			case 'workweek':
				const dayOfWeek = start.getDay();
				start.setDate(start.getDate() - dayOfWeek);
				start.setHours(0, 0, 0, 0);
				end.setDate(start.getDate() + 6);
				end.setHours(23, 59, 59, 999);
				break;

			case 'month':
				start.setDate(1);
				start.setHours(0, 0, 0, 0);
				end.setMonth(end.getMonth() + 1, 0);
				end.setHours(23, 59, 59, 999);
				// Include previous/next month days visible in calendar
				const firstDayOfWeek = start.getDay();
				start.setDate(start.getDate() - firstDayOfWeek);
				break;

			case 'agenda':
				start.setHours(0, 0, 0, 0);
				end.setDate(end.getDate() + 30); // Next 30 days
				end.setHours(23, 59, 59, 999);
				break;

			case 'timeline':
				start.setDate(start.getDate() - 7);
				start.setHours(0, 0, 0, 0);
				end.setDate(end.getDate() + 14);
				end.setHours(23, 59, 59, 999);
				break;
		}

		return { start, end };
	}

	/**
	 * Switch calendar view
	 */
	switchView(view) {
		this.currentView = view;
		
		// Update active button
		document.querySelectorAll('[data-view]').forEach(btn => {
			btn.classList.toggle('active', btn.dataset.view === view);
		});

		// Show/hide back to month button
		const backBtn = document.getElementById('cal-back-to-month');
		if (backBtn) {
			backBtn.style.display = view !== 'month' ? 'inline-block' : 'none';
		}

		this.renderCalendar();
		this.loadEvents();
	}

	/**
	 * Navigate to previous period
	 */
	navigatePrevious() {
		switch (this.currentView) {
			case 'day':
				this.currentDate.setDate(this.currentDate.getDate() - 1);
				break;
			case 'week':
			case 'workweek':
				this.currentDate.setDate(this.currentDate.getDate() - 7);
				break;
			case 'month':
				this.currentDate.setMonth(this.currentDate.getMonth() - 1);
				break;
		}
		this.loadEvents();
	}

	/**
	 * Navigate to next period
	 */
	navigateNext() {
		switch (this.currentView) {
			case 'day':
				this.currentDate.setDate(this.currentDate.getDate() + 1);
				break;
			case 'week':
			case 'workweek':
				this.currentDate.setDate(this.currentDate.getDate() + 7);
				break;
			case 'month':
				this.currentDate.setMonth(this.currentDate.getMonth() + 1);
				break;
		}
		this.loadEvents();
	}

	/**
	 * Go to today
	 */
	goToToday() {
		this.currentDate = new Date();
		this.loadEvents();
	}

	/**
	 * Focus search input
	 */
	focusSearch() {
		document.getElementById('cal-search')?.focus();
	}

	/**
	 * Render calendar based on current view
	 */
	renderCalendar() {
		const container = document.getElementById('calendar-container');
		if (!container) return;

		// Update date title
		this.updateDateTitle();

		// Render appropriate view
		switch (this.currentView) {
			case 'month':
				this.renderMonthView(container);
				break;
			case 'week':
				this.renderWeekView(container, false);
				break;
			case 'workweek':
				this.renderWeekView(container, true);
				break;
			case 'day':
				this.renderDayView(container);
				break;
			case 'agenda':
				this.renderAgendaView(container);
				break;
			case 'timeline':
				this.renderTimelineView(container);
				break;
		}
	}

	/**
	 * Update date title in header
	 */
	updateDateTitle() {
		const titleElement = document.getElementById('cal-date-title');
		if (!titleElement) return;

		let title = '';
		switch (this.currentView) {
			case 'day':
				title = this.formatDate(this.currentDate, { dateStyle: 'full' });
				break;
			case 'week':
			case 'workweek':
				const { start, end } = this.getDateRange();
				title = `${this.formatDate(start, { month: 'short', day: 'numeric' })} - ${this.formatDate(end, { month: 'short', day: 'numeric', year: 'numeric' })}`;
				break;
			case 'month':
				title = this.formatDate(this.currentDate, { month: 'long', year: 'numeric' });
				break;
			case 'agenda':
				title = 'Agenda';
				break;
			case 'timeline':
				title = 'Timeline';
				break;
		}

		titleElement.textContent = title;
	}

	/**
	 * Format date with timezone
	 */
	formatDate(date, options = {}) {
		return new Intl.DateTimeFormat('es-UY', {
			timeZone: this.timezone,
			...options
		}).format(date);
	}

	/**
	 * Format time
	 */
	formatTime(date) {
		return new Intl.DateTimeFormat('es-UY', {
			timeZone: this.timezone,
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	// ... (Continuará en siguiente archivo: calendar-views.js)

	/**
	 * Show notification
	 */
	showNotification(message, type = 'info') {
		// Use browser notification if permitted
		if ('Notification' in window && Notification.permission === 'granted') {
			new Notification('ScoutConnect Calendar', { body: message });
		}

		// Also show in-app notification
		const notification = document.createElement('div');
		notification.className = `calendar-notification ${type}`;
		notification.textContent = message;
		document.body.appendChild(notification);

		setTimeout(() => notification.remove(), 5000);
	}

	/**
	 * Show error message
	 */
	showError(message) {
		this.showNotification(message, 'error');
	}

	/**
	 * Debounce helper
	 */
	debounce(func, wait) {
		clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(func, wait);
	}
}

// Export for use in calendar.html
// No auto-initialize here - will be done in calendar.html
