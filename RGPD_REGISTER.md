# Ikasso - Registre des Traitements de Donnees Personnelles (RGPD)

**Responsable de traitement** : Ikasso, Ibrahim Sanogo  
**Adresse** : Bamako, Mali  
**Contact DPO/vie privee** : privacy@ikasso.ml  
**Date de creation** : 16 avril 2026  
**Derniere mise a jour** : 16 avril 2026

---

## 1. Registre des traitements

### T01 - Gestion des comptes utilisateurs

| Champ | Detail |
|-------|--------|
| **Finalite** | Creation et gestion des comptes utilisateurs (clients et hotes) |
| **Base legale** | Execution du contrat (Art. 6.1.b RGPD) |
| **Categories de donnees** | Nom, prenom, email, telephone, date de naissance, adresse, ville, pays, code postal, type d'utilisateur (client/hote), photo de profil (avatar), biographie |
| **Source des donnees** | Collecte directe aupres de l'utilisateur (formulaire d'inscription) ou via OAuth (Google, Apple) |
| **Destinataires** | Supabase (hebergement BDD + Auth), Vercel (hebergement web) |
| **Transferts hors UE** | Oui - Supabase (USA, clauses contractuelles types), Vercel (USA, clauses contractuelles types) |
| **Duree de conservation** | Duree du compte actif + 3 ans apres suppression (obligation legale) |
| **Mesures de securite** | RLS Supabase, chiffrement en transit (TLS), hashage mots de passe (bcrypt), validation Zod, rate limiting |
| **Fichiers concernes** | `apps/web/app/lib/dal/auth.ts`, `apps/web/app/lib/validations.ts`, `supabase/migrations/001_initial_schema.sql` |

### T02 - Gestion des reservations

| Champ | Detail |
|-------|--------|
| **Finalite** | Traitement des reservations d'hebergement entre clients et hotes |
| **Base legale** | Execution du contrat (Art. 6.1.b RGPD) |
| **Categories de donnees** | Nom et prenom du client, email, telephone, dates de sejour, nombre de voyageurs, demandes speciales, montant, methode et statut de paiement |
| **Source des donnees** | Collecte directe (formulaire de reservation) |
| **Destinataires** | Hote concerne, Supabase (stockage), Stripe ou Orange Money (paiement) |
| **Transferts hors UE** | Oui - Supabase (USA), Stripe (USA) |
| **Duree de conservation** | Duree du compte + 5 ans apres la reservation (obligations comptables) |
| **Mesures de securite** | RLS (guest_id/host_id), validation Zod, restriction UPDATE sur payment_status, webhook signe Stripe |
| **Fichiers concernes** | `apps/web/app/lib/validations.ts` (createBookingSchema), `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/013_security_fixes.sql` |

### T03 - Paiements

| Champ | Detail |
|-------|--------|
| **Finalite** | Traitement des paiements pour les reservations |
| **Base legale** | Execution du contrat (Art. 6.1.b RGPD) |
| **Categories de donnees** | Montant, devise (XOF), ID de transaction, methode de paiement, numero de telephone (Orange Money), ID session Stripe |
| **Source des donnees** | Collecte directe + processeurs de paiement |
| **Destinataires** | Stripe (paiement carte), Orange Money (paiement mobile), PayPal |
| **Transferts hors UE** | Oui - Stripe (USA), PayPal (USA) |
| **Duree de conservation** | 10 ans (obligations comptables et fiscales) |
| **Mesures de securite** | Pas de stockage de donnees de carte (delegation a Stripe), verification de signature webhook, rate limiting (10/min), validation Zod |
| **Fichiers concernes** | `apps/web/app/api/payment/stripe/create-checkout/route.ts`, `apps/web/app/api/payment/stripe/webhook/route.ts`, `apps/web/app/api/payment/orange-money/route.ts` |

### T04 - Verification d'identite

