'use client'

import React, { useState } from 'react'
import { X, CreditCard, Smartphone, Shield, Check } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  propertyName: string
  onPaymentSuccess: () => void
}

type PaymentMethod = 'orange_money' | 'card' | 'paypal' | 'klarna'

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  propertyName, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange_money')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    // Orange Money
    phoneNumber: '',
    
    // Carte bancaire
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // PayPal
    paypalEmail: '',
    
    // Klarna
    klarnaEmail: ''
  })

  const luhnCheck = (num: string) => {
    const digits = num.replace(/\s+/g, '')
    if (digits.length < 12 || digits.length > 19) return false
    let sum = 0
    let shouldDouble = false
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10)
      if (Number.isNaN(d)) return false
      if (shouldDouble) {
        d *= 2
        if (d > 9) d -= 9
      }
      sum += d
      shouldDouble = !shouldDouble
    }
    return sum % 10 === 0
  }

  const isValidPhone = (value: string) => {
    const trimmed = value.trim()
    const ml = /^\+?223\s?\d{8}$/
    const generic = /^\d{8,14}$/
    return ml.test(trimmed) || generic.test(trimmed)
  }

  const isValidExpiry = (value: string) => {
    const m = value.trim().match(/^(0[1-9]|1[0-2])\/?(\d{2})$/)
    if (!m) return false
    // Basic expiration check: not in the past (MM/YY)
    const mm = parseInt(m[1], 10)
    const yy = parseInt(m[2], 10)
    const now = new Date()
    const curYY = now.getFullYear() % 100
    const curMM = now.getMonth() + 1
    return yy > curYY || (yy === curYY && mm >= curMM)
  }

  const isValidCvv = (value: string) => /^(\d{3,4})$/.test(value.trim())

  const isMethodValid = (): boolean => {
    if (selectedMethod === 'orange_money') {
      return isValidPhone(paymentData.phoneNumber)
    }
    if (selectedMethod === 'card') {
      return (
        paymentData.cardName.trim().length >= 2 &&
        luhnCheck(paymentData.cardNumber) &&
        isValidExpiry(paymentData.expiryDate) &&
        isValidCvv(paymentData.cvv)
      )
    }
    if (selectedMethod === 'paypal') {
      return /.+@.+\..+/.test(paymentData.paypalEmail.trim())
    }
    if (selectedMethod === 'klarna') {
      return /.+@.+\..+/.test(paymentData.klarnaEmail.trim())
    }
    return false
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simulation du processus de paiement
    setTimeout(() => {
      setIsProcessing(false)
      onPaymentSuccess()
      onClose()
    }, 3000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Finaliser le paiement</h2>
            <p className="text-sm text-gray-600">{propertyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Résumé du montant */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total à payer</span>
              <span className="text-2xl font-bold text-primary-600">{formatPrice(amount)}</span>
            </div>
          </div>

          {/* Méthodes de paiement */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choisir une méthode de paiement</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orange Money */}
              <button
                onClick={() => setSelectedMethod('orange_money')}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                  selectedMethod === 'orange_money'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Orange Money</p>
                  <p className="text-sm text-gray-600">Paiement mobile</p>
                </div>
                {selectedMethod === 'orange_money' && (
                  <Check className="h-5 w-5 text-orange-500 ml-auto" />
                )}
              </button>

              {/* Carte bancaire */}
              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                  selectedMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Carte bancaire</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard</p>
                </div>
                {selectedMethod === 'card' && (
                  <Check className="h-5 w-5 text-blue-500 ml-auto" />
                )}
              </button>

              {/* PayPal */}
              <button
                onClick={() => setSelectedMethod('paypal')}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                  selectedMethod === 'paypal'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.26-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81.394.45.663.96.798 1.517.394-.9.394-1.517 0-2.41z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">PayPal</p>
                  <p className="text-sm text-gray-600">Paiement sécurisé</p>
                </div>
                {selectedMethod === 'paypal' && (
                  <Check className="h-5 w-5 text-blue-600 ml-auto" />
                )}
              </button>

              {/* Klarna */}
              <button
                onClick={() => setSelectedMethod('klarna')}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                  selectedMethod === 'klarna'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zM8.5 8.5v7h2v-7h-2zm5 0v3.5l3-3.5h2.5l-3.5 4 3.5 3.5H16l-2.5-2.5V16h-2V8.5h2z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Klarna</p>
                  <p className="text-sm text-gray-600">Payez plus tard</p>
                </div>
                {selectedMethod === 'klarna' && (
                  <Check className="h-5 w-5 text-pink-500 ml-auto" />
                )}
              </button>
            </div>
          </div>

          {/* Formulaires de paiement */}
          <div className="mb-6">
            {selectedMethod === 'orange_money' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Informations Orange Money</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+223 XX XX XX XX"
                    value={paymentData.phoneNumber}
                    autoComplete="tel"
                    inputMode="tel"
                    aria-invalid={selectedMethod==='orange_money' && !isValidPhone(paymentData.phoneNumber)}
                    pattern="(\+?223\s?\d{8})|\d{8,14}"
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Comment ça marche ?</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Vous recevrez un SMS avec un code de confirmation sur votre téléphone Orange Money.
                        Suivez les instructions pour finaliser le paiement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Informations de la carte</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Nom complet"
                    value={paymentData.cardName}
                    onChange={(e) => handleInputChange('cardName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    aria-invalid={selectedMethod==='card' && !luhnCheck(paymentData.cardNumber)}
                    pattern="[0-9 ]{12,19}"
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="MM/AA"
                      value={paymentData.expiryDate}
                      autoComplete="cc-exp"
                      aria-invalid={selectedMethod==='card' && !isValidExpiry(paymentData.expiryDate)}
                      pattern="(0[1-9]|1[0-2])\/?[0-9]{2}"
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="123"
                      value={paymentData.cvv}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      aria-invalid={selectedMethod==='card' && !isValidCvv(paymentData.cvv)}
                      pattern="\d{3,4}"
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'paypal' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Paiement PayPal</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email PayPal
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="votre@email.com"
                    value={paymentData.paypalEmail}
                    onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Vous serez redirigé vers PayPal pour finaliser votre paiement de manière sécurisée.
                  </p>
                </div>
              </div>
            )}

            {selectedMethod === 'klarna' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Paiement Klarna</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="votre@email.com"
                    value={paymentData.klarnaEmail}
                    onChange={(e) => handleInputChange('klarnaEmail', e.target.value)}
                  />
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <p className="text-sm text-pink-700">
                    Payez maintenant ou plus tard avec Klarna. Aucun frais supplémentaire.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sécurité */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Paiement sécurisé</p>
                <p className="text-sm text-green-700">
                  Vos informations de paiement sont protégées par un cryptage SSL 256 bits.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary py-3"
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || !isMethodValid()}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Traitement...
                </div>
              ) : (
                `Payer ${formatPrice(amount)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
