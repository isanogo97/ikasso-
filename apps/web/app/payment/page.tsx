'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CreditCard, Smartphone, DollarSign, CheckCircle, ArrowLeft, Loader } from 'lucide-react'
import LogoFinal from './components/LogoFinal'

type PaymentMethod = 'orange-money' | 'paypal' | 'card' | null

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  
  // Données de paiement
  const [orangeMoneyData, setOrangeMoneyData] = useState({
    phone: '',
    otp: ''
  })
  
  const [paypalEmail, setPaypalEmail] = useState('')
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  })

  // Montant exemple (à remplacer par le vrai montant de réservation)
  const amount = 75000 // 75,000 FCFA

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XOF', 
      minimumFractionDigits: 0 
    }).format(price)

  const handleOrangeMoneyPayment = async () => {
    if (!orangeMoneyData.phone) {
      alert('❌ Veuillez entrer votre numéro Orange Money')
      return
    }

    setIsProcessing(true)

    // Simuler l'appel à l'API Orange Money
    // En production, remplacer par: https://api.orange.com/orange-money-webpay/dev/v1
    setTimeout(() => {
      // Générer un OTP pour validation
      const otp = Math.floor(1000 + Math.random() * 9000).toString()
      alert(`📱 Code OTP Orange Money: ${otp}\n\nEntrez ce code pour confirmer le paiement de ${formatPrice(amount)}`)
      setIsProcessing(false)
      
      // Une fois l'OTP validé
      setPaymentSuccess(true)
    }, 2000)
  }

  const handlePayPalPayment = async () => {
    if (!paypalEmail) {
      alert('❌ Veuillez entrer votre email PayPal')
      return
    }

    setIsProcessing(true)

    // Simuler la redirection PayPal
    // En production, utiliser: https://developer.paypal.com/api/rest/
    setTimeout(() => {
      alert(`✅ Redirection vers PayPal...\n\nEmail: ${paypalEmail}\nMontant: ${formatPrice(amount)}`)
      setPaymentSuccess(true)
      setIsProcessing(false)
    }, 2000)
  }

  const handleCardPayment = async () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      alert('❌ Veuillez remplir toutes les informations de la carte')
      return
    }

    setIsProcessing(true)

    // Simuler le paiement par carte
    setTimeout(() => {
      alert(`✅ Paiement par carte accepté!\n\nMontant: ${formatPrice(amount)}`)
      setPaymentSuccess(true)
      setIsProcessing(false)
    }, 2000)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 mb-2">
            Votre paiement de <span className="font-bold text-green-600">{formatPrice(amount)}</span> a été traité avec succès.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous allez recevoir un email de confirmation sous peu.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard" className="btn-primary w-full block">
              Retour au tableau de bord
            </Link>
            <Link href="/" className="text-primary-600 hover:text-primary-700 block">
              Retour à l'accueil
            </Link>
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
            <Link href="/">
              <LogoFinal size="md" />
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Finaliser votre paiement
          </h1>
          <p className="text-gray-600">
            Montant total: <span className="text-2xl font-bold text-primary-600">{formatPrice(amount)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orange Money */}
          <div 
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
              selectedMethod === 'orange-money' ? 'ring-2 ring-orange-500 shadow-lg' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedMethod('orange-money')}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Orange Money</h3>
                <p className="text-sm text-gray-600">Paiement mobile instantané</p>
              </div>
            </div>

            {selectedMethod === 'orange-money' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro Orange Money
                  </label>
                  <input
                    type="tel"
                    placeholder="+223 XX XX XX XX"
                    className="input-field"
                    value={orangeMoneyData.phone}
                    onChange={(e) => setOrangeMoneyData({...orangeMoneyData, phone: e.target.value})}
                  />
                </div>
                <button
                  onClick={handleOrangeMoneyPayment}
                  disabled={isProcessing}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Traitement...
                    </span>
                  ) : (
                    `Payer ${formatPrice(amount)}`
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Vous recevrez un code OTP pour confirmer le paiement
                </p>
              </div>
            )}
          </div>

          {/* PayPal */}
          <div 
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
              selectedMethod === 'paypal' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedMethod('paypal')}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">PayPal</h3>
                <p className="text-sm text-gray-600">Paiement sécurisé international</p>
              </div>
            </div>

            {selectedMethod === 'paypal' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email PayPal
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input-field"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                </div>
                <button
                  onClick={handlePayPalPayment}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Redirection...
                    </span>
                  ) : (
                    `Payer avec PayPal`
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Vous serez redirigé vers PayPal pour finaliser
                </p>
              </div>
            )}
          </div>

          {/* Carte bancaire */}
          <div 
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all lg:col-span-2 ${
              selectedMethod === 'card' ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedMethod('card')}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Carte bancaire</h3>
                <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
              </div>
            </div>

            {selectedMethod === 'card' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    placeholder="PRENOM NOM"
                    className="input-field"
                    value={cardData.name}
                    onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="input-field"
                    maxLength={5}
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="input-field"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Traitement...
                      </span>
                    ) : (
                      `Payer ${formatPrice(amount)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sécurité */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Paiement 100% sécurisé</h4>
              <p className="text-xs text-blue-700">
                Vos informations de paiement sont cryptées et sécurisées. Nous ne stockons jamais vos données bancaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

