# 🎯 VOS ENREGISTREMENTS DNS EXACTS POUR VERCEL

## ⚠️ IMPORTANT : Copier ces valeurs EXACTEMENT

Vous avez déjà ajouté le domaine sur Resend. Maintenant, vous devez ajouter ces enregistrements DNS sur **Vercel**.

---

## 📋 ÉTAPE 1 : Aller sur Vercel

1. Aller sur **https://vercel.com**
2. Se connecter à votre compte
3. Ouvrir le projet **ikasso-pwxa**
4. Menu → **Settings** → **Domains**
5. Trouver **ikasso.ml** dans la liste
6. Cliquer sur les **3 points (⋮)** à droite de ikasso.ml
7. Sélectionner **"Manage DNS Records"** ou **"Edit"**

---

## 📝 ÉTAPE 2 : Ajouter les 3 Enregistrements DNS

### ✅ Enregistrement 1 : DKIM (OBLIGATOIRE)

**Cliquer sur "Add Record" et entrer :**

```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMAAAGCSqGSIb3DQEB... (LA VALEUR COMPLÈTE DEPUIS RESEND)
TTL: 60 (ou Auto)
```

**⚠️ IMPORTANT** : 
- Sur Resend, cliquer sur la valeur DKIM (p=MIGfMAAAGCSqGSIb3DQEB...) 
- La copier EN ENTIER (elle est longue, environ 200-300 caractères)
- La coller dans Vercel

**Sur Resend, cette valeur s'affiche comme :**
```
resend._domainkey  →  p=MIGfMAAAGCSqGSIb3DQEB...
```

---

### ✅ Enregistrement 2 : SPF

**Cliquer sur "Add Record" et entrer :**

```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: 60
```

**Note :** Le Name est "send" (pas "@") selon votre configuration Resend.

---

### ✅ Enregistrement 3 : MX

**Cliquer sur "Add Record" et entrer :**

```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: 60
```

**Note :** Le Name est "send" (pas "@") selon votre configuration Resend.

---

### ⭐ Enregistrement 4 : DMARC (Optionnel mais recommandé)

**Cliquer sur "Add Record" et entrer :**

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto
```

---

## ✅ ÉTAPE 3 : Sauvegarder les Enregistrements

1. Cliquer sur **"Save"** pour chaque enregistrement ajouté
2. Vérifier que tous les 3 (ou 4) enregistrements sont bien ajoutés

---

## ⏱️ ÉTAPE 4 : Attendre la Propagation DNS

1. Attendre **5 à 15 minutes** (parfois jusqu'à 30 min)
2. Retourner sur **Resend**
3. Aller sur **Domains** → **ikasso.ml**
4. Cliquer sur **"Verify DNS Records"** (le bouton noir en haut)
5. Le statut devrait passer de **"Not Started"** à **"Verified"** (vert) ✅

---

## 🔑 ÉTAPE 5 : Créer la Clé API Resend

**Pendant que les DNS se propagent, créez la clé API :**

1. Sur Resend, menu de gauche → **"API Keys"**
2. Cliquer sur **"+ Create API Key"**
3. Remplir :
   - **Name** : `Ikasso Production`
   - **Permission** : **Sending access** (ou Full access)
   - **Domain** : `ikasso.ml`
4. Cliquer sur **"Add"** ou **"Create"**
5. **⚠️ COPIER IMMÉDIATEMENT LA CLÉ** (format : `re_xxxxxxxxxxxxx`)
6. La clé ne sera visible **qu'une seule fois** !
7. Coller la clé dans un endroit sûr temporairement

---

## 🚀 ÉTAPE 6 : Ajouter la Clé API sur Vercel

1. Sur **Vercel** → Projet **ikasso-pwxa**
2. Menu → **Settings** → **Environment Variables**
3. Cliquer sur **"Add New"** ou **"+"**
4. Remplir :
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_xxxxxxxxxxxxx` (coller votre clé copiée)
   - **Environment** : Cocher **les 3 options** :
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
5. Cliquer sur **"Save"**

---

## 🔄 ÉTAPE 7 : Redéployer le Projet

