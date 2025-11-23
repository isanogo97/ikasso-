# 🌐 Configuration DNS - Référence Visuelle

## 📋 Enregistrements DNS Requis pour Resend

Cette page détaille EXACTEMENT les enregistrements DNS à ajouter sur Vercel ou Netim pour que les emails fonctionnent avec Resend.

---

## 🔑 Vue d'ensemble

Pour envoyer des emails depuis `noreply@ikasso.ml` via Resend, vous devez ajouter **3 enregistrements DNS obligatoires** + 1 optionnel :

| Priorité | Type | Nom | Objectif |
|----------|------|-----|----------|
| ⭐⭐⭐ | TXT | `resend._domainkey` | DKIM - Authentification (OBLIGATOIRE) |
| ⭐⭐ | TXT | `@` ou racine | SPF - Anti-spam |
| ⭐⭐ | MX | `@` ou racine | Serveur mail retour |
| ⭐ | TXT | `_dmarc` | DMARC - Politique email (Recommandé) |

---

## 📝 Enregistrement 1 : DKIM (OBLIGATOIRE)

### Qu'est-ce que c'est ?
**DKIM** (DomainKeys Identified Mail) prouve que l'email vient bien de votre domaine et n'a pas été modifié.

### Configuration

```
Type: TXT
Name: resend._domainkey
Value: [LA VALEUR FOURNIE PAR RESEND - COMMENCE PAR "p=MIGf..."]
TTL: 3600 (ou Auto)
```

### ⚠️ IMPORTANT
- La **Value** sera différente pour chaque domaine
- Elle est fournie par Resend quand vous ajoutez le domaine
- Elle commence toujours par `p=MIGf` ou `p=MIG`
- Elle fait environ 200-300 caractères
- **NE PAS** inventer cette valeur - elle doit venir de Resend

### Exemple de valeur (à titre indicatif seulement)
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGMjg7qhVx9p5...
```

### Sur Vercel
1. Settings → Domains → ikasso.ml → Manage DNS Records
2. Add Record
3. Type: **TXT**
4. Name: `resend._domainkey`
5. Value: [Coller la valeur depuis Resend]
6. TTL: 3600
7. Save

### Sur Netim
1. Mes domaines → ikasso.ml → Zone DNS
2. Ajouter un enregistrement
3. Type: **TXT**
4. Sous-domaine: `resend._domainkey`
5. Valeur: [Coller la valeur depuis Resend]
6. TTL: 3600
7. Enregistrer

---

## 📧 Enregistrement 2 : SPF (Anti-spam)

### Qu'est-ce que c'est ?
**SPF** (Sender Policy Framework) indique quels serveurs sont autorisés à envoyer des emails pour votre domaine.

### Configuration

```
Type: TXT
Name: @ (ou ikasso.ml ou laisser vide)
Value: v=spf1 include:amazonses.com ~all
TTL: 3600
```

### ✅ Cette valeur est FIXE
- Pas besoin de la récupérer sur Resend
- Toujours la même : `v=spf1 include:amazonses.com ~all`
- Autorise les serveurs Amazon SES (utilisés par Resend)

### Sur Vercel
1. Settings → Domains → ikasso.ml → Manage DNS Records
2. Add Record
3. Type: **TXT**
4. Name: `@` (ou laisser vide)
5. Value: `v=spf1 include:amazonses.com ~all`
6. TTL: 3600
7. Save

### Sur Netim
1. Mes domaines → ikasso.ml → Zone DNS
2. Ajouter un enregistrement
3. Type: **TXT**
4. Sous-domaine: `@` (ou laisser vide pour la racine)
5. Valeur: `v=spf1 include:amazonses.com ~all`
6. TTL: 3600
7. Enregistrer

---

## 📬 Enregistrement 3 : MX (Serveur mail retour)

### Qu'est-ce que c'est ?
**MX** (Mail Exchange) indique où envoyer les emails de retour (bounces, erreurs).

### Configuration

```
Type: MX
Name: @ (ou laisser vide)
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: 3600
```

### ✅ Cette valeur est FIXE
- Toujours la même pour la région EU (Europe)
- Priority: 10 (standard)
- Si vous avez choisi la région US sur Resend, utilisez : `feedback-smtp.us-east-1.amazonses.com`

### Sur Vercel
1. Settings → Domains → ikasso.ml → Manage DNS Records
2. Add Record
3. Type: **MX**
4. Name: `@` (ou laisser vide)
5. Value: `feedback-smtp.eu-west-1.amazonses.com`
6. Priority: `10`
7. TTL: 3600
8. Save

### Sur Netim
1. Mes domaines → ikasso.ml → Zone DNS
2. Ajouter un enregistrement
3. Type: **MX**
4. Sous-domaine: `@` (ou laisser vide)
5. Serveur mail: `feedback-smtp.eu-west-1.amazonses.com`
6. Priorité: `10`
7. TTL: 3600
8. Enregistrer

---

## 🛡️ Enregistrement 4 : DMARC (Recommandé)

### Qu'est-ce que c'est ?
**DMARC** (Domain-based Message Authentication) définit la politique de traitement des emails qui échouent aux vérifications.

### Configuration

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@ikasso.ml
TTL: 3600
```

