'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, MapPin, Star, Heart, User, Settings, Bell, 
  CreditCard, BookOpen, MessageCircle, LogOut, Menu, X,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import Logo from '../components/Logo'
import PhotoCapture from '../components/PhotoCapture'
import AvatarRestorer from '../components/AvatarRestorer'
import { saveUserAvatar, restoreUserAvatar } from '../lib/avatarPersistence'
import { debugAvatarState, forceAvatarSync } from '../lib/avatarDebug'

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
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  // Récupérer les cartes sauvegardées depuis localStorage
  const [savedCards, setSavedCards] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ikasso_cards')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  })

  // Récupérer les données utilisateur depuis localStorage
  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('ikasso_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        return {
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          postalCode: userData.postalCode,
          city: userData.city,
          country: userData.country,
          dateOfBirth: userData.dateOfBirth,
          avatar: userData.avatar, // null par défaut
          memberSince: userData.memberSince,
          totalBookings: userData.totalBookings || 0,
          totalSpent: userData.totalSpent || 0
        }
      }
    }
    // Données par défaut si aucune donnée sauvegardée
    return {
      name: 'Nouvel Utilisateur',
      firstName: 'Nouvel',
      lastName: 'Utilisateur',
      email: 'utilisateur@email.com',
      phone: '+223 XX XX XX XX',
      address: 'Adresse non renseignée',
      postalCode: '',
      city: '',
      country: '',
      dateOfBirth: '',
      avatar: null,
      memberSince: 'Novembre 2024',
      totalBookings: 0,
      totalSpent: 0
    }
  }

  // Chargement et restauration de l'utilisateur avec avatar
  useEffect(() => {
    let userData = getUserData()
    if (userData) {
      // Debug initial
      console.log('Chargement utilisateur:', userData.email, 'Avatar présent:', !!userData.avatar)
      debugAvatarState()
      
      // Restaurer l'avatar sauvegardé s'il existe
      userData = restoreUserAvatar(userData)
      
      // Force sync si pas d'avatar
      if (!userData.avatar) {
        console.log('Pas d\'avatar, tentative de synchronisation forcée')
        const synced = forceAvatarSync()
        if (synced) {
          userData = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
        }
      }
      
      // Mettre à jour localStorage avec l'avatar restauré
      localStorage.setItem('ikasso_user', JSON.stringify(userData))
      setUser(userData)
      
      console.log('Utilisateur final:', userData.email, 'Avatar présent:', !!userData.avatar)
    }
  }, [])

  // Si l'utilisateur n'est pas encore chargé, afficher un loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Fonction pour ajouter une carte
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Récupérer les valeurs directement du formulaire
    const formData = new FormData(e.target as HTMLFormElement)
    const number = formData.get('cardNumber') as string
    const expiry = formData.get('cardExpiry') as string
    const cvv = formData.get('cardCvv') as string
    const name = formData.get('cardName') as string
    
    if (!number || !expiry || !cvv || !name) {
      alert('Veuillez remplir tous les champs')
      return
    }
    
    const newCard = {
      id: Date.now().toString(),
      number: number,
      expiry: expiry,
      name: name,
      type: number.startsWith('4') ? 'Visa' : number.startsWith('5') ? 'Mastercard' : 'Carte',
      lastFour: number.slice(-4)
    }
    
    const updatedCards = [...savedCards, newCard]
    setSavedCards(updatedCards)
    // Sauvegarder dans localStorage
    localStorage.setItem('ikasso_cards', JSON.stringify(updatedCards))
    setCardForm({ number: '', expiry: '', cvv: '', name: '' })
    setShowAddCardModal(false)
    alert('Carte ajoutée avec succès !')
  }

  const bookings: Booking[] = [
    // Empty for new users - bookings will be added when user makes reservations
  ]

  const favorites: Favorite[] = [
    // Empty for new users - favorites will be added when user saves properties
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
      {/* Composant de restauration d'avatar */}
      <AvatarRestorer user={user} setUser={setUser} />
      
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
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('ikasso_user')
                  localStorage.removeItem('ikasso_cards')
                  window.location.href = '/auth/login'
                }}
                className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
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
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-gray-600" />
                  </div>
                )}
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
                <button 
                  onClick={() => {
                    // Sauvegarder l'avatar avant déconnexion
                    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
                    if (currentUser.avatar && currentUser.email) {
                      saveUserAvatar(currentUser.email, currentUser.avatar)
                    }
                    
                    // Supprimer les données utilisateur
                    localStorage.removeItem('ikasso_user')
                    localStorage.removeItem('ikasso_cards')
                    
                    // Rediriger vers la page de connexion
                    window.location.href = '/auth/login'
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
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
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">Aucune réservation pour le moment</p>
                      <a href="/search" className="btn-primary text-sm">
                        Faire ma première réservation
                      </a>
                    </div>
                  ) : (
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
                  )}
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
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation pour le moment</h3>
                        <p className="text-gray-600 mb-6">Commencez à explorer nos hébergements et faites votre première réservation !</p>
                        <a href="/search" className="btn-primary">
                          Découvrir les hébergements
                        </a>
                      </div>
                    ) : (
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
                    )}
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

                {favorites.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori pour le moment</h3>
                    <p className="text-gray-600 mb-6">Explorez nos hébergements et ajoutez vos préférés à vos favoris !</p>
                    <a href="/search" className="btn-primary">
                      Découvrir les hébergements
                    </a>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  <p className="text-gray-600">Communiquez avec vos hôtes et notre équipe support</p>
                </div>

                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <div className="text-center py-12">
                      <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message pour le moment</h3>
                      <p className="text-gray-600 mb-6">Vos conversations avec les hôtes et notre équipe support apparaîtront ici.</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="/contact" className="btn-primary">
                          Contacter le support
                        </a>
                        <a href="/search" className="btn-secondary">
                          Faire une réservation
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
                  <p className="text-gray-600">Gérez vos moyens de paiement et historique des transactions</p>
                </div>

                {/* Bouton pour aller à la page de paiement */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Effectuer un paiement</h2>
                  <p className="mb-4 text-primary-100">
                    Payez facilement avec Orange Money, PayPal ou votre carte bancaire
                  </p>
                  <Link 
                    href="/payment" 
                    className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Accéder aux paiements
                  </Link>
                </div>

                {/* Méthodes de paiement disponibles */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Orange Money */}
                    <button
                      onClick={async () => {
                        const phone = prompt('🍊 Orange Money\n\nEntrez votre numéro Orange Money:\n(Ex: +223 70 00 00 00)')
                        if (!phone) return
                        
                        const amount = prompt('Montant à payer (FCFA):')
                        if (!amount) return
                        
                        try {
                          const response = await fetch('/api/payment/orange-money', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone, amount: parseFloat(amount) })
                          })
                          
                          const data = await response.json()
                          
                          if (data.success) {
                            alert(`✅ Paiement Orange Money initié !\n\nTransaction ID: ${data.transactionId}\n\nVous recevrez une demande de confirmation sur votre téléphone ${phone}.`)
                          } else {
                            alert('❌ Erreur lors du paiement')
                          }
                        } catch (error) {
                          alert('❌ Erreur de connexion au serveur')
                        }
                      }}
                      className="flex items-center justify-between p-6 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-xl">OM</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Orange Money</h3>
                          <p className="text-sm text-gray-600">Paiement mobile Mali</p>
                        </div>
                      </div>
                      <span className="text-orange-500 text-2xl">→</span>
                    </button>

                    {/* PayPal */}
                    <button
                      onClick={async () => {
                        const amount = prompt('💳 PayPal\n\nMontant à payer (EUR):')
                        if (!amount) return
                        
                        try {
                          const response = await fetch('/api/payment/paypal', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount: parseFloat(amount), currency: 'EUR' })
                          })
                          
                          const data = await response.json()
                          
                          if (data.success) {
                            alert(`✅ Paiement PayPal créé !\n\nOrder ID: ${data.orderId}\n\n(En production, vous seriez redirigé vers PayPal)`)
                          } else {
                            alert('❌ Erreur lors du paiement')
                          }
                        } catch (error) {
                          alert('❌ Erreur de connexion au serveur')
                        }
                      }}
                      className="flex items-center justify-between p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-white font-bold text-xs">PayPal</span>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">PayPal</h3>
                          <p className="text-sm text-gray-600">Paiement international</p>
                        </div>
                      </div>
                      <span className="text-blue-600 text-2xl">→</span>
                    </button>
                  </div>
                </div>

                {/* Moyens de paiement - Cartes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Cartes bancaires</h2>
                    <button 
                      onClick={() => setShowAddCardModal(true)}
                      className="btn-primary text-sm"
                    >
                      Ajouter une carte
                    </button>
                  </div>
                  
                  {savedCards.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">Aucune carte enregistrée</p>
                      <p className="text-sm text-gray-500">Ajoutez une carte pour faciliter vos réservations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedCards.map((card) => (
                        <div key={card.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{card.type}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">•••• •••• •••• {card.lastFour}</p>
                              <p className="text-sm text-gray-600">{card.name} • Expire {card.expiry}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Principale</span>
                            <button 
                              onClick={() => {
                                const updatedCards = savedCards.filter(c => c.id !== card.id)
                                setSavedCards(updatedCards)
                                localStorage.setItem('ikasso_cards', JSON.stringify(updatedCards))
                                alert('Carte supprimée avec succès')
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historique des paiements */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des paiements</h2>
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                      <span className="text-gray-500 text-xl">💳</span>
                    </div>
                    <p className="text-gray-600 mb-4">Aucune transaction pour le moment</p>
                    <p className="text-sm text-gray-500">Vos paiements et remboursements apparaîtront ici</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                  <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Notifications par email</h3>
                        <p className="text-sm text-gray-600">Recevez des emails pour les réservations et mises à jour</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Notifications SMS</h3>
                        <p className="text-sm text-gray-600">Recevez des SMS pour les confirmations importantes</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Offres promotionnelles</h3>
                        <p className="text-sm text-gray-600">Recevez nos offres spéciales et réductions</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                  </div>
                </div>

                {/* Confidentialité */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Confidentialité</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Profil public</h3>
                        <p className="text-sm text-gray-600">Permettre aux hôtes de voir votre profil</p>
                      </div>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Partage de données</h3>
                        <p className="text-sm text-gray-600">Autoriser le partage anonyme pour améliorer nos services</p>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                  </div>
                </div>

                {/* Langue et région */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Langue et région</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                      <select className="input-field">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="bm">Bambara</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                      <select className="input-field">
                        <option value="XOF">Franc CFA (XOF)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="USD">Dollar US (USD)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions de compte */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions de compte</h2>
                  <div className="space-y-4">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <h3 className="font-medium text-gray-900">Télécharger mes données</h3>
                      <p className="text-sm text-gray-600">Obtenez une copie de toutes vos données personnelles</p>
                    </button>
                    <button className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 text-red-600">
                      <h3 className="font-medium">Supprimer mon compte</h3>
                      <p className="text-sm">Cette action est irréversible</p>
                    </button>
                  </div>
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
                      {user.avatar ? (
                        <Image 
                          src={user.avatar} 
                          alt={user.name}
                          width={96}
                          height={96}
                          className="w-24 h-24 rounded-full"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-12 w-12 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <PhotoCapture
                          onPhotoCapture={(imageUrl) => {
                            try {
                              // La sauvegarde persistante est déjà gérée dans PhotoCapture
                              // Mettre à jour l'utilisateur actuel et l'état
                              const updatedUser = { ...user, avatar: imageUrl }
                              localStorage.setItem('ikasso_user', JSON.stringify(updatedUser))
                              setUser(updatedUser)
                              
                              // Pas besoin de recharger, l'état se met à jour automatiquement
                            } catch (error) {
                              console.error('Erreur lors de la sauvegarde:', error)
                              alert('Erreur lors de la sauvegarde de la photo')
                            }
                          }}
                          onError={(error) => {
                            console.error('Erreur photo:', error)
                          }}
                          maxSizeMB={5}
                          acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                          className="mt-2"
                        />
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
                          defaultValue={user.firstName || ''}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={user.lastName || ''}
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
                        Adresse postale
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        defaultValue={user.address || ''}
                        placeholder="123 Rue de la Paix"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={user.postalCode || ''}
                          placeholder="75001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={user.city || ''}
                          placeholder="Paris"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays
                      </label>
                      <select
                        className="input-field"
                        defaultValue={user.country || ''}
                      >
                        <option value="">Sélectionnez un pays</option>
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Canada">Canada</option>
                        <option value="Maroc">Maroc</option>
                        <option value="Tunisie">Tunisie</option>
                        <option value="Algérie">Algérie</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        <option value="Mali">Mali</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        className="input-field"
                        defaultValue={user.dateOfBirth || ''}
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

      {/* Modale Ajouter une carte */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Ajouter une carte bancaire</h3>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    className="input-field"
                    placeholder="1234 5678 9012 3456"
                    defaultValue=""
                    maxLength={19}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      name="cardExpiry"
                      className="input-field"
                      placeholder="MM/AA"
                      defaultValue=""
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cardCvv"
                      className="input-field"
                      placeholder="123"
                      defaultValue=""
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    className="input-field"
                    placeholder="Nom complet"
                    defaultValue={user.name}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="save-card"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="save-card" className="ml-2 block text-sm text-gray-900">
                    Enregistrer cette carte pour les futurs paiements
                  </label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCardModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Ajouter la carte
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

