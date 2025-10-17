# Servidor HTTP simple
Add-Type -AssemblyName System.Net.Http
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:3000/")
$listener.Start()

Write-Host "Servidor iniciado en http://localhost:3000" -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Red

while ($true) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.AbsolutePath
        if ($path -eq "/") { 
            $path = "/dashboard-scout.html" 
        }
        
        $filePath = Join-Path (Get-Location) $path.TrimStart('/')
        
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $extension = [System.IO.Path]::GetExtension($filePath)
            
            $mimeType = switch ($extension) {
                ".html" { "text/html" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                default { "text/plain" }
            }
            
            $response.ContentType = $mimeType
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $error = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.OutputStream.Write($error, 0, $error.Length)
        }
        
        $response.OutputStream.Close()
        Write-Host "$($request.HttpMethod) $($request.Url.PathAndQuery)"
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)"
    }
}

$listener.Stop()