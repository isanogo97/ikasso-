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

## Installation et développement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
git clone [repository-url]
cd ikasso
npm install
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

## Évolutions prévues
- [ ] Paiement mobile (Orange Money, etc.)
- [ ] Chat temps réel hôte–voyageur
- [ ] Application mobile
- [ ] Recommandations IA
- [ ] Intégration transports locaux
- [ ] Multilingue (Bambara, Français, Anglais)

## Contribution
Les contributions sont les bienvenues. Merci de consulter le guide de contribution.

## Licence
Projet sous licence MIT. Voir `LICENSE`.

## Contact
contact@ikasso.ml

—
Ikasso — Découvrez l’hospitalité malienne, réservez chez vous !