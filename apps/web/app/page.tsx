"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Search, MapPin, Calendar, Users, Menu, X, Globe, 
  Home, Compass, ChevronDown, Star, Shield, 
  Clock, CreditCard, ArrowRight,
  Building2, Hotel, Sparkles
} from "lucide-react"
import Logo from "./components/Logo"

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]

// Catégories d'hébergements style Airbnb
const categories = [
  { id: "all", name: "Tout", icon: Home },
  { id: "hotel", name: "Hôtels", icon: Hotel },
  { id: "maison", name: "Maisons", icon: Home },
  { id: "appartement", name: "Appartements", icon: Building2 },
  { id: "villa", name: "Villas", icon: Sparkles },
]

// Types de services pour les hôtes
const hostServices = [
  { 
    id: "logement", 
    name: "Logement", 
    icon: "🏠", 
    description: "Proposez votre maison, appartement ou chambre" 
  },
  { 
    id: "experience", 
    name: "Expérience", 
    icon: "🎈", 
    description: "Partagez une activité unique avec des voyageurs" 
  },
  { 
    id: "service", 
    name: "Service", 
    icon: "🛎️", 
    description: "Offrez des services aux voyageurs" 
  },
]

const languages = [
  { lang: "Français", region: "Mali", code: "fr" },
  { lang: "Français", region: "France", code: "fr" },
  { lang: "English", region: "United States", code: "en" },
  { lang: "العربية", region: "العالم العربي", code: "ar" },
  { lang: "Español", region: "España", code: "es" },
  { lang: "Deutsch", region: "Deutschland", code: "de" },
  { lang: "中文", region: "中国", code: "zh" },
]

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"logements" | "experiences">("logements")
  const [showHostModal, setShowHostModal] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header Style Airbnb - Responsive */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Navigation centrale - Desktop */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab("logements")}
                className={`px-4 py-2.5 rounded-full text-[15px] font-medium transition-all ${
                  activeTab === "logements" 
                    ? "text-gray-900" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Logements
                </span>
              </button>
              <button
                onClick={() => setActiveTab("experiences")}
                className={`relative px-4 py-2.5 rounded-full text-[15px] font-medium transition-all ${
                  activeTab === "experiences" 
                    ? "text-gray-900" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Expériences
                </span>
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  NOUVEAU
                </span>
              </button>
            </nav>

            {/* Actions droite - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setShowHostModal(true)}
                className="px-3 lg:px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Devenir hôte
              </button>
              
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
              
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="p-3 hover:bg-gray-100 rounded-full transition-all"
              >
                <Globe className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Menu mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Globe className="h-5 w-5 text-gray-700" />
              </button>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2 animate-fadeIn">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab("logements")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                    activeTab === "logements" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Logements
                </button>
                <button
                  onClick={() => setActiveTab("experiences")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                    activeTab === "experiences" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Expériences
                </button>
              </div>
              <Link href="/auth/register-new" className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-lg">
                Inscription
              </Link>
              <Link href="/auth/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Connexion
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              <button 
                onClick={() => { setShowHostModal(true); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Devenir hôte
              </button>
              <Link href="/help" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Centre d'aide
              </Link>
            </div>
          )}
        </div>

        {/* Barre de recherche - Desktop */}
        <div className="hidden sm:block pb-4 px-4 sm:px-6 lg:px-20">
          <div className="max-w-[850px] mx-auto">
            <div className="flex items-center bg-white border rounded-full shadow-sm hover:shadow-md transition-all border-gray-200">
              {/* Destination */}
              <div className="flex-1 px-4 lg:px-6 py-3 cursor-pointer hover:bg-gray-50 rounded-l-full">
                <div className="text-xs font-semibold text-gray-900">Destination</div>
                <input
                  type="text"
                  placeholder="Rechercher une destination"
                  className="w-full text-sm text-gray-500 bg-transparent border-none outline-none placeholder-gray-400"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-200"></div>

              {/* Arrivée */}
              <div className="hidden md:block px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-xs font-semibold text-gray-900">Arrivée</div>
                <input
                  type="date"
                  className="text-sm text-gray-500 bg-transparent border-none outline-none"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="hidden md:block w-px h-8 bg-gray-200"></div>

              {/* Départ */}
              <div className="hidden md:block px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-xs font-semibold text-gray-900">Départ</div>
                <input
                  type="date"
                  className="text-sm text-gray-500 bg-transparent border-none outline-none"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              {/* Voyageurs + Bouton recherche */}
              <div className="flex items-center pl-2 lg:pl-4 pr-2 py-2">
                <div className="hidden lg:block pr-4">
                  <div className="text-xs font-semibold text-gray-900">Voyageurs</div>
                  <div className="text-sm text-gray-500">{guests} voyageur{guests > 1 ? 's' : ''}</div>
                </div>
                <Link 
                  href="/search"
                  className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-all hover:scale-105"
                >
                  <Search className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche - Mobile */}
        <div className="sm:hidden px-4 pb-4">
          <button
            onClick={() => setShowMobileSearch(true)}
            className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-all"
          >
            <Search className="h-5 w-5 text-gray-500" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">Où allez-vous ?</div>
              <div className="text-xs text-gray-500">Destination · Dates · Voyageurs</div>
            </div>
          </button>
        </div>

        {/* Barre de catégories - Responsive */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-8 lg:gap-12 py-4 sm:py-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 sm:gap-3 min-w-fit pb-2 sm:pb-3 border-b-[3px] transition-all ${
                    selectedCategory === cat.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <cat.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${selectedCategory === cat.id ? 'text-primary-500' : ''}`} />
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main>
        {/* Section hébergements - Responsive */}
        <section className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20 py-6 sm:py-8">
          {/* Message "Aucun hébergement" */}
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="max-w-2xl mx-auto px-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-primary-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Aucun logement pour l'instant
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Nous lançons bientôt notre plateforme au Mali ! 
                Soyez parmi les premiers hôtes à rejoindre Ikasso.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                <button 
                  onClick={() => setShowHostModal(true)}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all hover:scale-105"
                >
                  Devenir hôte
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section "Pourquoi Ikasso" - Responsive */}
        <section className="bg-gray-50 py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
              Pourquoi choisir Ikasso ?
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Réservation sécurisée</h3>
                <p className="text-xs sm:text-sm text-gray-600">Paiements protégés et données sécurisées</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Support 24/7</h3>
                <p className="text-xs sm:text-sm text-gray-600">Une équipe disponible à tout moment</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Paiement flexible</h3>
                <p className="text-xs sm:text-sm text-gray-600">Orange Money, carte ou espèces</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Qualité vérifiée</h3>
                <p className="text-xs sm:text-sm text-gray-600">Hébergements inspectés et validés</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA Devenir hôte - Responsive */}
        <section className="py-10 sm:py-12 lg:py-16">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
                Vous avez un hébergement à proposer ?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Rejoignez Ikasso et commencez à gagner de l'argent en accueillant des voyageurs
              </p>
              <button 
                onClick={() => setShowHostModal(true)}
                className="bg-white text-primary-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Commencer
              </button>
            </div>
          </div>
        </section>

        {/* Section destinations - Responsive */}
        <section className="py-10 sm:py-12 lg:py-16 bg-gray-50">
          <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
              Des idées pour vos prochaines escapades
            </h2>
            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {["Populaire", "Bamako", "Ségou", "Mopti", "Tombouctou"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    i === 0 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {cities.map((city) => (
                <Link 
                  key={city}
                  href="/search"
                  className="group p-3 sm:p-0"
                >
                  <div className="text-sm font-medium text-gray-900 group-hover:underline">{city}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Hébergements</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer style Airbnb - Responsive */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Assistance</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li><Link href="/help" className="hover:underline">Centre d'aide</Link></li>
                <li><a href="#" className="hover:underline">Assistance sécurité</a></li>
                <li><a href="#" className="hover:underline">Options d'annulation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Accueil de voyageurs</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li><button onClick={() => setShowHostModal(true)} className="hover:underline">Mettez votre logement sur Ikasso</button></li>
                <li><a href="#" className="hover:underline">Ressources pour les hôtes</a></li>
                <li><a href="#" className="hover:underline">Forum de la communauté</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Ikasso</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Newsroom</a></li>
                <li><a href="#" className="hover:underline">Carrières</a></li>
                <li><a href="#" className="hover:underline">Investisseurs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span>© {new Date().getFullYear()} Ikasso</span>
              <span className="hidden sm:inline">·</span>
              <a href="#" className="hover:underline">Confidentialité</a>
              <span className="hidden sm:inline">·</span>
              <a href="#" className="hover:underline">Conditions générales</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-900 hover:underline"
              >
                <Globe className="h-4 w-4" />
                Français (FR)
              </button>
              <span className="text-xs sm:text-sm font-medium text-gray-900">FCFA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Recherche Mobile */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-white sm:hidden">
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
              <Link
                href="/search"
                onClick={() => setShowMobileSearch(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-4 rounded-xl font-semibold text-base"
              >
                <Search className="h-5 w-5" />
                Rechercher
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Devenir Hôte - Responsive */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHostModal(false)}></div>
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:mx-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowHostModal(false)}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6 sm:p-8 pt-14 sm:pt-16">
              <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 mb-6 sm:mb-8">
                Que souhaitez-vous proposer ?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {hostServices.map((service) => (
                  <Link
                    key={service.id}
                    href="/auth/register-new"
                    onClick={() => setShowHostModal(false)}
                    className="flex flex-row sm:flex-col items-center sm:items-center p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-all group"
                  >
                    <span className="text-3xl sm:text-5xl mb-0 sm:mb-4 mr-4 sm:mr-0">{service.icon}</span>
                    <div className="text-left sm:text-center">
                      <span className="font-medium text-gray-900 block">{service.name}</span>
                      <span className="text-xs text-gray-500 sm:hidden">{service.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
              
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
                Vous pourrez configurer les détails après votre inscription
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Langue/Région - Responsive */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLanguageModal(false)}></div>
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl sm:mx-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6 sm:p-8 pt-14 sm:pt-16">
              {/* Tabs */}
              <div className="flex gap-4 sm:gap-6 border-b border-gray-200 mb-6 sm:mb-8">
                <button className="pb-3 sm:pb-4 border-b-2 border-gray-900 font-medium text-gray-900 text-sm sm:text-base">
                  Langue et région
                </button>
                <button className="pb-3 sm:pb-4 text-gray-500 hover:text-gray-700 text-sm sm:text-base">
                  Devise
                </button>
              </div>

              {/* Traduction auto */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 sm:mb-8 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                    Traduction
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Auto</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">Traduire automatiquement les descriptions</p>
                </div>
                <div className="w-10 sm:w-12 h-6 sm:h-7 bg-gray-900 rounded-full flex items-center justify-end px-1">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Langues */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Choisissez une langue et une région</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {languages.map((item, i) => (
                    <button
                      key={i}
                      className={`p-3 rounded-lg text-left border-2 transition-all ${
                        i === 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setShowLanguageModal(false)}
                    >
                      <div className="font-medium text-gray-900 text-sm">{item.lang}</div>
                      <div className="text-xs text-gray-500">{item.region}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
