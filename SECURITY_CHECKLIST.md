# Ikasso - OWASP Top 10 (2021) Security Checklist

**Date d'audit** : 16 avril 2026  
**Projet** : Ikasso - Plateforme de location immobiliere (Mali)  
**Stack** : Next.js 14, Supabase (PostgreSQL + Auth), Stripe, Orange Money, Vercel

---

## A01 - Broken Access Control | PASS

**Verdict : PASS**

Mesures en place :

- **Row-Level Security (RLS)** active sur toutes les tables Supabase : `profiles`, `properties`, `bookings`, `reviews`, `conversations`, `messages`, `admin_users`, `audit_log`
  - Fichier : `supabase/migrations/002_rls_policies.sql`
  - Les utilisateurs ne peuvent lire/modifier que leurs propres donnees (ex: `auth.uid() = id`, `auth.uid() = host_id`, `auth.uid() = guest_id`)
  - Les hotes ne voient que leurs proprietes et reservations associees
  - Les messages sont restreints aux participants de la conversation
  - L'audit_log est reserve aux admins

- **requireAdmin()** sur tous les endpoints `/api/admin/*` : verifie l'authentification ET le role admin dans la table `admin_users` avec `is_activated = true`
  - Fichier : `apps/web/app/lib/api-auth.ts`
  - Endpoints proteges : users, verifications, promo-codes, sponsors, incidents, stats, backup, send-email, referrals, 2fa

- **requireAuth()** sur les endpoints sensibles (upload avatar, upload identity)
  - Verification de correspondance userId/user authentifie pour prevenir l'usurpation d'identite
  - Fichier : `apps/web/app/api/upload/avatar/route.ts` (ligne 32), `apps/web/app/api/upload/identity/route.ts` (ligne 38)

- **Middleware Next.js** : redirection vers `/auth/login` pour les routes non-publiques sans cookie auth
  - Fichier : `apps/web/middleware.ts`

- **Security fix** (migration 013) : restriction des UPDATE sur `bookings` pour empecher la falsification de `payment_status` cote client

**Points d'attention** :
- Le middleware liste toutes les routes comme publiques (y compris `/admin`, `/dashboard`, `/settings`). La protection reelle est cote client + API. Cela fonctionne car l'auth reelle est verifiee au niveau API, mais ajouter une verification middleware serait une couche supplementaire.

---

## A02 - Cryptographic Failures | PASS

**Verdict : PASS**

Mesures en place :

- **HTTPS force** via HSTS avec `max-age=63072000; includeSubDomains; preload` en production
  - Fichier : `apps/web/next.config.js` (ligne 58)

- **Mots de passe** : hashes geres par Supabase Auth (bcrypt par defaut) - jamais stockes en clair cote serveur

- **Secrets** : stockes dans les variables d'environnement (`.env`), non committes
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `ORANGE_MONEY_API_KEY`

- **Documents d'identite** : stockes dans un bucket Supabase **prive** (`identity-docs`, `public: false`) avec URLs signees a duree limitee (1 an)
  - Fichier : `apps/web/app/api/upload/identity/route.ts`

- **Webhook Stripe** : verification de signature cryptographique via `stripe.webhooks.constructEvent()`
  - Fichier : `apps/web/app/api/payment/stripe/webhook/route.ts` (ligne 19)

- **Source maps** desactivees en production (`productionBrowserSourceMaps: false`)

- **Console logs** supprimes en production (sauf `error`/`warn`)

**Points d'attention** :
- Le mode localStorage (demo) stocke les mots de passe en clair dans `localStorage`. Acceptable uniquement en mode demo/dev.

---

## A03 - Injection | PASS

**Verdict : PASS**

Mesures en place :

- **Validation Zod** sur tous les inputs API : `loginSchema`, `registerSchema`, `createPropertySchema`, `createBookingSchema`, `createReviewSchema`, `paymentSchema`, `sendEmailSchema`
  - Fichier : `apps/web/app/lib/validations.ts`
  - Validation de types, formats (email, UUID), min/max, enums

- **Supabase client** : utilisation de l'API Supabase (pas de SQL brut) qui parametrise automatiquement les requetes - pas d'injection SQL possible

- **escapeHtml()** pour prevenir le XSS dans les templates email
  - Fichier : `apps/web/app/lib/api-auth.ts` (ligne 114)
  - Utilise dans : `send-admin-invite`, `admin/send-email`, `admin/incidents`

- **Content-Security-Policy** stricte en production : `script-src 'self' 'unsafe-inline' https://js.stripe.com`, `object-src 'none'`
  - Fichier : `apps/web/next.config.js`

