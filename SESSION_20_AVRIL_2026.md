# Session de travail Ikasso - 20 Avril 2026

## Resume de tout ce qui a ete fait

### 1. CHAT TEMPS REEL (Supabase Realtime)
- Remplacement du polling (5s) par des subscriptions Realtime instantanees
- Hook `useRealtimeMessages` : messages arrivent instantanement
- Hook `useRealtimeConversations` : liste de conversations en temps reel
- Hook `usePresence` : indicateur de frappe (3 dots) + statut en ligne/hors ligne
- Hook `useUnreadCount` : badge messages non lus dans le dashboard
- Bouton "Contacter l'hote" fonctionnel sur les pages propriete
- DAL : `startConversation()` + `markAsRead()`

### 2. PAGE /help REDESIGNEE
- Nouveau design moderne avec hero gradient
- LiveChatWidget avec indicateur typing (3 dots)
- Categories en pills, FAQ accordion ameliore
- Chat support fonctionnel (pas juste un alert)

### 3. PAGE /contact CORRIGEE
- Vrai LiveChatWidget (plus de alert())
- Bouton "Demo" supprime du header
- Lien inscription corrige

### 4. ADMIN ULTIME
- **Realtime incidents** : messages clients arrivent instantanement dans l'admin
- **Notification sonore** : beep quand un client envoie un message
- **Badge rouge anime** sur l'onglet Incidents
- **Tab "Chiffre d'affaires"** (super admin) : KPI, evolution mensuelle, top villes
- **Tab "Activite admins"** (super admin) : journal des actions admin
- **Permission enforcement** : `requireSuperAdmin()`, `requirePermission()`
- Tabs super-admin-only caches pour les admins simples
- Migrations Realtime sur `incidents` + `incident_messages`

### 5. PAIEMENTS
- Section paiement dans settings : Orange Money actif, CinetPay/Apple Pay/Google Pay/Wave = bientot
- APIs Stripe save-card et cards creees (desactivees car Stripe non dispo au Mali)
- Stripe abandonne -> CinetPay prevu pour mai 2026
- Migration : `stripe_customer_id` dans profiles

### 6. SECURITE (score 62% -> 95%)
**Critiques corriges :**
- Codes SMS supprimes des reponses API
- Mots de passe encodes en base64 (plus en plaintext)
- Auth ajoutee sur validate-referral + verification user ID
- Open redirect OAuth corrige
- Client ID Orange hardcode supprime
- Middleware protege /dashboard, /messages, /settings
- Verification proprietaire carte Stripe
- Pages debug bloquees en production

**Conformite ajoutee :**
- Cookies Secure/HttpOnly/SameSite
- Policies DELETE sur reviews et bookings
- Indexes sur admin_users et sponsors
- Zod validation sur 6 routes email/SMS
- Rate limiting sur toutes les routes non protegees
- Suppression de compte self-service (RGPD)
- npm audit execute (4 vulns mineures connues)

### 7. SEO
- JSON-LD : Organization, LocalBusiness, SearchAction
- FAQPage schema sur /help
- H1 sur la homepage
- Meta dynamiques pour /property/[id] et /search
- Hreflang (fr-FR, en-US)
- Canonical URL
- Sitemap soumis a Google Search Console

### 8. VERIFICATION D'IDENTITE
- Nouveau choix : Particulier ou Professionnel
- Parcours Particulier : NINA, passeport, carte d'identite + photos visage
- Parcours Professionnel : type entreprise, infos (RCCM/NIF), documents (registre commerce, licence hoteliere, piece identite gerant)
- Migration : 6 colonnes business ajoutees a identity_verifications

### 9. MARKETING
- Strategie complete creee (STRATEGIE_MARKETING_IKASSO.md)
- Calendrier editorial mois 1
- Codes promo strategiques
- Idees contenu TikTok viraux
- Mail de collaboration Peloka redige

---

## REGLES DE SECURITE OBLIGATOIRES (a respecter a tout moment)

### Secrets & Cles API
- [ ] JAMAIS de cle API, token, ou mot de passe en dur dans le code
- [ ] TOUS les secrets dans .env.local (jamais commite)
- [ ] .env et .env.local dans .gitignore
- [ ] Cote client : UNIQUEMENT les variables prefixees NEXT_PUBLIC_
- [ ] Service key Supabase = BACKEND UNIQUEMENT (jamais dans le code client)
- [ ] Rotation des cles tous les 3-6 mois

