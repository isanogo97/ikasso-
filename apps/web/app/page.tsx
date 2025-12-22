"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Search, MapPin, Calendar, Users, Menu, X, Globe, 
  Home, Compass, ChevronDown, Star, Shield, 
  Clock, CreditCard, ArrowRight,
  Building2, Hotel, Sparkles
} from "lucide-react"
import LogoIkasso from "./components/LogoIkasso"
import Logo from "./components/Logo"
import { useLanguage, availableLanguages, Language } from "./contexts/LanguageContext"

const cities = ["Bamako", "Sikasso", "Ségou", "Mopti", "Tombouctou", "Kayes", "Koutiala", "Gao"]

// Catégories d'hébergements style Airbnb
const categories = [
  { id: "all", nameKey: "cat.all", icon: Home },
  { id: "hotel", nameKey: "cat.hotels", icon: Hotel },
  { id: "maison", nameKey: "cat.houses", icon: Home },
  { id: "appartement", nameKey: "cat.apartments", icon: Building2 },
  { id: "villa", nameKey: "cat.villas", icon: Sparkles },
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
  const { t, language, setLanguage } = useLanguage()
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

  const currentLang = availableLanguages.find(l => l.code === language) || availableLanguages[0]

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile First */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-14 lg:h-20">
            {/* Logo - Centré sur mobile */}
            <div className="flex-1 lg:flex-none flex justify-start lg:justify-start">
              <Link href="/" className="flex-shrink-0">
                <Logo size="lg" />
              </Link>
            </div>

            {/* Navigation centrale - Desktop only */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
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
                  {t('nav.accommodations')}
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
                  {t('nav.experiences')}
                </span>
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                  {t('general.new')}
                </span>
              </button>
            </nav>

            {/* Actions droite - Desktop */}
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
              <button 
                onClick={() => setShowHostModal(true)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                {t('nav.become_host')}
              </button>
              
              <Link 
                href="/auth/login"
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                {t('nav.login')}
              </Link>
              
              <Link 
                href="/auth/register-new"
                className="px-5 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-full transition-all"
              >
                {t('nav.signup')}
              </Link>
              
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="p-3 hover:bg-gray-100 rounded-full transition-all flex items-center gap-1"
              >
                <Globe className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Mobile: Langue + Menu */}
            <div className="flex lg:hidden items-center gap-1">
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="text-lg">{currentLang.flag}</span>
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
            <div className="lg:hidden border-t border-gray-100 py-3 space-y-1 animate-fadeIn">
              <div className="flex gap-2 mb-3 px-1">
                <button
                  onClick={() => setActiveTab("logements")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${
                    activeTab === "logements" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t('nav.accommodations')}
                </button>
                <button
                  onClick={() => setActiveTab("experiences")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${
                    activeTab === "experiences" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t('nav.experiences')}
                </button>
              </div>
              <Link href="/auth/register-new" className="block px-4 py-3 text-sm font-semibold text-white bg-primary-500 rounded-lg mx-1">
                {t('nav.signup')}
              </Link>
              <Link href="/auth/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                {t('nav.login')}
              </Link>
              <div className="border-t border-gray-100 my-2"></div>
              <button 
                onClick={() => { setShowHostModal(true); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {t('nav.become_host')}
              </button>
              <Link href="/help" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                {t('nav.help')}
              </Link>
            </div>
          )}
        </div>

        {/* Barre de recherche - Desktop */}
        <div className="hidden lg:block pb-4 px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center bg-white border rounded-full shadow-sm hover:shadow-md transition-all border-gray-200">
              <div className="flex-1 px-6 py-3 cursor-pointer hover:bg-gray-50 rounded-l-full">
                <div className="text-xs font-semibold text-gray-900">{t('search.destination')}</div>
                <input
                  type="text"
                  placeholder={t('search.search_destination')}
                  className="w-full text-sm text-gray-500 bg-transparent border-none outline-none placeholder-gray-400"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <div className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-xs font-semibold text-gray-900">{t('search.arrival')}</div>
                <input
                  type="date"
                  className="text-sm text-gray-500 bg-transparent border-none outline-none"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <div className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-xs font-semibold text-gray-900">{t('search.departure')}</div>
                <input
                  type="date"
                  className="text-sm text-gray-500 bg-transparent border-none outline-none"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <div className="flex items-center pl-4 pr-2 py-2">
                <div className="pr-4">
                  <div className="text-xs font-semibold text-gray-900">{t('search.travelers')}</div>
                  <div className="text-sm text-gray-500">{guests} {guests > 1 ? t('search.travelers_plural') : t('search.traveler')}</div>
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
        <div className="lg:hidden px-4 pb-3">
          <button
            onClick={() => setShowMobileSearch(true)}
            className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm active:shadow-md transition-all"
          >
            <Search className="h-5 w-5 text-primary-500" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">{t('search.search_destination')}</div>
              <div className="text-xs text-gray-500">{t('search.arrival')} · {t('search.travelers')}</div>
            </div>
          </button>
        </div>

        {/* Barre de catégories */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-6 lg:gap-10 py-3 lg:py-5 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-1.5 lg:gap-2 min-w-fit pb-2 border-b-2 transition-all ${
                    selectedCategory === cat.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <cat.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${selectedCategory === cat.id ? 'text-primary-500' : ''}`} />
                  <span className="text-[11px] lg:text-sm font-medium whitespace-nowrap">{t(cat.nameKey)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main>
        {/* Section hébergements */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="text-center py-12 lg:py-16">
            <div className="max-w-lg mx-auto">
              <div className="w-20 h-20 lg:w-28 lg:h-28 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 lg:h-14 lg:w-14 text-primary-600" />
              </div>
              <h2 className="text-xl lg:text-3xl font-bold text-gray-900 mb-3">
                {t('home.no_listings')}
              </h2>
              <p className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed px-4">
                {t('home.launching_soon')}
              </p>
              <button 
                onClick={() => setShowHostModal(true)}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold text-sm lg:text-base transition-all"
              >
                {t('nav.become_host')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Section "Pourquoi Ikasso" */}
        <section className="bg-gray-50 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-6">
              {t('home.why_ikasso')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
              {[
                { icon: Shield, color: 'green', titleKey: 'home.secure_booking', descKey: 'home.secure_booking_desc' },
                { icon: Clock, color: 'blue', titleKey: 'home.support_24_7', descKey: 'home.support_24_7_desc' },
                { icon: CreditCard, color: 'purple', titleKey: 'home.flexible_payment', descKey: 'home.flexible_payment_desc' },
                { icon: Star, color: 'orange', titleKey: 'home.verified_quality', descKey: 'home.verified_quality_desc' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 lg:w-11 lg:h-11 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                    <item.icon className={`h-5 w-5 lg:h-6 lg:w-6 text-${item.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">{t(item.titleKey)}</h3>
                  <p className="text-xs lg:text-sm text-gray-600">{t(item.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section CTA Devenir hôte */}
        <section className="py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 lg:p-10 text-center text-white">
              <h2 className="text-lg lg:text-2xl font-bold mb-3">
                {t('home.have_property')}
              </h2>
              <p className="text-sm lg:text-base text-white/90 mb-5 max-w-xl mx-auto">
                {t('home.join_ikasso')}
              </p>
              <button 
                onClick={() => setShowHostModal(true)}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold text-sm lg:text-base hover:shadow-lg transition-all"
              >
                {t('home.get_started')}
              </button>
            </div>
          </div>
        </section>

        {/* Section destinations */}
        <section className="py-10 lg:py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-5">
              {t('home.destination_ideas')}
            </h2>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {[t('home.popular'), "Bamako", "Ségou", "Mopti", "Tombouctou"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-all ${
                    i === 0 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {cities.slice(0, 8).map((city) => (
                <Link 
                  key={city}
                  href="/search"
                  className="group p-3 bg-white rounded-lg hover:shadow-md transition-all"
                >
                  <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{city}</div>
                  <div className="text-xs text-gray-500">{t('home.accommodations')}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer.support')}</h3>
              <ul className="space-y-2 text-xs lg:text-sm text-gray-600">
                <li><Link href="/help" className="hover:underline">{t('footer.help_center')}</Link></li>
                <li><a href="#" className="hover:underline">{t('footer.safety_support')}</a></li>
                <li><a href="#" className="hover:underline">{t('footer.cancellation_options')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer.hosting')}</h3>
              <ul className="space-y-2 text-xs lg:text-sm text-gray-600">
                <li><button onClick={() => setShowHostModal(true)} className="hover:underline">{t('footer.list_property')}</button></li>
                <li><a href="#" className="hover:underline">{t('footer.host_resources')}</a></li>
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Ikasso</h3>
              <ul className="space-y-2 text-xs lg:text-sm text-gray-600">
                <li><a href="#" className="hover:underline">{t('footer.newsroom')}</a></li>
                <li><a href="#" className="hover:underline">{t('footer.careers')}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
              <span>© {new Date().getFullYear()} Ikasso</span>
              <span>·</span>
              <a href="#" className="hover:underline">{t('footer.privacy')}</a>
              <span>·</span>
              <a href="#" className="hover:underline">{t('footer.terms')}</a>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowLanguageModal(true)}
                className="flex items-center gap-2 text-xs font-medium text-gray-900 hover:underline"
              >
                <span>{currentLang.flag}</span>
                {currentLang.name}
              </button>
              <span className="text-xs font-medium text-gray-900">FCFA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Recherche Mobile */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button 
                onClick={() => setShowMobileSearch(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="font-semibold">{t('search.search')}</span>
              <div className="w-9"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('search.destination')}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search.search_destination')}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cities.slice(0, 4).map(city => (
                    <button
                      key={city}
                      onClick={() => setSearchLocation(city)}
                      className="px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-700 active:bg-gray-200"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('search.arrival')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl text-sm"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">{t('search.departure')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl text-sm"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('search.travelers')}</label>
                <div className="flex items-center justify-between p-4 border border-gray-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span>{guests} {guests > 1 ? t('search.travelers_plural') : t('search.traveler')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full text-lg"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium">{guests}</span>
                    <button
                      onClick={() => setGuests(guests + 1)}
                      className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <Link
                href="/search"
                onClick={() => setShowMobileSearch(false)}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-4 rounded-xl font-semibold"
              >
                <Search className="h-5 w-5" />
                {t('search.search')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Devenir Hôte */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHostModal(false)}></div>
          <div className="relative bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl w-full lg:max-w-lg lg:mx-4 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowHostModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6 pt-12">
              <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
                Que souhaitez-vous proposer ?
              </h2>
              
              <div className="space-y-3">
                {hostServices.map((service) => (
                  <Link
                    key={service.id}
                    href="/auth/register-new"
                    onClick={() => setShowHostModal(false)}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 transition-all"
                  >
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <span className="font-semibold text-gray-900 block">{service.name}</span>
                      <span className="text-sm text-gray-500">{service.description}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Langue */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLanguageModal(false)}></div>
          <div className="relative bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl w-full lg:max-w-md lg:mx-4 max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setShowLanguageModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6 pt-12">
              <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
                Choisir la langue
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as Language)
                      setShowLanguageModal(false)
                    }}
                    className={`p-4 rounded-xl text-left border-2 transition-all ${
                      language === lang.code 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{lang.name}</div>
                        <div className="text-xs text-gray-500">{lang.region}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
