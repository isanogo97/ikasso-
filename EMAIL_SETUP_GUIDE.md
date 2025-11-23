# 📧 Guide Configuration Emails Ikasso - SOLUTION COMPLÈTE

## 🎯 Objectif
Activer l'envoi d'emails RÉELS depuis `noreply@ikasso.ml` pour les codes de vérification.

---

## ✅ ÉTAT ACTUEL

### Ce qui est déjà fait ✓
- ✅ Package Resend installé (v6.5.2)
- ✅ API route créée : `/apps/web/app/api/send-email-verification/route.ts`
- ✅ Email HTML stylisé prêt
- ✅ Compte Resend créé : ibrahim.sanogo63@gmail.com
- ✅ Code déployé sur Vercel
- ✅ Domaine ikasso.ml acheté et actif

### Ce qu'il reste à faire ⚠️
- ⬜ Obtenir la clé API Resend
- ⬜ Configurer les DNS sur Vercel
- ⬜ Ajouter la variable d'environnement sur Vercel
- ⬜ Redéployer le projet
- ⬜ Tester l'envoi d'emails

---

## 📋 ÉTAPES À SUIVRE (dans l'ordre)

### ÉTAPE 1 : Ajouter le domaine sur Resend

1. **Aller sur Resend**
   - URL : https://resend.com/login
   - Se connecter avec : `ibrahim.sanogo63@gmail.com`

2. **Accéder aux domaines**
   - Menu latéral → **"Domains"**
   - Cliquer sur **"+ Add Domain"**

3. **Ajouter ikasso.ml**
   - Domain : `ikasso.ml`
   - Region : **EU (Europe)** (recommandé pour le Mali)
   - Cliquer sur **"Add"**

4. **Noter les enregistrements DNS**
   Resend va afficher 3 enregistrements DNS à configurer. **NOTEZ-LES** ou gardez la page ouverte.

---

### ÉTAPE 2 : Configurer les DNS sur Vercel (RECOMMANDÉ)

#### Option A : Via l'interface Vercel (Plus simple)

1. **Aller sur Vercel**
   - URL : https://vercel.com
   - Se connecter et ouvrir le projet **ikasso-pwxa**

2. **Accéder aux DNS du domaine**
   - Menu : **Settings** → **Domains**
   - Trouver `ikasso.ml` dans la liste
   - Cliquer sur les **3 points (⋮)** à droite
   - Sélectionner **"Manage DNS Records"** ou **"Edit"**

3. **Ajouter les 3 enregistrements Resend**

   **🔐 Enregistrement 1 : DKIM (OBLIGATOIRE)**
   ```
   Type: TXT
   Name: resend._domainkey
   Value: [Copier la valeur depuis Resend - commence par "p=MIGf..."]
   TTL: 3600 (ou Auto)
   ```

   **📧 Enregistrement 2 : SPF**
   ```
   Type: TXT
   Name: @ (ou ikasso.ml ou laisser vide)
   Value: v=spf1 include:amazonses.com ~all
   TTL: 3600
   ```

   **📬 Enregistrement 3 : MX**
   ```
   Type: MX
   Name: @ (ou laisser vide)
   Value: feedback-smtp.eu-west-1.amazonses.com
   Priority: 10
   TTL: 3600
   ```

   **🛡️ Enregistrement 4 : DMARC (OPTIONNEL mais recommandé)**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:admin@ikasso.ml
   TTL: 3600
   ```

4. **Sauvegarder**
   - Cliquer sur **"Save"** pour chaque enregistrement

5. **Vérifier sur Resend**
   - Retourner sur Resend → Domains → ikasso.ml
   - Cliquer sur **"Verify DNS Records"**
   - ⏱️ Attendre 5-15 minutes pour la propagation DNS
   - ✅ Le statut devrait passer à **"Verified"**

---

#### Option B : Via Netim (Alternative si Vercel ne permet pas)

Si Vercel ne permet pas d'ajouter des enregistrements DNS :

1. **Aller sur Netim**
   - URL : https://www.netim.com
   - Se connecter avec vos identifiants

2. **Accéder à la gestion DNS**
   - Menu → **Mes domaines**
   - Cliquer sur **ikasso.ml**
   - Onglet **"Zone DNS"** ou **"DNS Management"**

3. **Changer les serveurs DNS (si nécessaire)**
   - Si les DNS sont ceux de Vercel, il faut les remettre sur Netim
   - **⚠️ ATTENTION** : Cela va temporairement couper l'accès au site
   - Serveurs DNS Netim :
     ```
     ns1.netim.hosting
     ns2.netim.hosting
     ```

4. **Ajouter les enregistrements DNS**
   - Suivre les mêmes enregistrements que l'Option A
   - Ajouter AUSSI un enregistrement A pour pointer vers Vercel :
     ```
     Type: A
     Name: @ (ou laisser vide)
     Value: 76.76.21.21
     TTL: 3600
     ```

5. **Attendre la propagation**
   - ⏱️ Délai : 24 à 48 heures maximum
   - Vérifier avec : https://www.whatsmydns.net/#A/ikasso.ml

---

### ÉTAPE 3 : Obtenir la clé API Resend

1. **Sur Resend**
   - Menu → **"API Keys"**
   - Cliquer sur **"+ Create API Key"**

2. **Créer la clé**
   - Name : `Ikasso Production`
   - Permission : **Sending access** (Full access si besoin)
   - Domain : `ikasso.ml`
   - Cliquer sur **"Add"**

3. **COPIER LA CLÉ IMMÉDIATEMENT**
   - Format : `re_xxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **IMPORTANT** : Cette clé ne sera visible qu'une seule fois !
   - La coller dans un endroit sûr temporairement

