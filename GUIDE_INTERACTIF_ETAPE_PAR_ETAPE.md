# 🎯 GUIDE INTERACTIF - Configuration Emails Ikasso

## 📋 Comment ça marche ?

**Nous allons faire ça ensemble, étape par étape !**

1. Vous suivez les étapes ci-dessous
2. À chaque étape, vous prenez une **capture d'écran**
3. Vous me l'envoyez et je vérifie que c'est correct
4. On passe à l'étape suivante

**Temps estimé : 15-20 minutes**

---

## ✅ ÉTAPE 1 : Vérifier Resend

### Action :
1. Ouvrir **https://resend.com**
2. Se connecter avec `ibrahim.sanogo63@gmail.com`
3. Aller sur **Domains** (menu de gauche)
4. Vérifier que **ikasso.ml** est bien là

### Capture d'écran attendue :
Vous devriez voir :
- Domain: **ikasso.ml**
- Status: **Not Started** (en gris)
- Region: **Ireland (eu-west-1)**

### ✅ Fait ? Passez à l'étape 2

---

## ✅ ÉTAPE 2 : Copier la valeur DKIM depuis Resend

### Action :
1. Sur Resend, cliquer sur le domaine **ikasso.ml**
2. Descendre jusqu'à la section **"DNS Records"**
3. Trouver l'enregistrement **DKIM** (le premier)
4. **Cliquer sur la valeur** qui commence par `p=MIGf...`
5. Un bouton **"Copy"** devrait apparaître
6. **Cliquer sur Copy**

### 📋 À noter :
- La valeur fait environ 200-300 caractères
- Elle commence par `p=MIGfMA0GCSqGSIb3DQEB...`
- Elle est maintenant dans votre presse-papier

### ✅ Valeur DKIM copiée ? Passez à l'étape 3

---

## ✅ ÉTAPE 3 : Aller sur Vercel - Domaines

### Action :
1. Ouvrir **https://vercel.com**
2. Se connecter à votre compte
3. Cliquer sur le projet **ikasso-pwxa**
4. Menu → **Settings** (en haut)
5. Dans le menu de gauche → **Domains**

### Capture d'écran attendue :
Vous devriez voir :
- **ikasso.ml** dans la liste
- Statut : **Valid Configuration** (ou similaire)

### ✅ Sur la page Domains ? Passez à l'étape 4

---

## ✅ ÉTAPE 4 : Accéder aux DNS Records

### Action :
1. Sur la ligne **ikasso.ml**
2. À droite, cliquer sur les **3 points (⋮)**
3. Sélectionner **"Manage DNS Records"** ou **"Edit"** ou **"View DNS Records"**

### Capture d'écran attendue :
Vous devriez voir :
- Une liste d'enregistrements DNS existants
- Un bouton **"Add Record"** ou **"+"** en haut

### ✅ Sur la page DNS Records ? Passez à l'étape 5

---

## ✅ ÉTAPE 5 : Ajouter l'enregistrement DKIM

### Action :
1. Cliquer sur **"Add Record"** ou **"+"**
2. Remplir les champs :

```
Type: TXT
Name: resend._domainkey
Value: [COLLER la valeur DKIM copiée à l'étape 2]
TTL: 60 (ou laisser par défaut)
```

3. Vérifier que la valeur commence bien par `p=MIGf`
4. **Cliquer sur "Save"** ou **"Add"**

### ⚠️ ATTENTION :
- Ne pas mettre d'espaces avant/après
- Coller TOUTE la valeur (très longue)

### ✅ Enregistrement DKIM ajouté ? Passez à l'étape 6

---

## ✅ ÉTAPE 6 : Ajouter l'enregistrement SPF

### Action :
1. Cliquer à nouveau sur **"Add Record"**
2. Remplir les champs :

```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: 60
```

3. **Cliquer sur "Save"**

### ⚠️ COPIER EXACTEMENT :
`v=spf1 include:amazonses.com ~all`

### ✅ Enregistrement SPF ajouté ? Passez à l'étape 7

---

## ✅ ÉTAPE 7 : Ajouter l'enregistrement MX

### Action :
1. Cliquer à nouveau sur **"Add Record"**
2. Remplir les champs :

```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: 60
```

3. **Cliquer sur "Save"**

### ⚠️ COPIER EXACTEMENT :
`feedback-smtp.eu-west-1.amazonses.com`

### ✅ Enregistrement MX ajouté ? Passez à l'étape 8

---

## ✅ ÉTAPE 8 : Ajouter DMARC (Optionnel)

