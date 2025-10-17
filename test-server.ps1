# Servidor HTTP simple con PowerShell
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()

Write-Host "🚀 Servidor iniciado en http://localhost:3000" -ForegroundColor Green
Write-Host "📂 Sirviendo archivos desde: $PWD" -ForegroundColor Yellow
Write-Host "⏹️  Presiona Ctrl+C para detener" -ForegroundColor Red

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.AbsolutePath
        if ($path -eq "/") { $path = "/chat.html" }
        
        $filePath = Join-Path $PWD $path.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $extension = [System.IO.Path]::GetExtension($filePath)
            
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css" }
                ".js" { $response.ContentType = "application/javascript" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                default { $response.ContentType = "text/plain" }
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $error = [System.Text.Encoding]::UTF8.GetBytes("Archivo no encontrado: $path")
            $response.OutputStream.Write($error, 0, $error.Length)
        }
        
        $response.OutputStream.Close()
        
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] $($request.HttpMethod) $($request.Url.PathAndQuery)" -ForegroundColor Cyan
    }
    catch {
        if ($_.Exception.Message -notlike "*thread*abort*") {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

$listener.Stop()