// =============================================
// CONFIGURACIÓN DE SUPABASE - ScoutConnect
// =============================================

const SUPABASE_CONFIG = {
  // 📍 URL del proyecto - Se inyecta desde SUPABASE_URL en .env
  url: '{{SUPABASE_URL}}',
  
  // 🔑 API Key pública/anon - Se inyecta desde SUPABASE_ANON_KEY en .env
  anonKey: '{{SUPABASE_ANON_KEY}}'
};

// =============================================
// INICIALIZAR CLIENTE DE SUPABASE
// =============================================

let supabase = null;

// Función para inicializar Supabase
function initSupabase() {
  if (supabase !== null) {
    return supabase;
  }

  try {
    // Verificar que la librería de Supabase esté cargada
    if (typeof window === 'undefined' || !window.supabase || !window.supabase.createClient) {
      console.error('❌ ERROR: La librería de Supabase no está cargada.');
      return null;
    }

    // Crear cliente de Supabase
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

    // Hacer disponible globalmente
    window.supabase = supabase;
    
    console.log('✅ Cliente de Supabase inicializado correctamente');
    return supabase;
  } catch (error) {
    console.error('❌ ERROR al inicializar Supabase:', error);
    return null;
  }
}

// Inicializar inmediatamente cuando se carga el script
if (typeof window !== 'undefined') {
  // Intentar inicializar inmediatamente
  const result = initSupabase();
  
  // Si falla (librería aún no cargada), reintentar cuando el DOM esté listo
  if (!result && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
  }
}

