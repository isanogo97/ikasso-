'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, Settings } from 'lucide-react'

interface CookieConsentProps {
  onAccept?: () => void
  onDecline?: () => void
}

export default function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('ikasso_cookie_consent')
    if (!consent) {
      // Petit délai pour l'animation
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleAcceptAll = () => {
    const newPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    }
    localStorage.setItem('ikasso_cookie_consent', JSON.stringify(newPreferences))
    localStorage.setItem('ikasso_cookie_consent_date', new Date().toISOString())
    setIsVisible(false)
    onAccept?.()
  }

  const handleDecline = () => {
    const newPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    }
    localStorage.setItem('ikasso_cookie_consent', JSON.stringify(newPreferences))
    localStorage.setItem('ikasso_cookie_consent_date', new Date().toISOString())
    setIsVisible(false)
    onDecline?.()
  }

  const handleSavePreferences = () => {
    localStorage.setItem('ikasso_cookie_consent', JSON.stringify(preferences))
    localStorage.setItem('ikasso_cookie_consent_date', new Date().toISOString())
    setIsVisible(false)
    setShowPreferences(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay pour les préférences */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowPreferences(false)} />
      )}

      {/* Bannière principale - Responsive */}
      <div className={`fixed bottom-0 left-0 right-0 z-[99] transition-transform duration-500 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Texte */}
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    🍪 Nous respectons votre vie privée
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.
                    En continuant, vous acceptez notre{' '}
                    <Link href="/privacy" className="text-primary-600 hover:underline font-medium">
                      politique de confidentialité
                    </Link>.
                  </p>
                </div>
              </div>

              {/* Boutons - Responsive */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all order-3 sm:order-1"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Gérer</span>
                  <span className="sm:hidden">Préférences</span>
                </button>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-all order-2"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 sm:py-3 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all order-1 sm:order-3"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal des préférences - Responsive */}
      {showPreferences && (
        <div className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-lg bg-white rounded-2xl shadow-2xl z-[101] max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Préférences de cookies</h2>
              <button 
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {/* Cookies nécessaires */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl">🔒</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Cookies nécessaires</span>
                  </div>
                  <div className="w-10 h-6 bg-primary-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Essentiels au fonctionnement du site. Ils ne peuvent pas être désactivés.
                </p>
              </div>

              {/* Cookies analytiques */}
              <div className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl">📊</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Cookies analytiques</span>
                  </div>
                  <button
                    onClick={() => setPreferences({...preferences, analytics: !preferences.analytics})}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${
                      preferences.analytics ? 'bg-primary-500 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                </p>
              </div>

              {/* Cookies marketing */}
              <div className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl">📢</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Cookies marketing</span>
                  </div>
                  <button
                    onClick={() => setPreferences({...preferences, marketing: !preferences.marketing})}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${
                      preferences.marketing ? 'bg-primary-500 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Permettent de vous montrer des publicités pertinentes.
                </p>
              </div>

              {/* Cookies de personnalisation */}
              <div className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl">✨</span>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">Personnalisation</span>
                  </div>
                  <button
                    onClick={() => setPreferences({...preferences, personalization: !preferences.personalization})}
                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-all ${
                      preferences.personalization ? 'bg-primary-500 justify-end' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow"></div>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Permettent de personnaliser votre expérience sur le site.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-all"
              >
                Refuser tout
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2.5 sm:py-3 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-all"
              >
                Enregistrer mes choix
              </button>
            </div>

            {/* Lien vers la politique */}
            <p className="mt-3 sm:mt-4 text-center text-xs text-gray-500">
              En savoir plus sur notre{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline">
                politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  )
}





