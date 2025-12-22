# Script de déploiement Ikasso
# Utilise PM2 pour redémarrer l'application avec le nouveau build

Write-Host "🚀 Déploiement d'Ikasso en cours..." -ForegroundColor Green

# Vérifier que le build existe
if (-not (Test-Path "apps\web\.next\standalone")) {
    Write-Host "❌ Build non trouvé. Exécutez d'abord 'npm run build' dans apps/web" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build trouvé" -ForegroundColor Green

# Copier les fichiers vers le serveur (si nécessaire)
# Ici, nous assumons que nous sommes déjà sur le serveur

# Redémarrer PM2
Write-Host "🔄 Redémarrage de l'application avec PM2..." -ForegroundColor Yellow

try {
    # Naviguer vers le dossier web
    Set-Location "apps\web"
    
    # Redémarrer l'application PM2
    pm2 restart ecosystem.config.js
    
    Write-Host "✅ Application redémarrée avec succès!" -ForegroundColor Green
    Write-Host "🌐 Site disponible sur: https://ikasso.ml" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Erreur lors du redémarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Déploiement terminé!" -ForegroundColor Green
