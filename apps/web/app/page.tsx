'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Calendar, Users, Star, Heart, Menu, X } from 'lucide-react'
import Logo from './components/Logo'

// Types
interface Property {
  id: string
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  image: string
  type: 'hotel' | 'maison' | 'appartement'
  amenities: string[]
}

// Sample data
const sampleProperties: Property[] = [
  {
    id: '1',
    title: 'Villa Moderne à Bamako',
    location: 'Bamako, Mali',
    price: 25000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    type: 'maison',
    amenities: ['WiFi', 'Climatisation', 'Piscine', 'Parking']
  },
  {
    id: '2',
    title: 'Hôtel Le Diplomate',
    location: 'Sikasso, Mali',
    price: 35000,
    rating: 4.6,
    reviews: 18,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    type: 'hotel',
    amenities: ['WiFi', 'Restaurant', 'Spa', 'Salle de sport']
  },
  {
    id: '3',
    title: 'Maison Traditionnelle Dogon',
    location: 'Mopti, Mali',
    price: 15000,
    rating: 4.9,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    type: 'maison',
    amenities: ['Vue panoramique', 'Cuisine équipée', 'Terrasse']
  },
  {
    id: '4',
    title: 'Appartement Centre-ville',
    location: 'Ségou, Mali',
    price: 20000,
    rating: 4.5,
    reviews: 15,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
    type: 'appartement',
    amenities: ['WiFi', 'Climatisation', 'Balcon', 'Proche marché']
  }
]

const cities = ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Tombouctou', 'Kayes', 'Koutiala', 'Gao']

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Logo size="md" />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-primary-600">Accueil</a>
              <Link href="/search" className="text-gray-700 hover:text-primary-600">Hébergements</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600">Devenir Hôte</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600">Tarifs</Link>
              <Link href="/help" className="text-gray-700 hover:text-primary-600">Aide</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/demo-accounts" className="text-primary-600 hover:text-primary-700 font-medium">Démo</Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">Connexion</Link>
              <Link href="/auth/register" className="btn-primary">Inscription</Link>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-700">Accueil</a>
              <a href="#" className="block px-3 py-2 text-gray-700">Hébergements</a>
              <Link href="/host" className="block px-3 py-2 text-gray-700">Devenir Hôte</Link>
              <Link href="/pricing" className="block px-3 py-2 text-gray-700">Tarifs</Link>
              <a href="#" className="block px-3 py-2 text-gray-700">Aide</a>
              <div className="border-t pt-2">
                <Link href="/demo-accounts" className="block px-3 py-2 text-primary-600 font-medium">Démo</Link>
                <Link href="/auth/login" className="block px-3 py-2 text-gray-700">Connexion</Link>
                <Link href="/auth/register" className="block px-3 py-2 text-primary-600 font-medium">Inscription</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue chez toi au Mali
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Découvrez des hébergements authentiques et confortables dans tout le Mali. 
              Des hôtels modernes aux maisons traditionnelles.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select 
                    className="input-field pl-10"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  >
                    <option value="">Choisir une ville</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    className="input-field pl-10"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    className="input-field pl-10"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select 
                    className="input-field pl-10"
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'voyageur' : 'voyageurs'}</option>
                    ))}
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

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Hébergements populaires</h3>
          <p className="text-lg text-gray-600">Découvrez nos hébergements les mieux notés au Mali</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleProperties.map((property) => (
            <div key={property.id} className="card overflow-hidden">
              <div className="relative">
                <Link href={`/property/${property.id}`}>
                  <Image 
                    src={property.image} 
                    alt={property.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                <button 
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart 
                    className={`h-4 w-4 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
                <div className="absolute top-3 left-3">
                  <span className="bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-medium capitalize">
                    {property.type}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/property/${property.id}`}>
                    <h4 className="font-semibold text-gray-900 hover:text-primary-600 truncate">{property.title}</h4>
                  </Link>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm text-gray-600">{property.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {property.amenities.slice(0, 2).map((amenity, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                  {property.amenities.length > 2 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      +{property.amenities.length - 2}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(property.price)}
                    </span>
                    <span className="text-gray-600 text-sm">/nuit</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {property.reviews} avis
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Ikasso */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir Ikasso ?</h3>
            <p className="text-lg text-gray-600">Votre plateforme de confiance pour l'hébergement au Mali</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Partout au Mali</h4>
              <p className="text-gray-600">Des hébergements dans toutes les régions du Mali, des grandes villes aux villages authentiques.</p>
            </div>

            <div className="text-center">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-secondary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Qualité garantie</h4>
              <p className="text-gray-600">Tous nos hébergements sont vérifiés et notés par notre communauté de voyageurs.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Accueil chaleureux</h4>
              <p className="text-gray-600">Découvrez l'hospitalité malienne avec des hôtes passionnés par leur région.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-xl font-bold mb-4">Ikasso</h5>
              <p className="text-gray-400 mb-4">Votre plateforme de réservation d'hébergements au Mali.</p>
              <p className="text-gray-400">"Chez toi" en bambara</p>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Destinations</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Bamako</a></li>
                <li><a href="#" className="hover:text-white">Sikasso</a></li>
                <li><a href="#" className="hover:text-white">Ségou</a></li>
                <li><a href="#" className="hover:text-white">Mopti</a></li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white">Nous contacter</a></li>
                <li><a href="#" className="hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
              </ul>
            </div>

            <div>
              <h6 className="font-semibold mb-4">Hôtes</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Devenir hôte</a></li>
                <li><a href="#" className="hover:text-white">Guide de l'hôte</a></li>
                <li><a href="#" className="hover:text-white">Centre de ressources</a></li>
                <li><a href="#" className="hover:text-white">Communauté</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ikasso. Tous droits r\\u00e9serv\\u00e9s. Fait avec \\u2764\\ufe0f pour le Mali.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


