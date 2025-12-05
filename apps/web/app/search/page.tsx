"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users, Star, Heart, SlidersHorizontal, Grid, List, ChevronDown, Home, Building2, Hotel, Filter, X, ArrowRight, Sparkles } from "lucide-react"
import Logo from "../components/Logo"

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
  guests: number
  bedrooms: number
  bathrooms: number
}

// Propriétés d'exemple pour démonstration
const allProperties: Property[] = [
  {
    id: "1",
    title: "Hôtel Radisson Blu",
    location: "Bamako, ACI 2000",
    price: 85000,
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    type: "hotel",
    amenities: ["WiFi", "Piscine", "Climatisation", "Restaurant", "Spa"],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1
  },
  {
    id: "2",
    title: "Villa avec piscine",
    location: "Bamako, Badalabougou",
    price: 120000,
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    type: "maison",
    amenities: ["WiFi", "Piscine", "Climatisation", "Parking", "Cuisine équipée"],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2
  },
  {
    id: "3",
    title: "Appartement moderne centre-ville",
    location: "Bamako, Hamdallaye",
    price: 45000,
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop",
    type: "appartement",
    amenities: ["WiFi", "Climatisation", "Cuisine équipée", "Terrasse"],
    guests: 4,
    bedrooms: 2,
    bathrooms: 1
  },
  {
    id: "4",
    title: "Hôtel Azalaï",
    location: "Bamako, Quartier du fleuve",
    price: 75000,
    rating: 4.7,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    type: "hotel",
    amenities: ["WiFi", "Piscine", "Climatisation", "Restaurant", "Parking"],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1
  },
  {
    id: "5",
    title: "Maison traditionnelle avec cour",
    location: "Ségou, Centre",
    price: 35000,
    rating: 4.5,
    reviews: 42,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    type: "maison",
    amenities: ["WiFi", "Climatisation", "Cuisine équipée", "Terrasse"],
    guests: 5,
    bedrooms: 2,
    bathrooms: 1
  },
  {
    id: "6",
    title: "Studio cosy",
    location: "Bamako, Sotuba",
    price: 25000,
    rating: 4.4,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
    type: "appartement",
    amenities: ["WiFi", "Climatisation", "Cuisine équipée"],
    guests: 2,
    bedrooms: 1,
    bathrooms: 1
  },
]

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]
const allAmenities = ["WiFi", "Climatisation", "Piscine", "Parking", "Restaurant", "Spa", "Cuisine équipée", "Terrasse", "Vue panoramique"]

