// Renderiza dinámicamente el navbar y el footer en los placeholders
document.addEventListener('DOMContentLoaded', () => {
	// Navbar
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
					<li><a href="#contacto">Contacto</a></li>
				</ul>
			</div>
		</nav>
		`;
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
