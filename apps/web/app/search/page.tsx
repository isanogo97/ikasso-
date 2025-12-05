"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Search, MapPin, Calendar, Users, Star, Home, Building2, Hotel, 
  X, ArrowRight, Globe, Menu, SlidersHorizontal, Sparkles
} from "lucide-react"
import Logo from "../components/Logo"

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
    <div className="min-h-screen bg-white">
      {/* Header Style Airbnb */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Barre de recherche compacte - Centre */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all">
                <button className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                  {searchLocation || "Destination"}
                </button>
                <button className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                  {checkIn || "Arrivée"}
                </button>
                <button className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                  {checkOut || "Départ"}
                </button>
                <button className="px-4 py-2 text-sm text-gray-600">
                  {guests} voyageur{guests > 1 ? 's' : ''}
                </button>
                <button className="bg-primary-500 text-white p-2 m-1 rounded-full">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              <Link 
                href="/host"
                className="hidden md:block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Devenir hôte
              </Link>
              
              <Link 
                href="/auth/login"
                className="hidden md:block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Connexion
              </Link>
              
              <Link 
                href="/auth/register-new"
                className="hidden md:block px-5 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-full transition-all"
              >
                Inscription
              </Link>
              
              <button className="p-3 hover:bg-gray-100 rounded-full transition-all">
                <Globe className="h-5 w-5 text-gray-700" />
              </button>

              {/* Menu mobile */}
              <div className="relative md:hidden">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 p-2 pl-3 border border-gray-200 rounded-full hover:shadow-md transition-all"
                >
                  <Menu className="h-4 w-4 text-gray-700" />
                </button>

                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
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
        </div>

        {/* Barre de catégories - Agrandie et centrée */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center gap-8 py-6">
              {/* Catégories */}
              <div className="flex items-center justify-center gap-12 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-3 min-w-fit pb-3 border-b-[3px] transition-all ${
                      selectedCategory === cat.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <cat.icon className={`h-7 w-7 ${selectedCategory === cat.id ? 'text-primary-500' : ''}`} />
                    <span className="text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Bouton Filtres */}
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl hover:shadow-md transition-all ml-8"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span className="text-sm font-semibold">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-8">
        {/* Message "Aucun logement" */}
        <div className="text-center py-20">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <MapPin className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun logement pour l'instant
            </h2>
            <p className="text-gray-600 mb-8">
              Nous lançons bientôt notre plateforme au Mali. 
              Soyez parmi les premiers hôtes à nous rejoindre !
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/host"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Devenir hôte
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Filtres */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)}></div>
          <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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
                  Tout effacer
                </button>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Type de logement */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de logement</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "hotel", label: "Hôtel", icon: Hotel },
                      { key: "maison", label: "Maison", icon: Home },
                      { key: "appartement", label: "Appartement", icon: Building2 },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => togglePropertyType(key)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          propertyTypes.includes(key) 
                            ? 'border-gray-900 bg-gray-50' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${propertyTypes.includes(key) ? 'text-gray-900' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${propertyTypes.includes(key) ? 'text-gray-900' : 'text-gray-600'}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fourchette de prix */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fourchette de prix</h3>
                  <p className="text-sm text-gray-500 mb-4">Prix par nuit</p>
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
                    <div className="flex justify-between mt-2">
                      <div className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
                        <span className="text-gray-500">Min</span>
                        <div className="font-medium">0 FCFA</div>
                      </div>
                      <div className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
                        <span className="text-gray-500">Max</span>
                        <div className="font-medium">{formatPrice(priceMax)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipements</h3>
                  <div className="flex flex-wrap gap-2">
                    {allAmenities.map((amenity) => (
                      <button 
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Note minimale</h3>
                  <div className="flex gap-2">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button 
                        key={r} 
                        onClick={() => setMinRating(r)} 
                        className={`flex-1 py-3 rounded-lg font-medium border transition-all ${
                          minRating === r 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {r === 0 ? 'Tous' : (
                          <span className="flex items-center justify-center gap-1">
                            {r}+ <Star className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 flex gap-3">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
                >
                  Afficher les résultats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer simplifié */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© {new Date().getFullYear()} Ikasso</span>
              <span>·</span>
              <a href="#" className="hover:underline">Confidentialité</a>
              <span>·</span>
              <a href="#" className="hover:underline">Conditions</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline">
                <Globe className="h-4 w-4" />
                Français (FR)
              </button>
              <span className="text-sm font-medium text-gray-900">FCFA</span>
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
