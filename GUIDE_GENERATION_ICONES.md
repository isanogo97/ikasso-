# 🎨 Guide de Génération des Icônes Ikasso

## Fichiers SVG créés

Les logos SVG haute résolution sont disponibles dans `apps/web/public/icons/` :

| Fichier | Description | Usage |
|---------|-------------|-------|
| `ikasso-logo.svg` | Logo sur fond orange | Icône principale des stores |
| `ikasso-logo-white-bg.svg` | Logo sur fond blanc | Alternative |
| `ikasso-logo-full.svg` | Logo complet avec texte | Marketing, bannières |
| `favicon.svg` | Favicon | Site web |

---

## 🔧 Générer les icônes PNG pour les stores

### Méthode 1 : Utiliser un outil en ligne (Recommandé)

1. **Allez sur** : https://realfavicongenerator.net
2. **Uploadez** : `ikasso-logo.svg`
3. **Téléchargez** le pack complet avec toutes les tailles

### Méthode 2 : Utiliser CloudConvert

1. **Allez sur** : https://cloudconvert.com/svg-to-png
2. **Uploadez** : `ikasso-logo.svg`
3. **Configurez** la taille (ex: 1024x1024)
4. **Convertissez** et téléchargez

### Méthode 3 : Utiliser Canva (Gratuit)

1. **Allez sur** : https://www.canva.com
2. **Créez un design** 1024x1024 px
3. **Importez** le fichier SVG
4. **Exportez** en PNG

---

## 📱 Tailles requises

### Pour Apple App Store (iOS)
| Taille | Fichier | Usage |
|--------|---------|-------|
| 1024x1024 | icon-1024.png | App Store |
| 180x180 | icon-180.png | iPhone |
| 167x167 | icon-167.png | iPad Pro |
| 152x152 | icon-152.png | iPad |
| 120x120 | icon-120.png | iPhone |
| 87x87 | icon-87.png | iPhone Spotlight |
| 80x80 | icon-80.png | iPad Spotlight |
| 76x76 | icon-76.png | iPad |
| 60x60 | icon-60.png | iPhone |
| 40x40 | icon-40.png | Spotlight |
| 29x29 | icon-29.png | Settings |
| 20x20 | icon-20.png | Notification |

⚠️ **Important pour iOS** : Pas de transparence, coins carrés (iOS arrondit automatiquement)

### Pour Google Play Store (Android)
| Taille | Fichier | Usage |
|--------|---------|-------|
| 512x512 | icon-512.png | Play Store |
| 192x192 | icon-192.png | Launcher |
| 144x144 | icon-144.png | Launcher |
| 96x96 | icon-96.png | Launcher |
| 72x72 | icon-72.png | Launcher |
| 48x48 | icon-48.png | Launcher |

### Bannière Google Play (Feature Graphic)
- **Taille** : 1024x500 px
- **Format** : PNG ou JPEG
- **Contenu suggéré** : Logo + "Réservez des hébergements au Mali"

---

## 🖼️ Captures d'écran requises

### Pour Apple App Store
- **iPhone 6.7"** : 1290 x 2796 px (iPhone 14 Pro Max)
- **iPhone 6.5"** : 1284 x 2778 px (iPhone 14 Plus)
- **iPhone 5.5"** : 1242 x 2208 px (iPhone 8 Plus)
- **iPad 12.9"** : 2048 x 2732 px (optionnel)

### Pour Google Play
- **Téléphone** : 1080 x 1920 px (minimum 2, maximum 8)
- **Tablette 7"** : 1080 x 1920 px (optionnel)
- **Tablette 10"** : 1920 x 1080 px (optionnel)

---

## 🎯 Comment prendre les captures d'écran

### Sur votre iPhone :
1. Ouvrez Safari et allez sur https://ikasso.ml
2. Appuyez sur **Bouton latéral + Volume haut** simultanément
3. La capture est sauvegardée dans Photos

### Pages à capturer :
1. **Page d'accueil** - Avec la barre de recherche
2. **Page de recherche** - Résultats (même vide)
3. **Page de connexion** - Formulaire
4. **Page d'inscription** - Étape 1
5. **Centre d'aide** - FAQ

---

## 📤 Où placer les fichiers

Après génération, placez les icônes dans :
```
apps/web/public/icons/
├── icon-20x20.png
├── icon-29x29.png
├── icon-40x40.png
├── icon-48x48.png
├── icon-60x60.png
├── icon-72x72.png
├── icon-76x76.png
├── icon-80x80.png
├── icon-87x87.png
├── icon-96x96.png
├── icon-120x120.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-167x167.png
├── icon-180x180.png
├── icon-192x192.png
├── icon-512x512.png
├── icon-1024x1024.png
└── feature-graphic.png (1024x500)
```

---

## ✅ Checklist

- [ ] Générer icon-1024x1024.png (Apple)
- [ ] Générer icon-512x512.png (Google)
- [ ] Générer toutes les tailles intermédiaires
- [ ] Créer la bannière 1024x500 (Google)
- [ ] Prendre 5 captures d'écran iPhone
- [ ] Vérifier que les PNG n'ont pas de transparence (iOS)





