// ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR
// Este archivo fue generado desde supabase-config.template.js
// Generado el: 2025-11-09T00:08:40.219Z
// Para regenerar: npm run build

// =============================================
// CONFIGURACIÓN DE SUPABASE - ScoutConnect
// =============================================

const SUPABASE_CONFIG = {
  // 📍 URL del proyecto - Se inyecta desde SUPABASE_URL en .env
  url: 'https://lcujogyjgncfsxeptrlz.supabase.co',
  
  // 🔑 API Key pública/anon - Se inyecta desde SUPABASE_ANON_KEY en .env
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdWpvZ3lqZ25jZnN4ZXB0cmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODUwNTcsImV4cCI6MjA3NjQ2MTA1N30.9V_LbNKuIoHt1p1-jSnXM1U33bG6qMN4R4JTbxhRbbM'
};

// =============================================
// INICIALIZAR CLIENTE DE SUPABASE
// =============================================

let supabase = null;
let initializationPromise = null;

// Función para inicializar Supabase (singleton con Promise para evitar múltiples inicializaciones)
function initSupabase() {
  // Si ya está inicializado, devolver la instancia
  if (supabase !== null) {
    return Promise.resolve(supabase);
  }

  // Si ya hay una inicialización en curso, esperar a que termine
  if (initializationPromise !== null) {
    return initializationPromise;
  }

  // Crear nueva promesa de inicialización
  initializationPromise = new Promise((resolve, reject) => {
    try {
      // Verificar que la librería de Supabase esté cargada
      if (typeof window === 'undefined' || !window.supabase || !window.supabase.createClient) {
        const error = new Error('La librería de Supabase no está cargada. Asegúrate de incluir el CDN antes de este script.');
        console.error('❌ ERROR:', error.message);
        reject(error);
        return;
      }

      // Crear cliente de Supabase
      const { createClient } = window.supabase;
      supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

      // Hacer disponible globalmente
      window.supabase = supabase;
      
      console.log('✅ Cliente de Supabase inicializado correctamente');
      resolve(supabase);
    } catch (error) {
      console.error('❌ ERROR al inicializar Supabase:', error);
      reject(error);
    }
  });

  return initializationPromise;
}

// Helper para obtener el cliente (espera a que esté inicializado)
async function getSupabaseClient() {
  if (supabase !== null) {
    return supabase;
  }
  return await initSupabase();
}

// Inicializar inmediatamente cuando se carga el script
if (typeof window !== 'undefined') {
  // Intentar inicializar inmediatamente
  initSupabase().catch(error => {
    // Si falla (librería aún no cargada), reintentar cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initSupabase());
    }
  });
}

