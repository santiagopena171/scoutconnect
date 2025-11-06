// Script de Diagnóstico - Supabase Connection
// Incluye este script en login.html para verificar la conectividad

console.log('=== DIAGNÓSTICO DE CONEXIÓN SUPABASE ===');

// 1. Verificar que el CDN de Supabase esté cargado
if (typeof window.supabase === 'undefined') {
  console.error('❌ ERROR: La librería de Supabase NO está cargada');
  console.log('Verifica que el CDN esté accesible: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
} else {
  console.log('✅ Librería de Supabase cargada correctamente');
}

// 2. Verificar configuración
if (typeof SUPABASE_CONFIG !== 'undefined') {
  console.log('✅ Configuración encontrada');
  console.log('📍 URL:', SUPABASE_CONFIG.url);
  console.log('🔑 Key:', SUPABASE_CONFIG.anonKey ? 'Configurada (' + SUPABASE_CONFIG.anonKey.substring(0, 20) + '...)' : '❌ NO CONFIGURADA');
} else {
  console.error('❌ ERROR: SUPABASE_CONFIG no está definido');
}

// 3. Verificar que el cliente esté inicializado
setTimeout(() => {
  if (typeof supabase !== 'undefined' && supabase !== null) {
    console.log('✅ Cliente de Supabase inicializado');
    
    // 4. Test de conectividad
    console.log('🔄 Probando conectividad con Supabase...');
    
    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Error de conectividad:', error.message);
          console.log('🔍 Detalles del error:', error);
        } else {
          console.log('✅ Conectividad exitosa con Supabase');
          console.log('📊 Sesión actual:', data.session ? 'Activa' : 'No hay sesión');
        }
      })
      .catch(err => {
        console.error('❌ Fallo en test de conectividad:', err);
        console.log('🌐 Verifica tu conexión a internet');
        console.log('🔐 Verifica que las credenciales sean correctas');
      });
  } else {
    console.error('❌ Cliente de Supabase NO inicializado');
  }
}, 1000);

console.log('=== FIN DEL DIAGNÓSTICO ===');
