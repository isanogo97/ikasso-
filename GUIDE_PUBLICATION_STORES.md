# 📱 Guide de Publication - Google Play Store & Apple App Store

## Option 1 : PWA (Progressive Web App) - GRATUIT ✅

Votre site est déjà installable ! Les utilisateurs peuvent :
- **Android** : Ouvrir Chrome → Menu ⋮ → "Ajouter à l'écran d'accueil"
- **iPhone** : Ouvrir Safari → Partager → "Sur l'écran d'accueil"

### Ce qu'il vous faut créer :
1. **Icônes** dans `apps/web/public/icons/` :
   - icon-72x72.png, icon-96x96.png, icon-128x128.png
   - icon-144x144.png, icon-152x152.png, icon-192x192.png
   - icon-384x384.png, icon-512x512.png

2. **Outil recommandé** : https://realfavicongenerator.net
   - Uploadez votre logo Ikasso
   - Téléchargez toutes les tailles générées

---

## Option 2 : Google Play Store 🤖

### Prérequis :
- Compte Google Play Console : **25$ une seule fois**
- https://play.google.com/console

### Méthode A : TWA (Trusted Web Activity) - Recommandé
Transforme votre PWA en app Android native.

**Outil** : https://pwabuilder.com
1. Allez sur pwabuilder.com
2. Entrez : `https://ikasso.ml`
3. Cliquez "Package for stores"
4. Choisissez "Android"
5. Téléchargez le fichier APK/AAB

### Méthode B : React Native / Expo
Reconstruire l'app en natif (plus complexe, 2-4 semaines).

### Publication :
1. Créez votre compte sur Google Play Console
2. Créez une nouvelle application
3. Remplissez : Description, captures d'écran, catégorie "Voyage"
4. Uploadez le fichier AAB
5. Soumettez pour révision (1-3 jours)

---

## Option 3 : Apple App Store 🍎

### Prérequis :
- Compte Apple Developer : **99$/an**
- Mac avec Xcode (obligatoire)
- https://developer.apple.com

### Méthode A : PWA via PWABuilder
1. Allez sur https://pwabuilder.com
2. Entrez : `https://ikasso.ml`
3. Choisissez "iOS"
4. Téléchargez le projet Xcode
5. Ouvrez sur Mac, signez et publiez

### Méthode B : React Native / Expo
Reconstruire l'app en natif.

### Publication :
1. Créez votre compte Apple Developer
2. Créez l'app sur App Store Connect
3. Remplissez les métadonnées
4. Uploadez via Xcode ou Transporter
5. Soumettez pour révision (1-7 jours)

---

## 📋 Checklist avant publication

### Informations requises :
- [ ] Nom de l'app : "Ikasso"
- [ ] Description courte (80 car.) : "Réservez des hébergements au Mali"
- [ ] Description longue (4000 car.)
- [ ] Catégorie : Voyage / Lifestyle
- [ ] Mots-clés : Mali, hébergement, voyage, hôtel, Bamako
- [ ] URL politique de confidentialité
- [ ] URL conditions d'utilisation
- [ ] Email support : support@ikasso.ml

### Assets graphiques :
- [ ] Icône 512x512 (PNG, sans transparence pour iOS)
- [ ] Captures d'écran téléphone (1080x1920)
- [ ] Captures d'écran tablette (optionnel)
- [ ] Bannière promotionnelle (1024x500 pour Play Store)

---

## 💰 Résumé des coûts

| Plateforme | Coût | Délai |
|------------|------|-------|
| PWA | Gratuit | Immédiat |
| Google Play | 25$ (une fois) | 1-3 jours |
| Apple App Store | 99$/an | 1-7 jours |

---

## 🚀 Recommandation

**Étape 1** : Commencez par la PWA (gratuit, immédiat)
**Étape 2** : Publiez sur Google Play avec PWABuilder (25$)
**Étape 3** : Si succès, investissez dans Apple (99$/an)

Besoin d'aide ? Contactez-moi pour la suite !