- **React** echappe automatiquement les outputs JSX (protection XSS native)

**Points d'attention** :
- `unsafe-inline` present dans `script-src` - necessaire pour Next.js mais reduit legerement la protection CSP. L'utilisation de nonces serait ideale.

---

## A04 - Insecure Design | PARTIAL

**Verdict : PARTIAL**

Mesures en place :

- **Separation des roles** : client/hote/admin avec verification systematique
- **Validation metier** : CHECK constraints en base (status, types, ratings 1-5, payment_status)
  - Fichier : `supabase/migrations/001_initial_schema.sql`
- **Rate limiting** par type d'operation : auth (5/15min), email (3/min), upload (10/5min), API (60/min), Stripe (10/min)
  - Fichier : `apps/web/app/lib/rate-limit.ts`
- **safeError()** : ne revele jamais les erreurs internes en production
  - Fichier : `apps/web/app/lib/api-auth.ts` (ligne 154)
- **2FA TOTP** disponible pour les comptes admin
  - Fichier : `apps/web/app/api/admin/2fa/route.ts`

**Points d'attention** :
- Pas de tests automatises de securite visibles (pas de dossier `__tests__` ou `cypress`)
- Pas de limitation de tentatives de login visible au niveau middleware (le rate limiting est present sur les API mais pas specifiquement sur le formulaire de login)
- Pas de mecanisme de verrouillage de compte apres echecs multiples

---

## A05 - Security Misconfiguration | PASS

**Verdict : PASS**

Mesures en place :

- **En-tetes de securite complets** :
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restrictive (camera, micro, geolocalisation, etc. desactives)
  - `X-DNS-Prefetch-Control: off`
  - `Strict-Transport-Security` en production
  - Fichier : `apps/web/next.config.js`

- **poweredByHeader: false** - pas de divulgation du framework

- **CORS restreint** : `Access-Control-Allow-Origin: https://ikasso.ml` (uniquement pour les API)

- **Images** : domaines restreints via `remotePatterns` (Unsplash, Placeholder, Supabase uniquement)

- **Upload** : types MIME restreints (`image/jpeg`, `image/png`, `image/webp`), tailles limitees (5 Mo avatars, 10 Mo documents)
  - Fichiers : `apps/web/app/api/upload/avatar/route.ts`, `apps/web/app/api/upload/identity/route.ts`

- **Sentry** configure pour le monitoring d'erreurs en production avec source maps masquees
  - Fichier : `apps/web/sentry.client.config.ts`

---

## A06 - Vulnerable and Outdated Components | PARTIAL

**Verdict : PARTIAL**

Mesures en place :

- Dependances modernes et a jour :
  - Next.js 14.x
  - Supabase JS v2.102
  - Stripe v22
  - Zod v4.3
  - Sentry v10.49
  - Fichier : `apps/web/package.json`

**Points d'attention** :
- Pas de `npm audit` automatise visible dans le CI/CD
- Pas de Dependabot ou Renovate configure
- Pas de fichier `package-lock.json` audit ou de politique de mise a jour automatique visible
- La version de `next-auth` (v4.24.13) coexiste avec `@auth/core` (v0.34.3) - potentielle confusion de versions

---

## A07 - Identification and Authentication Failures | PASS

**Verdict : PASS**

Mesures en place :

- **Supabase Auth** : gestion complete de l'authentification (signup, login, OAuth Google/Apple, password reset)
  - Fichier : `apps/web/app/lib/dal/auth.ts`

- **Validation de mot de passe** : min 8 caracteres, au moins 1 majuscule, 1 minuscule, 1 chiffre
  - Fichier : `apps/web/app/lib/validations.ts` (lignes 12-17)

- **OAuth** : support Google et Apple via Supabase OAuth avec callback securise
  - Fichier : `apps/web/app/api/auth/callback/route.ts`

- **2FA TOTP** pour les administrateurs avec QR code et verification
  - Fichier : `apps/web/app/api/admin/2fa/route.ts`

- **Rate limiting sur l'auth** : 5 requetes par 15 minutes par IP
  - Fichier : `apps/web/app/lib/rate-limit.ts` (ligne 58)

- **Logging des echecs** : les tentatives d'acces non-autorise sont loguees dans `audit_log`
  - Fichier : `apps/web/app/lib/security-log.ts`

- **Token-based auth** : Bearer tokens Supabase JWT, pas de session serveur stateful

**Points d'attention** :
- Le 2FA n'est obligatoire que pour les admins, pas pour les utilisateurs reguliers
- Pas de protection contre le credential stuffing au-dela du rate limiting

