"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users, Star, Heart, SlidersHorizontal, Grid, List, ChevronDown } from "lucide-react"

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

const allProperties: Property[] = [
  { id: "1", title: "Villa Moderne à Bamako", location: "Bamako, Mali", price: 25000, rating: 4.8, reviews: 24, image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400", type: "maison", amenities: ["WiFi", "Climatisation", "Piscine", "Parking"], guests: 6, bedrooms: 3, bathrooms: 2 },
  { id: "2", title: "Hôtel Le Diplomate", location: "Sikasso, Mali", price: 35000, rating: 4.6, reviews: 18, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", type: "hotel", amenities: ["WiFi", "Restaurant", "Spa", "Salle de sport"], guests: 2, bedrooms: 1, bathrooms: 1 },
  { id: "3", title: "Maison Traditionnelle Dogon", location: "Mopti, Mali", price: 15000, rating: 4.9, reviews: 32, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", type: "maison", amenities: ["Vue panoramique", "Cuisine équipée", "Terrasse"], guests: 4, bedrooms: 2, bathrooms: 1 },
  { id: "4", title: "Appartement Centre-ville", location: "Ségou, Mali", price: 20000, rating: 4.5, reviews: 15, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400", type: "appartement", amenities: ["WiFi", "Climatisation", "Balcon", "Proche marché"], guests: 3, bedrooms: 1, bathrooms: 1 },
  { id: "5", title: "Riad Authentique", location: "Tombouctou, Mali", price: 30000, rating: 4.7, reviews: 21, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", type: "maison", amenities: ["WiFi", "Climatisation", "Terrasse", "Vue historique"], guests: 5, bedrooms: 2, bathrooms: 2 },
  { id: "6", title: "Hôtel des Voyageurs", location: "Kayes, Mali", price: 18000, rating: 4.3, reviews: 12, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400", type: "hotel", amenities: ["WiFi", "Restaurant", "Parking", "Climatisation"], guests: 2, bedrooms: 1, bathrooms: 1 },
]

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(allProperties)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const [searchLocation, setSearchLocation] = useState(searchParams?.get("location") || "")
  const [checkIn, setCheckIn] = useState(searchParams?.get("checkin") || "")
  const [checkOut, setCheckOut] = useState(searchParams?.get("checkout") || "")
  const [guests, setGuests] = useState(Number(searchParams?.get("guests")) || 1)

  const [priceMax, setPriceMax] = useState(50000)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState("relevance")

  const allAmenities = ["WiFi", "Climatisation", "Piscine", "Parking", "Restaurant", "Spa", "Cuisine équipée", "Terrasse", "Vue panoramique"]

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
    setPriceMax(50000)
    setPropertyTypes([])
    setSelectedAmenities([])
    setMinRating(0)
    setSortBy("relevance")
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select className="input-field pl-10" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)}>
                  <option value="">Toutes les villes</option>
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

        <div className="flex flex-col lg:flex-row gap-8">
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filtres</h3>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">Effacer tout</button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Prix par nuit</h4>
                <div className="space-y-2">
                  <input type="range" min={0} max={50000} step={1000} value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} />
                  <div className="flex justify-between text-sm text-gray-600"><span>0</span><span>{formatPrice(priceMax)}</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Type d'hébergement</h4>
                <div className="space-y-2">
                  {[
                    { key: "hotel", label: "Hôtel" },
                    { key: "maison", label: "Maison" },
                    { key: "appartement", label: "Appartement" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input type="checkbox" className="mr-2" checked={propertyTypes.includes(key)} onChange={() => togglePropertyType(key)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Équipements</h4>
                <div className="grid grid-cols-2 gap-2">
                  {allAmenities.map((a) => (
                    <label key={a} className="flex items-center">
                      <input type="checkbox" className="mr-2" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)} />
                      <span className="text-sm">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Note minimale</h4>
                <div className="flex items-center gap-2">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button key={r} onClick={() => setMinRating(r)} className={`px-3 py-1 rounded border text-sm ${minRating === r ? 'border-primary-500 text-primary-700 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>{r === 0 ? 'Toutes' : `${r}+`}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button className="lg:hidden inline-flex items-center gap-2 px-3 py-2 border rounded" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" /> Filtres
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Afficher:</span>
                <button className={`p-2 border rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`} onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></button>
                <button className={`p-2 border rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`} onClick={() => setViewMode('list')}><List className="h-4 w-4" /></button>
              </div>
              <div className="relative">
                <select className="input-field pr-8" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevance">Pertinence</option>
                  <option value="price-low">Prix: bas à haut</option>
                  <option value="price-high">Prix: haut à bas</option>
                  <option value="rating">Note</option>
                  <option value="reviews">Avis</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 text-lg">Aucun hébergement ne correspond à vos critères.</div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProperties.map((property) => (
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
                      <div className="flex items-center justify-between">
                        <div><span className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</span><span className="text-gray-600 text-sm">/nuit</span></div>
                        <span className="text-sm text-gray-500">{property.reviews} avis</span>
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

