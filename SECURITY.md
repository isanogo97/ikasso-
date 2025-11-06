# Sécurité d’Ikasso

Ce document résume le durcissement et les bonnes pratiques appliqués dans l’application.

- En-têtes HTTP (via `apps/web/next.config.js`):
  - Content-Security-Policy stricte (`object-src 'none'`, `frame-ancestors 'none'`, etc.)
  - Strict-Transport-Security (production), Referrer-Policy `strict-origin-when-cross-origin`
  - X-Content-Type-Options `nosniff`, X-Frame-Options `DENY`, X-DNS-Prefetch-Control `off`
  - Permissions-Policy minimale (capteurs, caméra, micro, etc. désactivés)
  - `poweredByHeader: false`
- Images via `next/image` avec contrôle de domaines (Unsplash/Placeholder autorisés).
- Formulaires: validations côté client (email, téléphone, Luhn/carte, CVV, date d’expiration) et désactivation des boutons tant que non valide.
- Logs de production: suppression des `console.*` (hors `error`/`warn`).
- Pages d’erreur dédiées: `app/error.tsx` et `app/not-found.tsx` pour éviter les fuites d’infos.
- Secrets: ne pas committer de secrets; utilisez `.env` à partir de `.env.example`.

Signalement de vulnérabilité: ouvrez une issue privée ou contactez l’équipe de maintien.