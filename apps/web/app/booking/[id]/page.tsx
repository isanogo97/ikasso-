'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { 
  MapPin, Star, Calendar, Users, ArrowLeft, CreditCard, 
  Shield, CheckCircle, AlertCircle, Clock
} from 'lucide-react'
import PaymentModal from '../../components/PaymentModal'

// Sample property data (same as property detail page)
const propertyData = {
  '1': {
    id: '1',
    title: 'Villa Moderne à Bamako',
    location: 'Quartier du Fleuve, Bamako, Mali',
    price: 25000,
    rating: 4.8,
    reviews: 24,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    type: 'maison',
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Climatisation', 'Piscine', 'Parking', 'Cuisine équipée', 'Terrasse'],
    host: {
      name: 'Aminata Traoré',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      joinedDate: 'Janvier 2023',
      reviews: 45,
      verified: true
    },
    rules: [
      'Arrivée après 15h00',
      'Départ avant 11h00',
      'Non fumeur',
      'Animaux non autorisés',
      'Pas de fêtes ou événements'
    ]
  }
}

export default function BookingPage() {
  const params = useParams()
  const propertyId = params.id as string
  const property = propertyData[propertyId as keyof typeof propertyData]
  
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) // 1: Info, 2: Review, 3: Payment
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Propriété non trouvée</h1>
          <a href="/" className="btn-primary">Retour à l'accueil</a>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights * property.price : 0
  }

  const nights = calculateTotal() / property.price || 0
  const subtotal = calculateTotal()
  const serviceFee = Math.round(subtotal * 0.08)
  const total = subtotal + serviceFee

  const handleGuestInfoChange = (field: string, value: string) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1)
    }
  }

  const handlePaymentSuccess = () => {
    setBookingComplete(true)
    setShowPaymentModal(false)
  }

  const isFormValid = () => {
    return checkIn && checkOut && guests > 0 && 
           guestInfo.firstName && guestInfo.lastName && 
           guestInfo.email && guestInfo.phone
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h1>
          <p className="text-gray-600 mb-6">
            Votre réservation pour {property.title} a été confirmée. 
            Vous recevrez un email de confirmation sous peu.
          </p>
          <div className="space-y-3">
            <a href="/dashboard" className="block btn-primary">
              Voir mes réservations
            </a>
            <a href="/" className="block btn-secondary">
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-primary-600">Ikasso</a>
              <span className="ml-2 text-sm text-gray-500">Chez Toi</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Étape {bookingStep} sur 3</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6">
          <a href={`/property/${propertyId}`} className="flex items-center text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la propriété
          </a>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step <= bookingStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step < bookingStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={bookingStep >= 1 ? 'text-primary-600' : 'text-gray-500'}>
              Informations
            </span>
            <span className={bookingStep >= 2 ? 'text-primary-600' : 'text-gray-500'}>
              Vérification
            </span>
            <span className={bookingStep >= 3 ? 'text-primary-600' : 'text-gray-500'}>
              Paiement
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {bookingStep === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Informations de réservation</h2>
                
                {/* Dates and Guests */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Dates et voyageurs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                      <input
                        type="date"
                        className="input-field"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                      <input
                        type="date"
                        className="input-field"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Voyageurs</label>
                      <select
                        className="input-field"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                      >
                        {[1,2,3,4,5,6].map(num => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'voyageur' : 'voyageurs'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Guest Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Informations du voyageur principal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={guestInfo.firstName}
                        onChange={(e) => handleGuestInfoChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input
                        type="text"
                        className="input-field"
                        value={guestInfo.lastName}
                        onChange={(e) => handleGuestInfoChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        className="input-field"
                        value={guestInfo.email}
                        onChange={(e) => handleGuestInfoChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="+223 XX XX XX XX"
                        value={guestInfo.phone}
                        onChange={(e) => handleGuestInfoChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Demandes spéciales (optionnel)</h3>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Avez-vous des demandes particulières pour votre séjour ?"
                    value={guestInfo.specialRequests}
                    onChange={(e) => handleGuestInfoChange('specialRequests', e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!isFormValid()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Vérifiez votre réservation</h2>
                
                {/* Booking Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Résumé de la réservation</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <Image 
                        src={property.image} 
                        alt={property.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{property.title}</h4>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{property.rating} ({property.reviews} avis)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates and Guests Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Détails du séjour</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">Dates</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(checkIn).toLocaleDateString('fr-FR')} - {new Date(checkOut).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600">{nights} nuit{nights > 1 ? 's' : ''}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">Voyageurs</span>
                      </div>
                      <p className="text-sm text-gray-600">{guests} voyageur{guests > 1 ? 's' : ''}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">Total</span>
                      </div>
                      <p className="text-lg font-bold text-primary-600">{formatPrice(total)}</p>
                    </div>
                  </div>
                </div>

                {/* Guest Info Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Informations du voyageur</h3>
                  <div className="border rounded-lg p-4">
                    <p><strong>Nom :</strong> {guestInfo.firstName} {guestInfo.lastName}</p>
                    <p><strong>Email :</strong> {guestInfo.email}</p>
                    <p><strong>Téléphone :</strong> {guestInfo.phone}</p>
                    {guestInfo.specialRequests && (
                      <p><strong>Demandes spéciales :</strong> {guestInfo.specialRequests}</p>
                    )}
                  </div>
                </div>

                {/* House Rules */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Règlement intérieur</h3>
                  <div className="border rounded-lg p-4">
                    <ul className="space-y-2">
                      {property.rules.map((rule, index) => (
                        <li key={index} className="flex items-center text-gray-700">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="btn-secondary"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Procéder au paiement
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Paiement</h2>
                
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Paiement sécurisé</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Vos informations de paiement sont protégées par un cryptage SSL 256 bits.
                          Vous ne serez débité qu'après confirmation de la réservation par l'hôte.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="btn-primary text-lg px-8 py-3"
                  >
                    Payer {formatPrice(total)}
                  </button>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handlePreviousStep}
                    className="btn-secondary"
                  >
                    Retour
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Résumé de la réservation</h3>
              
              <div className="flex items-start space-x-3 mb-6">
                <Image 
                  src={property.image} 
                  alt={property.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{property.title}</h4>
                  <p className="text-sm text-gray-600">{property.location}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-xs text-gray-600">{property.rating}</span>
                  </div>
                </div>
              </div>

              {checkIn && checkOut && (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span>Dates</span>
                      <span className="text-sm">
                        {new Date(checkIn).toLocaleDateString('fr-FR')} - {new Date(checkOut).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voyageurs</span>
                      <span>{guests}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>{formatPrice(property.price)} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de service</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </>
              )}

              {!checkIn || !checkOut ? (
                <p className="text-sm text-gray-500 text-center">
                  Sélectionnez vos dates pour voir le prix total
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={total}
        propertyName={property.title}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