### Action :
1. Cliquer sur **"Add Record"**
2. Remplir :

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto
```

3. **Cliquer sur "Save"**

### ✅ DMARC ajouté ? Passez à l'étape 9

---

## ✅ ÉTAPE 9 : Vérifier les DNS sur Resend

### Action :
1. **Retourner sur Resend**
2. Aller sur **Domains** → **ikasso.ml**
3. En haut, cliquer sur le bouton noir **"Verify DNS Records"**
4. **Attendre 10-15 minutes** ⏱️

### Résultat attendu :
- Status passe de **"Not Started"** à **"Verified"** (vert avec ✓)

### ⚠️ Si ça ne marche pas immédiatement :
- Attendre 15 minutes
- Re-cliquer sur "Verify DNS Records"
- Répéter jusqu'à ce que ça soit vérifié

### ✅ Statut "Verified" ? Passez à l'étape 10

---

## ✅ ÉTAPE 10 : Créer la clé API Resend

### Action :
1. Sur Resend, menu de gauche → **"API Keys"**
2. Cliquer sur **"+ Create API Key"** (en haut à droite)
3. Remplir :
   - **Name** : `Ikasso Production`
   - **Permission** : **Sending access**
   - **Domain** : `ikasso.ml`
4. Cliquer sur **"Add"** ou **"Create"**

### ⚠️ IMPORTANT :
5. Une clé s'affiche (format : `re_xxxxxxxxxxxxx`)
6. **COPIER IMMÉDIATEMENT cette clé**
7. La coller dans un Notepad temporairement
8. ⚠️ **Elle ne sera visible qu'UNE SEULE FOIS !**

### ✅ Clé API copiée ? Passez à l'étape 11

---

## ✅ ÉTAPE 11 : Ajouter la clé API sur Vercel

### Action :
1. **Retourner sur Vercel**
2. Projet **ikasso-pwxa**
3. Menu → **Settings**
4. Dans le menu de gauche → **Environment Variables**
5. Cliquer sur **"Add New"** ou **"+"**

### Remplir :
```
Name: RESEND_API_KEY
Value: [COLLER la clé API copiée à l'étape 10]
Environment: ✅ Cocher les 3 :
  - ✅ Production
  - ✅ Preview
  - ✅ Development
```

6. Cliquer sur **"Save"**

### Capture d'écran attendue :
Vous devriez voir la variable ajoutée :
- **RESEND_API_KEY** : `re_xxx...` (masqué)
- Environments : Production, Preview, Development

### ✅ Variable ajoutée ? Passez à l'étape 12

---

## ✅ ÉTAPE 12 : Redéployer le projet

### Action :
1. Sur Vercel, onglet **"Deployments"** (en haut)
2. Cliquer sur le **premier déploiement** (le plus récent)
3. En haut à droite, cliquer sur les **3 points (⋮)**
4. Sélectionner **"Redeploy"**
5. Confirmer en cliquant à nouveau sur **"Redeploy"**

### Résultat attendu :
- Un nouveau déploiement démarre
- Attendre 1-2 minutes
- Le statut passe à **"Ready"** (vert avec ✓)

### ✅ Déploiement réussi (Ready) ? Passez à l'étape 13

---

## ✅ ÉTAPE 13 : TESTER L'INSCRIPTION !

### Action :
1. Ouvrir **https://ikasso-pwxa.vercel.app**
2. Aller sur la page **Inscription**
3. Remplir le formulaire avec **VOTRE vrai email**
4. Soumettre le formulaire

### Résultat attendu :
5. **Ouvrir votre boîte mail** 📧
6. Vous devriez avoir reçu un email de **Ikasso <noreply@ikasso.ml>**
7. Sujet : **🔐 Votre code de vérification Ikasso**
8. Email stylisé avec un code à 6 chiffres

### ✅ Email reçu ? **FÉLICITATIONS ! 🎉**

---

## ✅ ÉTAPE 14 : Vérifier sur Resend

### Action :
1. Sur Resend → Menu **"Emails"** (à gauche)
2. Vous devriez voir l'email envoyé
3. Status : **"Delivered"** (vert avec ✓)
4. Cliquer dessus pour voir les détails

### ✅ Email visible dans les logs ? **PARFAIT ! ✅**

---

## 🎉 CONFIGURATION TERMINÉE !

**Bravo ! Les emails fonctionnent maintenant !**

Chaque nouvel utilisateur qui s'inscrit sur Ikasso recevra automatiquement un email de vérification professionnel depuis `noreply@ikasso.ml`.

---

## 📊 RÉCAPITULATIF

✅ Domaine ikasso.ml vérifié sur Resend
✅ 3 enregistrements DNS ajoutés sur Vercel
✅ Clé API Resend créée et ajoutée sur Vercel
✅ Projet redéployé
✅ Test d'inscription réussi
✅ Email reçu et stylis é

**Système 100% opérationnel ! 🚀**

---

## 🆘 BESOIN D'AIDE À UNE ÉTAPE ?

**Partagez une capture d'écran de votre écran** et dites-moi à quelle étape vous êtes bloqué.

Je vous guiderai précisément sur quoi cliquer !

---

*Guide créé le : 22 novembre 2025*
*Temps total estimé : 15-30 minutes*
