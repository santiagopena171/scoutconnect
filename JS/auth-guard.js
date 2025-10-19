// =============================================
// PROTECCIÓN DE RUTAS - Auth Guard
// Incluir este script en TODAS las páginas protegidas
// =============================================

(async function() {
  console.log('🔒 Verificando autenticación...');

  // Verificar si acabamos de iniciar sesión
  const justLoggedIn = localStorage.getItem('justLoggedIn');
  if (justLoggedIn === 'true') {
    console.log('✅ Usuario acaba de iniciar sesión, permitiendo acceso...');
    localStorage.removeItem('justLoggedIn'); // Limpiar la marca
    
    // Esperar más tiempo para que todo se establezca
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  try {
    // Verificar si Supabase está inicializado
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase no está inicializado');
      // Esperar un poco por si aún se está cargando
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (typeof supabase === 'undefined') {
        console.error('❌ Supabase definitivamente no está disponible');
        redirectToLogin();
        return;
      }
    }

    // Esperar un poco para que la sesión se establezca completamente
    await new Promise(resolve => setTimeout(resolve, 300));

    // Obtener sesión actual
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Error al obtener sesión:', error);
      redirectToLogin();
      return;
    }

    if (!session) {
      console.log('❌ No hay sesión activa');
      redirectToLogin();
      return;
    }

    console.log('✅ Sesión activa encontrada');

    // Obtener perfil del usuario
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Si el perfil no existe, crear uno básico
    if (profileError || !profile) {
      console.warn('⚠️ Perfil no encontrado en auth-guard, creando uno básico...');
      
      const userMetadata = session.user.user_metadata || {};
      const newProfile = {
        id: session.user.id,
        email: session.user.email,
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
        console.error('❌ No se pudo crear perfil en auth-guard:', createError);
        redirectToLogin();
        return;
      }

      profile = createdProfile;
      console.log('✅ Perfil creado por auth-guard');
    }

    console.log('👤 Usuario autenticado:', profile);

    // Verificar que el usuario esté en la página correcta
    const currentPage = window.location.pathname.split('/').pop();
    const userType = profile.user_type;

    if (currentPage === 'dashboard-scout.html' && userType !== 'scout') {
      console.log('⚠️ Usuario no es scout, redirigiendo...');
      window.location.href = getDashboardForUserType(userType);
      return;
    }

    if (currentPage === 'dashboard-futbolista.html' && userType !== 'jugador') {
      console.log('⚠️ Usuario no es jugador, redirigiendo...');
      window.location.href = getDashboardForUserType(userType);
      return;
    }

    // Guardar datos del usuario en variable global
    window.currentUser = {
      id: session.user.id,
      email: profile.email,
      name: profile.full_name,
      userType: profile.user_type,
      profile: profile
    };

    console.log('✅ Protección de ruta completada');

  } catch (error) {
    console.error('❌ Error en protección de ruta:', error);
    redirectToLogin();
  }
})();

function redirectToLogin() {
  console.log('🚪 Redirigiendo a login...');
  
  // Limpiar sesiones antiguas
  localStorage.removeItem('scoutConnectToken');
  localStorage.removeItem('scoutConnectUser');
  localStorage.removeItem('scoutConnectExpiry');
  
  // Redirigir a login
  if (!window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

function getDashboardForUserType(userType) {
  switch(userType) {
    case 'scout':
      return 'dashboard-scout.html';
    case 'jugador':
      return 'dashboard-futbolista.html';
    default:
      return 'dashboard-futbolista.html';
  }
}

// Función global para cerrar sesión
window.logout = async function() {
  try {
    console.log('🚪 Cerrando sesión...');
    
    // Marcar que estamos haciendo logout (ANTES de limpiar)
    localStorage.setItem('justLoggedOut', 'true');
    
    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error al cerrar sesión en Supabase:', error);
    }
    
    // Limpiar todo el localStorage EXCEPTO justLoggedOut
    const justLoggedOut = localStorage.getItem('justLoggedOut');
    localStorage.clear();
    localStorage.setItem('justLoggedOut', justLoggedOut);
    
    console.log('✅ Sesión cerrada completamente');
    
    // Esperar un momento para asegurar que Supabase procese el signOut
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Redirigir a login
    window.location.href = 'login.html';
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    // Forzar limpieza y redirección
    localStorage.setItem('justLoggedOut', 'true');
    const justLoggedOut = localStorage.getItem('justLoggedOut');
    localStorage.clear();
    localStorage.setItem('justLoggedOut', justLoggedOut);
    window.location.href = 'login.html';
  }
};
