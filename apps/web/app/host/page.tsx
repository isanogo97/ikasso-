'use client'

import React from 'react'
import Link from 'next/link'
import { Home, DollarSign, Shield, Users, Star, TrendingUp, Calendar, MessageCircle, Award, ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'

export default function HostPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/help" className="text-gray-600 hover:text-primary-600">Aide</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-primary-600">Connexion</Link>
              <Link href="/auth/register-new" className="btn-primary">Inscription</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
            🏡 Rejoignez notre communauté d'hôtes
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            Devenez hôte sur <span className="text-yellow-300">Ikasso</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto font-light leading-relaxed">
            Transformez votre propriété en source de revenus et partagez l'hospitalité malienne avec le monde entier
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/register-new" className="inline-flex items-center bg-white text-primary-700 px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
              Commencer maintenant
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
            <Link href="#avantages" className="inline-flex items-center border-2 border-white text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white hover:text-primary-700 transition-all transform hover:scale-105">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-primary-600 mb-2">100%</div>
              <p className="text-gray-600 text-lg">Gratuit pour commencer</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-primary-600 mb-2">8%</div>
              <p className="text-gray-600 text-lg">Commission seulement</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-primary-600 mb-2">24h</div>
              <p className="text-gray-600 text-lg">Paiement rapide</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-primary-600 mb-2">24/7</div>
              <p className="text-gray-600 text-lg">Support disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="avantages" className="py-24 bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-6 py-3 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
              🎁 Avantages exclusifs
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Pourquoi devenir hôte sur Ikasso ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rejoignez la première plateforme malienne d'hébergement et profitez d'avantages exclusifs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Revenus supplémentaires</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Générez des revenus passifs avec votre propriété. Fixez vos propres prix et disponibilités.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Protection totale</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Assurance incluse, paiements sécurisés et vérification des voyageurs pour votre tranquillité.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Communauté active</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Rejoignez une communauté d'hôtes passionnés et partagez vos expériences.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-orange-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visibilité maximale</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Profitez de notre marketing pour attirer plus de voyageurs vers votre propriété.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-pink-500 to-pink-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestion simplifiée</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Tableau de bord intuitif pour gérer vos réservations, disponibilités et revenus.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-yellow-500 to-yellow-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Support dédié</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Notre équipe est disponible 24/7 pour répondre à toutes vos questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold">
            🚀 Lancez-vous maintenant
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
            Prêt à devenir hôte ?
          </h2>
          <p className="text-xl md:text-2xl mb-12 font-light leading-relaxed">
            Inscrivez-vous gratuitement et commencez à accueillir vos premiers voyageurs dès aujourd'hui
          </p>
          <Link href="/auth/register-new" className="inline-flex items-center bg-white text-primary-700 px-12 py-6 rounded-2xl text-2xl font-extrabold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110">
            <Award className="mr-3 h-8 w-8" />
            Créer mon compte hôte
          </Link>
          <p className="mt-8 text-white/80 text-lg">
            ✨ Inscription 100% gratuite • Sans engagement • Validé en 24h
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Logo size="md" />
          <p className="mt-4 text-gray-400">
            © {new Date().getFullYear()} Ikasso Mali. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
