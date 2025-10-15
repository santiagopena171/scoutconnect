// ===== JAVASCRIPT PARA LA PÁGINA DE LOGIN =====

document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const loginBtn = document.getElementById('loginBtn');
  const rememberMe = document.getElementById('rememberMe');
  const messageModal = document.getElementById('messageModal');
  const messageIcon = document.getElementById('messageIcon');
  const messageTitle = document.getElementById('messageTitle');
  const messageText = document.getElementById('messageText');
  const messageClose = document.getElementById('messageClose');

  // Funcionalidad de mostrar/ocultar contraseña
  togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Cambiar el icono
    if (type === 'text') {
      togglePassword.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m1 1 22 22"></path>
          <path d="M6.71 6.71C5.68 7.74 5 9.24 5 12c0 4.42 4.48 8 7 8 2.76 0 4.26-.68 5.29-1.71"></path>
          <path d="m14 14.12-.12.07c-.7.43-1.51.65-2.38.65C9.24 14.84 7 12.6 7 10.34c0-.87.22-1.68.65-2.38l.07-.12"></path>
        </svg>
      `;
    } else {
      togglePassword.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  });

  // Validación en tiempo real
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
  emailInput.addEventListener('input', clearError);
  passwordInput.addEventListener('input', clearError);

  // Funciones de validación
  function validateEmail() {
    const email = emailInput.value.trim();
    const emailError = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      showError(emailError, 'El correo electrónico es requerido');
      return false;
    }

    if (!emailRegex.test(email)) {
      showError(emailError, 'Por favor, ingresa un correo electrónico válido');
      return false;
    }

    hideError(emailError);
    return true;
  }

  function validatePassword() {
    const password = passwordInput.value;
    const passwordError = document.getElementById('passwordError');

    if (!password) {
      showError(passwordError, 'La contraseña es requerida');
      return false;
    }

    if (password.length < 6) {
      showError(passwordError, 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    hideError(passwordError);
    return true;
  }

  function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  function hideError(errorElement) {
    errorElement.classList.remove('show');
  }

  function clearError(event) {
    const errorElement = event.target.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
      hideError(errorElement);
    }
  }

  // Manejo del formulario de login
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validar campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Mostrar estado de carga
    setLoadingState(true);

    try {
      // Simular llamada a la API (reemplazar con tu lógica real)
      await simulateLogin();
      
      // Login exitoso
      if (rememberMe.checked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', emailInput.value.trim());
      }

      showMessage('success', '¡Bienvenido!', 'Has iniciado sesión correctamente.');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);

    } catch (error) {
      // Error en el login
      showMessage('error', 'Error de autenticación', error.message || 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
    } finally {
      setLoadingState(false);
    }
  });

  // Función para simular login (reemplazar con tu API real)
  function simulateLogin() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Simulación simple - reemplazar con validación real
        if (email === 'admin@scoutconnect.com' && password === 'admin123') {
          resolve({ success: true, user: { email, name: 'Administrador' } });
        } else if (email.includes('@') && password.length >= 6) {
          resolve({ success: true, user: { email, name: 'Usuario' } });
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 1500); // Simular latencia de red
    });
  }

  // Estados de carga del botón
  function setLoadingState(loading) {
    if (loading) {
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;
    } else {
      loginBtn.classList.remove('loading');
      loginBtn.disabled = false;
    }
  }

  // Mostrar mensajes modales
  function showMessage(type, title, text) {
    messageIcon.className = `message-icon ${type}`;
    messageIcon.innerHTML = type === 'success' ? '✓' : '✕';
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageModal.classList.add('show');
  }

  // Cerrar modal de mensaje
  messageClose.addEventListener('click', function() {
    messageModal.classList.remove('show');
  });

  // Cerrar modal al hacer click fuera
  messageModal.addEventListener('click', function(e) {
    if (e.target === messageModal) {
      messageModal.classList.remove('show');
    }
  });

  // Cargar datos recordados
  if (localStorage.getItem('rememberMe') === 'true') {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      emailInput.value = savedEmail;
      rememberMe.checked = true;
    }
  }

  // Manejo de botones sociales
  const googleBtn = document.querySelector('.google-btn');
  googleBtn.addEventListener('click', function() {
    // Aquí iría la lógica para login con Google
    showMessage('info', 'Próximamente', 'El login con Google estará disponible próximamente.');
  });

  // Manejo de enlaces
  const forgotPasswordLink = document.querySelector('.forgot-password');
  forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    showMessage('info', 'Recuperar contraseña', 'Se enviará un enlace de recuperación a tu correo electrónico.');
  });

  const signupLink = document.querySelector('.signup-btn');
  signupLink.addEventListener('click', function(e) {
    e.preventDefault();
    // Redirigir a la página de registro
    window.location.href = 'registro.html';
  });

  // Efectos visuales adicionales
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });

  // Animación de entrada
  setTimeout(() => {
    document.querySelector('.login-wrapper').style.transform = 'translateY(0)';
    document.querySelector('.login-wrapper').style.opacity = '1';
  }, 100);

  // Aplicar estilos iniciales para la animación
  document.querySelector('.login-wrapper').style.transform = 'translateY(20px)';
  document.querySelector('.login-wrapper').style.opacity = '0';
  document.querySelector('.login-wrapper').style.transition = 'all 0.6s ease';

  // Manejo de teclas
  document.addEventListener('keydown', function(e) {
    // Cerrar modal con Escape
    if (e.key === 'Escape' && messageModal.classList.contains('show')) {
      messageModal.classList.remove('show');
    }
    
    // Submit con Enter
    if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
      loginForm.dispatchEvent(new Event('submit'));
    }
  });

  console.log('🔐 Login page initialized successfully');
});