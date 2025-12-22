# Script PowerShell pour renommer les logos Ikasso

Write-Host "🎨 Renommage des logos Ikasso..." -ForegroundColor Green

# Renommer les logos principaux
if (Test-Path "vector file.svg") {
    Copy-Item "vector file.svg" "ikasso-logo.svg" -Force
    Write-Host "✅ Logo principal SVG créé" -ForegroundColor Green
}

if (Test-Path "800 width size png.png") {
    Copy-Item "800 width size png.png" "ikasso-logo.png" -Force
    Write-Host "✅ Logo principal PNG créé" -ForegroundColor Green
}

if (Test-Path "400 width size png.png") {
    Copy-Item "400 width size png.png" "ikasso-logo-medium.png" -Force
    Write-Host "✅ Logo medium PNG créé" -ForegroundColor Green
}

if (Test-Path "200 with size png.png") {
    Copy-Item "200 with size png.png" "ikasso-logo-small.png" -Force
    Write-Host "✅ Logo small PNG créé" -ForegroundColor Green
}

# Extraire les icônes du ZIP si possible
if (Test-Path "icons.zip") {
    try {
        Expand-Archive -Path "icons.zip" -DestinationPath "." -Force
        Write-Host "✅ Icônes extraites du ZIP" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Impossible d'extraire le ZIP automatiquement" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Renommage terminé !" -ForegroundColor Green
Write-Host "📋 Vérifiez les fichiers créés et ajustez si nécessaire" -ForegroundColor Cyan
