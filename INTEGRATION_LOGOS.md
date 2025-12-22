# 🎨 Guide d'intégration des logos professionnels Ikasso

## 📁 **Étape 1: Placer vos fichiers**

Copiez vos logos professionnels dans le dossier :
```
apps/web/public/images/logos/
```

### **Nomenclature recommandée :**

**Logos principaux :**
- `ikasso-logo.svg` ← Votre logo principal (vectoriel)
- `ikasso-logo.png` ← Votre logo principal (PNG haute résolution)
- `ikasso-logo-white.svg` ← Version blanche pour fonds sombres
- `ikasso-logo-white.png` ← Version blanche PNG

**Logos avec texte (optionnel) :**
- `ikasso-horizontal.svg` ← Logo + texte "IKASSO" intégré
- `ikasso-horizontal.png` ← Version PNG

**Favicons (différentes tailles) :**
- `favicon.ico` ← Favicon classique
- `ikasso-logo-16.png` ← 16x16px
- `ikasso-logo-32.png` ← 32x32px
- `ikasso-logo-48.png` ← 48x48px
- `ikasso-logo-96.png` ← 96x96px
- `ikasso-logo-192.png` ← 192x192px
- `ikasso-logo-512.png` ← 512x512px

**Icônes spéciales :**
- `apple-touch-icon.png` ← 180x180px pour iOS
- `android-chrome-192x192.png` ← 192x192px pour Android
- `android-chrome-512x512.png` ← 512x512px pour Android

## 🔧 **Étape 2: Remplacer les anciens logos**

### **Dans les composants React :**

**Ancien code :**
```tsx
import Logo from '../components/Logo'
<Logo size="lg" />
```

**Nouveau code :**
```tsx
import LogoFinal from '../components/LogoFinal'
<LogoFinal size="lg" />
```

### **Variantes disponibles :**

```tsx
// Logo par défaut
<LogoFinal size="md" />

// Logo blanc pour fonds sombres
<LogoFinal variant="white" size="lg" />

// Logo horizontal (avec texte intégré)
<LogoFinal variant="horizontal" size="xl" />

// Logo compact mobile
<LogoFinal size="sm" mobileCompact={true} />

// Logo prioritaire (chargement rapide)
<LogoFinal size="lg" priority={true} />
```

## 📱 **Étape 3: Mise à jour automatique**

Une fois vos fichiers placés, le système :

✅ **Détecte automatiquement** vos logos  
✅ **Utilise SVG en priorité** (vectoriel, meilleure qualité)  
✅ **Fallback vers PNG** si SVG indisponible  
✅ **Affiche un placeholder** si aucun logo trouvé  
✅ **Met à jour les favicons** dans toute l'app  

## 🎯 **Étape 4: Fichiers à remplacer**

### **Rechercher et remplacer dans le code :**

1. **Dashboard :**
```tsx
// apps/web/app/dashboard/page.tsx
import LogoFinal from '../components/LogoFinal'
// Remplacer <Logo /> par <LogoFinal />
```

2. **Header/Navigation :**
```tsx
// Dans tous les headers
<LogoFinal size="md" priority={true} />
```

3. **Page d'accueil :**
```tsx
// apps/web/app/page.tsx
<LogoFinal size="lg" priority={true} />
```

4. **Pages d'authentification :**
```tsx
// apps/web/app/auth/*/page.tsx
<LogoFinal size="lg" />
```

## 🔍 **Étape 5: Vérification**

### **Testez ces pages :**
- [ ] Page d'accueil (`/`)
- [ ] Dashboard (`/dashboard`)
- [ ] Connexion (`/auth/login`)
- [ ] Inscription (`/auth/register`)
- [ ] Settings (`/settings`)
- [ ] Toutes les pages avec navigation

### **Vérifiez les favicons :**
- [ ] Onglet du navigateur
- [ ] Favoris/Bookmarks
- [ ] Écran d'accueil mobile (iOS/Android)
- [ ] PWA (si installée)

## 🛠️ **Étape 6: Optimisations**

### **Pour de meilleures performances :**

1. **Compressez vos PNG** (TinyPNG, ImageOptim)
2. **Optimisez vos SVG** (SVGO)
3. **Utilisez WebP** si possible (optionnel)

### **Tailles recommandées :**
- **Favicon** : 16x16, 32x32, 48x48px
- **Mobile** : 96x96, 192x192px  
- **Desktop** : 256x256, 512x512px
- **Apple** : 180x180px

## 🚀 **Résultat final**

Après intégration, vous aurez :

✅ **Logos professionnels** partout dans l'app  
✅ **Favicons personnalisés** dans le navigateur  
✅ **Icônes PWA** pour l'installation mobile  
✅ **Fallbacks intelligents** si fichiers manquants  
✅ **Performance optimisée** avec chargement prioritaire  

## 📞 **Support**

Si vous avez des questions sur l'intégration :
1. Vérifiez que vos fichiers sont dans le bon dossier
2. Respectez la nomenclature exacte
3. Testez avec les outils de debug du navigateur
4. Le composant `LogoFinal` gère automatiquement les fallbacks

---

**Une fois vos logos placés, l'intégration sera automatique ! 🎉**
