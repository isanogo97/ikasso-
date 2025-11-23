# Ikasso — Chez toi au Mali

Ikasso est une plateforme de réservation d’hébergements dédiée au Mali, inspirée d’Airbnb. Le nom « Ikasso » signifie « chez toi » en bambara, et reflète l’esprit d’hospitalité malienne.

## Fonctionnalités

### Pour les voyageurs
- Recherche avancée par ville, dates, voyageurs
- Filtres: type d’hébergement, équipements, prix
- Cartes interactives pour visualiser les emplacements
- Système d’avis et de notes
- Réservation simple et sécurisée

### Pour les hôtes
- Interface en 4 étapes pour ajouter un hébergement
- Gestion des photos (upload/organisation)
- Tarification en Francs CFA (XOF)
- Gestion des réservations avec tableau de bord
- Statistiques (performances et revenus)

## Villes couvertes
- Bamako — Capitale du Mali
- Sikasso — Région sud
- Ségou — Région du fleuve Niger
- Mopti — Porte du pays Dogon
- Tombouctou — Cité historique
- Kayes — Région ouest
- Koutiala — Centre agricole
- Gao — Région nord

## Types d’hébergements
- Maisons: villas modernes, maisons traditionnelles
- Hôtels: établissements hôteliers, auberges
- Appartements: studios, appartements en centre-ville

## Devise
Tous les prix sont affichés en Francs CFA (XOF).

## Technologies
- Frontend: Next.js 14, React 18, TypeScript
- Style: Tailwind CSS
- Icônes: Lucide React
- Architecture: Monorepo (workspaces)
- Email: Resend (envoi d'emails de vérification)
- Paiements: PayPal, Orange Money

## Installation et développement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
git clone [repository-url]
cd ikasso
npm install
```

### Configuration

1. **Copier le fichier d'environnement**
   ```bash
   cp .env.example .env.local
   ```

2. **Configurer les variables d'environnement**
   - Éditer `.env.local` et ajouter vos clés API
   - Variable obligatoire : `RESEND_API_KEY` (pour les emails)
   - Voir `.env.example` pour la liste complète

3. **Configuration des emails (IMPORTANT)**
   - 📧 **[Guide Complet](./EMAIL_SETUP_GUIDE.md)** - Configuration détaillée (30-60 min)
   - ⚡ **[Guide Rapide](./QUICK_START_EMAIL.md)** - Configuration express (15 min)
   - 🌐 **[Référence DNS](./DNS_CONFIG_REFERENCE.md)** - Configuration DNS détaillée

### Démarrage
```bash
npm run dev
```
Application: http://localhost:3000

### Scripts
```bash
npm run dev       # Dev
npm run build     # Build prod
npm run start     # Démarrage prod
npm run lint      # Lint
```

## Structure du projet
```
ikasso/
  apps/
    web/              # Application Next.js
      app/            # App Router
      components/     # Composants réutilisables
      public/         # Assets statiques
  packages/
    ui/               # (futur) composants partagés
  package.json        # Monorepo
```

## Design et UX
- Couleurs: Orange (#d35400) et palette secondaire
- Typographie: Inter (next/font)
- Responsive: mobile, tablette, desktop
- Accessibilité: bonnes pratiques WCAG

## Spécificités Mali
- Interface en français
- Devise: Francs CFA (XOF)
- Villes majeures du pays
- Culture: hospitalité malienne (« Ikasso » = « chez toi »)

## Fonctionnalités actuelles
- ✅ Système d'inscription en 3 étapes
- ✅ Envoi d'emails de vérification (Resend + noreply@ikasso.ml)
- ✅ Dashboards séparés : clients et hôtes
- ✅ Système de paiements (PayPal, Orange Money, Carte)
- ✅ Recherche et filtrage d'hébergements
- ✅ Interface responsive (mobile, tablette, desktop)
- ✅ Déployé sur Vercel : https://ikasso-pwxa.vercel.app

## Évolutions prévues
- [ ] Chat temps réel hôte–voyageur
- [ ] Application mobile native
- [ ] Recommandations personnalisées (IA)
- [ ] Intégration transports locaux
- [ ] Multilingue (Bambara, Français, Anglais)
- [ ] Vérification d'identité (NINA API Mali)

## Contribution
Les contributions sont les bienvenues. Merci de consulter le guide de contribution.

## Licence
Projet sous licence MIT. Voir `LICENSE`.

## Contact
contact@ikasso.ml

—
Ikasso — Découvrez l’hospitalité malienne, réservez chez vous !
