# Ikasso Email Server

Serveur Node.js dédié pour l'envoi d'emails via SMTP Netim.

## 🚀 Déploiement sur Railway (Gratuit)

### Étape 1 : Créer un compte Railway
1. Allez sur https://railway.app
2. Connectez-vous avec GitHub

### Étape 2 : Déployer le serveur
1. Cliquez sur "New Project"
2. Sélectionnez "Deploy from GitHub repo"
3. Choisissez le repo `ikasso-` et le dossier `email-server`
4. Railway détectera automatiquement le `package.json`

### Étape 3 : Configurer les variables d'environnement
Dans Railway, allez dans l'onglet **Variables** et ajoutez :

```
SMTP_HOST=mail1.netim.hosting
SMTP_PORT=465
SMTP_USER=noreply@ikasso.ml
SMTP_PASSWORD=94Valenton
```

### Étape 4 : Obtenir l'URL du serveur
Railway vous donnera une URL du type : `https://ikasso-email-production.up.railway.app`

### Étape 5 : Configurer Vercel
Sur Vercel, ajoutez la variable :
```
EMAIL_SERVER_URL=https://votre-url-railway.up.railway.app
```

## 🧪 Test local

```bash
cd email-server
npm install
node server.js
```

Le serveur démarre sur http://localhost:3001

## 📧 Routes API

### GET /
Health check du serveur

### POST /send-verification
Envoie un email de vérification
```json
{
  "email": "utilisateur@example.com",
  "name": "John Doe",
  "code": "123456"
}
```

### POST /send-sms
Envoie un SMS (à implémenter)
```json
{
  "phone": "+223 70 00 00 00",
  "code": "1234"
}
```

