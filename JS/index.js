// Renderiza dinámicamente el navbar y el footer en los placeholders
document.addEventListener('DOMContentLoaded', () => {
	// Verificar sesión activa y mostrar enlace apropiado
	checkSessionForNavbar();

	// Navbar
	const navbar = document.getElementById('main-navbar-placeholder');
	if (navbar) {
		const loginLink = getSessionBasedLoginLink();
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

	// Función para verificar sesión y determinar enlace de login/dashboard
	function checkSessionForNavbar() {
		const sessionToken = localStorage.getItem('scoutConnectToken');
		const sessionExpiry = localStorage.getItem('scoutConnectExpiry');
		
		if (sessionToken && sessionExpiry) {
			const now = new Date().getTime();
			const expiryTime = parseInt(sessionExpiry);
			
			if (now >= expiryTime) {
				// Sesión expirada - limpiar
				localStorage.removeItem('scoutConnectToken');
				localStorage.removeItem('scoutConnectUser');
				localStorage.removeItem('scoutConnectExpiry');
			}
		}
	}

	// Función para obtener el enlace apropiado según el estado de sesión
	function getSessionBasedLoginLink() {
		const sessionToken = localStorage.getItem('scoutConnectToken');
		const sessionUser = localStorage.getItem('scoutConnectUser');
		const sessionExpiry = localStorage.getItem('scoutConnectExpiry');
		
		if (sessionToken && sessionUser && sessionExpiry) {
			const now = new Date().getTime();
			const expiryTime = parseInt(sessionExpiry);
			
			if (now < expiryTime) {
				// Sesión válida - mostrar enlace al dashboard
				try {
					const userData = JSON.parse(sessionUser);
					const dashboardUrl = getDashboardUrl(userData.userType || 'jugador');
					return `<li><a href="${dashboardUrl}">Mi Dashboard</a></li>`;
				} catch (error) {
					return '<li><a href="login.html">Iniciar sesión</a></li>';
				}
			}
		}
		
		// No hay sesión válida - mostrar enlace de login
		return '<li><a href="login.html">Iniciar sesión</a></li>';
	}

	// Función para obtener URL del dashboard según tipo de usuario
	function getDashboardUrl(userType) {
		switch(userType) {
			case 'jugador':
			case 'futbolista':
				return 'dashboard-futbolista.html';
			case 'scout':
			case 'ojeador':
				return 'dashboard-futbolista.html'; // Temporal
			case 'club':
			case 'academia':
				return 'dashboard-futbolista.html'; // Temporal
			default:
				return 'dashboard-futbolista.html';
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
