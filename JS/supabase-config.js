// =============================================
// CONFIGURACIÓN DE SUPABASE - ScoutConnect
// =============================================

// 🔐 INSTRUCCIONES:
// 1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
// 2. Click en Settings (⚙️) → API
// 3. Copia tu "Project URL" y "anon public key"
// 4. Pega los valores abajo (reemplaza los textos entre comillas)

const SUPABASE_CONFIG = {
  // 📍 URL del proyecto (ejemplo: https://xyzcompany.supabase.co)
  url: 'https://lcujogyjgncfsxeptrlz.supabase.co',
  
  // 🔑 API Key pública/anon (ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdWpvZ3lqZ25jZnN4ZXB0cmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODUwNTcsImV4cCI6MjA3NjQ2MTA1N30.9V_LbNKuIoHt1p1-jSnXM1U33bG6qMN4R4JTbxhRbbM'
};

// =============================================
// INICIALIZAR CLIENTE DE SUPABASE
// =============================================

// Importar la librería de Supabase
// La importamos desde CDN en el HTML

let supabase = null;

// Función para inicializar Supabase
function initSupabase() {
  if (typeof supabase !== 'undefined' && supabase !== null) {
    return supabase;
  }

  // Verificar que las credenciales estén configuradas
  if (SUPABASE_CONFIG.url === 'TU_SUPABASE_URL_AQUI' || 
      SUPABASE_CONFIG.anonKey === 'TU_SUPABASE_ANON_KEY_AQUI') {
    console.error('⚠️ ERROR: Debes configurar las credenciales de Supabase en supabase-config.js');
    
    
    
    
    
    
    return null;
  }

  try {
    // Crear cliente de Supabase
    supabase = window.supabase.createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey
    );
    
    
    return supabase;
  } catch (error) {
    console.error('❌ Error al inicializar Supabase:', error);
    return null;
  }
}

// =============================================
// FUNCIONES DE AUTENTICACIÓN
// =============================================

// Registrar nuevo usuario
async function signUpUser(email, password, userData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: userData.fullName,
          user_type: userData.userType,
          phone: userData.phone
        }
      }
    });

    if (error) throw error;

    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return { success: false, error: error.message };
  }
}

// Iniciar sesión
async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    return { success: false, error: error.message };
  }
}

// Cerrar sesión
async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    
    return { success: true };
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    return { success: false, error: error.message };
  }
}

// Obtener usuario actual
async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    return null;
  }
}

// Obtener sesión actual
async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('❌ Error al obtener sesión:', error);
    return null;
  }
}

// Recuperar contraseña
async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) throw error;

    
    return { success: true };
  } catch (error) {
    console.error('❌ Error al enviar email de recuperación:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// FUNCIONES DE BASE DE DATOS - PERFILES
// =============================================

// Crear perfil de usuario
async function createProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        user_type: profileData.userType,
        email: profileData.email,
        full_name: profileData.fullName,
        phone: profileData.phone,
        birth_date: profileData.birthDate,
        nationality: profileData.nationality,
        city: profileData.city
      }])
      .select();

    if (error) throw error;

    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al crear perfil:', error);
    return { success: false, error: error.message };
  }
}

// Obtener perfil de usuario
async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar perfil
async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;

    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// FUNCIONES DE BASE DE DATOS - JUGADORES
// =============================================

// Crear perfil de jugador
async function createPlayerProfile(userId, playerData) {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert([{
        user_id: userId,
        position: playerData.position,
        preferred_foot: playerData.preferredFoot,
        height: playerData.height,
        weight: playerData.weight,
        current_club: playerData.currentClub,
        country: playerData.country,
        state: playerData.state,
        bio: playerData.bio
      }])
      .select();

    if (error) throw error;

    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al crear perfil de jugador:', error);
    return { success: false, error: error.message };
  }
}

// Obtener todos los jugadores
async function getAllPlayers() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          avatar_url,
          nationality,
          city
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al obtener jugadores:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// FUNCIONES DE BASE DE DATOS - SCOUTS
// =============================================

// Crear perfil de scout
async function createScoutProfile(userId, scoutData) {
  try {
    const { data, error } = await supabase
      .from('scouts')
      .insert([{
        user_id: userId,
        organization: scoutData.organization,
        position: scoutData.position,
        experience: scoutData.experience,
        specialization: scoutData.specialization,
        region: scoutData.region,
        languages: scoutData.languages,
        bio: scoutData.bio
      }])
      .select();

    if (error) throw error;

    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error al crear perfil de scout:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// FUNCIONES DE STORAGE - AVATARES
// =============================================

// Subir avatar
async function uploadAvatar(userId, file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Obtener URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    
    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('❌ Error al subir avatar:', error);
    return { success: false, error: error.message };
  }
}

// =============================================
// INICIALIZACIÓN
// =============================================

// Inicializar Supabase cuando el script se carga
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
  } else {
    initSupabase();
  }
}

// Exportar funciones para uso global
window.supabaseAuth = {
  signUp: signUpUser,
  signIn: signInUser,
  signOut: signOutUser,
  getCurrentUser,
  getCurrentSession,
  resetPassword
};

window.supabaseDB = {
  createProfile,
  getProfile,
  updateProfile,
  createPlayerProfile,
  createScoutProfile,
  getAllPlayers,
  uploadAvatar
};
