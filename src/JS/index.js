// Renderiza dinámicamente el navbar y el footer en los placeholders
document.addEventListener('DOMContentLoaded', async () => {
	// Verificar sesión de Supabase y mostrar enlace apropiado
	await renderNavbarWithSession();

	// Función para renderizar navbar con estado de sesión de Supabase
	async function renderNavbarWithSession() {
		const loginLink = await getSessionBasedLoginLink();
		
		const navbar = document.getElementById('main-navbar-placeholder');
		if (navbar) {
			navbar.outerHTML = `
			<nav class="main-navbar">
				<div class="navbar-container">
					<ul class="navbar-menu">
						<li><a href="index.html">Inicio</a></li>
						<li><a href="como-funciona.html">Cómo funciona</a></li>
						<li><a href="#seguridad">Seguridad</a></li>
						<li><a href="#requisitos">Requisitos</a></li>
						<li><a href="#faq">Preguntas frecuentes</a></li>
						${loginLink}
					</ul>
				</div>
			</nav>
			`;
		}
	}

	// Función para obtener el enlace apropiado según el estado de sesión de Supabase
	async function getSessionBasedLoginLink() {
		try {
			// Intentar obtener cliente de Supabase
			let supabaseClient = null;
			
			if (typeof getSupabaseClient === 'function') {
				supabaseClient = await getSupabaseClient();
			} else if (typeof initSupabase === 'function') {
				supabaseClient = await initSupabase();
			} else if (window.supabase) {
				supabaseClient = window.supabase;
			}

			if (!supabaseClient) {
				console.warn('Supabase client not available in index.js');
				return '<li><a href="login.html">Iniciar sesión</a></li>';
			}

			// Obtener sesión actual de Supabase
			const { data: { session }, error } = await supabaseClient.auth.getSession();
			
			if (error) {
				console.error('Error getting session:', error);
				return '<li><a href="login.html">Iniciar sesión</a></li>';
			}

			if (session && session.user) {
				// Sesión válida - obtener datos del perfil para determinar dashboard
				const { data: profile } = await supabaseClient
					.from('profiles')
					.select('user_type')
					.eq('id', session.user.id)
					.single();

				const userType = profile?.user_type || 'jugador';
				const dashboardUrl = getDashboardUrl(userType);
				return `<li><a href="${dashboardUrl}">Mi Dashboard</a></li>`;
			}
			
			// No hay sesión válida
			return '<li><a href="login.html">Iniciar sesión</a></li>';
			
		} catch (error) {
			console.error('Error checking session:', error);
			return '<li><a href="login.html">Iniciar sesión</a></li>';
		}
	}

	// Función para obtener URL del dashboard según tipo de usuario
	function getDashboardUrl(userType) {
		switch(userType) {
			case 'jugador':
			case 'futbolista':
				return 'public/dashboard-futbolista.html';
			case 'scout':
			case 'ojeador':
				return 'public/dashboard-scout.html';
			case 'club':
			case 'academia':
				return 'public/dashboard-futbolista.html'; // Temporal
			default:
				return 'public/dashboard-futbolista.html';
		}
	}

	// Footer
	const footer = document.getElementById('footer-placeholder');
	if (footer) {
		footer.outerHTML = `
		<footer class="footer dark-bg">
			<div class="container footer-content">
				<img src="imagenes/logo.png" alt="Logo ScoutConnect" class="footer-logo">
				<nav class="footer-nav">
					<a href="#">Términos y condiciones</a>
					<a href="#">Políticas de privacidad</a>
					<a href="#">Contacto</a>
					<a href="https://instagram.com" target="_blank">Instagram</a>
					<a href="https://tiktok.com" target="_blank">TikTok</a>
					<a href="https://youtube.com" target="_blank">YouTube</a>
				</nav>
				<p class="legal">&copy; 2025 ScoutConnect. Todos los derechos reservados.</p>
			</div>
		</footer>
		`;
	}

	// Smooth scroll para .goto-section (si existiera)
	document.querySelectorAll('.goto-section').forEach(btn => {
		btn.addEventListener('click', e => {
			e.preventDefault();
			const target = document.querySelector(btn.getAttribute('href'));
			if (target) target.scrollIntoView({ behavior: 'smooth' });
		});
	});
});
