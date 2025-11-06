require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Verificar que las variables de entorno estén configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Las variables SUPABASE_URL y SUPABASE_ANON_KEY deben estar configuradas en el archivo .env');
  console.log('📋 Copia .env.example a .env y rellena con tus credenciales reales');
  process.exit(1);
}

const configPath = path.join(__dirname, 'JS', 'supabase-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Reemplazar placeholders con variables de entorno
configContent = configContent.replace(
  /url: '[^']*'/,
  `url: '${process.env.SUPABASE_URL}'`
);
configContent = configContent.replace(
  /anonKey: '[^']*'/,
  `anonKey: '${process.env.SUPABASE_ANON_KEY}'`
);

// Escribir el archivo modificado
fs.writeFileSync(configPath, configContent);

console.log('✅ Configuración de Supabase actualizada con variables de entorno');
console.log(`   URL: ${process.env.SUPABASE_URL}`);
console.log(`   Key: ${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...`);