# 🔐 Guide Configuration OAuth - Google & Apple

## 📋 État Actuel

✅ Boutons Google et Apple présents sur la page de connexion  
⚠️ Configuration OAuth nécessaire pour activer la fonctionnalité  
✅ Message informatif affiché lors du clic  

---

## 🎯 Pour Activer la Connexion Google

### Étape 1 : Créer un Projet Google Cloud

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet "Ikasso"
3. Activez "Google+ API"

### Étape 2 : Configurer OAuth 2.0

1. Dans le menu, allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth client ID**
3. Type d'application : **Web application**
4. Nom : `Ikasso Web`
5. **Authorized JavaScript origins** :
   - `https://ikasso-pwxa.vercel.app`
   - `http://localhost:3000` (pour le développement)
6. **Authorized redirect URIs** :
   - `https://ikasso-pwxa.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`

### Étape 3 : Récupérer les Credentials

- **Client ID** : `xxxxx.apps.googleusercontent.com`
- **Client Secret** : `xxxxx`

### Étape 4 : Ajouter sur Vercel

Variables d'environnement à ajouter :
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
NEXTAUTH_URL=https://ikasso-pwxa.vercel.app
NEXTAUTH_SECRET=générer_avec_openssl_rand_base64_32
```

---

## 🍎 Pour Activer la Connexion Apple

### Étape 1 : Apple Developer Account

1. Créer un compte Apple Developer (99$/an)
2. Allez sur https://developer.apple.com

### Étape 2 : Créer un App ID

1. **Certificates, Identifiers & Profiles** → **Identifiers**
2. Cliquez sur **+** pour créer un App ID
3. Sélectionnez **App IDs** → **Continue**
4. Type : **App**
5. Description : `Ikasso Web`
6. Bundle ID : `com.ikasso.web`
7. Cochez **Sign in with Apple**

### Étape 3 : Créer un Service ID

1. **Identifiers** → **+** → **Services IDs**
2. Description : `Ikasso Web Sign In`
3. Identifier : `com.ikasso.web.signin`
4. Cochez **Sign in with Apple** → **Configure**
5. **Domains and Subdomains** :
   - `ikasso-pwxa.vercel.app`
6. **Return URLs** :
   - `https://ikasso-pwxa.vercel.app/api/auth/callback/apple`

### Étape 4 : Créer une Key

1. **Keys** → **+**
2. Key Name : `Ikasso Apple Sign In Key`
3. Cochez **Sign in with Apple**
4. **Téléchargez le fichier .p8** (ne peut être téléchargé qu'une seule fois !)
5. Notez le **Key ID**

### Étape 5 : Récupérer les Credentials

- **Service ID** : `com.ikasso.web.signin`
- **Team ID** : Trouvé dans Membership
- **Key ID** : De l'étape 4
- **Private Key** : Contenu du fichier .p8

### Étape 6 : Ajouter sur Vercel

Variables d'environnement :
```
APPLE_ID=com.ikasso.web.signin
APPLE_TEAM_ID=xxxxx
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
APPLE_KEY_ID=xxxxx
```

---

## 🔧 Configuration NextAuth (apps/web/app/api/auth/[...nextauth]/route.ts)

```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: {
        appleId: process.env.APPLE_ID!,
        teamId: process.env.APPLE_TEAM_ID!,
        privateKey: process.env.APPLE_PRIVATE_KEY!,
        keyId: process.env.APPLE_KEY_ID!,
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Sauvegarder l'utilisateur dans localStorage ou base de données
      const userData = {
        email: user.email,
        name: user.name,
        image: user.image,
        provider: account?.provider,
        userType: 'client',
        emailVerified: true,
        phoneVerified: false,
        memberSince: new Date().toLocaleDateString('fr-FR'),
        avatar: user.image,
        totalBookings: 0,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      }
      
      // TODO: Sauvegarder dans la base de données
      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl + '/dashboard'
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
})

export { handler as GET, handler as POST }
```

---

## 📝 Mettre à Jour la Page de Connexion

Dans `apps/web/app/auth/login/page.tsx`, remplacer les simulations par :

```typescript
import { signIn } from 'next-auth/react'

// Bouton Google
<button 
  type="button"
  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
  className="..."
>
  ...
</button>

// Bouton Apple
<button 
  type="button"
  onClick={() => signIn('apple', { callbackUrl: '/dashboard' })}
  className="..."
>
  ...
</button>
```

---

## ⚠️ Important

### Coûts
- **Google OAuth** : Gratuit
- **Apple Sign In** : Nécessite Apple Developer Program (99$/an)

### Sécurité
- Ne jamais commit les secrets dans Git
- Utiliser uniquement les variables d'environnement
- Régénérer les secrets régulièrement

### Limites
- Google : 10,000 requêtes/jour (gratuit)
- Apple : Pas de limite spécifique

---

## 🧪 Test

### En développement (localhost)
1. Ajouter les variables dans `.env.local`
2. Redémarrer le serveur
3. Tester la connexion

### En production (Vercel)
1. Ajouter les variables dans Settings → Environment Variables
2. Redéployer
3. Tester sur le site live

---

## 📞 Support

Pour toute question sur la configuration OAuth :
- Google : https://console.cloud.google.com/support
- Apple : https://developer.apple.com/support/
- NextAuth : https://next-auth.js.org/

---

*Note : Pour l'instant, les boutons affichent un message informatif. L'activation complète nécessite la configuration ci-dessus.*



