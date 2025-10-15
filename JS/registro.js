// ===== JAVASCRIPT PARA LA PÁGINA DE REGISTRO =====

document.addEventListener('DOMContentLoaded', function() {
  // Verificar sesión activa al cargar la página
  checkActiveSession();

  // Elementos del DOM
  const registerForm = document.getElementById('registerForm');
  const userTypeTabs = document.querySelectorAll('.user-type-tab');
  const userSpecificSections = document.querySelectorAll('.user-specific-section');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const togglePassword = document.getElementById('togglePassword');
  const passwordStrength = document.getElementById('passwordStrength');
  const strengthFill = passwordStrength.querySelector('.strength-fill');
  const strengthText = passwordStrength.querySelector('.strength-text');
  const registerBtn = document.getElementById('registerBtn');
  const messageModal = document.getElementById('messageModal');
  const messageIcon = document.getElementById('messageIcon');
  const messageTitle = document.getElementById('messageTitle');
  const messageText = document.getElementById('messageText');
  const messageClose = document.getElementById('messageClose');

  let currentUserType = 'jugador';

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
    showMessage('info', 'Sesión activa detectada', 'Redirigiendo a tu dashboard...');
    
    setTimeout(() => {
      switch(userType) {
        case 'jugador':
        case 'futbolista':
          window.location.href = 'dashboard-futbolista.html';
          break;
        case 'scout':
        case 'ojeador':
          // Cuando esté listo: window.location.href = 'dashboard-scout.html';
          window.location.href = 'dashboard-futbolista.html'; // Temporal
          break;
        case 'club':
        case 'academia':
          // Cuando esté listo: window.location.href = 'dashboard-club.html';
          window.location.href = 'dashboard-futbolista.html'; // Temporal
          break;
        default:
          window.location.href = 'dashboard-futbolista.html';
      }
    }, 1500);
  }

  // Inicialización
  init();

  function init() {
    setupEventListeners();
    setupFormValidation();
    applyInitialAnimations();
  }

  function setupEventListeners() {
    // Tabs de tipo de usuario
    userTypeTabs.forEach(tab => {
      tab.addEventListener('click', () => switchUserType(tab.dataset.type));
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', togglePasswordVisibility);

    // Password strength checker
    passwordInput.addEventListener('input', checkPasswordStrength);
    passwordInput.addEventListener('input', validatePasswordMatch);
    confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    // Form submission
    registerForm.addEventListener('submit', handleFormSubmission);

    // Modal events
    messageClose.addEventListener('click', () => messageModal.classList.remove('show'));
    messageModal.addEventListener('click', (e) => {
      if (e.target === messageModal) messageModal.classList.remove('show');
    });

    // Real-time validation
    setupRealTimeValidation();
  }

  function setupRealTimeValidation() {
    const inputs = registerForm.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearFieldError(input));
    });
  }

  function switchUserType(type) {
    currentUserType = type;
    
    // Update active tab
    userTypeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.type === type);
    });

    // Show/hide specific sections
    userSpecificSections.forEach(section => {
      const sectionType = section.id.replace('Section', '');
      section.classList.toggle('hidden', sectionType !== type);
    });

    // Update required fields
    updateRequiredFields();
  }

  function updateRequiredFields() {
    // Remove required from all specific fields first
    const specificFields = document.querySelectorAll('.user-specific-section input, .user-specific-section select');
    specificFields.forEach(field => field.removeAttribute('required'));

    // Add required to active section fields
    const activeSection = document.getElementById(`${currentUserType}Section`);
    if (activeSection) {
      const requiredFields = activeSection.querySelectorAll('input[data-required], select[data-required]');
      requiredFields.forEach(field => field.setAttribute('required', 'required'));
      
      // Specific required fields per user type
      if (currentUserType === 'jugador') {
        document.getElementById('position').setAttribute('required', 'required');
        document.getElementById('experience').setAttribute('required', 'required');
      } else if (currentUserType === 'scout') {
        document.getElementById('organization').setAttribute('required', 'required');
        document.getElementById('scoutExperience').setAttribute('required', 'required');
      } else if (currentUserType === 'club') {
        document.getElementById('clubName').setAttribute('required', 'required');
        document.getElementById('clubType').setAttribute('required', 'required');
      }
    }
  }

  function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    togglePassword.innerHTML = type === 'text' 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m1 1 22 22"></path>
          <path d="M6.71 6.71C5.68 7.74 5 9.24 5 12c0 4.42 4.48 8 7 8 2.76 0 4.26-.68 5.29-1.71"></path>
          <path d="m14 14.12-.12.07c-.7.43-1.51.65-2.38.65C9.24 14.84 7 12.6 7 10.34c0-.87.22-1.68.65-2.38l.07-.12"></path>
        </svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
  }

  function checkPasswordStrength() {
    const password = passwordInput.value;
    const strength = calculatePasswordStrength(password);
    
    strengthFill.className = 'strength-fill';
    
    if (password.length === 0) {
      strengthFill.style.width = '0%';
      strengthText.textContent = 'Seguridad de la contraseña';
      strengthText.style.color = '#666666';
    } else if (strength < 3) {
      strengthFill.classList.add('weak');
      strengthText.textContent = 'Contraseña débil';
      strengthText.style.color = '#E74C3C';
    } else if (strength < 5) {
      strengthFill.classList.add('medium');
      strengthText.textContent = 'Contraseña media';
      strengthText.style.color = '#F39C12';
    } else {
      strengthFill.classList.add('strong');
      strengthText.textContent = 'Contraseña fuerte';
      strengthText.style.color = '#00A859';
    }
  }

  function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  }

  function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
      showFieldError(errorElement, 'Las contraseñas no coinciden');
      return false;
    } else {
      hideFieldError(errorElement);
      return true;
    }
  }

  function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    const errorElement = document.getElementById(`${fieldName}Error`);
    
    if (!errorElement) return true;

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      showFieldError(errorElement, 'Este campo es requerido');
      return false;
    }

    // Specific validations
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (value && value.length < 2) {
          showFieldError(errorElement, 'Debe tener al menos 2 caracteres');
          return false;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          showFieldError(errorElement, 'Por favor, ingresa un correo electrónico válido');
          return false;
        }
        break;

      case 'birthDate':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (age < 13) {
            showFieldError(errorElement, 'Debes tener al menos 13 años');
            return false;
          }
          if (age > 80) {
            showFieldError(errorElement, 'Por favor, verifica la fecha de nacimiento');
            return false;
          }
        }
        break;

      case 'phone':
        if (value) {
          const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
          if (!phoneRegex.test(value)) {
            showFieldError(errorElement, 'Número de teléfono inválido');
            return false;
          }
        }
        break;

      case 'password':
        if (value && value.length < 8) {
          showFieldError(errorElement, 'La contraseña debe tener al menos 8 caracteres');
          return false;
        }
        break;

      case 'clubWebsite':
        if (value) {
          const urlRegex = /^https?:\/\/.+\..+/;
          if (!urlRegex.test(value)) {
            showFieldError(errorElement, 'Por favor, ingresa una URL válida');
            return false;
          }
        }
        break;
    }

    hideFieldError(errorElement);
    return true;
  }

  function showFieldError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  function hideFieldError(errorElement) {
    errorElement.classList.remove('show');
  }

  function clearFieldError(event) {
    const field = event.target;
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
      hideFieldError(errorElement);
    }
  }

  async function handleFormSubmission(e) {
    e.preventDefault();

    // Validate all fields
    const allInputs = registerForm.querySelectorAll('input, select');
    let isValid = true;

    allInputs.forEach(input => {
      if (!input.classList.contains('hidden') && !validateField(input)) {
        isValid = false;
      }
    });

    // Validate password match
    if (!validatePasswordMatch()) {
      isValid = false;
    }

    // Validate terms acceptance
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('termsError');
    if (!termsCheckbox.checked) {
      showFieldError(termsError, 'Debes aceptar los términos y condiciones');
      isValid = false;
    } else {
      hideFieldError(termsError);
    }

    if (!isValid) {
      showMessage('error', 'Formulario incompleto', 'Por favor, corrige los errores antes de continuar.');
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      // Collect form data
      const formData = collectFormData();
      
      // Simulate API call
      const registrationResult = await simulateRegistration(formData);
      
      // Registration successful
      const userData = {
        email: formData.email,
        userType: formData.userType,
        name: `${formData.firstName} ${formData.lastName}`,
        registrationTime: new Date().toISOString()
      };

      // Crear sesión automáticamente después del registro
      const sessionToken = generateSessionToken();
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 1 día
      
      localStorage.setItem('scoutConnectToken', sessionToken);
      localStorage.setItem('scoutConnectUser', JSON.stringify(userData));
      localStorage.setItem('scoutConnectExpiry', expiryTime.toString());

      showMessage('success', '¡Cuenta creada exitosamente!', 'Bienvenido a ScoutConnect. Serás redirigido a tu dashboard.');
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        redirectToDashboard(userData.userType);
      }, 3000);

    } catch (error) {
      showMessage('error', 'Error en el registro', error.message || 'Ocurrió un error al crear tu cuenta. Intenta nuevamente.');
    } finally {
      setLoadingState(false);
    }
  }

  function collectFormData() {
    const formData = new FormData(registerForm);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    data.userType = currentUserType;
    data.registrationDate = new Date().toISOString();
    
    return data;
  }

  function simulateRegistration(formData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate email check
        if (formData.email === 'test@test.com') {
          reject(new Error('Este correo electrónico ya está registrado'));
          return;
        }
        
        // Simulate successful registration
        resolve({
          success: true,
          userId: Math.random().toString(36).substr(2, 9),
          message: 'Usuario registrado exitosamente'
        });
      }, 2000);
    });
  }

  // Función para generar token de sesión
  function generateSessionToken() {
    return 'scToken_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  function setLoadingState(loading) {
    if (loading) {
      registerBtn.classList.add('loading');
      registerBtn.disabled = true;
    } else {
      registerBtn.classList.remove('loading');
      registerBtn.disabled = false;
    }
  }

  function showMessage(type, title, text) {
    messageIcon.className = `message-icon ${type}`;
    messageIcon.innerHTML = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageModal.classList.add('show');
  }

  function applyInitialAnimations() {
    // Initial animation for the wrapper
    setTimeout(() => {
      document.querySelector('.register-wrapper').style.transform = 'translateY(0)';
      document.querySelector('.register-wrapper').style.opacity = '1';
    }, 100);

    // Set initial styles for animation
    const wrapper = document.querySelector('.register-wrapper');
    wrapper.style.transform = 'translateY(20px)';
    wrapper.style.opacity = '0';
    wrapper.style.transition = 'all 0.6s ease';
  }

  function setupFormValidation() {
    // Set initial required fields
    updateRequiredFields();
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && messageModal.classList.contains('show')) {
      messageModal.classList.remove('show');
    }
  });

  // Auto-fill country based on locale (optional)
  function detectUserCountry() {
    const locale = navigator.language || navigator.userLanguage;
    const countryCode = locale.split('-')[1];
    const countrySelect = document.getElementById('country');
    
    if (countryCode && countrySelect.querySelector(`option[value="${countryCode}"]`)) {
      countrySelect.value = countryCode;
    }
  }

  // Call detect country on load
  detectUserCountry();

  console.log('📝 Registration page initialized successfully');
});