'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Home, Star, CreditCard, MapPin, Phone, Mail } from 'lucide-react';
import Logo from '../components/Logo';

export default function DemoAccounts() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const accounts = [
    {
      id: 'traveler',
      type: 'Voyageur',
      name: 'Amadou Diallo',
      email: 'amadou.diallo@email.com',
      phone: '+223 70 12 34 56',
      location: 'Bamako, Mali',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      stats: {
        bookings: 12,
        spent: '2,450,000',
        favorites: 8,
        reviews: 15
      },
      dashboardUrl: '/dashboard',
      description: 'Compte voyageur avec historique de réservations et favoris',
      features: [
        'Historique des réservations',
        'Liste des favoris',
        'Profil voyageur',
        'Avis et évaluations'
      ]
    },
    {
      id: 'host',
      type: 'Hôte',
      name: 'Fatou Keita',
      email: 'fatou.keita@email.com',
      phone: '+223 76 98 76 54',
      location: 'Sikasso, Mali',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      stats: {
        properties: 3,
        earnings: '8,750,000',
        bookings: 45,
        rating: 4.8
      },
      dashboardUrl: '/dashboard/host',
      description: 'Compte hôte avec propriétés et gestion des réservations',
      features: [
        'Gestion des propriétés',
        'Suivi des revenus',
        'Gestion des réservations',
        'Statistiques détaillées'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Connexion réelle
              </Link>
              <Link
                href="/"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Comptes de Démonstration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Testez les fonctionnalités d'Ikasso avec nos comptes de démonstration. 
            Choisissez entre un compte voyageur ou un compte hôte pour explorer les différents tableaux de bord.
          </p>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                selectedAccount === account.id
                  ? 'border-primary-500 ring-4 ring-primary-100'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="p-8">
                {/* Account Type Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    account.type === 'Voyageur' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {account.type === 'Voyageur' ? <User className="w-4 h-4 mr-1" /> : <Home className="w-4 h-4 mr-1" />}
                    {account.type}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {account.type === 'Hôte' ? account.stats.rating : '4.9'}
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex items-center mb-6">
                  <Image
                    src={account.avatar}
                    alt={account.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{account.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {account.location}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {account.email}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {account.phone}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {account.type === 'Voyageur' ? (
                    <>
                      <div className="text-center p-3 bg-primary-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{account.stats.bookings}</div>
                        <div className="text-sm text-gray-600">Réservations</div>
                      </div>
                      <div className="text-center p-3 bg-secondary-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{account.stats.favorites}</div>
                        <div className="text-sm text-gray-600">Favoris</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center p-3 bg-primary-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{account.stats.properties}</div>
                        <div className="text-sm text-gray-600">Propriétés</div>
                      </div>
                      <div className="text-center p-3 bg-secondary-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary-600">{account.stats.bookings}</div>
                        <div className="text-sm text-gray-600">Réservations</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{account.description}</p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Fonctionnalités disponibles :</h4>
                  <ul className="space-y-1">
                    {account.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href={account.dashboardUrl}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    Accéder au tableau de bord
                    {account.type === 'Voyageur' ? <User className="w-4 h-4 ml-2" /> : <Home className="w-4 h-4 ml-2" />}
                  </Link>
                  
                  <button
                    onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                    className="w-full border-2 border-primary-200 text-primary-600 py-2 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                  >
                    {selectedAccount === account.id ? 'Masquer les détails' : 'Voir les détails'}
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedAccount === account.id && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-3">Données de test incluses :</h5>
                    {account.type === 'Voyageur' ? (
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• {account.stats.bookings} réservations avec historique complet</p>
                        <p>• {account.stats.spent} FCFA dépensés au total</p>
                        <p>• {account.stats.favorites} propriétés en favoris</p>
                        <p>• {account.stats.reviews} avis laissés</p>
                        <p>• Profil complet avec préférences</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• {account.stats.properties} propriétés actives</p>
                        <p>• {account.stats.earnings} FCFA de revenus générés</p>
                        <p>• {account.stats.bookings} réservations gérées</p>
                        <p>• Note moyenne de {account.stats.rating}/5</p>
                        <p>• Statistiques détaillées et analytics</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions d'utilisation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-3">Compte Voyageur (Amadou)</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Explorez l'historique des réservations</li>
                <li>• Consultez les propriétés favorites</li>
                <li>• Vérifiez les statistiques de voyage</li>
                <li>• Testez les fonctionnalités de profil</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-3">Compte Hôte (Fatou)</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Gérez les propriétés et leur statut</li>
                <li>• Suivez les revenus et commissions</li>
                <li>• Approuvez ou refusez les réservations</li>
                <li>• Analysez les performances</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <p className="text-primary-800">
              <strong>Note :</strong> Ces comptes sont uniquement à des fins de démonstration. 
              Toutes les données sont fictives et aucune transaction réelle n'est effectuée.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
