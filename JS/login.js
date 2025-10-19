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
  async function checkActiveSession() {
    try {
      // Si acabamos de hacer logout, NO verificar sesión
      const justLoggedOut = localStorage.getItem('justLoggedOut');
      if (justLoggedOut === 'true') {
        console.log('🚪 Logout reciente detectado, no verificar sesión');
        localStorage.removeItem('justLoggedOut');
        clearSession();
        return false;
      }

      // Verificar sesión en Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('✅ Sesión activa de Supabase detectada');
        
        // Obtener datos del perfil
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile && !error) {
          console.log('👤 Perfil encontrado:', profile);
          redirectToDashboard(profile.user_type);
          return true;
        }
      }

      // Fallback: verificar localStorage (sesiones antiguas)
      const sessionToken = localStorage.getItem('scoutConnectToken');
      const sessionUser = localStorage.getItem('scoutConnectUser');
      const sessionExpiry = localStorage.getItem('scoutConnectExpiry');

      if (sessionToken && sessionUser && sessionExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(sessionExpiry);

        if (now < expiryTime) {
          const userData = JSON.parse(sessionUser);
          redirectToDashboard(userData.userType || 'jugador');
          return true;
        } else {
          clearSession();
        }
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
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
      // Login con Supabase
      console.log('📡 Autenticando con Supabase...');
      const loginResult = await authenticateWithSupabase();
      console.log('✅ Login exitoso:', loginResult);
      
      // Verificar que el tipo de usuario seleccionado coincida con el registrado
      const selectedUserType = document.querySelector('input[name="userType"]:checked').value;
      const registeredUserType = loginResult.profile.user_type;
      
      console.log('🔍 Tipo seleccionado:', selectedUserType);
      console.log('🔍 Tipo registrado:', registeredUserType);
      
      if (selectedUserType !== registeredUserType) {
        // Cerrar la sesión de Supabase ya que no coincide el tipo
        await supabase.auth.signOut();
        
        const tipoSeleccionado = selectedUserType === 'scout' ? 'Scout' : 'Futbolista';
        const tipoReal = registeredUserType === 'scout' ? 'Scout' : 'Futbolista';
        
        throw new Error(`Esta cuenta está registrada como ${tipoReal}. Por favor, selecciona "${tipoReal}" para iniciar sesión.`);
      }
      
      // Login exitoso - obtener perfil del usuario
      const userData = {
        id: loginResult.user.id,
        email: loginResult.user.email,
        userType: loginResult.profile.user_type,
        name: loginResult.profile.full_name,
        loginTime: new Date().toISOString()
      };

      // Guardar en localStorage para compatibilidad
      localStorage.setItem('scoutConnectUser', JSON.stringify(userData));
      
      // Marcar que acabamos de iniciar sesión (para que auth-guard no bloquee)
      localStorage.setItem('justLoggedIn', 'true');

      console.log('💾 Datos de usuario:', userData);

      if (rememberMe.checked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', emailInput.value.trim());
        console.log('✅ Datos de "recordarme" guardados');
      }

      showMessage('success', '¡Bienvenido!', 'Has iniciado sesión correctamente.');
      
      console.log('🚀 Redirigiendo al dashboard...');
      // Redirigir inmediatamente
      redirectToDashboard(userData.userType);

    } catch (error) {
      // Error en el login
      console.error('❌ Error en login:', error);
      let errorMessage = 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Tu email no está confirmado. Ve a Supabase Dashboard → Authentication → Providers → Email y desactiva "Confirm email" para desarrollo.';
      } else if (error.message.includes('Esta cuenta está registrada como')) {
        errorMessage = error.message; // Mensaje personalizado de tipo de usuario
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showMessage('error', 'Error de autenticación', errorMessage);
    } finally {
      setLoadingState(false);
    }
  });

  // Función para autenticar con Supabase
  async function authenticateWithSupabase() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log('🔍 Validando credenciales para:', email);

    // 1. Iniciar sesión con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      throw authError;
    }

    console.log('✅ Autenticación exitosa');

    // 2. Obtener perfil del usuario
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // 3. Si el perfil no existe, crearlo ahora
    if (profileError || !profile) {
      console.warn('⚠️ Perfil no encontrado, creando uno nuevo...');
      
      const userMetadata = authData.user.user_metadata || {};
      const newProfile = {
        id: authData.user.id,
        email: authData.user.email,
        user_type: userMetadata.user_type || 'jugador',
        full_name: userMetadata.full_name || 'Usuario',
        phone: userMetadata.phone || null
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear perfil:', createError);
        throw new Error('No se pudo crear el perfil del usuario: ' + createError.message);
      }

      profile = createdProfile;
      console.log('✅ Perfil creado exitosamente');
    }

    console.log('👤 Perfil obtenido:', profile);

    return {
      user: authData.user,
      session: authData.session,
      profile: profile
    };
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