### ✅ Cette valeur est FIXE
- `p=none` : Mode monitoring (recommandé au début)
- `rua=mailto:admin@ikasso.ml` : Où envoyer les rapports
- Plus tard, vous pouvez changer `p=none` en `p=quarantine` ou `p=reject`

### Sur Vercel
1. Settings → Domains → ikasso.ml → Manage DNS Records
2. Add Record
3. Type: **TXT**
4. Name: `_dmarc`
5. Value: `v=DMARC1; p=none; rua=mailto:admin@ikasso.ml`
6. TTL: 3600
7. Save

### Sur Netim
1. Mes domaines → ikasso.ml → Zone DNS
2. Ajouter un enregistrement
3. Type: **TXT**
4. Sous-domaine: `_dmarc`
5. Valeur: `v=DMARC1; p=none; rua=mailto:admin@ikasso.ml`
6. TTL: 3600
7. Enregistrer

---

## 📊 Tableau Récapitulatif

| # | Type | Nom | Valeur | TTL | Priorité |
|---|------|-----|--------|-----|----------|
| 1 | TXT | `resend._domainkey` | [DEPUIS RESEND - p=MIGf...] | 3600 | - |
| 2 | TXT | `@` | `v=spf1 include:amazonses.com ~all` | 3600 | - |
| 3 | MX | `@` | `feedback-smtp.eu-west-1.amazonses.com` | 3600 | 10 |
| 4 | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:admin@ikasso.ml` | 3600 | - |

---

## ✅ Vérification des DNS

### Après avoir ajouté les enregistrements

1. **Attendre la propagation** : 5-30 minutes (parfois jusqu'à 2h)

2. **Vérifier sur Resend** :
   - Aller sur Resend → Domains → ikasso.ml
   - Cliquer sur "Verify DNS Records"
   - Le statut devrait passer à **"Verified"** (vert)

3. **Vérifier manuellement** :
   - DKIM : https://mxtoolbox.com/SuperTool.aspx?action=dkim%3Aikasso.ml%3Aresend
   - SPF : https://mxtoolbox.com/SuperTool.aspx?action=spf%3Aikasso.ml
   - MX : https://mxtoolbox.com/SuperTool.aspx?action=mx%3Aikasso.ml
   - DMARC : https://mxtoolbox.com/SuperTool.aspx?action=dmarc%3Aikasso.ml

4. **Test complet** :
   - https://www.mail-tester.com/
   - Envoyer un email de test
   - Vérifier le score (devrait être > 8/10)

---

## 🚨 Problèmes Fréquents

### ❌ "DKIM record not found"
**Causes possibles :**
- Le nom est incorrect (doit être exactement `resend._domainkey`)
- La valeur n'a pas été copiée correctement depuis Resend
- DNS pas encore propagés (attendre 15-30 min)

**Solutions :**
1. Vérifier que le nom est bien `resend._domainkey` (pas `_domainkey` tout seul)
2. Re-copier la valeur depuis Resend (elle peut être très longue)
3. Vérifier qu'il n'y a pas d'espaces avant/après la valeur
4. Attendre la propagation DNS

---

### ❌ "SPF record not found" ou "SPF too many lookups"
**Causes possibles :**
- Le nom est incorrect (doit être `@` ou racine)
- Vous avez déjà un enregistrement SPF existant
- La valeur est incorrecte

**Solutions :**
1. Si vous avez déjà un SPF, **NE PAS** créer un 2ème enregistrement SPF
2. Modifier l'existant pour ajouter `include:amazonses.com`
3. Exemple : `v=spf1 include:_spf.google.com include:amazonses.com ~all`

---

### ❌ "MX record not found"
**Causes possibles :**
- Le nom est incorrect
- La priorité n'est pas définie
- Région incorrecte (EU vs US)

**Solutions :**
1. Vérifier le nom : `@` ou racine (selon l'interface)
2. Vérifier la priorité : 10
3. Vérifier la région sur Resend (EU ou US) et adapter le serveur MX

---

### ❌ "Domain not verified after 2 hours"
**Causes possibles :**
- Serveurs DNS ne sont pas ceux attendus
- Erreur dans les enregistrements

**Solutions :**
1. Vérifier que les DNS pointent bien vers Vercel ou Netim
2. Utiliser `nslookup` ou `dig` pour vérifier :
   ```bash
   nslookup -type=TXT resend._domainkey.ikasso.ml
   nslookup -type=TXT ikasso.ml
   nslookup -type=MX ikasso.ml
   ```
3. Sur Windows PowerShell :
   ```powershell
   Resolve-DnsName -Name resend._domainkey.ikasso.ml -Type TXT
   Resolve-DnsName -Name ikasso.ml -Type TXT
   Resolve-DnsName -Name ikasso.ml -Type MX
   ```

---

## 🔄 Différences Vercel vs Netim

### Sur Vercel
- ✅ Plus simple (interface moderne)
- ✅ Propagation rapide (5-15 min)
- ✅ Pas besoin de toucher aux DNS de base
- ✅ Pas de risque de casser le site

**Recommandé si les DNS actuels sont sur Vercel**

### Sur Netim
- ⚠️ Plus complexe
- ⚠️ Propagation plus lente (15 min - 2h)
- ⚠️ Il faut potentiellement changer les serveurs DNS
- ⚠️ Risque de coupure temporaire du site

**À utiliser seulement si Vercel ne permet pas d'ajouter les enregistrements**

---

## 📞 Commandes de Vérification

### Windows PowerShell
```powershell
# Vérifier DKIM
Resolve-DnsName -Name resend._domainkey.ikasso.ml -Type TXT