---

### ÉTAPE 4 : Ajouter la variable d'environnement sur Vercel

1. **Aller sur Vercel**
   - Ouvrir le projet : **ikasso-pwxa**

2. **Accéder aux variables d'environnement**
   - Menu → **Settings**
   - Section → **Environment Variables**

3. **Ajouter la clé API**
   - **Name** : `RESEND_API_KEY`
   - **Value** : `re_xxxxxxxxxxxxxxxxxxxxx` (coller votre clé)
   - **Environment** : Cocher les 3 options
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Cliquer sur **"Save"**

---

### ÉTAPE 5 : Redéployer le projet

1. **Sur Vercel**
   - Aller dans l'onglet **"Deployments"**
   - Cliquer sur le déploiement le plus récent
   - Cliquer sur les **3 points (⋮)**
   - Sélectionner **"Redeploy"**
   - Confirmer avec **"Redeploy"**

2. **Attendre le build**
   - ⏱️ Délai : 1-2 minutes
   - Vérifier que le statut est **"Ready"** (vert)

---

### ÉTAPE 6 : Tester l'envoi d'emails

#### Test 1 : Via le site en production

1. **Ouvrir le site**
   - URL : https://ikasso-pwxa.vercel.app

2. **Créer un nouveau compte**
   - Aller sur la page d'inscription
   - Remplir le formulaire avec un **vrai email** (le vôtre pour tester)
   - Soumettre le formulaire

3. **Vérifier**
   - ✅ Vous devriez recevoir un email de `noreply@ikasso.ml`
   - ✅ L'email contient le code de vérification
   - ✅ Le design est stylisé comme prévu

#### Test 2 : Via les logs Vercel

1. **Vérifier les logs sur Vercel**
   - Projet → **Deployments** → **Latest deployment**
   - Onglet **"Functions"** ou **"Logs"**
   - Chercher les logs de `/api/send-email-verification`
   - Vérifier qu'il n'y a pas d'erreurs

#### Test 3 : Via Resend

1. **Sur Resend**
   - Menu → **"Logs"** ou **"Emails"**
   - Vous devriez voir les emails envoyés
   - Statut : **"Delivered"** (vert)

---

## 🔍 DÉPANNAGE

### Problème 1 : "Domain not verified"

**Cause** : Les DNS ne sont pas encore propagés

**Solution** :
- Attendre 15-30 minutes de plus
- Vérifier que les enregistrements DNS sont corrects
- Sur Resend → Domains → ikasso.ml → "Verify DNS Records"

---

### Problème 2 : "Invalid API key"

**Cause** : La clé API n'est pas correctement configurée

**Solution** :
- Vérifier que la variable `RESEND_API_KEY` est bien ajoutée sur Vercel
- Vérifier qu'il n'y a pas d'espaces avant/après la clé
- Redéployer le projet après avoir ajouté la variable

---

### Problème 3 : Emails en spam

**Cause** : DNS mal configurés ou manquants

