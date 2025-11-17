'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, MapPin, Star, Heart, User, Settings, Bell, 
  CreditCard, BookOpen, MessageCircle, LogOut, Menu, X,
  Clock, CheckCircle, XCircle, AlertCircle, Home, Plus,
  TrendingUp, Eye, Edit, Trash2, Users
} from 'lucide-react'
import Logo from '../../components/Logo'

// Types
interface Property {
  id: string
  name: string
  location: string
  image: string
  type: 'maison' | 'hotel' | 'appartement'
  price: number
  rating: number
  reviews: number
  bookings: number
  status: 'active' | 'inactive' | 'pending'
  earnings: number
}

interface Booking {
  id: string
  guestName: string
  guestAvatar: string
  property: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  total: number
}

export default function HostDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // État pour les données utilisateur
  const [host, setHost] = useState({
    name: 'Nouvel Hôte',
    email: 'hote@email.com',
    phone: '+223 XX XX XX XX',
    avatar: null,
    memberSince: 'Novembre 2024',
    totalProperties: 0,
    totalEarnings: 0,
    totalBookings: 0,
    rating: 0,
    hostType: 'particulier',
    companyName: '',
    siret: ''
  })

  const [properties, setProperties] = useState<Property[]>([])
  const [bookings] = useState<Booking[]>([])

  // Charger les données utilisateur au montage du composant
  useEffect(() => {
    const getUserData = () => {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('ikasso_user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setHost({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            phone: userData.phone,
            avatar: userData.avatar,
            memberSince: userData.memberSince || 'Novembre 2024',
            totalProperties: 0,
            totalEarnings: 0,
            totalBookings: 0,
            rating: 0,
            hostType: userData.hostType || 'particulier',
            companyName: userData.companyName || '',
            siret: userData.siret || ''
          })
        }

        // Charger les propriétés
        const saved = localStorage.getItem('ikasso_host_properties')
        if (saved) {
          setProperties(JSON.parse(saved))
        }
      }
    }

    getUserData()
  }, [])

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
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />
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
      case 'active':
        return 'Active'
      case 'inactive':
        return 'Inactive'
      default:
        return 'Inconnue'
    }
  }

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BookOpen },
    { id: 'properties', label: 'Mes propriétés', icon: Home },
    { id: 'bookings', label: 'Réservations', icon: Calendar },
    { id: 'earnings', label: 'Revenus', icon: TrendingUp },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
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
              <a href="/">
                <Logo size="md" />
              </a>
              <span className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                Tableau de bord Hôte
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                {host.avatar ? (
                  <Image 
                    src={host.avatar} 
                    alt={host.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{host.name}</span>
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
                {host.avatar ? (
                  <Image 
                    src={host.avatar} 
                    alt={host.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{host.name}</h3>
                <p className="text-sm text-gray-600">Hôte depuis {host.memberSince}</p>
                <div className="flex items-center justify-center mt-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{host.rating}</span>
                </div>
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
                  <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Hôte</h1>
                  <p className="text-gray-600">Bienvenue, {host.name} !</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <Home className="h-8 w-8 text-primary-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Propriétés</p>
                        <p className="text-2xl font-bold text-gray-900">{host.totalProperties}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Réservations</p>
                        <p className="text-2xl font-bold text-gray-900">{host.totalBookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                        <p className="text-2xl font-bold text-gray-900">{formatPrice(host.totalEarnings)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                        <p className="text-2xl font-bold text-gray-900">{host.rating}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Réservations récentes</h2>
                        <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Image 
                          src={booking.guestAvatar} 
                          alt={booking.guestName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{booking.guestName}</h3>
                          <p className="text-sm text-gray-600">{booking.property}</p>
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

            {activeTab === 'properties' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes propriétés</h1>
                    <p className="text-gray-600">Gérez vos hébergements</p>
                  </div>
                  <Link href="/host/add-property" className="btn-primary flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une propriété
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="relative">
                        <Image 
                          src={property.image} 
                          alt={property.name}
                          width={800}
                          height={480}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(property.status)}
                            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                              {getStatusText(property.status)}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3 flex space-x-2">
                          <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg">
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{property.name}</h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">{property.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-600">Prix/nuit</p>
                            <p className="font-semibold">{formatPrice(property.price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Réservations</p>
                            <p className="font-semibold">{property.bookings}</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Revenus</span>
                            <span className="font-bold text-primary-600">{formatPrice(property.earnings)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
                  <p className="text-gray-600">Gérez toutes vos réservations</p>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-4">
                          <Image 
                            src={booking.guestAvatar} 
                            alt={booking.guestName}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full"
                          />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{booking.guestName}</h3>
                                  <p className="text-gray-600">{booking.property}</p>
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
                                <button className="btn-secondary text-sm px-4 py-2">
                                  Contacter le voyageur
                                </button>
                                {booking.status === 'pending' && (
                                  <>
                                    <button className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700">
                                      Accepter
                                    </button>
                                    <button className="bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700">
                                      Refuser
                                    </button>
                                  </>
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

            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Revenus</h1>
                  <p className="text-gray-600">Suivez vos gains et paiements</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ce mois</h3>
                    <p className="text-3xl font-bold text-primary-600">{formatPrice(125000)}</p>
                    <p className="text-sm text-green-600 mt-1">+15% vs mois dernier</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cette année</h3>
                    <p className="text-3xl font-bold text-primary-600">{formatPrice(host.totalEarnings)}</p>
                    <p className="text-sm text-green-600 mt-1">+28% vs année dernière</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">En attente</h3>
                    <p className="text-3xl font-bold text-yellow-600">{formatPrice(45000)}</p>
                    <p className="text-sm text-gray-600 mt-1">Paiement dans 3 jours</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par propriété</h3>
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Image 
                            src={property.image} 
                            alt={property.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{property.name}</h4>
                            <p className="text-sm text-gray-600">{property.bookings} réservations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{formatPrice(property.earnings)}</p>
                          <p className="text-sm text-gray-600">Commission: {formatPrice(property.earnings * 0.08)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