| Champ | Detail |
|-------|--------|
| **Finalite** | Verification de l'identite des hotes pour la confiance et la securite de la plateforme |
| **Base legale** | Interet legitime (Art. 6.1.f RGPD) - securite de la plateforme et conformite reglementaire |
| **Categories de donnees** | Documents d'identite (NINA, passeport, carte d'identite, permis de conduire), photos du visage (face, profil gauche, profil droit) |
| **Source des donnees** | Collecte directe (upload par l'utilisateur) |
| **Destinataires** | Administrateurs Ikasso (verification manuelle), Supabase Storage (stockage) |
| **Transferts hors UE** | Oui - Supabase Storage (USA) |
| **Duree de conservation** | Duree du compte + 1 an apres suppression ou rejet |
| **Mesures de securite** | Bucket prive Supabase (`public: false`), URLs signees a duree limitee, requireAuth, verification userId, types MIME restreints, taille limitee (10 Mo), rate limiting uploads |
| **Fichiers concernes** | `apps/web/app/api/upload/identity/route.ts`, `supabase/migrations/004_identity_verification.sql` |

### T05 - Messagerie entre utilisateurs

| Champ | Detail |
|-------|--------|
| **Finalite** | Communication entre clients et hotes concernant les reservations |
| **Base legale** | Execution du contrat (Art. 6.1.b RGPD) |
| **Categories de donnees** | Contenu des messages, identifiant expediteur, identifiant conversation, statut de lecture, horodatage |
| **Source des donnees** | Collecte directe (saisie utilisateur) |
| **Destinataires** | Participants de la conversation uniquement |
| **Transferts hors UE** | Oui - Supabase (USA) |
| **Duree de conservation** | Duree du compte + 1 an apres suppression du compte |
| **Mesures de securite** | RLS strict (seuls les participants voient les messages), INSERT restreint au sender_id authentifie |
| **Fichiers concernes** | `supabase/migrations/002_rls_policies.sql`, `apps/web/app/lib/dal/messages.ts` |

### T06 - Avis et evaluations

| Champ | Detail |
|-------|--------|
| **Finalite** | Permettre aux clients de laisser des avis sur les hebergements |
| **Base legale** | Interet legitime (Art. 6.1.f RGPD) - transparence et confiance |
| **Categories de donnees** | Note (1-5), commentaire, photos, identifiant du client, identifiant de la propriete |
| **Source des donnees** | Collecte directe (formulaire d'avis) |
| **Destinataires** | Public (les avis sont visibles par tous), Supabase (stockage) |
| **Transferts hors UE** | Oui - Supabase (USA) |
| **Duree de conservation** | Duree de publication de la propriete + 3 ans |
| **Mesures de securite** | RLS (INSERT restreint au guest_id authentifie), validation Zod (rating 1-5, UUID), escapeHtml |
| **Fichiers concernes** | `apps/web/app/lib/validations.ts` (createReviewSchema), `supabase/migrations/002_rls_policies.sql` |

### T07 - Emails transactionnels et notifications

| Champ | Detail |
|-------|--------|
| **Finalite** | Envoi de confirmations de reservation, verification d'email, reinitialisation de mot de passe, invitations admin |
| **Base legale** | Execution du contrat (Art. 6.1.b RGPD) pour les transactionnels, Consentement (Art. 6.1.a) pour le marketing |
| **Categories de donnees** | Email, nom, codes de verification |
| **Source des donnees** | Donnees du compte utilisateur |
| **Destinataires** | Resend (envoi d'emails) |
| **Transferts hors UE** | Oui - Resend (USA) |
| **Duree de conservation** | Logs d'envoi conserves 90 jours |
| **Mesures de securite** | Rate limiting email (3/min), escapeHtml dans les templates, requireAdmin pour les emails admin |
| **Fichiers concernes** | `apps/web/app/api/send-welcome-email/route.ts`, `apps/web/app/api/send-booking-confirmation/route.ts`, `apps/web/app/api/send-email-verification/route.ts`, `apps/web/app/api/send-password-reset/route.ts` |

### T08 - Journalisation et securite (Audit log)

| Champ | Detail |
|-------|--------|
| **Finalite** | Tracabilite des actions d'administration et detection d'activites suspectes |
| **Base legale** | Interet legitime (Art. 6.1.f RGPD) - securite du systeme |
| **Categories de donnees** | Action effectuee, type de cible, identifiant cible, adresse IP, chemin d'acces, details, horodatage |
| **Source des donnees** | Collecte automatique par le systeme |
| **Destinataires** | Administrateurs Ikasso uniquement |
| **Transferts hors UE** | Oui - Supabase (USA) |
| **Duree de conservation** | 1 an glissant |
| **Mesures de securite** | RLS (acces admin uniquement), table dediee avec index |
| **Fichiers concernes** | `apps/web/app/lib/security-log.ts`, `supabase/migrations/012_audit_log.sql` |

### T09 - Monitoring d'erreurs (Sentry)

| Champ | Detail |
|-------|--------|
| **Finalite** | Detection et correction des erreurs techniques |
| **Base legale** | Interet legitime (Art. 6.1.f RGPD) - maintien du service |
| **Categories de donnees** | Traces d'erreurs, user agent, URL, potentiellement identifiant utilisateur |
| **Source des donnees** | Collecte automatique lors d'erreurs |
| **Destinataires** | Sentry (monitoring) |
| **Transferts hors UE** | Oui - Sentry (USA) |
| **Duree de conservation** | 90 jours (parametrage Sentry par defaut) |
| **Mesures de securite** | Sampling reduit (tracesSampleRate: 0.1), active uniquement en production, source maps masquees |
| **Fichiers concernes** | `apps/web/sentry.client.config.ts`, `apps/web/sentry.server.config.ts` |

### T10 - Cookies et preferences

| Champ | Detail |
|-------|--------|
| **Finalite** | Fonctionnement du site et personnalisation de l'experience |
| **Base legale** | Consentement (Art. 6.1.a RGPD) pour les cookies non-essentiels, Interet legitime pour les cookies necessaires |
| **Categories de donnees** | Preferences de cookies, token d'authentification, preferences utilisateur |
| **Source des donnees** | Navigateur de l'utilisateur |
| **Destinataires** | Stockage local (localStorage) |
| **Transferts hors UE** | Non (stockage local) |
| **Duree de conservation** | Session ou jusqu'a revocation du consentement |
| **Mesures de securite** | Banniere de consentement avec choix granulaire (necessaires, analytiques, marketing, personnalisation) |
| **Fichiers concernes** | `apps/web/app/components/CookieConsent.tsx` |

### T11 - Codes promotionnels et parrainages

| Champ | Detail |
|-------|--------|
| **Finalite** | Gestion des promotions et du programme de parrainage |
| **Base legale** | Execution du contrat (Art. 6.1.b RGPD) |
| **Categories de donnees** | Code promo, identifiant parrain, identifiant filleul, montant de remise |
| **Source des donnees** | Collecte directe et systeme de parrainage |
| **Destinataires** | Administrateurs Ikasso, Supabase |
| **Transferts hors UE** | Oui - Supabase (USA) |
| **Duree de conservation** | 3 ans apres utilisation |
| **Mesures de securite** | requireAdmin pour la gestion, validation API |
| **Fichiers concernes** | `supabase/migrations/005_promo_codes.sql`, `supabase/migrations/009_referrals.sql`, `apps/web/app/api/admin/promo-codes/route.ts` |

---

## 2. Sous-traitants (Art. 28 RGPD)

| Sous-traitant | Fonction | Localisation | Garanties |
|---------------|----------|-------------|-----------|
| **Supabase** | Base de donnees, authentification, stockage fichiers | USA (AWS) | SOC 2 Type II, clauses contractuelles types |
| **Vercel** | Hebergement web, CDN | USA (AWS/Cloudflare) | SOC 2, clauses contractuelles types |
| **Stripe** | Traitement des paiements par carte | USA | PCI DSS Level 1, clauses contractuelles types |
| **Orange Money** | Paiement mobile | Mali/France | Reglementation bancaire locale |
| **PayPal** | Paiement en ligne | USA | PCI DSS Level 1, clauses contractuelles types |
| **Resend** | Envoi d'emails transactionnels | USA | Clauses contractuelles types |
| **Sentry** | Monitoring d'erreurs | USA | SOC 2, clauses contractuelles types |

---

## 3. Droits des personnes concernees

| Droit | Modalite d'exercice | Delai de reponse |
|-------|---------------------|------------------|
| **Acces** (Art. 15) | Email a privacy@ikasso.ml ou via les parametres du compte | 30 jours |
| **Rectification** (Art. 16) | Via les parametres du profil ou email a privacy@ikasso.ml | 30 jours |
| **Effacement** (Art. 17) | Email a privacy@ikasso.ml (suppression du compte et des donnees associees) | 30 jours |
| **Limitation** (Art. 18) | Email a privacy@ikasso.ml | 30 jours |
| **Portabilite** (Art. 20) | Email a privacy@ikasso.ml (export JSON des donnees personnelles) | 30 jours |
| **Opposition** (Art. 21) | Email a privacy@ikasso.ml ou desinscription des emails marketing | 30 jours |
| **Retrait du consentement** | Via la banniere de cookies ou email a privacy@ikasso.ml | Immediat |

---

## 4. Analyse de la page Politique de Confidentialite existante

**Fichier** : `apps/web/app/privacy/page.tsx`

### Elements presents (conformes) :
- Types de donnees collectees (section 2)
- Finalites du traitement (section 3)
- Partage avec tiers (section 4) - mentionne Stripe, Orange Money, PayPal
- Mesures de securite (section 5)
- Conservation des donnees - mention generale (section 6)
- Droits des utilisateurs RGPD (section 7) - acces, rectification, suppression, limitation, portabilite, opposition, retrait consentement
- Politique de cookies - mention generale (section 8)
- Transferts internationaux (section 9)
- Mineurs (section 10)
- Contact (section 12) - email privacy@ikasso.ml, support@ikasso.ml, telephone

### Elements manquants ou a ameliorer pour conformite RGPD complete :
1. **Identite du responsable de traitement** : seul "Ikasso" est mentionne - ajouter le nom complet (Ibrahim Sanogo) et le statut juridique
2. **Base legale de chaque traitement** : la page ne mentionne pas les bases legales specifiques (execution du contrat, interet legitime, consentement) pour chaque type de traitement
3. **Durees de conservation specifiques** : la mention actuelle est trop vague ("aussi longtemps que necessaire") - ajouter des durees precises par type de donnee
4. **Liste complete des sous-traitants** : Supabase, Vercel, Resend et Sentry ne sont pas mentionnes explicitement
5. **Droit de reclamation aupres d'une autorite de controle** : non mentionne (APDP Mali ou CNIL si utilisateurs europeens)
6. **Politique de cookies detaillee** : la mention est trop breve - ajouter les types de cookies utilises, leur duree, et leur finalite
7. **Prise de decision automatisee** : preciser si le profilage est utilise ou non (Art. 22)
8. **DPO** : preciser si un DPO est designe ou indiquer la personne responsable

---

## 5. Analyse du composant Cookie Consent

**Fichier** : `apps/web/app/components/CookieConsent.tsx`

### Elements presents (conformes) :
- Banniere de consentement avec delai d'apparition
- Choix granulaire : necessaires, analytiques, marketing, personnalisation
- Boutons "Accepter tout", "Refuser", "Gerer les preferences"
- Cookies necessaires non desactivables
- Sauvegarde des preferences dans localStorage
- Lien vers la politique de confidentialite

### Elements a ameliorer :
1. **Stockage du consentement** : utilise localStorage au lieu de cookies HTTP - un cookie serait plus conforme car lisible cote serveur
2. **Date du consentement** : enregistree (`ikasso_cookie_consent_date`) - conforme
3. **Pas de blocage effectif** : le composant enregistre les preferences mais ne semble pas bloquer reellement les scripts analytiques/marketing si refuses
4. **Pas de lien vers la politique de cookies detaillee** : renvoie a la politique de confidentialite generale
5. **Renouvellement du consentement** : pas de mecanisme de renouvellement periodique visible (recommandation : tous les 12 mois)

---

## 6. Actions recommandees pour conformite RGPD complete

| Priorite | Action | Statut |
|----------|--------|--------|
| Haute | Completer la page privacy avec l'identite complete du responsable et les bases legales | A faire |
| Haute | Ajouter les durees de conservation specifiques dans la page privacy | A faire |
| Haute | Lister explicitement tous les sous-traitants (Supabase, Vercel, Resend, Sentry) | A faire |
| Haute | Ajouter le droit de reclamation aupres de l'autorite de controle | A faire |
| Moyenne | Implementer le blocage effectif des cookies non-essentiels quand refuses | A faire |
| Moyenne | Ajouter un mecanisme d'export de donnees (portabilite) dans les parametres du compte | A faire |
| Moyenne | Ajouter un mecanisme de suppression de compte en self-service | A faire |
| Basse | Creer une politique de cookies separee et detaillee | A faire |
| Basse | Ajouter un mecanisme de renouvellement du consentement cookies (12 mois) | A faire |
| Basse | Documenter les clauses contractuelles types avec chaque sous-traitant | A faire |
