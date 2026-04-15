'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Calendar, MessageCircle, User, MapPin, Bell,
  LogOut, Menu, X, Clock, ChevronRight,
  Home, Compass, ArrowRight
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { getUserBookings } from '../lib/dal'
import type { Booking } from '../lib/dal'

// ---------------------------------------------------------------------------
// Avatar helper
// ---------------------------------------------------------------------------
function UserAvatar({ user, size = 'md' }: { user: any; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-20 w-20 text-2xl' }
  const src = user?.avatarUrl || user?.avatar
  const initials = `${(user?.firstName?.[0] || '').toUpperCase()}${(user?.lastName?.[0] || '').toUpperCase()}` || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow`}
      />
    )
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold ring-2 ring-white shadow`}>
      {initials}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: 'Confirmee', cls: 'bg-green-50 text-green-700 ring-green-600/20' },
    pending:   { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
    cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-700 ring-red-600/20' },
    completed: { label: 'Terminee', cls: 'bg-gray-50 text-gray-600 ring-gray-500/20' },
  }
  const s = map[status] || map.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ===========================================================================
// MAIN COMPONENT
// ===========================================================================
export default function TravelerDashboard() {
  const { user, isLoading, signOut } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(true)

  // Fetch bookings
  useEffect(() => {
    async function load() {
      try {
        const data = await getUserBookings(user?.id)
        setBookings(data)
      } catch { /* silent */ }
      setLoadingBookings(false)
    }
    if (user) load()
    else setLoadingBookings(false)
  }, [user])

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!user && !isLoading) {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return null
  }

  const firstName = user?.firstName || 'Voyageur'
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending')
  const recentBookings = bookings.slice(0, 3)

  // Greeting based on time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir'

  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* ----------------------------------------------------------------- */}
      {/* HEADER                                                            */}
      {/* ----------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/search" className="hover:text-primary-500 transition-colors">Explorer</Link>
            <Link href="/messages" className="hover:text-primary-500 transition-colors">Messages</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <UserAvatar user={user} size="sm" />
                <span className="text-sm font-medium text-gray-700">{firstName}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-500"
                title="Deconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
            <Link href="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
              <UserAvatar user={user} size="sm" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </Link>
            <hr className="border-gray-100" />
            <Link href="/search" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              <Search className="h-4 w-4 text-gray-400" /> Explorer
            </Link>
            <Link href="/settings" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              <User className="h-4 w-4 text-gray-400" /> Mon profil
            </Link>
            <Link href="/messages" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-sm text-gray-700" onClick={() => setMobileMenuOpen(false)}>
              <MessageCircle className="h-4 w-4 text-gray-400" /> Messages
            </Link>
            <hr className="border-gray-100" />
            <button onClick={() => { signOut(); setMobileMenuOpen(false) }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-red-50 text-sm text-red-600 w-full">
              <LogOut className="h-4 w-4" /> Deconnexion
            </button>
          </div>
        )}
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN CONTENT                                                      */}
      {/* ----------------------------------------------------------------- */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">

        {/* ---- Welcome banner ---- */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-orange-700 p-6 md:p-10 text-white">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
              <circle cx="350" cy="30" r="120" fill="white" />
              <circle cx="50" cy="180" r="80" fill="white" />
            </svg>
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">{greeting}, {firstName} !</h1>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                Pret a decouvrir votre prochain logement au Mali ? Explorez nos meilleures offres.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl self-start md:self-center"
            >
              <Search className="h-4 w-4" />
              Rechercher
            </Link>
          </div>
        </section>

        {/* ---- Quick actions ---- */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Acces rapide</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { href: '/search',    icon: Search,         label: 'Rechercher un logement', desc: 'Explorer les offres',   color: 'from-orange-400 to-primary-500' },
              { href: '/messages',  icon: MessageCircle,  label: 'Messages',               desc: 'Vos conversations',    color: 'from-emerald-400 to-emerald-600' },
              { href: '/settings',  icon: User,           label: 'Mon profil',             desc: 'Parametres du compte',  color: 'from-violet-400 to-violet-600' },
            ].map(({ href, icon: Icon, label, desc, color }) => (
              <Link
                key={href}
                href={href}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md hover:ring-primary-200 transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br ${color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
                  <p className="text-xs text-gray-400 mt-1">{desc}</p>
                </div>
                <ChevronRight className="absolute top-5 right-4 h-4 w-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
              </Link>
            ))}
          </div>
        </section>

        {/* ---- Recent bookings ---- */}
        <section id="reservations">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Reservations recentes</h2>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : recentBookings.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white ring-1 ring-gray-100">
              <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center mb-5">
                <Calendar className="h-10 w-10 text-primary-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700">Aucune reservation</h3>
              <p className="text-sm text-gray-400 mt-1 mb-6 text-center max-w-xs">
                Vous n&apos;avez pas encore de reservation. Commencez par explorer nos logements.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
              >
                <Search className="h-4 w-4" />
                Trouver un logement
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow"
                >
                  {/* Property image or placeholder */}
                  <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {booking.property?.image ? (
                      <img src={booking.property.image} alt={booking.property.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {booking.property?.name || `Reservation #${booking.id.slice(-6)}`}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      {booking.property?.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{booking.property.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(booking.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  {/* Status + price */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                    <span className="text-sm font-bold text-gray-800">{booking.total.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---- Explore CTA ---- */}
        <section className="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Compass className="h-7 w-7 text-primary-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800">Decouvrir des logements</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">
                  Parcourez notre selection de logements a Bamako, Sikasso, Mopti et partout au Mali.
                </p>
              </div>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors self-start md:self-center"
            >
              Explorer <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Carte interactive sera ajoutee quand les logements reels seront disponibles */}
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* MOBILE BOTTOM NAV                                                 */}
      {/* ----------------------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {[
            { href: '/dashboard', icon: Home,          label: 'Accueil',  active: true  },
            { href: '/search',    icon: Search,        label: 'Explorer', active: false },
            { href: '/messages',  icon: MessageCircle, label: 'Messages', active: false },
            { href: '/settings',  icon: User,          label: 'Profil',   active: false },
          ].map(({ href, icon: Icon, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
