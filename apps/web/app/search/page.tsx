'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { 
  Search, MapPin, Calendar, Users, Star, Heart, Filter, 
  SlidersHorizontal, Grid, List, ChevronDown 
} from 'lucide-react'

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
  guests: number
  bedrooms: number
  bathrooms: number
}

// Sample data - extended
const allProperties: Property[] = [
  {
    id: '1',
    title: 'Villa Moderne à Bamako',
    location: 'Bamako, Mali',
    price: 25000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    type: 'maison',
    amenities: ['WiFi', 'Climatisation', 'Piscine', 'Parking'],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2
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
    amenities: ['WiFi', 'Restaurant', 'Spa', 'Salle de sport'],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1
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
    amenities: ['Vue panoramique', 'Cuisine équipée', 'Terrasse'],
    guests: 4,
    bedrooms: 2,
    bathrooms: 1
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
    amenities: ['WiFi', 'Climatisation', 'Balcon', 'Proche marché'],
    guests: 3,
    bedrooms: 1,
    bathrooms: 1
  },
  {
    id: '5',
    title: 'Riad Authentique',
    location: 'Tombouctou, Mali',
    price: 30000,
    rating: 4.7,
    reviews: 21,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    type: 'maison',
    amenities: ['WiFi', 'Climatisation', 'Terrasse', 'Vue historique'],
    guests: 5,
    bedrooms: 2,
    bathrooms: 2
  },
  {
    id: '6',
    title: 'Hôtel des Voyageurs',
    location: 'Kayes, Mali',
    price: 18000,
    rating: 4.3,
    reviews: 12,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    type: 'hotel',
    amenities: ['WiFi', 'Restaurant', 'Parking', 'Climatisation'],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1
  }
]

const cities = ['Bamako', 'Sikasso', 'Ségou', 'Mopti', 'Tombouctou', 'Kayes', 'Koutiala', 'Gao']

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>(allProperties)
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(allProperties)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Search filters
  const [searchLocation, setSearchLocation] = useState(searchParams?.get('location') || '')
  const [checkIn, setCheckIn] = useState(searchParams?.get('checkin') || '')
  const [checkOut, setCheckOut] = useState(searchParams?.get('checkout') || '')
  const [guests, setGuests] = useState(Number(searchParams?.get('guests')) || 1)
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('relevance')

  const allAmenities = ['WiFi', 'Climatisation', 'Piscine', 'Parking', 'Restaurant', 'Spa', 'Cuisine équipée', 'Terrasse', 'Vue panoramique']

  const filterProperties = useCallback(() => {
    let filtered = allProperties.filter(property => {
      // Location filter
      if (searchLocation && !property.location.toLowerCase().includes(searchLocation.toLowerCase())) {
        return false
      }
      
      // Guests filter
      if (property.guests < guests) {
        return false
      }
      
      // Price filter
      if (property.price < priceRange[0] || property.price > priceRange[1]) {
        return false
      }
      
      // Property type filter
      if (propertyTypes.length > 0 && !propertyTypes.includes(property.type)) {
        return false
      }
      
      // Amenities filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenity => 
          property.amenities.includes(amenity)
        )
        if (!hasAllAmenities) return false
      }
      
      // Rating filter
      if (property.rating < minRating) {
        return false
      }
      
      return true
    })

    // Sort properties
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredProperties(filtered)
  }, [searchLocation, guests, priceRange, propertyTypes, selectedAmenities, minRating, sortBy])

  useEffect(() => {
    filterProperties()
  }, [filterProperties])

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const clearFilters = () => {
    setPriceRange([0, 50000])
    setPropertyTypes([])
    setSelectedAmenities([])
    setMinRating(0)
    setSortBy('relevance')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">Ikasso</Link>
              <span className="ml-2 text-sm text-gray-500">Chez Toi</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600">Accueil</Link>
              <Link href="/search" className="text-primary-600 font-medium">Hébergements</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600">Devenir Hôte</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600">Tarifs</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                  <option value="">Toutes les villes</option>
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

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtres</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Effacer tout
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Prix par nuit</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Property Types */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Type d'hébergement</h4>
                <div className="space-y-2">
                  {['hotel', 'maison', 'appartement'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={propertyTypes.includes(type)}
                        onChange={() => togglePropertyType(type)}
                        className="mr-2"
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Équipements</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {allAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="mr-2"
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Note minimum</h4>
                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {rating === 0 ? (
                          <span>Toutes les notes</span>
                        ) : (
                          <>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{rating}+</span>
                          </>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredProperties.length} hébergement{filteredProperties.length !== 1 ? 's' : ''} trouvé{filteredProperties.length !== 1 ? 's' : ''}
                </h2>
                {searchLocation && (
                  <p className="text-gray-600">à {searchLocation}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtres</span>
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="rating">Mieux notés</option>
                  <option value="reviews">Plus d'avis</option>
                </select>

                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Grid/List */}
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun hébergement ne correspond à vos critères.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 btn-primary"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-6'
              }>
                {filteredProperties.map((property) => (
                  <div key={property.id} className={`card overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-80 flex-shrink-0' : ''}`}>
                      <a href={`/property/${property.id}`}>
                        <Image 
                          src={property.image} 
                          alt={property.title}
                          width={600}
                          height={400}
                          className={`object-cover ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'}`}
                        />
                      </a>
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
                    
                    <div className="p-4 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <a href={`/property/${property.id}`}>
                          <h4 className="font-semibold text-gray-900 hover:text-primary-600 truncate">
                            {property.title}
                          </h4>
                        </a>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{property.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <span>{property.guests} voyageurs</span>
                        <span className="mx-2">•</span>
                        <span>{property.bedrooms} chambres</span>
                        <span className="mx-2">•</span>
                        <span>{property.bathrooms} sdb</span>
                      </div>
                      
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
