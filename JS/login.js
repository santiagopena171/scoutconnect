// ===== JAVASCRIPT PARA LA PÁGINA DE LOGIN =====

document.addEventListener('DOMContentLoaded', function() {
  // Verificar sesión activa al cargar la página
  checkActiveSession();

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

  // Función para verificar sesión activa
  function checkActiveSession() {
    const sessionToken = localStorage.getItem('scoutConnectToken');
    const sessionUser = localStorage.getItem('scoutConnectUser');
    const sessionExpiry = localStorage.getItem('scoutConnectExpiry');

    if (sessionToken && sessionUser && sessionExpiry) {
      const now = new Date().getTime();
      const expiryTime = parseInt(sessionExpiry);

      if (now < expiryTime) {
        // Sesión válida - redirigir al dashboard
        const userData = JSON.parse(sessionUser);
        redirectToDashboard(userData.userType || 'jugador');
        return true;
      } else {
        // Sesión expirada - limpiar datos
        clearSession();
      }
    }
    return false;
  }

  // Función para limpiar sesión
  function clearSession() {
    localStorage.removeItem('scoutConnectToken');
    localStorage.removeItem('scoutConnectUser');
    localStorage.removeItem('scoutConnectExpiry');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
  }

  // Función para redirigir al dashboard según tipo de usuario
  function redirectToDashboard(userType) {
    console.log('🎯 Redirigiendo usuario tipo:', userType);
    
    showMessage('info', 'Sesión activa detectada', 'Redirigiendo a tu dashboard...');
    
    setTimeout(() => {
      let redirectUrl;
      
      switch(userType) {
        case 'jugador':
        case 'futbolista':
          redirectUrl = 'dashboard-futbolista.html';
          break;
        case 'scout':
        case 'ojeador':
          // Cuando esté listo: redirectUrl = 'dashboard-scout.html';
          redirectUrl = 'dashboard-futbolista.html'; // Temporal
          break;
        case 'club':
        case 'academia':
          // Cuando esté listo: redirectUrl = 'dashboard-club.html';
          redirectUrl = 'dashboard-futbolista.html'; // Temporal
          break;
        default:
          redirectUrl = 'dashboard-futbolista.html';
      }
      
      console.log('🚀 Redirigiendo a:', redirectUrl);
      window.location.href = redirectUrl;
    }, 1500);
  }

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

    console.log('🔄 Iniciando proceso de login...');

    // Validar campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      console.log('❌ Validación de campos fallida');
      return;
    }

    // Mostrar estado de carga
    setLoadingState(true);

    try {
      // Simular llamada a la API (reemplazar con tu lógica real)
      console.log('📡 Enviando credenciales...');
      const simulationResult = await simulateLogin();
      console.log('✅ Login exitoso:', simulationResult);
      
      // Login exitoso
      const userData = {
        email: emailInput.value.trim(),
        userType: simulationResult.user.userType || 'jugador',
        name: simulationResult.user.name || 'Usuario',
        loginTime: new Date().toISOString()
      };

      // Guardar sesión
      const sessionToken = generateSessionToken();
      const expiryTime = new Date().getTime() + (rememberMe.checked ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000); // 30 días o 1 día
      
      localStorage.setItem('scoutConnectToken', sessionToken);
      localStorage.setItem('scoutConnectUser', JSON.stringify(userData));
      localStorage.setItem('scoutConnectExpiry', expiryTime.toString());

      console.log('💾 Sesión guardada:', {
        token: sessionToken,
        user: userData,
        expiry: new Date(expiryTime).toLocaleString()
      });

      if (rememberMe.checked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', emailInput.value.trim());
        console.log('✅ Datos de "recordarme" guardados');
      }

      showMessage('success', '¡Bienvenido!', 'Has iniciado sesión correctamente.');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        console.log('🚀 Redirigiendo al dashboard...');
        redirectToDashboard(userData.userType);
      }, 2000);

    } catch (error) {
      // Error en el login
      console.error('❌ Error en login:', error);
      showMessage('error', 'Error de autenticación', error.message || 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
    } finally {
      setLoadingState(false);
    }
  });

  // Función para simular login (reemplazar con tu API real)
  function simulateLogin() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const email = emailInput.value.trim();
          const password = passwordInput.value;

          console.log('🔍 Validando credenciales para:', email);

          // Simulación simple - reemplazar con validación real
          if (email === 'admin@scoutconnect.com' && password === 'admin123') {
            const result = { 
              success: true, 
              user: { 
                email, 
                name: 'Administrador',
                userType: 'admin'
              } 
            };
            console.log('✅ Admin login exitoso');
            resolve(result);
          } else if (email === 'scout@scoutconnect.com' && password === 'scout123') {
            const result = { 
              success: true, 
              user: { 
                email, 
                name: 'Carlos Mendoza',
                userType: 'scout'
              } 
            };
            console.log('✅ Scout login exitoso');
            resolve(result);
          } else if (email === 'club@scoutconnect.com' && password === 'club123') {
            const result = { 
              success: true, 
              user: { 
                email, 
                name: 'Boca Juniors',
                userType: 'club'
              } 
            };
            console.log('✅ Club login exitoso');
            resolve(result);
          } else if (email.includes('@') && password.length >= 6) {
            const result = { 
              success: true, 
              user: { 
                email, 
                name: 'Juan Pérez',
                userType: 'jugador'
              } 
            };
            console.log('✅ Jugador login exitoso');
            resolve(result);
          } else {
            console.log('❌ Credenciales incorrectas');
            reject(new Error('Credenciales incorrectas'));
          }
        } catch (error) {
          console.error('❌ Error en simulateLogin:', error);
          reject(error);
        }
      }, 1500); // Simular latencia de red
    });
  }

  // Función para generar token de sesión
  function generateSessionToken() {
    return 'scToken_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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