1. Sur Vercel → Onglet **"Deployments"**
2. Cliquer sur le déploiement le plus récent (en haut)
3. Cliquer sur les **3 points (⋮)** en haut à droite
4. Sélectionner **"Redeploy"**
5. Confirmer avec **"Redeploy"**
6. Attendre que le statut soit **"Ready"** (vert) ✅

**Temps estimé : 1-2 minutes**

---

## ✅ ÉTAPE 8 : TESTER !

1. Ouvrir **https://ikasso-pwxa.vercel.app**
2. Aller sur la page d'inscription
3. Remplir le formulaire avec **VOTRE vrai email**
4. Soumettre le formulaire
5. **Vérifier votre boîte mail** 📧

### Vous devriez recevoir :
- ✅ Email de **Ikasso <noreply@ikasso.ml>**
- ✅ Sujet : **🔐 Votre code de vérification Ikasso**
- ✅ Email bien stylisé (couleurs, design)
- ✅ Code de 6 chiffres visible dans une boîte
- ✅ Email **PAS en spam**

---

## 🔍 VÉRIFICATION SUR RESEND

Après le test d'inscription :

1. Aller sur Resend → Menu **"Emails"** ou **"Logs"**
2. Vous devriez voir l'email envoyé
3. Statut : **"Delivered"** (vert avec checkmark)
4. Destinataire : votre email
5. Cliquer dessus pour voir les détails

---

## 📊 RÉSUMÉ DES VALEURS À COPIER

| Type | Name | Value | Priority | TTL |
|------|------|-------|----------|-----|
| TXT | `resend._domainkey` | `p=MIGfMAAAGCSqGSIb3DQEB...` (COPIER LA VALEUR COMPLÈTE DEPUIS RESEND) | - | 60 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | - | 60 |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 | 60 |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | - | Auto |

---

## ⚠️ NOTES IMPORTANTES

### Pour l'enregistrement DKIM :
- La valeur commence par `p=MIGf` ou `p=MIG`
- Elle fait environ 200-300 caractères
- **Vous DEVEZ copier la valeur COMPLÈTE depuis Resend**
- Ne laissez aucun espace avant ou après

### Pour vérifier que vous avez bien copié :
- Sur Resend, survolez ou cliquez sur la valeur DKIM
- Un bouton "Copy" devrait apparaître
- Cliquez dessus pour copier automatiquement
- Collez dans Vercel

---

## 🚨 SI LES DNS NE SE VÉRIFIENT PAS

### Après 30 minutes, si le statut est toujours "Not Started" :

1. **Vérifier les enregistrements sur Vercel**
   - Allez sur Vercel → Domains → ikasso.ml → DNS Records
   - Vérifiez que les 3 enregistrements sont bien là
   - Vérifiez qu'il n'y a pas d'erreurs

2. **Vérifier manuellement avec PowerShell (Windows)**
   ```powershell
   # Ouvrir PowerShell et taper :
   Resolve-DnsName -Name resend._domainkey.ikasso.ml -Type TXT
   Resolve-DnsName -Name send.ikasso.ml -Type TXT
   Resolve-DnsName -Name send.ikasso.ml -Type MX
   ```

3. **Re-cliquer sur "Verify DNS Records" sur Resend**
   - Parfois il faut cliquer plusieurs fois
   - Attendre 1 minute entre chaque clic

---

## 🎉 SUCCÈS !

Une fois que :
- ✅ Les DNS sont vérifiés (statut "Verified" sur Resend)
- ✅ La clé API est ajoutée sur Vercel
- ✅ Le projet est redéployé
- ✅ Le test d'inscription fonctionne

**Félicitations ! Les emails fonctionnent ! 🎊**

Chaque nouvel utilisateur recevra automatiquement son code de vérification par email depuis `noreply@ikasso.ml`.

---

## 📞 BESOIN D'AIDE ?

Si vous rencontrez un problème :
1. Vérifiez **EMAIL_SETUP_GUIDE.md** (section Dépannage)
2. Vérifiez les logs sur Vercel → Deployments → Latest → Functions
3. Vérifiez les logs sur Resend → Emails

---

**Bon courage ! Vous y êtes presque ! 💪**

*Temps total estimé : 15-30 minutes*
