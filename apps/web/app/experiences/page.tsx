'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Calendar, Users, Star, Heart, Clock, Filter, Menu, X } from 'lucide-react'
import LogoFinal from '../components/LogoFinal'

interface Experience {
  id: string
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  image: string
  duration: string
  category: string
  hostName: string
  hostAvatar: string
  description: string
}

// Expériences réelles (vide pour l'instant - seront ajoutées par les hôtes)
const sampleExperiences: Experience[] = []

const categories = ['Tous', 'Gastronomie', 'Culture', 'Musique', 'Nature', 'Artisanat', 'Sport']

export default function ExperiencesPage() {
  const [searchLocation, setSearchLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [favorites, setFavorites] = useState<string[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleFavorite = (experienceId: string) => {
    setFavorites(prev => 
      prev.includes(experienceId) 
        ? prev.filter(id => id !== experienceId)
        : [...prev, experienceId]
    )
  }

  const filteredExperiences = sampleExperiences.filter(experience => {
    const matchesCategory = selectedCategory === 'Tous' || experience.category === selectedCategory
    const matchesLocation = searchLocation === '' || 
      experience.location.toLowerCase().includes(searchLocation.toLowerCase())
    return matchesCategory && matchesLocation
  })

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF', 
      minimumFractionDigits: 0 
    }).format(price)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/"><LogoFinal size="md" /></Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600">Accueil</Link>
              <Link href="/search" className="text-gray-700 hover:text-primary-600">Hébergements</Link>
              <Link href="/experiences" className="text-primary-600 font-medium">Expériences</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600">Devenir Hôte</Link>
              <Link href="/help" className="text-gray-700 hover:text-primary-600">Aide</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">Connexion</Link>
              <Link href="/auth/register" className="btn-primary">Inscription</Link>
            </div>
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700">Accueil</Link>
              <Link href="/search" className="block px-3 py-2 text-gray-700">Hébergements</Link>
              <Link href="/experiences" className="block px-3 py-2 text-primary-600 font-medium">Expériences</Link>
              <Link href="/host" className="block px-3 py-2 text-gray-700">Devenir Hôte</Link>
              <Link href="/help" className="block px-3 py-2 text-gray-700">Aide</Link>
              <div className="border-t pt-2">
                <Link href="/auth/login" className="block px-3 py-2 text-gray-700">Connexion</Link>
                <Link href="/auth/register" className="block px-3 py-2 text-primary-600 font-medium">Inscription</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            🎭 Expériences authentiques
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Découvrez le <span className="text-yellow-300">Mali Authentique</span>
          </h1>
          <p className="text-2xl mb-12 text-white/90 max-w-3xl mx-auto font-light">
            Vivez des expériences uniques avec des locaux passionnés
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Où souhaitez-vous aller ?"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 text-lg transition-all"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn-primary flex items-center justify-center px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all">
                <Search className="h-5 w-5 mr-2" />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredExperiences.length} expérience{filteredExperiences.length > 1 ? 's' : ''} 
            {selectedCategory !== 'Tous' && ` en ${selectedCategory}`}
          </h2>
          <button className="flex items-center text-gray-600 hover:text-gray-800">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </button>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={experience.image}
                  alt={experience.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(experience.id)}
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`h-5 w-5 ${
                      favorites.includes(experience.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    {experience.category}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Image
                    src={experience.hostAvatar}
                    alt={experience.hostName}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600">Avec {experience.hostName}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {experience.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {experience.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {experience.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {experience.duration}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{experience.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({experience.reviews})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(experience.price)}
                    </span>
                    <span className="text-sm text-gray-600 block">par personne</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExperiences.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <Search className="h-16 w-16 text-primary-600" />
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                🎉 Bientôt disponible !
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Aucune expérience n'est encore proposée.<br/>
                <span className="font-semibold text-primary-600">Soyez parmi les premiers à partager votre passion et créer des expériences inoubliables.</span>
              </p>
              <Link href="/auth/register-new" className="btn-primary inline-flex items-center text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all">
                <Star className="mr-2 h-5 w-5" />
                Proposer une expérience
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center transform hover:scale-105 transition-transform duration-300">
            <div className="inline-block mb-6 px-6 py-3 bg-primary-100 text-primary-700 rounded-full text-sm font-bold">
              💼 Devenez guide
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Vous êtes un expert local ?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Partagez votre passion et créez des expériences inoubliables pour les voyageurs
            </p>
            <Link href="/auth/register-new" className="btn-primary inline-flex items-center text-xl px-10 py-5 shadow-xl hover:shadow-2xl transition-all">
              <Heart className="mr-3 h-6 w-6" />
              Proposer une expérience
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
