"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users, Star, SlidersHorizontal, Grid, List, Home, Building2, Hotel, Filter, X, ArrowRight } from "lucide-react"
import Logo from "../components/Logo"

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]
const allAmenities = ["WiFi", "Climatisation", "Piscine", "Parking", "Restaurant", "Spa", "Cuisine équipée", "Terrasse", "Vue panoramique"]

function SearchContent() {
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [searchLocation, setSearchLocation] = useState(searchParams?.get("location") || "")
  const [checkIn, setCheckIn] = useState(searchParams?.get("checkin") || "")
  const [checkOut, setCheckOut] = useState(searchParams?.get("checkout") || "")
  const [guests, setGuests] = useState(Number(searchParams?.get("guests")) || 1)

  const [priceMax, setPriceMax] = useState(150000)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [minRating, setMinRating] = useState(0)

  const togglePropertyType = (type: string) => setPropertyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  const toggleAmenity = (amenity: string) => setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price)

  const clearFilters = () => {
    setPriceMax(150000)
    setPropertyTypes([])
    setSelectedAmenities([])
    setMinRating(0)
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
          <p className="text-white/80">Explorez les hébergements disponibles au Mali</p>
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
              <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
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
            {/* Barre d'outils mobile */}
            <div className="flex items-center justify-between mb-6">
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
            </div>

            {/* Message "Aucun hébergement" */}
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <MapPin className="h-12 w-12 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Aucun hébergement pour l'instant
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                Nous lançons bientôt notre plateforme ! Les premiers hébergements 
                seront disponibles très prochainement.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/host" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">
                  <Star className="h-5 w-5" />
                  Devenir hôte
                </Link>
                <Link href="/" className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all">
                  Retour à l'accueil
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-8">
                Soyez parmi les premiers à proposer votre hébergement et bénéficiez d'avantages exclusifs !
              </p>
            </div>
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
                Appliquer
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
