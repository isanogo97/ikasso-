# ⚡ GUIDE RAPIDE - Configuration Emails en 15 Minutes

## 🎯 Objectif
Activer l'envoi d'emails RÉELS pour les codes de vérification Ikasso.

---

## ✅ CHECKLIST ÉTAPE PAR ÉTAPE

### □ ÉTAPE 1 : Resend - Ajouter le domaine (5 min)

1. ☐ Aller sur https://resend.com/login
2. ☐ Se connecter avec : `ibrahim.sanogo63@gmail.com`
3. ☐ Menu → **Domains** → **+ Add Domain**
4. ☐ Entrer : `ikasso.ml`
5. ☐ Region : **EU (Europe)**
6. ☐ Cliquer sur **Add**
7. ☐ **NOTER les 3 enregistrements DNS** (ou garder la page ouverte)

---

### □ ÉTAPE 2 : Vercel - Configurer les DNS (10 min)

1. ☐ Aller sur https://vercel.com
2. ☐ Ouvrir le projet **ikasso-pwxa**
3. ☐ Menu → **Settings** → **Domains**
4. ☐ Trouver `ikasso.ml` → Cliquer sur **⋮** → **Manage DNS Records**

#### Ajouter ces 3 enregistrements :

**Enregistrement 1 - DKIM** ✅
```
Type: TXT
Name: resend._domainkey
Value: [Copier depuis Resend - commence par "p=MIGf..."]
TTL: 3600
```
☐ Enregistrement DKIM ajouté

---

**Enregistrement 2 - SPF** ✅
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
TTL: 3600
```
☐ Enregistrement SPF ajouté

---

**Enregistrement 3 - MX** ✅
```
Type: MX
Name: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: 3600
```
☐ Enregistrement MX ajouté

---

**Enregistrement 4 - DMARC (Optionnel)** ⭐
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@ikasso.ml
TTL: 3600
```
☐ Enregistrement DMARC ajouté (recommandé)

---

5. ☐ Retourner sur Resend → **Domains** → **ikasso.ml**
6. ☐ Cliquer sur **Verify DNS Records**
7. ☐ Attendre 5-15 minutes
8. ☐ Vérifier que le statut est **"Verified"** (vert) ✅

---

### □ ÉTAPE 3 : Resend - Obtenir la clé API (2 min)

1. ☐ Sur Resend → Menu → **API Keys**
2. ☐ Cliquer sur **+ Create API Key**
3. ☐ Name : `Ikasso Production`
4. ☐ Permission : **Sending access**
5. ☐ Domain : `ikasso.ml`
6. ☐ Cliquer sur **Add**
7. ☐ **COPIER LA CLÉ** (format : `re_xxxxx...`) ⚠️ **Une seule fois !**
8. ☐ Coller la clé temporairement dans un endroit sûr

---

### □ ÉTAPE 4 : Vercel - Ajouter la variable d'environnement (3 min)

1. ☐ Sur Vercel → Projet **ikasso-pwxa**
2. ☐ Menu → **Settings** → **Environment Variables**
3. ☐ Cliquer sur **Add New**
4. ☐ Name : `RESEND_API_KEY`
5. ☐ Value : `re_xxxxx...` (coller votre clé)
6. ☐ Environment : Cocher **les 3 options**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. ☐ Cliquer sur **Save**

---

### □ ÉTAPE 5 : Vercel - Redéployer (2 min)

1. ☐ Sur Vercel → Onglet **Deployments**
2. ☐ Cliquer sur le déploiement le plus récent
3. ☐ Cliquer sur **⋮** (3 points)
4. ☐ Sélectionner **Redeploy**
5. ☐ Confirmer avec **Redeploy**
6. ☐ Attendre que le statut soit **"Ready"** (vert) ✅

---

### □ ÉTAPE 6 : Test - Vérifier que ça marche (5 min)

1. ☐ Ouvrir https://ikasso-pwxa.vercel.app
2. ☐ Aller sur la page d'inscription
3. ☐ Remplir le formulaire avec **VOTRE email** (pour tester)
4. ☐ Soumettre le formulaire
5. ☐ **Vérifier votre boîte mail** 📧
6. ☐ Email reçu de `noreply@ikasso.ml` ✅
7. ☐ Code de vérification visible ✅
8. ☐ Design stylisé ✅

---

## ✅ VÉRIFICATION FINALE

### Tout fonctionne si :
- ✅ Email reçu dans les 30 secondes
- ✅ Expéditeur : `Ikasso <noreply@ikasso.ml>`
- ✅ Sujet : `🔐 Votre code de vérification Ikasso`
- ✅ Email bien stylisé (couleurs, logo)
- ✅ Code de 6 chiffres visible dans une boîte
- ✅ Email **PAS en spam**

---

## 🚨 DÉPANNAGE RAPIDE

### ❌ "Email non reçu"
**Solutions :**
1. Vérifier les spams
2. Attendre 1-2 minutes
3. Vérifier que le domaine est vérifié sur Resend (statut "Verified")
4. Vérifier les logs sur Vercel → Deployments → Latest → Functions

### ❌ "Domain not verified"
**Solutions :**
1. Attendre 15 minutes de plus pour propagation DNS
2. Vérifier que les 3 DNS sont bien ajoutés sur Vercel
3. Sur Resend → Domains → ikasso.ml → "Verify DNS Records"

### ❌ "Invalid API key"
**Solutions :**
1. Vérifier la variable `RESEND_API_KEY` sur Vercel
2. Vérifier qu'il n'y a pas d'espaces avant/après la clé
3. Redéployer le projet

---

## 🎯 MODE TEST RAPIDE (Sans DNS)

Si vous voulez tester en 5 minutes sans configurer les DNS :

1. ☐ **Étape 3** : Obtenir la clé API Resend
2. ☐ **Étape 4** : Ajouter `RESEND_API_KEY` sur Vercel
3. ☐ **Étape 5** : Redéployer
4. ☐ **Test** : S'inscrire avec `ibrahim.sanogo63@gmail.com` uniquement

⚠️ **Limite** : Sans DNS vérifié, les emails ne sont envoyés qu'à l'email du compte Resend.

---

## 📋 RÉSUMÉ ULTRA-RAPIDE

```
1. Resend → + Add Domain → ikasso.ml → Noter DNS
2. Vercel → Settings → Domains → ikasso.ml → Ajouter 3 DNS
3. Resend → API Keys → Créer → Copier re_xxx
4. Vercel → Settings → Env Variables → RESEND_API_KEY=re_xxx
5. Vercel → Redeploy
6. Test → Inscription → Email reçu ✅
```

**Temps total : 15-30 minutes**

---

## 📞 LIENS UTILES

- **Resend** : https://resend.com
- **Vercel** : https://vercel.com
- **Site Ikasso** : https://ikasso-pwxa.vercel.app
- **Guide complet** : Voir `EMAIL_SETUP_GUIDE.md`

---

## 🎉 FÉLICITATIONS !

Une fois terminé, chaque nouvel utilisateur recevra automatiquement un email de vérification professionnel depuis `noreply@ikasso.ml` ! 

**Bon travail ! 🚀**

---

*Temps estimé : 15-30 minutes (selon propagation DNS)*
*Dernière mise à jour : 22 novembre 2025*
