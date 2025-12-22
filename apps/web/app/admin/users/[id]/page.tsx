'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, CreditCard, 
  Ban, CheckCircle, XCircle, DollarSign, Plus, Edit, Trash2,
  Home, Clock, AlertTriangle
} from 'lucide-react'
import LogoFinal from '../components/LogoFinal'

interface UserAccount {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  userType: 'client' | 'hote'
  createdAt: string
  totalBookings: number
  totalSpent: number
  status: 'active' | 'suspended' | 'deleted'
  address?: string
  city?: string
}

interface Booking {
  id: string
  propertyName: string
  propertyImage: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  paymentStatus: 'paid' | 'pending' | 'refunded'
  createdAt: string
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id as string

  const [user, setUser] = useState<UserAccount | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)

  useEffect(() => {
    if (!userId) return

    // Charger les données utilisateur
    const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const foundUser = allUsers.find((u: UserAccount) => u.id === userId)
    
    if (foundUser) {
      setUser(foundUser)
      
      // Charger les réservations de l'utilisateur
      const userBookings = JSON.parse(localStorage.getItem(`ikasso_bookings_${userId}`) || '[]')
      setBookings(userBookings)
    }
  }, [userId])

  const handleSuspendUser = () => {
    if (!user) return
    
    if (confirm('⚠️ Êtes-vous sûr de vouloir suspendre ce compte ?')) {
      const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      const updatedUsers = allUsers.map((u: UserAccount) => 
        u.id === userId ? { ...u, status: 'suspended' } : u
      )
      localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
      setUser({ ...user, status: 'suspended' })
      alert('✅ Compte suspendu')
    }
  }

  const handleActivateUser = () => {
    if (!user) return
    
    const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const updatedUsers = allUsers.map((u: UserAccount) => 
      u.id === userId ? { ...u, status: 'active' } : u
    )
    localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
    setUser({ ...user, status: 'active' })
    alert('✅ Compte activé')
  }

  const handleDeleteUser = () => {
    if (!confirm('⚠️ ATTENTION !\n\nÊtes-vous sûr de vouloir SUPPRIMER DÉFINITIVEMENT ce compte ?\n\nToutes les données seront perdues. Cette action est IRRÉVERSIBLE.')) {
      return
    }

    const allUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
    const updatedUsers = allUsers.filter((u: UserAccount) => u.id !== userId)
    localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
    
    alert('✅ Compte supprimé définitivement')
    router.push('/admin/users')
  }

  const handleCancelBooking = (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }

    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    )
    setBookings(updatedBookings)
    localStorage.setItem(`ikasso_bookings_${userId}`, JSON.stringify(updatedBookings))
    alert('✅ Réservation annulée')
  }

  const handleRefundBooking = (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rembourser cette réservation ?')) {
      return
    }

    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, paymentStatus: 'refunded' as const, status: 'cancelled' as const } : b
    )
    setBookings(updatedBookings)
    localStorage.setItem(`ikasso_bookings_${userId}`, JSON.stringify(updatedBookings))
    alert('✅ Réservation remboursée')
  }

  const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newBooking: Booking = {
      id: Date.now().toString(),
      propertyName: formData.get('propertyName') as string,
      propertyImage: '/placeholder-property.jpg',
      checkIn: formData.get('checkIn') as string,
      checkOut: formData.get('checkOut') as string,
      guests: parseInt(formData.get('guests') as string),
      totalPrice: parseInt(formData.get('totalPrice') as string),
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString()
    }

    const updatedBookings = [...bookings, newBooking]
    setBookings(updatedBookings)
    localStorage.setItem(`ikasso_bookings_${userId}`, JSON.stringify(updatedBookings))
    
    setShowNewBookingModal(false)
    alert('✅ Réservation créée avec succès')
  }

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF', 
      minimumFractionDigits: 0 
    }).format(price)

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-purple-100 text-purple-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts = {
      confirmed: 'Confirmée',
      pending: 'En attente',
      cancelled: 'Annulée',
      completed: 'Terminée',
      paid: 'Payée',
      refunded: 'Remboursée'
    }
    return texts[status as keyof typeof texts] || status
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <LogoFinal size="md" />
              </Link>
              <span className="text-lg font-semibold text-gray-900">Administration</span>
            </div>
            <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux utilisateurs
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations utilisateur */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.userType === 'hote' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.userType === 'hote' ? 'Hôte' : 'Client'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'suspended'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'Supprimé'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {user.status === 'active' ? (
                <button
                  onClick={handleSuspendUser}
                  className="flex items-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspendre
                </button>
              ) : (
                <button
                  onClick={handleActivateUser}
                  className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activer
                </button>
              )}
              <button
                onClick={handleDeleteUser}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </div>
          </div>

          {/* Détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Inscrit le</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Total dépensé</p>
                <p className="text-sm font-medium text-gray-900">{formatPrice(user.totalSpent || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <Home className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations actives</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Réservations annulées</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {bookings.filter(b => b.status === 'cancelled').length}
                </p>
              </div>
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Réservations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Réservations</h2>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une réservation
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
              <p className="text-gray-600">Cet utilisateur n'a pas encore de réservation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.propertyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.paymentStatus)}`}>
                          {getStatusText(booking.paymentStatus)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Arrivée: {new Date(booking.checkIn).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Départ: {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {booking.guests} voyageur(s)
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {formatPrice(booking.totalPrice)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Annuler"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRefundBooking(booking.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rembourser"
                          >
                            <DollarSign className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouvelle Réservation */}
      {showNewBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer une réservation</h2>
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la propriété
                </label>
                <input
                  type="text"
                  name="propertyName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Villa Bamako Centre"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'arrivée
                  </label>
                  <input
                    type="date"
                    name="checkIn"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de départ
                  </label>
                  <input
                    type="date"
                    name="checkOut"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de voyageurs
                  </label>
                  <input
                    type="number"
                    name="guests"
                    required
                    min="1"
                    defaultValue="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix total (FCFA)
                  </label>
                  <input
                    type="number"
                    name="totalPrice"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Créer la réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}







