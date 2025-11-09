#!/usr/bin/env node

/**
 * SCRIPT DE MIGRACIÓN - Datos Simulados → Datos Reales
 * 
 * Este script reemplaza automáticamente las referencias a archivos
 * con datos hardcodeados por las nuevas versiones con integración a Supabase.
 * 
 * Uso: node scripts/migrate-to-real-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando migración a datos reales...\n');

// Archivos a modificar
const filesToMigrate = [
  {
    path: 'public/chat.html',
    oldScript: '../src/JS/chat.js',
    newScripts: [
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      '../src/JS/supabase-config.js',
      '../src/JS/chat-real.js'
    ]
  },
  {
    path: 'public/dashboard-scout.html',
    oldScript: '../src/JS/dashboard-scout.js',
    newScripts: [
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      '../src/JS/supabase-config.js',
      '../src/JS/dashboard-scout-real.js'
    ]
  },
  {
    path: 'public/mensajes.html',
    oldScript: '../src/JS/chat.js',
    newScripts: [
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      '../src/JS/supabase-config.js',
      '../src/JS/chat-real.js'
    ]
  }
];

// Crear backups
console.log('📦 Creando backups...');
filesToMigrate.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  
  if (fs.existsSync(filePath)) {
    const backupPath = `${filePath}.backup`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`   ✅ Backup creado: ${file.path}.backup`);
  } else {
    console.log(`   ⚠️  Archivo no encontrado: ${file.path}`);
  }
});

console.log('\n🔄 Aplicando migraciones...\n');

// Aplicar cambios
filesToMigrate.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⏭️  Saltando ${file.path} (no existe)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Buscar y reemplazar el script antiguo
  const oldScriptPattern = new RegExp(
    `<script[^>]*src=["']${file.oldScript.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*></script>`,
    'gi'
  );

  if (oldScriptPattern.test(content)) {
    console.log(`📝 Procesando: ${file.path}`);
    
    // Generar nuevos scripts
    const newScriptsHtml = file.newScripts.map(script => {
      if (script.startsWith('http')) {
        return `<script src="${script}"></script>`;
      } else {
        return `<script src="${script}"></script>`;
      }
    }).join('\n    ');

    // Reemplazar
    content = content.replace(oldScriptPattern, `<!-- Migrado a datos reales -->\n    ${newScriptsHtml}`);
    
    // Guardar
    fs.writeFileSync(filePath, content, 'utf8');
    modified = true;
    
    console.log(`   ✅ ${file.path} actualizado`);
    console.log(`   📊 Scripts agregados:`);
    file.newScripts.forEach(s => {
      console.log(`      - ${s}`);
    });
    console.log('');
  } else {
    console.log(`   ℹ️  ${file.path} no contiene el script antiguo (puede estar ya migrado)`);
  }
});

console.log('\n✅ Migración completada!\n');

console.log('📋 Próximos pasos:');
console.log('   1. Verificar que supabase-config.js esté generado:');
console.log('      npm run build');
console.log('');
console.log('   2. Habilitar Realtime en Supabase Dashboard:');
console.log('      - Ir a Database → Replication');
console.log('      - Activar realtime en: messages, message_status, conversation_participants');
console.log('');
console.log('   3. Probar la aplicación:');
console.log('      - Abrir chat en dos navegadores');
console.log('      - Enviar mensaje y verificar que llegue instantáneamente');
console.log('');
console.log('   4. Si algo sale mal, restaurar backups:');
console.log('      mv public/chat.html.backup public/chat.html');
console.log('      mv public/dashboard-scout.html.backup public/dashboard-scout.html');
console.log('');

console.log('📚 Documentación completa en:');
console.log('   - docs/INTEGRACION-TIEMPO-REAL.md');
console.log('   - docs/IMPLEMENTACION-RAPIDA.md');
console.log('');
