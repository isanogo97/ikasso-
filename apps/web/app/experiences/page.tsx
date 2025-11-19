'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Calendar, Users, Star, Heart, Clock, Filter, Menu, X } from 'lucide-react'
import Logo from '../components/Logo'

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

// Expériences d'exemple (à remplacer par de vraies données)
const sampleExperiences: Experience[] = [
  {
    id: '1',
    title: 'Cours de cuisine malienne traditionnelle',
    location: 'Bamako, Mali',
    price: 15000,
    rating: 4.9,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    duration: '3 heures',
    category: 'Gastronomie',
    hostName: 'Aminata Traoré',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
    description: 'Apprenez à préparer des plats traditionnels maliens avec une chef locale'
  },
  {
    id: '2',
    title: 'Visite guidée des marchés de Bamako',
    location: 'Bamako, Mali',
    price: 8000,
    rating: 4.7,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    duration: '2 heures',
    category: 'Culture',
    hostName: 'Moussa Keita',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    description: 'Découvrez les marchés colorés et l\'artisanat local avec un guide expérimenté'
  },
  {
    id: '3',
    title: 'Atelier de percussion djembé',
    location: 'Ségou, Mali',
    price: 12000,
    rating: 4.8,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    duration: '2.5 heures',
    category: 'Musique',
    hostName: 'Bakary Coulibaly',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    description: 'Initiez-vous aux rythmes traditionnels maliens avec un maître percussionniste'
  },
  {
    id: '4',
    title: 'Safari photo au parc national',
    location: 'Mopti, Mali',
    price: 35000,
    rating: 4.9,
    reviews: 43,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400',
    duration: 'Journée complète',
    category: 'Nature',
    hostName: 'Seydou Diarra',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    description: 'Explorez la faune et la flore maliennes avec un guide naturaliste'
  },
  {
    id: '5',
    title: 'Initiation à la poterie traditionnelle',
    location: 'Sikasso, Mali',
    price: 10000,
    rating: 4.6,
    reviews: 52,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    duration: '3 heures',
    category: 'Artisanat',
    hostName: 'Fatoumata Sanogo',
    hostAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    description: 'Créez vos propres objets en argile selon les techniques ancestrales'
  },
  {
    id: '6',
    title: 'Balade en pirogue sur le fleuve Niger',
    location: 'Mopti, Mali',
    price: 18000,
    rating: 4.8,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    duration: '4 heures',
    category: 'Nature',
    hostName: 'Ibrahim Maiga',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    description: 'Naviguez sur le fleuve Niger et découvrez les villages de pêcheurs'
  }
]

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
              <Link href="/"><Logo size="md" /></Link>
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Découvrez le Mali Authentique
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            Vivez des expériences uniques avec des locaux passionnés
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Où souhaitez-vous aller ?"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn-primary flex items-center justify-center">
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
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune expérience trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vous êtes un expert local ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Partagez votre passion et créez des expériences inoubliables pour les voyageurs
          </p>
          <Link href="/host/add-experience" className="btn-primary text-lg px-8 py-3">
            Proposer une expérience
          </Link>
        </div>
      </div>
    </div>
  )
}
