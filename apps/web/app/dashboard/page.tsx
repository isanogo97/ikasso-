'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, MapPin, Star, Heart, User, Settings, Bell, 
  CreditCard, BookOpen, MessageCircle, LogOut, Menu, X,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import Logo from '../components/Logo'

// Types
interface Booking {
  id: string
  property: {
    name: string
    location: string
    image: string
  }
  checkIn: string
  checkOut: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  total: number
}

interface Favorite {
  id: string
  name: string
  location: string
  image: string
  price: number
  rating: number
}

export default function TravelerDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sample data
  const user = {
    name: 'Amadou Diallo',
    email: 'amadou.diallo@email.com',
    phone: '+223 70 12 34 56',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    memberSince: 'Janvier 2024',
    totalBookings: 8,
    totalSpent: 450000
  }

  const bookings: Booking[] = [
    {
      id: '1',
      property: {
        name: 'Villa Moderne à Bamako',
        location: 'Bamako, Mali',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300'
      },
      checkIn: '2024-12-15',
      checkOut: '2024-12-18',
      guests: 4,
      status: 'confirmed',
      total: 75000
    },
    {
      id: '2',
      property: {
        name: 'Hôtel Le Diplomate',
        location: 'Sikasso, Mali',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'
      },
      checkIn: '2024-11-20',
      checkOut: '2024-11-23',
      guests: 2,
      status: 'completed',
      total: 105000
    }
  ]

  const favorites: Favorite[] = [
    {
      id: '1',
      name: 'Maison Traditionnelle Dogon',
      location: 'Mopti, Mali',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300',
      price: 15000,
      rating: 4.9
    },
    {
      id: '2',
      name: 'Appartement Centre-ville',
      location: 'Ségou, Mali',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300',
      price: 20000,
      rating: 4.5
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée'
      case 'pending':
        return 'En attente'
      case 'cancelled':
        return 'Annulée'
      case 'completed':
        return 'Terminée'
      default:
        return 'Inconnue'
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BookOpen },
    { id: 'bookings', label: 'Mes réservations', icon: Calendar },
    { id: 'favorites', label: 'Mes favoris', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <Logo size="md" />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Image 
                  src={user.avatar} 
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <Image 
                  src={user.avatar} 
                  alt={user.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">Membre depuis {user.memberSince}</p>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === item.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </button>
                  )
                })}
              </nav>

              <div className="mt-6 pt-6 border-t">
                <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
                  <LogOut className="h-4 w-4 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                  <p className="text-gray-600">Bienvenue, {user.name} !</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-primary-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Réservations totales</p>
                        <p className="text-2xl font-bold text-gray-900">{user.totalBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <CreditCard className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(user.totalSpent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <Heart className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Favoris</p>
                        <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Réservations récentes</h2>
                  <div className="space-y-4">
                    {bookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Image 
                          src={booking.property.image} 
                          alt={booking.property.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{booking.property.name}</h3>
                          <p className="text-sm text-gray-600">{booking.property.location}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.checkIn).toLocaleDateString('fr-FR')} - {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(booking.status)}
                            <span className="text-sm font-medium">{getStatusText(booking.status)}</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">{formatPrice(booking.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes réservations</h1>
                  <p className="text-gray-600">Gérez toutes vos réservations</p>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                            <Image 
                              src={booking.property.image} 
                              alt={booking.property.name}
                              width={96}
                              height={96}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{booking.property.name}</h3>
                                  <p className="text-gray-600 flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {booking.property.location}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                      <strong>Dates:</strong> {new Date(booking.checkIn).toLocaleDateString('fr-FR')} - {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      <strong>Voyageurs:</strong> {booking.guests}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {getStatusIcon(booking.status)}
                                    <span className="text-sm font-medium">{getStatusText(booking.status)}</span>
                                  </div>
                                  <p className="text-xl font-bold text-gray-900">{formatPrice(booking.total)}</p>
                                </div>
                              </div>
                              <div className="mt-4 flex space-x-3">
                                <button className="btn-primary text-sm px-4 py-2">
                                  Voir les détails
                                </button>
                                {booking.status === 'confirmed' && (
                                  <button className="btn-secondary text-sm px-4 py-2">
                                    Contacter l'hôte
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
                  <p className="text-gray-600">Vos hébergements préférés</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favorites.map((favorite) => (
                    <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <Image 
                        src={favorite.image} 
                        alt={favorite.name}
                        width={800}
                        height={480}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{favorite.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">{favorite.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {favorite.location}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(favorite.price)}
                            </span>
                            <span className="text-gray-600 text-sm">/nuit</span>
                          </div>
                          <button className="btn-primary text-sm px-4 py-2">
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
                  <p className="text-gray-600">Gérez vos informations personnelles</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <form className="space-y-6">
                    <div className="flex items-center space-x-6">
                      <Image 
                        src={user.avatar} 
                        alt={user.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full"
                      />
                      <div>
                        <button className="btn-primary text-sm">
                          Changer la photo
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, GIF ou PNG. 1MB max.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue="Amadou"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue="Diallo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        defaultValue={user.email}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        defaultValue={user.phone}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        className="input-field"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn-primary">
                        Sauvegarder les modifications
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

