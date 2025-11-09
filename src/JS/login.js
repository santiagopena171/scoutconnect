// =============================================
// LOGIN - Simplificado (Solo Supabase)
// =============================================

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

  // Cargar email guardado si existe
  const savedEmail = localStorage.getItem('userEmail');
  const rememberedUser = localStorage.getItem('rememberMe');
  if (savedEmail && rememberedUser === 'true') {
    emailInput.value = savedEmail;
    rememberMe.checked = true;
  }

  // Función para verificar sesión activa
  async function checkActiveSession() {
    try {
      // Verificar sesión en Supabase (única fuente de verdad)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ Sesión activa detectada');
        
        // Obtener perfil del usuario
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile && !error) {
          console.log('✅ Perfil encontrado, redirigiendo...');
          redirectToDashboard(profile.user_type);
          return true;
        }
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
    }
    
    return false;
  }

  // Función para redirigir al dashboard según tipo de usuario
  function redirectToDashboard(userType) {
    console.log(`🔄 Redirigiendo a dashboard de ${userType}`);
    showMessage('info', 'Iniciando sesión...', 'Redirigiendo a tu dashboard...');
    
    setTimeout(() => {
      let redirectUrl;
      
      switch(userType) {
        case 'jugador':
        case 'futbolista':
          redirectUrl = 'dashboard-futbolista.html';
          break;
        case 'scout':
        case 'ojeador':
          redirectUrl = 'dashboard-scout.html';
          break;
        default:
          redirectUrl = 'dashboard-futbolista.html';
      }
      
      window.location.href = redirectUrl;
    }, 1000);
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

    // Validar campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Mostrar estado de carga
    setLoadingState(true);

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const selectedUserType = document.querySelector('input[name="userType"]:checked').value;

      console.log('🔐 Intentando login...');

      // Login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      console.log('✅ Login exitoso en Supabase');

      // Obtener perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('No se pudo cargar el perfil del usuario. Por favor, contacta al administrador.');
      }

      console.log('✅ Perfil cargado:', profile.user_type);

      // Verificar que el tipo de usuario seleccionado coincida con el registrado
      if (selectedUserType !== profile.user_type) {
        // Cerrar la sesión ya que no coincide el tipo
        await supabase.auth.signOut();
        
        const tipoSeleccionado = selectedUserType === 'scout' ? 'Scout' : 'Futbolista';
        const tipoReal = profile.user_type === 'scout' ? 'Scout' : 'Futbolista';
        
        throw new Error(`Esta cuenta está registrada como ${tipoReal}. Por favor, selecciona "${tipoReal}" para iniciar sesión.`);
      }

      // Guardar preferencias de "Recordarme" (solo email, no sesión)
      if (rememberMe.checked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
      }

      // Mostrar mensaje de éxito
      showMessage('success', '¡Bienvenido!', `Iniciando sesión como ${profile.full_name || email}`);
      
      // Redirigir al dashboard
      setTimeout(() => {
        redirectToDashboard(profile.user_type);
      }, 1500);

    } catch (error) {
      console.error('❌ Error en login:', error);
      setLoadingState(false);
      
      let errorMessage = 'Ha ocurrido un error al iniciar sesión';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirma tu email antes de iniciar sesión.';
      } else if (error.message.includes('registrada como')) {
        errorMessage = error.message;
      }
      
      showMessage('error', 'Error de autenticación', errorMessage);
    }
  });

  // Función para establecer estado de carga
  function setLoadingState(isLoading) {
    if (isLoading) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span class="spinner"></span> Iniciando sesión...';
    } else {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Iniciar Sesión';
    }
  }

  // Función para mostrar mensajes
  function showMessage(type, title, message) {
    messageTitle.textContent = title;
    messageText.textContent = message;
    
    // Cambiar icono y colores según el tipo
    messageIcon.className = 'message-icon';
    if (type === 'success') {
      messageIcon.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
      messageIcon.classList.add('success');
    } else if (type === 'error') {
      messageIcon.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
      messageIcon.classList.add('error');
    } else {
      messageIcon.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
      messageIcon.classList.add('info');
    }
    
    messageModal.classList.add('show');
  }

  // Cerrar modal de mensaje
  messageClose.addEventListener('click', function() {
    messageModal.classList.remove('show');
  });

  // Cerrar modal al hacer clic fuera
  messageModal.addEventListener('click', function(e) {
    if (e.target === messageModal) {
      messageModal.classList.remove('show');
    }
  });
});