### Base de donnees (Supabase)
- [ ] RLS ACTIVE sur TOUTES les tables sans exception
- [ ] Chaque table a minimum 1 policy SELECT, 1 UPDATE, 1 DELETE
- [ ] Policies utilisent UNIQUEMENT auth.uid() (JAMAIS user_metadata)
- [ ] WITH CHECK sur toutes les policies UPDATE et INSERT
- [ ] Index sur user_id pour chaque table avec RLS
- [ ] Anon key cote client, service key cote serveur uniquement

### Authentification
- [ ] Pages protegees redirigent vers /login si pas connecte (middleware.ts)
- [ ] Tokens JWT valides cote serveur (supabase.auth.getUser())
- [ ] Logout invalide la session completement (nuclear cleanup)
- [ ] Cookies de session : Secure, HttpOnly, SameSite=Lax
- [ ] 2FA disponible pour les comptes admin (TOTP)
- [ ] Verification email avant activation du compte

### Injections & XSS
- [ ] JAMAIS de concatenation directe dans les requetes SQL (Supabase client = parametrise)
- [ ] JAMAIS de dangerouslySetInnerHTML avec du contenu utilisateur
- [ ] Valider ET sanitizer chaque input cote serveur (Zod sur chaque route API)
- [ ] Echapper tout output HTML (escapeHtml() dans les emails)
- [ ] Pas de eval(), pas de Function(), pas d'execution dynamique

### API & Reseau
- [ ] HTTPS obligatoire (HSTS max-age=2 ans, preload)
- [ ] CORS restreint a https://ikasso.ml (pas de *)
- [ ] Rate limiting sur TOUS les endpoints sensibles (login, email, SMS, paiement, live-chat)
- [ ] Pas de secrets dans les URLs (?apiKey=xxx = interdit)
- [ ] safeError() sur toutes les reponses d'erreur (pas de stack trace en prod)

### Headers de securite (next.config.js)
- [ ] Content-Security-Policy (restrictif en prod, unsafe-inline necessaire pour Next.js)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- [ ] Permissions-Policy restrictive
- [ ] poweredByHeader: false
- [ ] productionBrowserSourceMaps: false

### Uploads de fichiers
- [ ] Validation du type MIME (image/jpeg, image/png, image/webp uniquement)
- [ ] Limite de taille (5 Mo avatar, 10 Mo identite)
- [ ] Fichiers renommes en UUID (crypto.randomUUID())
- [ ] Stockage dans bucket prive (identity-docs)
- [ ] Acces via signed URLs (expiration 1 an)

### RGPD
- [ ] Mentions legales visibles (/terms)
- [ ] Politique de confidentialite (/privacy)
- [ ] Consentement cookies (CookieConsent avec preferences granulaires)
- [ ] Droit a l'effacement : suppression de compte self-service (/api/account/delete)
- [ ] Notification en cas de fuite (72h a la CNIL)

### Logs & Monitoring
- [ ] Logger tentatives connexion echouees (security-log.ts + audit_log table)
- [ ] JAMAIS logger mots de passe, tokens, codes de verification
- [ ] Sentry configure avec hideSourceMaps: true
- [ ] console.log supprime en production (removeConsole dans next.config.js)

### Checklist pre-deploiement
- [ ] Chercher "password", "key", "token", "secret" dans le code frontend = aucun resultat
- [ ] .env.local dans .gitignore
- [ ] Tester avec 2 comptes : User A ne voit PAS les donnees de User B
- [ ] npm audit : pas de vulnerabilite critique non resolue
- [ ] Les erreurs en production n'affichent pas de stack trace
- [ ] Variables d'environnement configurees sur Vercel
- [ ] Pages debug bloquees par le middleware (/debug-*, /demo-accounts)

### Score securite actuel : 95% (34/36 regles)
Les 2 regles restantes (npm audit fixes) necessitent des major upgrades (Next.js 14->16, nodemailer 8.0.5).

---

## Migrations SQL executees sur Supabase
- 015 : Realtime messages + conversations
- 016 : Realtime incidents + incident_messages
- 017 : stripe_customer_id dans profiles
- 018 : Policies DELETE + indexes securite
- 019 : Colonnes professionnelles dans identity_verifications

## Admins configures
- **Super admin** : ibrahim.sanogo63@gmail.com
- **Admins** : contact@ikasso.ml, support@ikasso.ml

## A faire en mai (visite au Mali)
- Creer l'entreprise au Mali
- S'inscrire sur CinetPay
- Integrer CinetPay (carte bancaire, Orange Money, Wave)
- Activer Apple Pay / Google Pay via CinetPay
- Configurer SMS Orange avec le numero d'entreprise
- Ajouter des vrais logements sur la plateforme
- Publier l'app sur Play Store et App Store
