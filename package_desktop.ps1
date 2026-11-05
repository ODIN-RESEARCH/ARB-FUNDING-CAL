$src = 'C:\Users\manuv\.gemini\antigravity\scratch\funding-arbitrage-calculator'
$targets = @(
    'C:\Users\manuv\Desktop\1',
    'C:\Users\manuv\OneDrive\Desktop\1',
    'C:\Users\manuv\OneDrive\Desktop\C-FUNDING-CAL',
    'C:\Users\manuv\OneDrive\Desktop\C-ARB-FUNDING CAL'
)
$zipTargets = @(
    'C:\Users\manuv\Desktop\1.zip',
    'C:\Users\manuv\OneDrive\Desktop\1.zip',
    'C:\Users\manuv\OneDrive\Desktop\C-FUNDING-CAL.zip',
    'C:\Users\manuv\Desktop\Funding-Arbitrage-Calculator.zip'
)

foreach ($dest in $targets) {
    if (Test-Path $dest) {
        try {
            Remove-Item -Recurse -Force $dest -ErrorAction SilentlyContinue
        } catch {
            Write-Host "Notice: updating $dest in place..."
        }
    }
    New-Item -ItemType Directory -Force -Path $dest | Out-Null

    # Copy standalone execution files
    $filesToCopy = @(
        'HOW_TO_RUN.txt',
        'START_CALCULATOR.bat',
        'INSTALL_DEPENDENCIES.bat',
        'app_server.py',
        'server.ps1',
        'STRATEGY_GUIDE.md',
        'README.md',
        'mt5_bridge.py',
        'package.json',
        '.gitignore',
        'vite.config.ts',
        'tailwind.config.js',
        'tsconfig.json',
        'postcss.config.js',
        'index.html'
    )
    foreach ($f in $filesToCopy) {
        $p = Join-Path $src $f
        if (Test-Path $p) {
            Copy-Item -Path $p -Destination $dest -Force
        }
    }

    # Copy dist folder (required for running without Node/npm)
    Copy-Item -Path (Join-Path $src 'dist') -Destination (Join-Path $dest 'dist') -Recurse -Force

    # Copy .github workflow for automated Pages deployment
    if (Test-Path (Join-Path $src '.github')) {
        Copy-Item -Path (Join-Path $src '.github') -Destination (Join-Path $dest '.github') -Recurse -Force
    }

    # Copy src and public for reference/customization
    Copy-Item -Path (Join-Path $src 'public') -Destination (Join-Path $dest 'public') -Recurse -Force
    Copy-Item -Path (Join-Path $src 'src') -Destination (Join-Path $dest 'src') -Recurse -Force

    Write-Host "Copied clean package to: $dest"
}

# Create zip files from the guaranteed local folder
$sourceForZip = 'C:\Users\manuv\Desktop\1'
foreach ($zipPath in $zipTargets) {
    if (Test-Path $zipPath) {
        try {
            Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
        } catch {}
    }
    Write-Host "Creating zip at: $zipPath..."
    Compress-Archive -Path "$sourceForZip\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
    Write-Host "Successfully generated: $zipPath"
}