# Vérifier SPF
Resolve-DnsName -Name ikasso.ml -Type TXT

# Vérifier MX
Resolve-DnsName -Name ikasso.ml -Type MX

# Vérifier DMARC
Resolve-DnsName -Name _dmarc.ikasso.ml -Type TXT
```

### macOS / Linux Terminal
```bash
# Vérifier DKIM
dig TXT resend._domainkey.ikasso.ml +short

# Vérifier SPF
dig TXT ikasso.ml +short

# Vérifier MX
dig MX ikasso.ml +short

# Vérifier DMARC
dig TXT _dmarc.ikasso.ml +short
```

---

## 🎯 Résumé Ultra-Rapide

**3 enregistrements à copier-coller :**

### 1. DKIM (Récupérer depuis Resend)
```
TXT | resend._domainkey | [DEPUIS RESEND]
```

### 2. SPF (Valeur fixe)
```
TXT | @ | v=spf1 include:amazonses.com ~all
```

### 3. MX (Valeur fixe)
```
MX | @ | feedback-smtp.eu-west-1.amazonses.com (Priority: 10)
```

### 4. DMARC (Optionnel, valeur fixe)
```
TXT | _dmarc | v=DMARC1; p=none; rua=mailto:admin@ikasso.ml
```

---

## ✅ Checklist de Vérification

Après avoir ajouté les DNS, vérifier que :

- [ ] Les 3 enregistrements DNS sont ajoutés (DKIM, SPF, MX)
- [ ] Sur Resend, le domaine est "Verified" (vert)
- [ ] Test sur mxtoolbox.com : DKIM, SPF, MX OK
- [ ] Un email de test est bien reçu
- [ ] L'email n'est pas en spam
- [ ] L'expéditeur affiché est "Ikasso <noreply@ikasso.ml>"

---

*Dernière mise à jour : 22 novembre 2025*
*Guide complet : Voir EMAIL_SETUP_GUIDE.md*