**Solution** :
- Vérifier que les 3 enregistrements DNS sont bien ajoutés (DKIM, SPF, MX)
- Ajouter l'enregistrement DMARC
- Vérifier sur https://mxtoolbox.com/SuperTool.aspx?action=dkim%3aikasso.ml

---

### Problème 4 : "Emails not sending from noreply@ikasso.ml"

**Cause** : Le domaine n'est pas vérifié sur Resend

**Solution** :
1. Sur Resend → Domains → ikasso.ml
2. Vérifier le statut (doit être "Verified" en vert)
3. Si "Unverified", cliquer sur "Verify DNS Records"
4. Attendre quelques minutes et réessayer

---

## 📊 VÉRIFICATION FINALE

### Checklist avant de considérer le projet terminé

- [ ] Compte Resend créé et connecté
- [ ] Domaine ikasso.ml ajouté sur Resend
- [ ] 3 enregistrements DNS configurés (DKIM, SPF, MX)
- [ ] Domaine vérifié sur Resend (statut "Verified")
- [ ] Clé API Resend obtenue
- [ ] Variable `RESEND_API_KEY` ajoutée sur Vercel
- [ ] Projet redéployé avec succès
- [ ] Test d'inscription réalisé avec un vrai email
- [ ] Email reçu avec le code de vérification
- [ ] Email n'est pas en spam
- [ ] Logs Vercel sans erreurs
- [ ] Logs Resend montrent "Delivered"

---

## 📧 DÉTAILS TECHNIQUES

### Enregistrements DNS complets

```dns
# DKIM - Authentification
Type: TXT
Name: resend._domainkey.ikasso.ml
Value: [Valeur fournie par Resend, commence par "p=MIGf..."]
TTL: 3600

# SPF - Anti-spam
Type: TXT
Name: ikasso.ml
Value: v=spf1 include:amazonses.com ~all
TTL: 3600

# MX - Serveur mail retour
Type: MX
Name: ikasso.ml
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: 3600

# DMARC - Politique email
Type: TXT
Name: _dmarc.ikasso.ml
Value: v=DMARC1; p=none; rua=mailto:admin@ikasso.ml
TTL: 3600
```

---

## 🚀 SOLUTION RAPIDE (Mode Test)

Si vous voulez tester IMMÉDIATEMENT sans configurer les DNS :

1. **Obtenir la clé API Resend** (Étape 3)
2. **Ajouter la variable sur Vercel** (Étape 4)
3. **Redéployer** (Étape 5)
4. **Tester avec l'email du compte Resend**
   - Resend permet d'envoyer des emails de test sans DNS vérifié
   - Mais uniquement vers l'email du compte : `ibrahim.sanogo63@gmail.com`

**Limitations** :
- ⚠️ Emails envoyés uniquement vers ibrahim.sanogo63@gmail.com
- ⚠️ Ne fonctionnera pas pour les vrais utilisateurs
- ⚠️ Bon uniquement pour les tests initiaux

---

## 📞 INFORMATIONS DE CONTACT

### Services utilisés
- **Resend** : https://resend.com
- **Vercel** : https://vercel.com
- **Netim** : https://www.netim.com

### Emails Ikasso
- noreply@ikasso.ml (envoi auto)
- admin@ikasso.ml
- contact@ikasso.ml
- support@ikasso.ml

### Mots de passe
- Emails Netim : `94Valenton`

---

## ✅ RÉSUMÉ RAPIDE (TL;DR)

1. **Resend** → Ajouter domaine `ikasso.ml` → Noter les DNS
2. **Vercel** → Domaines → ikasso.ml → Ajouter les 3 DNS (DKIM, SPF, MX)
3. **Resend** → API Keys → Créer clé → Copier `re_xxx...`
4. **Vercel** → Settings → Environment Variables → `RESEND_API_KEY=re_xxx...`
5. **Vercel** → Redeploy
6. **Test** → Inscription → Vérifier email reçu ✅

**Temps estimé** : 30 minutes à 2 heures (selon propagation DNS)

---

## 🎉 SUCCÈS !

Une fois tous les tests passés, les emails fonctionneront comme ceci :

1. Utilisateur s'inscrit sur https://ikasso-pwxa.vercel.app
2. Code de vérification généré automatiquement
3. Email envoyé depuis `noreply@ikasso.ml` via Resend
4. Utilisateur reçoit l'email avec le code stylisé
5. Utilisateur entre le code et finalise son inscription

**Félicitations ! 🎊**

---

*Dernière mise à jour : 22 novembre 2025*
