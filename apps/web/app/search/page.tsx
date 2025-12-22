"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Search, MapPin, Calendar, Users, Star, Home, Building2, Hotel, 
  X, ArrowRight, Globe, Menu, SlidersHorizontal, Sparkles, ArrowLeft
} from "lucide-react"
import LogoFinal from '../components/LogoFinal'

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]
const allAmenities = ["WiFi", "Climatisation", "Piscine", "Parking", "Restaurant", "Spa", "Cuisine équipée", "Terrasse", "Vue panoramique"]

// Catégories style Airbnb
const categories = [
  { id: "all", name: "Tout", icon: Home },
  { id: "hotel", name: "Hôtels", icon: Hotel },
  { id: "maison", name: "Maisons", icon: Home },
  { id: "appartement", name: "Appartements", icon: Building2 },
  { id: "villa", name: "Villas", icon: Sparkles },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showMobileSearch, setShowMobileSearch] = useState(false)

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Style Airbnb - Responsive */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between h-14 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-gray-600 sm:hidden" />
              <span className="hidden sm:block"><LogoFinal size="md" /></span>
              <span className="sm:hidden"><LogoFinal size="sm" /></span>
            </Link>

            {/* Barre de recherche compacte - Desktop */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all">
                <button className="px-3 lg:px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                  {searchLocation || "Destination"}
                </button>
                <button className="px-3 lg:px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                  {checkIn || "Arrivée"}
                </button>
                <button className="hidden lg:block px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                  {checkOut || "Départ"}
                </button>
                <button className="px-3 lg:px-4 py-2 text-sm text-gray-600">
                  {guests} voyageur{guests > 1 ? 's' : ''}
                </button>
                <button className="bg-primary-500 text-white p-2 m-1 rounded-full">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile search button */}
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden flex-1 mx-4 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm"
            >
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500 truncate">{searchLocation || "Rechercher"}</span>
            </button>

            {/* Actions droite - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/host"
                className="px-3 lg:px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Devenir hôte
              </Link>
              
              <Link 
                href="/auth/login"
                className="px-3 lg:px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Connexion
              </Link>
              
              <Link 
                href="/auth/register-new"
                className="px-4 lg:px-5 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-full transition-all"
              >
                Inscription
              </Link>
              
              <button className="p-3 hover:bg-gray-100 rounded-full transition-all">
                <Globe className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Menu mobile */}
            <div className="relative md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link href="/auth/register-new" className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50">
                      Inscription
                    </Link>
                    <Link href="/auth/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      Connexion
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link href="/host" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      Devenir hôte
                    </Link>
                    <Link href="/help" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      Centre d'aide
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Barre de catégories - Responsive */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 py-3 sm:py-6">
              {/* Catégories */}
              <div className="flex items-center gap-4 sm:gap-8 lg:gap-12 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 sm:gap-3 min-w-fit pb-2 sm:pb-3 border-b-[3px] transition-all ${
                      selectedCategory === cat.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <cat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${selectedCategory === cat.id ? 'text-primary-500' : ''}`} />
                    <span className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Bouton Filtres */}
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-md transition-all flex-shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-500 text-white text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20 py-6 sm:py-8">
        {/* Message "Aucun logement" - Responsive */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl mx-auto px-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Aucun logement pour l'instant
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Nous lançons bientôt notre plateforme au Mali. 
              Soyez parmi les premiers hôtes à nous rejoindre !
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link 
                href="/host"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all text-sm sm:text-base"
              >
                Devenir hôte
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Recherche Mobile */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button 
                onClick={() => setShowMobileSearch(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="font-semibold">Rechercher</span>
              <div className="w-9"></div>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Où allez-vous ?"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                {/* Suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {cities.slice(0, 4).map(city => (
                    <button
                      key={city}
                      onClick={() => setSearchLocation(city)}
                      className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Arrivée</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Départ</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Voyageurs */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Voyageurs</label>
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-base">{guests} voyageur{guests > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:border-gray-400"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{guests}</span>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:border-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowMobileSearch(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold text-base"
              >
                <Search className="h-5 w-5" />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Filtres - Responsive */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:mx-4 max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="font-semibold text-gray-900">Filtres</h2>
                <button 
                  onClick={clearFilters}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  Effacer
                </button>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
                {/* Type de logement */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Type de logement</h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { key: "hotel", label: "Hôtel", icon: Hotel },
                      { key: "maison", label: "Maison", icon: Home },
                      { key: "appartement", label: "Appart.", icon: Building2 },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => togglePropertyType(key)}
                        className={`flex flex-col items-center gap-1 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          propertyTypes.includes(key) 
                            ? 'border-gray-900 bg-gray-50' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${propertyTypes.includes(key) ? 'text-gray-900' : 'text-gray-400'}`} />
                        <span className={`text-xs sm:text-sm font-medium ${propertyTypes.includes(key) ? 'text-gray-900' : 'text-gray-600'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fourchette de prix */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Fourchette de prix</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">Prix par nuit</p>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min={0} 
                      max={150000} 
                      step={5000} 
                      value={priceMax} 
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full accent-gray-900"
                    />
                    <div className="flex justify-between mt-2 gap-3">
                      <div className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm">
                        <span className="text-gray-500">Min</span>
                        <div className="font-medium">0 FCFA</div>
                      </div>
                      <div className="flex-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm">
                        <span className="text-gray-500">Max</span>
                        <div className="font-medium">{formatPrice(priceMax)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Équipements</h3>
                  <div className="flex flex-wrap gap-2">
                    {allAmenities.map((amenity) => (
                      <button 
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all ${
                          selectedAmenities.includes(amenity) 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Note minimale</h3>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button 
                        key={r} 
                        onClick={() => setMinRating(r)} 
                        className={`flex-1 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium border transition-all ${
                          minRating === r 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {r === 0 ? 'Tous' : (
                          <span className="flex items-center justify-center gap-1">
                            {r}+ <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all text-sm sm:text-base"
                >
                  Afficher les résultats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer simplifié - Responsive */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span>© {new Date().getFullYear()} Ikasso</span>
              <span className="hidden sm:inline">·</span>
              <a href="#" className="hover:underline">Confidentialité</a>
              <span className="hidden sm:inline">·</span>
              <a href="#" className="hover:underline">Conditions</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-900 hover:underline">
                <Globe className="h-4 w-4" />
                Français (FR)
              </button>
              <span className="text-xs sm:text-sm font-medium text-gray-900">FCFA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
