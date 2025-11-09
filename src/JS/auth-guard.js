// =============================================
// PROTECCIÓN DE RUTAS - Auth Guard (Simplificado)
// Incluir este script en TODAS las páginas protegidas
// =============================================

(async function() {
  try {
    // Asegurar que Supabase esté inicializado
    let supabaseClient;
    
    if (typeof getSupabaseClient === 'function') {
      // Usar la función helper si está disponible
      supabaseClient = await getSupabaseClient();
    } else if (typeof initSupabase === 'function') {
      // Llamar a initSupabase si está disponible
      supabaseClient = await initSupabase();
    } else if (typeof window.supabase !== 'undefined' && window.supabase) {
      // Fallback al objeto global si ya existe
      supabaseClient = window.supabase;
    } else {
      console.error('❌ No se puede inicializar Supabase');
      redirectToLogin();
      return;
    }

    // Obtener sesión actual de Supabase (única fuente de verdad)
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError) {
      console.error('❌ Error al obtener sesión:', sessionError);
      redirectToLogin();
      return;
    }

    if (!session) {
      console.log('ℹ️ No hay sesión activa');
      redirectToLogin();
      return;
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Si el perfil no existe, hay un problema - redirigir a login
    if (profileError || !profile) {
      console.error('❌ Perfil no encontrado. El usuario debe completar el registro.');
      await supabaseClient.auth.signOut();
      redirectToLogin();
      return;
    }

    // Verificar que el usuario esté en la página correcta según su tipo
    const currentPage = window.location.pathname.split('/').pop();
    const userType = profile.user_type;

    // Validar que el tipo de usuario corresponde con la página
    if (currentPage === 'dashboard-scout.html' && userType !== 'scout') {
      console.warn('⚠️ Usuario no es scout, redirigiendo...');
      window.location.href = getDashboardForUserType(userType);
      return;
    }

    if (currentPage === 'dashboard-futbolista.html' && userType !== 'jugador') {
      console.warn('⚠️ Usuario no es jugador, redirigiendo...');
      window.location.href = getDashboardForUserType(userType);
      return;
    }

    // Validar perfiles específicos de scout/jugador
    if (currentPage === 'perfil-scout.html' && userType !== 'scout') {
      console.warn('⚠️ Usuario no es scout, redirigiendo...');
      window.location.href = getDashboardForUserType(userType);
      return;
    }

    if (currentPage === 'perfil-jugador.html' && userType !== 'jugador') {
      console.warn('⚠️ Usuario no es jugador, redirigiendo...');
      window.location.href = getDashboardForUserType(userType);
      return;
    }

    // Guardar datos del usuario en variable global (solo lectura)
    window.currentUser = {
      id: session.user.id,
      email: profile.email,
      name: profile.full_name,
      userType: profile.user_type,
      profile: profile
    };

    console.log('✅ Sesión validada correctamente');

  } catch (error) {
    console.error('❌ Error en protección de ruta:', error);
    redirectToLogin();
  }
})();

function redirectToLogin() {
  console.log('🔄 Redirigiendo a login...');
  
  // NO redirigir si ya estamos en login
  if (window.location.href.includes('login.html')) {
    return;
  }
  
  window.location.href = 'login.html';
}

function getDashboardForUserType(userType) {
  switch(userType) {
    case 'scout':
    case 'ojeador':
      return 'dashboard-scout.html';
    case 'jugador':
    case 'futbolista':
      return 'dashboard-futbolista.html';
    default:
      return 'dashboard-futbolista.html';
  }
}

// Función global para cerrar sesión (simplificada)
window.logout = async function() {
  try {
    console.log('🚪 Cerrando sesión...');
    
    // Cerrar sesión en Supabase (única fuente de verdad)
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
    
    // Limpiar variable global
    window.currentUser = null;
    
    // Redirigir a login
    window.location.href = 'login.html';
    
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    // Forzar redirección a login de todos modos
    window.location.href = 'login.html';
  }
};
