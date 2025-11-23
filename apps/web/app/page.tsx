"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Calendar, Users, Star, Heart, Menu, X } from "lucide-react"
import Logo from "./components/Logo"

interface Property {
  id: string
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  image: string
  type: "hotel" | "maison" | "appartement"
  amenities: string[]
}

// SITE EN PRODUCTION - PLUS DE DONNÉES DE DÉMONSTRATION
// Toutes les fausses annonces ont été supprimées pour le lancement officiel
const sampleProperties: Property[] = []

// Vérification: le tableau est bien vide
console.log('Propriétés chargées:', sampleProperties.length)

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  // FORCE: Vérification que les propriétés sont bien vides
  console.log('🚀 IKASSO - Mode Production - Propriétés:', sampleProperties.length)
  console.log('🚀 IKASSO - Timestamp:', new Date().toISOString())

  const toggleFavorite = (propertyId: string) => {
    setFavorites((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/"><Logo size="md" /></Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600">Accueil</Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600">Hébergements</Link>
              <Link href="/experiences" className="text-gray-700 hover:text-primary-600">Expériences</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600">Devenir Hôte</Link>
              <Link href="/help" className="text-gray-700 hover:text-primary-600">Aide</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">Connexion</Link>
              <Link href="/auth/register-new" className="btn-primary">Inscription</Link>
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700">Accueil</Link>
              <Link href="/search" className="block px-3 py-2 text-gray-700">Hébergements</Link>
              <Link href="/experiences" className="block px-3 py-2 text-gray-700">Expériences</Link>
              <Link href="/host" className="block px-3 py-2 text-gray-700">Devenir Hôte</Link>
              <Link href="/help" className="block px-3 py-2 text-gray-700">Aide</Link>
              <div className="border-t pt-2">
                <Link href="/auth/login" className="block px-3 py-2 text-gray-700">Connexion</Link>
                <Link href="/auth/register-new" className="block px-3 py-2 text-primary-600 font-medium">Inscription</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              🇲🇱 Plateforme malienne d'hébergement
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Trouvez votre <span className="text-yellow-300">hébergement idéal</span> au Mali
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              Découvrez des hébergements authentiques et confortables dans tout le Mali.<br/>
              <span className="font-semibold text-yellow-200">Des hôtels modernes aux maisons traditionnelles.</span>
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-12 backdrop-blur-sm border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select className="input-field pl-10" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}>
                    <option value="">Choisir une ville</option>
                    {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="date" className="input-field pl-10" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input type="date" className="input-field pl-10" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select className="input-field pl-10" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (<option key={num} value={num}>{num} {num === 1 ? "voyageur" : "voyageurs"}</option>))}
                  </select>
                </div>
              </div>
            </div>

            <button className="w-full md:w-auto btn-primary mt-6 px-8 py-3 text-lg">
              <Search className="inline-block mr-2 h-5 w-5" />
              Rechercher
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
            ⭐ Bientôt disponible
          </div>
          <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Hébergements au Mali
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez bientôt nos premiers hébergements authentiques et confortables
          </p>
        </div>
        {sampleProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-xl">
                  <MapPin className="h-16 w-16 text-primary-600" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                🚀 Site en Production
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Nous préparons une sélection exceptionnelle d'hébergements au Mali.<br/>
                <span className="font-semibold text-primary-600">Les premiers hôtes rejoignent notre plateforme très prochainement.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/register-new" className="btn-primary inline-flex items-center text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all">
                  <Star className="mr-2 h-5 w-5" />
                  Devenir hôte
                </Link>
                <Link href="/help" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg">
                  En savoir plus
                  <Heart className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-6 italic">
                ✨ Soyez parmi les premiers à proposer votre hébergement et bénéficiez d'avantages exclusifs
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleProperties.map((property) => (
            <div key={property.id} className="card overflow-hidden">
              <div className="relative">
                <Link href={`/property/${property.id}`}>
                  <Image src={property.image} alt={property.title} width={600} height={400} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200" />
                </Link>
                <button onClick={() => toggleFavorite(property.id)} className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                  <Heart className={`h-4 w-4 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <div className="absolute top-3 left-3"><span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">{property.type}</span></div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/property/${property.id}`}><h4 className="font-semibold text-gray-900 hover:text-primary-600 truncate">{property.title}</h4></Link>
                  <div className="flex items-center"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="ml-1 text-sm text-gray-600">{property.rating}</span></div>
                </div>
                <p className="text-gray-600 text-sm mb-2 flex items-center"><MapPin className="h-4 w-4 mr-1" />{property.location}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {property.amenities.slice(0, 2).map((amenity, index) => (<span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{amenity}</span>))}
                  {property.amenities.length > 2 && (<span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{property.amenities.length - 2}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <div><span className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</span><span className="text-gray-600 text-sm">/nuit</span></div>
                  <span className="text-sm text-gray-500">{property.reviews} avis</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-to-br from-white via-primary-50 to-secondary-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block mb-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
              🏆 Nos avantages
            </div>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Pourquoi choisir Ikasso ?
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Votre plateforme de confiance pour l'hébergement au Mali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Partout au Mali</h4>
              <p className="text-gray-600 leading-relaxed">
                Des hébergements dans toutes les régions du Mali, des grandes villes aux villages authentiques.
              </p>
            </div>
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-yellow-500 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Star className="h-10 w-10 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Qualité garantie</h4>
              <p className="text-gray-600 leading-relaxed">
                Tous nos hébergements sont vérifiés et notés par notre communauté de voyageurs.
              </p>
            </div>
            <div className="group text-center transform hover:scale-105 transition-all duration-300">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Heart className="h-10 w-10 text-white" />
                </div>
              </div>
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Accueil chaleureux</h4>
              <p className="text-gray-600 leading-relaxed">
                Découvrez l'hospitalité malienne avec des hôtes passionnés par leur région.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <Logo size="md" />
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Votre plateforme de réservation d'hébergements au Mali.
              </p>
              <p className="text-gray-400 italic">
                "Chez toi" en bambara 🇲🇱
              </p>
            </div>
            <div>
              <h6 className="font-bold text-lg mb-4 text-primary-300">Destinations</h6>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/search" className="hover:text-primary-400 transition-colors flex items-center">→ Bamako</Link></li>
                <li><Link href="/search" className="hover:text-primary-400 transition-colors flex items-center">→ Sikasso</Link></li>
                <li><Link href="/search" className="hover:text-primary-400 transition-colors flex items-center">→ Ségou</Link></li>
                <li><Link href="/search" className="hover:text-primary-400 transition-colors flex items-center">→ Mopti</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-bold text-lg mb-4 text-primary-300">Support</h6>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/help" className="hover:text-primary-400 transition-colors flex items-center">→ Centre d'aide</Link></li>
                <li><Link href="/help" className="hover:text-primary-400 transition-colors flex items-center">→ Nous contacter</Link></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors flex items-center">→ Conditions</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors flex items-center">→ Confidentialité</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-bold text-lg mb-4 text-primary-300">Hôtes</h6>
              <ul className="space-y-3 text-gray-300">
                <li><Link href="/host" className="hover:text-primary-400 transition-colors flex items-center">→ Devenir hôte</Link></li>
                <li><Link href="/help" className="hover:text-primary-400 transition-colors flex items-center">→ Guide de l'hôte</Link></li>
                <li><Link href="/help" className="hover:text-primary-400 transition-colors flex items-center">→ Ressources</Link></li>
                <li><Link href="/help" className="hover:text-primary-400 transition-colors flex items-center">→ Communauté</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-center md:text-left">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-primary-300">Ikasso</span>. Tous droits réservés.
              </p>
              <p className="text-gray-400 text-center md:text-right">
                Plateforme malienne d'hébergement 🇲🇱
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
