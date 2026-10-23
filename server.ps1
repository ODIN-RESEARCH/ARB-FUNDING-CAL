# Windows Built-In Web Server for Funding Arbitrage Calculator
# Requires NO Node.js, NO npm, NO external installations.
# Uses built-in Windows .NET HttpListener.

param(
    [int]$Port = 5173
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $scriptDir "dist"

if (-not (Test-Path $distDir)) {
    Write-Host "[ERROR] dist folder not found at: $distDir" -ForegroundColor Red
    exit 1
}

$ports = @($Port, 5174, 5176, 5177, 8080, 8088, 3000)
$listener = $null
$activePrefix = $null

foreach ($p in $ports) {
    try {
        $candidate = New-Object System.Net.HttpListener
        $prefix = "http://localhost:$p/"
        $candidate.Prefixes.Add($prefix)
        $candidate.Start()
        $listener = $candidate
        $activePrefix = $prefix
        break
    } catch {
        if ($candidate) {
            try { $candidate.Close() } catch {}
        }
    }
}

if (-not $listener) {
    Write-Host "[ERROR] Unable to bind to any local web port." -ForegroundColor Red
    exit 1
}

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "           ODIN RESEARCH - FUNDING ARBITRAGE CALCULATOR              " -ForegroundColor Yellow
Write-Host "               Windows Native Standalone Server                      " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Dashboard is running at: $activePrefix" -ForegroundColor Green
Write-Host "  Press Ctrl+C or close this window to stop." -ForegroundColor Gray
Write-Host ""

Start-Process $activePrefix

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".webp"  = "image/webp"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".json"  = "application/json; charset=utf-8"
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $urlPath = $request.Url.LocalPath

            # API Handlers for MT5 status & symbol
            if ($urlPath -eq "/status") {
                $json = '{"connected": false, "mt5_available": false, "message": "Using calibrated broker presets. Run with Python for live MT5 stream."}'
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Close()
                continue
            }

            if ($urlPath -eq "/symbol") {
                $json = '{"error": "Live MT5 bridge requires Python. Calibrated presets are active in the calculator."}'
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 404
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Close()
                continue
            }

            if ($urlPath -eq "/" -or [string]::IsNullOrWhiteSpace($urlPath)) {
                $urlPath = "/index.html"
            }

            # Normalize relative path
            $cleanPath = $urlPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
            $filePath = Join-Path $distDir $cleanPath

            if (-not (Test-Path $filePath -PathType Leaf)) {
                # SPA Fallback to index.html
                $filePath = Join-Path $distDir "index.html"
            }

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = $mimeTypes[$ext]
                if (-not $mime) { $mime = "application/octet-stream" }

                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentType = $mime
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Close()
            } else {
                $response.StatusCode = 404
                $response.OutputStream.Close()
            }
        } catch {
            # Client socket disconnects or rapid page refreshes handled without stopping server
        }
    }
} finally {
    if ($listener) {
        try { $listener.Stop() } catch {}
        try { $listener.Close() } catch {}
    }
}
