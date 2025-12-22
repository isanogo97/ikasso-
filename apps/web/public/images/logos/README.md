# Guide d'intégration des logos Ikasso

## 📁 Structure des fichiers

Placez vos logos professionnels dans ce dossier avec cette nomenclature :

### **Logos principaux**
- `ikasso-logo.svg` - Logo principal (vectoriel, recommandé)
- `ikasso-logo.png` - Logo principal (haute résolution, 512x512px min)
- `ikasso-logo-white.svg` - Logo blanc pour fonds sombres
- `ikasso-logo-white.png` - Logo blanc (PNG avec transparence)

### **Variantes de taille (PNG)**
- `ikasso-logo-16.png` - 16x16px (favicon)
- `ikasso-logo-32.png` - 32x32px (favicon)
- `ikasso-logo-48.png` - 48x48px (mobile)
- `ikasso-logo-96.png` - 96x96px (mobile)
- `ikasso-logo-192.png` - 192x192px (PWA)
- `ikasso-logo-512.png` - 512x512px (PWA, haute résolution)

### **Logos horizontaux (avec texte)**
- `ikasso-horizontal.svg` - Logo + texte horizontal
- `ikasso-horizontal.png` - Logo + texte horizontal (PNG)
- `ikasso-horizontal-white.svg` - Version blanche
- `ikasso-horizontal-white.png` - Version blanche (PNG)

### **Favicons**
- `favicon.ico` - Favicon classique (16x16, 32x32, 48x48)
- `apple-touch-icon.png` - 180x180px pour iOS
- `android-chrome-192x192.png` - 192x192px pour Android
- `android-chrome-512x512.png` - 512x512px pour Android

## 🎨 Formats recommandés

1. **SVG** (priorité) - Vectoriel, s'adapte à toutes les tailles
2. **PNG** avec transparence - Pour les cas où SVG n'est pas supporté
3. **ICO** - Pour les favicons uniquement

## 📱 Tailles recommandées

- **Favicon** : 16x16, 32x32, 48x48px
- **Mobile** : 48x48, 96x96, 192x192px
- **Desktop** : 128x128, 256x256, 512x512px
- **Apple Touch Icon** : 180x180px
- **PWA** : 192x192, 512x512px

## 🔧 Après avoir placé vos fichiers

1. Mettez vos logos dans ce dossier
2. Respectez la nomenclature ci-dessus
3. L'intégration se fera automatiquement via le composant LogoPro
4. Les favicons seront mis à jour dans le layout principal

## ✅ Checklist

- [ ] Logo principal (SVG + PNG)
- [ ] Logo blanc pour fonds sombres
- [ ] Favicon (16x16, 32x32, 48x48)
- [ ] Apple Touch Icon (180x180)
- [ ] Logos PWA (192x192, 512x512)
- [ ] Logo horizontal avec texte (optionnel)