---

## A08 - Software and Data Integrity Failures | PASS

**Verdict : PASS**

Mesures en place :

- **Verification de signature Stripe webhook** : `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
  - Fichier : `apps/web/app/api/payment/stripe/webhook/route.ts` (ligne 19)
  - Empeche les faux evenements de paiement

- **Validation d'entree systematique** avec Zod sur tous les API routes de paiement et de donnees

- **Separation service_role** : le `SUPABASE_SERVICE_ROLE_KEY` n'est utilise que cote serveur (admin client)
  - Fichier : `apps/web/app/lib/supabase/admin.ts`

- **RLS policies** empechent la modification directe de `payment_status` par les clients
  - Fichier : `supabase/migrations/013_security_fixes.sql`

- **Subresource Integrity** : CSP limite les scripts aux domaines autorises (Stripe)

**Points d'attention** :
- Pas de Subresource Integrity (SRI) explicite sur les scripts tiers
- Pas de verification de hash pour les dependances npm (pas de `npm ci --ignore-scripts` visible)

---

## A09 - Security Logging and Monitoring Failures | PARTIAL

**Verdict : PARTIAL**

Mesures en place :

- **Audit log** en base de donnees : table `audit_log` avec action, target, details, timestamp
  - Fichier : `supabase/migrations/012_audit_log.sql`

- **Security event logging** : login echoue, acces admin non-autorise, rate limiting, activite suspecte
  - Fichier : `apps/web/app/lib/security-log.ts`
  - Types : `login_failed`, `login_success`, `admin_action`, `unauthorized_access`, `rate_limited`, `suspicious_activity`

- **Sentry** pour le monitoring d'erreurs en production
  - Fichier : `apps/web/sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`

- **Rate limit logging** : les depassements sont logues avec IP et details

**Points d'attention** :
- Pas d'alerting automatise visible (ex: Slack/email sur evenements critiques)
- Le logging est non-bloquant (`catch {}`) - les echecs de logging passent silencieusement
- Pas de retention/rotation de logs configuree
- Pas d'integration SIEM visible
- `login_success` est declare comme type mais son utilisation n'est pas visible dans le code

---

## A10 - Server-Side Request Forgery (SSRF) | PASS

**Verdict : PASS**

Mesures en place :

- **Aucun fetch base sur des URL utilisateur** : toutes les requetes sortantes sont vers des endpoints fixes :
  - Orange Money API : `https://api.orange.com/orange-money-webpay/...` (URL hardcodee)
  - PayPal API : `https://api-m.sandbox.paypal.com/...` (URL hardcodee)
  - Orange SMS API : `https://api.orange.com/oauth/...` (URL hardcodee)
  - Fichiers : `apps/web/app/api/payment/orange-money/route.ts`, `apps/web/app/api/payment/paypal/route.ts`

- **Pas de proxy** ou de fonctionnalite de recuperation d'URL arbitraire

- **generate-icon** : genere un SVG a partir d'un parametre `size` (entier) - pas de risque SSRF
  - Fichier : `apps/web/app/api/generate-icon/route.ts`

- **Images** : domaines strictement limites dans `next.config.js` (`images.remotePatterns`)

---

## Resume

| # | Categorie | Verdict | Score |
|---|-----------|---------|-------|
| A01 | Broken Access Control | PASS | 9/10 |
| A02 | Cryptographic Failures | PASS | 9/10 |
| A03 | Injection | PASS | 9/10 |
| A04 | Insecure Design | PARTIAL | 7/10 |
| A05 | Security Misconfiguration | PASS | 9/10 |
| A06 | Vulnerable and Outdated Components | PARTIAL | 6/10 |
| A07 | Identification and Authentication Failures | PASS | 8/10 |
| A08 | Software and Data Integrity Failures | PASS | 8/10 |
| A09 | Security Logging and Monitoring Failures | PARTIAL | 7/10 |
| A10 | Server-Side Request Forgery (SSRF) | PASS | 10/10 |

**Score global : 82/100**

### Recommandations prioritaires

1. **Ajouter des tests de securite automatises** (A04) - tests d'integration pour les controles d'acces
2. **Configurer Dependabot/Renovate** (A06) - mise a jour automatique des dependances
3. **Ajouter un systeme d'alerting** (A09) - notifications sur evenements critiques (tentatives d'intrusion, etc.)
4. **Verrouillage de compte** (A04) - apres N echecs de connexion
5. **SRI sur les scripts tiers** (A08) - ajouter des hash d'integrite pour Stripe JS
