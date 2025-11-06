# Script de Configuración Inicial - ScoutConnect
# Ejecuta este script para configurar el proyecto por primera vez

Write-Host "🚀 Configurando ScoutConnect..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si existe .env
if (-Not (Test-Path ".env")) {
    Write-Host "📋 Creando archivo .env desde .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales reales de Supabase" -ForegroundColor Red
    Write-Host "   1. Ve a https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "   2. Selecciona tu proyecto → Settings → API" -ForegroundColor White
    Write-Host "   3. Copia 'Project URL' y 'anon/public key' al archivo .env" -ForegroundColor White
    Write-Host ""
    
    # Abrir .env en el editor predeterminado
    Write-Host "🔧 Abriendo .env para edición..." -ForegroundColor Yellow
    Start-Process notepad.exe ".env"
    
    Write-Host ""
    Read-Host "Presiona Enter después de configurar tus credenciales en .env"
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

# 2. Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

# 3. Ejecutar build
Write-Host ""
Write-Host "🔨 Inyectando credenciales..." -ForegroundColor Yellow
node build.js

# 4. Finalizar
Write-Host ""
Write-Host "✨ ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar la aplicación, ejecuta:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
