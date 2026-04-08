'use client'

import React, { useState } from 'react'
import { X, CreditCard, Smartphone, Shield, Check, ExternalLink } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  propertyName: string
  bookingId?: string
  onPaymentSuccess: () => void
}

type PaymentMethod = 'orange_money' | 'stripe'

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  propertyName,
  bookingId,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange_money')
  const [isProcessing, setIsProcessing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')

  const isValidPhone = (value: string) => {
    const trimmed = value.trim()
    return /^\+?223\s?\d{8}$/.test(trimmed) || /^\d{8,14}$/.test(trimmed)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleStripePayment = async () => {
    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/payment/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          propertyName,
          bookingId,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.demo) {
        // Demo mode — simulate success
        setTimeout(() => {
          setIsProcessing(false)
          onPaymentSuccess()
          onClose()
        }, 2000)
      } else {
        setError(data.error || 'Erreur lors de la creation du paiement')
        setIsProcessing(false)
      }
    } catch {
      setError('Erreur de connexion. Veuillez reessayer.')
      setIsProcessing(false)
    }
  }

  const handleOrangeMoneyPayment = async () => {
    if (!isValidPhone(phoneNumber)) {
      setError('Numero de telephone invalide')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/payment/orange-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phoneNumber,
          propertyName,
          bookingId,
        }),
      })

      const data = await response.json()

      if (data.success || data.demo) {
        setTimeout(() => {
          setIsProcessing(false)
          onPaymentSuccess()
          onClose()
        }, 2000)
      } else {
        setError(data.error || 'Erreur de paiement Orange Money')
        setIsProcessing(false)
      }
    } catch {
      setError('Erreur de connexion. Veuillez reessayer.')
      setIsProcessing(false)
    }
  }

  const handlePayment = () => {
    if (selectedMethod === 'stripe') {
      handleStripePayment()
    } else {
      handleOrangeMoneyPayment()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Finaliser le paiement</h2>
            <p className="text-sm text-gray-600">{propertyName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total a payer</span>
              <span className="text-2xl font-bold text-primary-600">{formatPrice(amount)}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choisir une methode de paiement</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Orange Money */}
              <button
                onClick={() => { setSelectedMethod('orange_money'); setError('') }}
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

              {/* Stripe (Cards) */}
              <button
                onClick={() => { setSelectedMethod('stripe'); setError('') }}
                className={`p-4 border-2 rounded-lg flex items-center space-x-3 ${
                  selectedMethod === 'stripe'
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
                {selectedMethod === 'stripe' && (
                  <Check className="h-5 w-5 text-blue-500 ml-auto" />
                )}
              </button>
            </div>
          </div>

          {/* Payment Forms */}
          <div className="mb-6">
            {selectedMethod === 'orange_money' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Informations Orange Money</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero de telephone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+223 XX XX XX XX"
                    value={phoneNumber}
                    autoComplete="tel"
                    inputMode="tel"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Smartphone className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Comment ca marche ?</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Vous recevrez un SMS avec un code de confirmation sur votre telephone Orange Money.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'stripe' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Paiement par carte</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Paiement securise via Stripe</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Vous serez redirige vers une page de paiement securisee Stripe pour entrer vos informations de carte. Vos donnees bancaires ne transitent jamais par nos serveurs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Paiement securise</p>
                <p className="text-sm text-green-700">
                  Vos informations sont protegees par un cryptage SSL 256 bits.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all"
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || (selectedMethod === 'orange_money' && !isValidPhone(phoneNumber))}
              className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
