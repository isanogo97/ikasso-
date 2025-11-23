# ✅ CORRECTION - DNS à Ajouter sur Vercel

D'après votre capture d'écran Resend, voici les enregistrements EXACTS à ajouter :

---

## 📋 Section 1 : Domain Verification (DKIM)

### ✅ Enregistrement 1 : DKIM
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEB... (COPIER LA VALEUR COMPLÈTE DEPUIS RESEND)
TTL: 60 ou Auto
```

**Action** : Copier la valeur complète du DKIM depuis Resend et l'ajouter sur Vercel

---

## 📧 Section 2 : Enable Sending (SPF)

Resend affiche **2 enregistrements** sous "SPF" :

### ✅ Enregistrement 2 : MX (Envoi)
```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1-amazonses.com
Priority: 10
TTL: 60
```

### ✅ Enregistrement 3 : TXT SPF (Anti-spam)
```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: 60
```

**⚠️ IMPORTANT** : Les deux ont le même "Name" = **send** (pas "@")

---

## 🛡️ Section 3 : DMARC (Optionnel)

### ✅ Enregistrement 4 : DMARC
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto
```

---

## 📊 RÉSUMÉ - CE QU'IL FAUT AJOUTER SUR VERCEL

| # | Type | Name | Value | Priority | TTL |
|---|------|------|-------|----------|-----|
| 1 | TXT | `resend._domainkey` | `p=MIGf...` (depuis Resend) | - | 60 |
| 2 | MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | 10 | 60 |
| 3 | TXT | `send` | `v=spf1 include:amazonses.com ~all` | - | 60 |
| 4 | TXT | `_dmarc` | `v=DMARC1; p=none;` | - | Auto |

---

## 🎯 ACTIONS À FAIRE MAINTENANT

### Sur Vercel :

1. **Aller sur Vercel** → Projet ikasso-pwxa → Settings → Domains
2. Cliquer sur **⋮** à côté de ikasso.ml → "Manage DNS Records"
3. **Cliquer 4 fois sur "Add Record"** pour ajouter les 4 enregistrements ci-dessus

### Détails pour chaque enregistrement :

#### Enregistrement 1 (DKIM) :
- Cliquer "Add Record"
- Type: **TXT**
- Name: `resend._domainkey`
- Value: [COPIER depuis Resend - la longue valeur p=MIGf...]
- Cliquer "Save"

#### Enregistrement 2 (MX) :
- Cliquer "Add Record"
- Type: **MX**
- Name: `send`
- Value: `feedback-smtp.eu-west-1.amazonses.com`
- Priority: `10`
- Cliquer "Save"

#### Enregistrement 3 (SPF TXT) :
- Cliquer "Add Record"
- Type: **TXT**
- Name: `send`
- Value: `v=spf1 include:amazonses.com ~all`
- Cliquer "Save"

#### Enregistrement 4 (DMARC) :
- Cliquer "Add Record"
- Type: **TXT**
- Name: `_dmarc`
- Value: `v=DMARC1; p=none;`
- Cliquer "Save"

---

## ⏱️ Après avoir ajouté les 4 enregistrements

1. **Attendre 10-15 minutes** (propagation DNS)
2. **Retourner sur Resend**
3. Aller sur Domains → ikasso.ml
4. Cliquer sur **"Verify DNS Records"** (bouton noir en haut)
5. Le statut devrait passer à **"Verified"** ✅

---

## 📸 Captures à m'envoyer

Envoyez-moi des captures après chaque étape :

1. **Après avoir ajouté les 4 DNS sur Vercel** → Capture de la liste des DNS
2. **Après avoir cliqué "Verify" sur Resend** → Capture du statut
3. **En cas de problème** → Capture de l'erreur

---

**Prêt ? Allez sur Vercel et ajoutez ces 4 enregistrements !** 🚀