function SearchContent() {
  const searchParams = useSearchParams()
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(allProperties)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [searchLocation, setSearchLocation] = useState(searchParams?.get("location") || "")
  const [checkIn, setCheckIn] = useState(searchParams?.get("checkin") || "")
  const [checkOut, setCheckOut] = useState(searchParams?.get("checkout") || "")
  const [guests, setGuests] = useState(Number(searchParams?.get("guests")) || 1)

  const [priceMax, setPriceMax] = useState(150000)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState("relevance")

  const filterProperties = useCallback(() => {
    let filtered = allProperties.filter((property) => {
      if (searchLocation && !property.location.toLowerCase().includes(searchLocation.toLowerCase())) return false
      if (property.guests < guests) return false
      if (property.price > priceMax) return false
      if (propertyTypes.length > 0 && !propertyTypes.includes(property.type)) return false
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => property.amenities.includes(a))) return false
      if (property.rating < minRating) return false
      return true
    })

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      default:
        break
    }
    setFilteredProperties(filtered)
  }, [searchLocation, guests, priceMax, propertyTypes, selectedAmenities, minRating, sortBy])

  useEffect(() => { filterProperties() }, [filterProperties])

  const toggleFavorite = (id: string) => setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const togglePropertyType = (type: string) => setPropertyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  const toggleAmenity = (amenity: string) => setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price)

  const clearFilters = () => {
    setPriceMax(150000)
    setPropertyTypes([])
    setSelectedAmenities([])
    setMinRating(0)
    setSortBy("relevance")
  }

  const activeFiltersCount = propertyTypes.length + selectedAmenities.length + (minRating > 0 ? 1 : 0) + (priceMax < 150000 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/"><Logo size="md" /></Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">Accueil</Link>
              <Link href="/search" className="text-primary-600 font-semibold border-b-2 border-primary-600 pb-1">Hébergements</Link>
              <Link href="/experiences" className="text-gray-700 hover:text-primary-600 transition-colors">Expériences</Link>
              <Link href="/host" className="text-gray-700 hover:text-primary-600 transition-colors">Devenir Hôte</Link>
              <Link href="/help" className="text-gray-700 hover:text-primary-600 transition-colors">Aide</Link>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-primary-600 font-medium">Connexion</Link>
              <Link href="/auth/register-new" className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-full font-medium hover:shadow-lg transition-all">Inscription</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero compact */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Trouvez votre hébergement idéal</h1>
          <p className="text-white/80">Explorez {allProperties.length} hébergements disponibles au Mali</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white shadow-md -mt-4 relative z-10 mx-4 sm:mx-6 lg:mx-auto max-w-7xl rounded-2xl">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}>
                  <option value="">Toutes les villes</option>
                  {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="date" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (<option key={num} value={num}>{num} {num === 1 ? "voyageur" : "voyageurs"}</option>))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button onClick={filterProperties} className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <Search className="h-5 w-5" />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtres Desktop */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Effacer ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Prix */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Prix par nuit</h4>
                <div className="space-y-3">
                  <input 
                    type="range" 
                    min={0} 
                    max={150000} 
                    step={5000} 
                    value={priceMax} 
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">0 FCFA</span>
                    <span className="font-semibold text-primary-600">{formatPrice(priceMax)}</span>
                  </div>
                </div>
              </div>

              {/* Type d'hébergement */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Type d'hébergement</h4>
                <div className="space-y-3">
                  {[
                    { key: "hotel", label: "Hôtel", icon: Hotel },
                    { key: "maison", label: "Maison", icon: Home },
                    { key: "appartement", label: "Appartement", icon: Building2 },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${propertyTypes.includes(key) ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}>
                      <input type="checkbox" className="sr-only" checked={propertyTypes.includes(key)} onChange={() => togglePropertyType(key)} />
                      <Icon className={`h-5 w-5 ${propertyTypes.includes(key) ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${propertyTypes.includes(key) ? 'text-primary-700' : 'text-gray-700'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Équipements */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Équipements</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allAmenities.map((amenity) => (
                    <label key={amenity} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all ${selectedAmenities.includes(amenity) ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}>
                      <input type="checkbox" className="sr-only" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedAmenities.includes(amenity) ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                        {selectedAmenities.includes(amenity) && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                      </div>
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Note minimale */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Note minimale</h4>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button 
                      key={r} 
                      onClick={() => setMinRating(r)} 
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${minRating === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {r === 0 ? 'Tous' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all" 
                  onClick={() => setShowMobileFilters(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">{activeFiltersCount}</span>
                  )}
                </button>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredProperties.length}</span> hébergements trouvés
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button 
                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`} 
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button 
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`} 
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <select 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Pertinence</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                  <option value="rating">Meilleures notes</option>
                  <option value="reviews">Plus d'avis</option>
                </select>
              </div>
            </div>

            {/* Liste des propriétés */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun résultat</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Aucun hébergement ne correspond à vos critères. Essayez de modifier vos filtres.
                </p>
                <button onClick={clearFilters} className="text-primary-600 font-semibold hover:text-primary-700">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProperties.map((property) => (
                  <div key={property.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group ${viewMode === 'list' ? 'flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-72 flex-shrink-0' : ''}`}>
                      <Link href={`/property/${property.id}`}>
                        <div className="relative overflow-hidden">
                          <Image 
                            src={property.image} 
                            alt={property.title} 
                            width={600} 
                            height={400} 
                            className={`w-full object-cover group-hover:scale-110 transition-transform duration-500 ${viewMode === 'list' ? 'h-full' : 'h-56'}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </Link>
                      <button 
                        onClick={() => toggleFavorite(property.id)} 
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-110 transition-all"
                      >
                        <Heart className={`h-5 w-5 ${favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold capitalize shadow-lg">
                          {property.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/property/${property.id}`}>
                          <h3 className="font-bold text-lg text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">{property.title}</h3>
                        </Link>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-800">{property.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                            +{property.amenities.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">{formatPrice(property.price)}</span>
                          <span className="text-gray-500 text-sm"> /nuit</span>
                        </div>
                        <Link 
                          href={`/property/${property.id}`}
                          className="text-primary-600 font-semibold text-sm hover:text-primary-700 flex items-center gap-1 group/link"
                        >
                          Voir 
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Filtres Mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filtres</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Prix */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Prix par nuit</h4>
                <input 
                  type="range" 
                  min={0} 
                  max={150000} 
                  step={5000} 
                  value={priceMax} 
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">0 FCFA</span>
                  <span className="font-semibold text-primary-600">{formatPrice(priceMax)}</span>
                </div>
              </div>

              {/* Type */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Type d'hébergement</h4>
                <div className="space-y-3">
                  {[
                    { key: "hotel", label: "Hôtel", icon: Hotel },
                    { key: "maison", label: "Maison", icon: Home },
                    { key: "appartement", label: "Appartement", icon: Building2 },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${propertyTypes.includes(key) ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50 border-2 border-transparent'}`}>
                      <input type="checkbox" className="sr-only" checked={propertyTypes.includes(key)} onChange={() => togglePropertyType(key)} />
                      <Icon className={`h-5 w-5 ${propertyTypes.includes(key) ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${propertyTypes.includes(key) ? 'text-primary-700' : 'text-gray-700'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Équipements */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Équipements</h4>
                <div className="flex flex-wrap gap-2">
                  {allAmenities.map((amenity) => (
                    <button 
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedAmenities.includes(amenity) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Note minimale</h4>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button 
                      key={r} 
                      onClick={() => setMinRating(r)} 
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${minRating === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {r === 0 ? 'Tous' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3">
              <button onClick={clearFilters} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
                Effacer
              </button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700">
                Voir {filteredProperties.length} résultats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
