"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Calendar, Users, Star, Menu, X, Shield, Clock, CreditCard, Home, Building2, Hotel, ArrowRight, CheckCircle, Play, Sparkles } from "lucide-react"
import Logo from "./components/Logo"

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]

const propertyTypes = [
  { name: "Hôtels", icon: Hotel, description: "Confort et services", color: "from-blue-500 to-blue-700" },
  { name: "Maisons", icon: Home, description: "Espace et authenticité", color: "from-green-500 to-green-700" },
  { name: "Appartements", icon: Building2, description: "Pratique et économique", color: "from-purple-500 to-purple-700" },
]

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/"><Logo size="md" /></Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-primary-600 font-semibold">Accueil</Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600 transition-colors">Hébergements</Link>
              <Link href="/experiences" className="text-gray-700 hover:text-primary-600 transition-colors">Expériences</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600 transition-colors">Devenir Hôte</Link>
              <Link href="/help" className="text-gray-700 hover:text-primary-600 transition-colors">Aide</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 font-medium">Connexion</Link>
              <Link href="/auth/register-new" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all">Inscription</Link>
            </div>
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <Link href="/" className="block px-4 py-3 text-primary-600 font-semibold rounded-lg bg-primary-50">Accueil</Link>
              <Link href="/search" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Hébergements</Link>
              <Link href="/experiences" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Expériences</Link>
              <Link href="/host" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Devenir Hôte</Link>
              <Link href="/help" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Aide</Link>
              <div className="border-t pt-4 mt-4 space-y-2">
                <Link href="/auth/login" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Connexion</Link>
                <Link href="/auth/register-new" className="block px-4 py-3 text-center bg-primary-600 text-white rounded-lg font-medium">Inscription</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background avec gradient et pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }}></div>
        
        {/* Cercles décoratifs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">La première plateforme malienne d'hébergement</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Réservez votre
                <span className="block text-yellow-300">séjour au Mali</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                Découvrez des hébergements uniques dans tout le Mali. 
                Des hôtels de luxe aux maisons traditionnelles, 
                trouvez l'endroit parfait pour votre séjour.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Réservation sécurisée</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Paiement flexible</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>Support 24/7</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/search" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
                  Explorer
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/host" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all">
                  <Play className="h-5 w-5" />
                  Devenir hôte
                </Link>
              </div>
            </div>

            {/* Formulaire de recherche */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Trouvez votre hébergement</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
                      value={searchLocation} 
                      onChange={(e) => setSearchLocation(e.target.value)}
                    >
                      <option value="">Où allez-vous ?</option>
                      {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Arrivée</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="date" 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        value={checkIn} 
                        onChange={(e) => setCheckIn(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Départ</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="date" 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        value={checkOut} 
                        onChange={(e) => setCheckOut(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Voyageurs</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900"
                      value={guests} 
                      onChange={(e) => setGuests(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>{num} {num === 1 ? "voyageur" : "voyageurs"}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Link 
                  href="/search" 
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Rechercher
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types d'hébergements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Types d'hébergements
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Que vous cherchiez le confort d'un hôtel ou l'authenticité d'une maison traditionnelle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {propertyTypes.map((type, index) => (
              <Link 
                key={type.name}
                href="/search"
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">{type.name}</h3>
                  <p className="text-gray-600 group-hover:text-white/80 transition-colors">{type.description}</p>
                  <div className="mt-6 flex items-center text-primary-600 group-hover:text-white font-semibold transition-colors">
                    Découvrir <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Message "Aucun hébergement pour l'instant" */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-12">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <MapPin className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Aucun hébergement pour l'instant
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nous lançons bientôt notre plateforme ! Soyez parmi les premiers hôtes à proposer 
              votre hébergement au Mali et bénéficiez d'avantages exclusifs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/host" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">
                <Star className="h-5 w-5" />
                Devenir hôte
              </Link>
              <Link href="/auth/register-new" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-full font-bold text-lg border-2 border-primary-200 hover:border-primary-300 hover:shadow-lg transition-all">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi Ikasso */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Ikasso ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              La plateforme de confiance pour vos séjours au Mali
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Réservation sécurisée</h3>
              <p className="text-gray-600">Vos paiements sont protégés et vos données personnelles sécurisées</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support 24/7</h3>
              <p className="text-gray-600">Notre équipe est disponible à tout moment pour vous assister</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Paiement flexible</h3>
              <p className="text-gray-600">Orange Money, carte bancaire ou espèces à l'arrivée</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Qualité vérifiée</h3>
              <p className="text-gray-600">Tous nos hébergements seront inspectés et validés</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Devenir hôte */}
      <section className="py-20 bg-gradient-to-br from-secondary-600 to-secondary-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Vous avez un hébergement à proposer ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté d'hôtes et commencez à gagner de l'argent 
            en accueillant des voyageurs du monde entier.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/host" className="inline-flex items-center gap-2 bg-white text-secondary-700 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
              Devenir hôte
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/help" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" />
              <p className="text-gray-400 mt-4 leading-relaxed">
                Votre plateforme de réservation d'hébergements au Mali.
              </p>
              <p className="text-gray-500 mt-2 text-sm italic">
                "Chez toi" en bambara 🇲🇱
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/search" className="hover:text-white transition-colors">Bamako</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Sikasso</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Ségou</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Mopti</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Centre d'aide</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Nous contacter</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Hôtes</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/host" className="hover:text-white transition-colors">Devenir hôte</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Guide de l'hôte</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Ressources</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Communauté</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Ikasso. Tous droits réservés.
            </p>
            <p className="text-gray-400 text-sm">
              Plateforme malienne d'hébergement 🇲🇱
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
