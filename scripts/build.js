require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Verificar que las variables de entorno estén configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Las variables SUPABASE_URL y SUPABASE_ANON_KEY deben estar configuradas en el archivo .env');
  console.log('📋 Copia .env.example a .env y rellena con tus credenciales reales');
  process.exit(1);
}

// Rutas de archivos
const templatePath = path.join(__dirname, '..', 'src', 'JS', 'supabase-config.template.js');
const configPath = path.join(__dirname, '..', 'src', 'JS', 'supabase-config.js');

// Verificar que el template exista
if (!fs.existsSync(templatePath)) {
  console.error('❌ ERROR: No se encontró el archivo template: supabase-config.template.js');
  process.exit(1);
}

// Leer el template
let configContent = fs.readFileSync(templatePath, 'utf8');

// Reemplazar placeholders con variables de entorno
configContent = configContent.replace(/\{\{SUPABASE_URL\}\}/g, process.env.SUPABASE_URL);
configContent = configContent.replace(/\{\{SUPABASE_ANON_KEY\}\}/g, process.env.SUPABASE_ANON_KEY);

// Agregar comentario de advertencia al inicio
const warning = `// ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE - NO EDITAR
// Este archivo fue generado desde supabase-config.template.js
// Generado el: ${new Date().toISOString()}
// Para regenerar: npm run build

`;

configContent = warning + configContent;

// Escribir el archivo de configuración
fs.writeFileSync(configPath, configContent);

console.log('✅ Configuración de Supabase generada correctamente desde template');
console.log(`   Template: supabase-config.template.js`);
console.log(`   Salida: supabase-config.js`);
console.log(`   URL: ${process.env.SUPABASE_URL}`);
console.log(`   Key: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log('\n⚠️  IMPORTANTE: supabase-config.js NO debe subirse a Git');
