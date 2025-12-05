"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Search, MapPin, Calendar, Users, Menu, X, Globe, 
  Home, Compass, Briefcase, ChevronDown, Star, Shield, 
  Clock, CreditCard, ArrowRight, Heart, Sparkles,
  Building2, Hotel, UtensilsCrossed, Camera, Car, Music
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
  const [searchFocused, setSearchFocused] = useState(false)

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

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowHostModal(true)}
                className="hidden md:block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                Devenir hôte
              </button>
              
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
              
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="p-3 hover:bg-gray-100 rounded-full transition-all"
              >
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

                {/* Dropdown Menu Mobile */}
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
                      <button 
                        onClick={() => { setShowHostModal(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Devenir hôte
                      </button>
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

        {/* Barre de recherche style Airbnb */}
        <div className="pb-4 px-6 md:px-10 lg:px-20">
          <div className={`max-w-[850px] mx-auto transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
            <div 
              className={`flex items-center bg-white border rounded-full shadow-sm hover:shadow-md transition-all ${
                searchFocused ? 'shadow-lg border-gray-300' : 'border-gray-200'
              }`}
            >
              {/* Destination */}
              <div 
                className="flex-1 px-6 py-3 cursor-pointer hover:bg-gray-50 rounded-l-full"
                onClick={() => setSearchFocused(true)}
              >
                <div className="text-xs font-semibold text-gray-900">Destination</div>
                <input
                  type="text"
                  placeholder="Rechercher une destination"
                  className="w-full text-sm text-gray-500 bg-transparent border-none outline-none placeholder-gray-400"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                />
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              {/* Arrivée */}
              <div className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-xs font-semibold text-gray-900">Arrivée</div>
                <input
                  type="date"
                  className="text-sm text-gray-500 bg-transparent border-none outline-none"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              {/* Départ */}
              <div className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-xs font-semibold text-gray-900">Départ</div>
                <input
                  type="date"
                  className="text-sm text-gray-500 bg-transparent border-none outline-none"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              {/* Voyageurs + Bouton recherche */}
              <div className="flex items-center pl-4 pr-2 py-2">
                <div className="pr-4">
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

        {/* Barre de catégories - Agrandie et centrée */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center gap-12 py-6 overflow-x-auto scrollbar-hide">
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
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main>
        {/* Section hébergements */}
        <section className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-8">
          {/* Message "Aucun hébergement" */}
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <MapPin className="h-16 w-16 text-primary-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Aucun logement pour l'instant
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nous lançons bientôt notre plateforme au Mali ! 
                Soyez parmi les premiers hôtes à rejoindre Ikasso.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => setShowHostModal(true)}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105"
                >
                  Devenir hôte
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section "Pourquoi Ikasso" */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Pourquoi choisir Ikasso ?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Réservation sécurisée</h3>
                <p className="text-sm text-gray-600">Paiements protégés et données sécurisées</p>
              </div>
              <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Support 24/7</h3>
                <p className="text-sm text-gray-600">Une équipe disponible à tout moment</p>
              </div>
              <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Paiement flexible</h3>
                <p className="text-sm text-gray-600">Orange Money, carte ou espèces</p>
              </div>
              <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Qualité vérifiée</h3>
                <p className="text-sm text-gray-600">Hébergements inspectés et validés</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA Devenir hôte */}
        <section className="py-16">
          <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Vous avez un hébergement à proposer ?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Rejoignez Ikasso et commencez à gagner de l'argent en accueillant des voyageurs
              </p>
              <button 
                onClick={() => setShowHostModal(true)}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Commencer
              </button>
            </div>
          </div>
        </section>

        {/* Section destinations */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Des idées pour vos prochaines escapades
            </h2>
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {["Populaire", "Bamako", "Ségou", "Mopti", "Tombouctou"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    i === 0 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cities.map((city) => (
                <Link 
                  key={city}
                  href="/search"
                  className="group"
                >
                  <div className="text-sm font-medium text-gray-900 group-hover:underline">{city}</div>
                  <div className="text-sm text-gray-500">Hébergements</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer style Airbnb */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Assistance</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link href="/help" className="hover:underline">Centre d'aide</Link></li>
                <li><a href="#" className="hover:underline">Assistance sécurité</a></li>
                <li><a href="#" className="hover:underline">Options d'annulation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Accueil de voyageurs</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><button onClick={() => setShowHostModal(true)} className="hover:underline">Mettez votre logement sur Ikasso</button></li>
                <li><a href="#" className="hover:underline">Ressources pour les hôtes</a></li>
                <li><a href="#" className="hover:underline">Forum de la communauté</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Ikasso</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#" className="hover:underline">Newsroom</a></li>
                <li><a href="#" className="hover:underline">Carrières</a></li>
                <li><a href="#" className="hover:underline">Investisseurs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>© {new Date().getFullYear()} Ikasso</span>
              <span>·</span>
              <a href="#" className="hover:underline">Confidentialité</a>
              <span>·</span>
              <a href="#" className="hover:underline">Conditions générales</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
              >
                <Globe className="h-4 w-4" />
                Français (FR)
              </button>
              <span className="text-sm font-medium text-gray-900">FCFA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Devenir Hôte */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHostModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowHostModal(false)}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-8 pt-16">
              <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
                Que souhaitez-vous proposer ?
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {hostServices.map((service) => (
                  <Link
                    key={service.id}
                    href="/auth/register-new"
                    onClick={() => setShowHostModal(false)}
                    className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-all group"
                  >
                    <span className="text-5xl mb-4">{service.icon}</span>
                    <span className="font-medium text-gray-900 text-center">{service.name}</span>
                  </Link>
                ))}
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-8">
                Vous pourrez configurer les détails après votre inscription
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Langue/Région */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLanguageModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-8 pt-16">
              {/* Tabs */}
              <div className="flex gap-6 border-b border-gray-200 mb-8">
                <button className="pb-4 border-b-2 border-gray-900 font-medium text-gray-900">
                  Langue et région
                </button>
                <button className="pb-4 text-gray-500 hover:text-gray-700">
                  Devise
                </button>
              </div>

              {/* Traduction auto */}
              <div className="bg-gray-50 rounded-xl p-4 mb-8 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    Traduction
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Auto</span>
                  </div>
                  <p className="text-sm text-gray-500">Traduire automatiquement les descriptions</p>
                </div>
                <div className="w-12 h-7 bg-gray-900 rounded-full flex items-center justify-end px-1">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Langues suggérées */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-4">Langues et régions suggérées</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { lang: "Français", region: "Mali" },
                    { lang: "Français", region: "France" },
                    { lang: "English", region: "United States" },
                    { lang: "Français", region: "Belgique" },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className={`p-3 rounded-lg text-left border-2 transition-all ${
                        i === 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{item.lang}</div>
                      <div className="text-sm text-gray-500">{item.region}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toutes les langues */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Choisissez une langue et une région</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { lang: "Français", region: "Mali" },
                    { lang: "Français", region: "France" },
                    { lang: "English", region: "USA" },
                    { lang: "العربية", region: "العالم العربي" },
                    { lang: "Español", region: "España" },
                    { lang: "Português", region: "Brasil" },
                    { lang: "Deutsch", region: "Deutschland" },
                    { lang: "中文", region: "中国" },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className={`p-3 rounded-lg text-left border-2 transition-all ${
                        i === 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setShowLanguageModal(false)}
                    >
                      <div className="font-medium text-gray-900">{item.lang}</div>
                      <div className="text-sm text-gray-500">{item.region}</div>
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
