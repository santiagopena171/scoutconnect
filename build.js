require('dotenv').config();

const fs = require('fs');
const path = require('path');

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