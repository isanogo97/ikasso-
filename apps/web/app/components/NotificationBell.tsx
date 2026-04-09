'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { isPushSupported, getPermissionStatus, subscribeToPush, sendLocalNotification } from '../lib/push-notifications'

export default function NotificationBell() {
  const [permission, setPermission] = useState<string>('default')
  const [showPopup, setShowPopup] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setPermission(getPermissionStatus())
    // Check if already asked
    const asked = localStorage.getItem('ikasso_push_asked')
    if (!asked && isPushSupported() && getPermissionStatus() === 'default') {
      // Show popup after 10 seconds
      const timer = setTimeout(() => setShowPopup(true), 10000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnable = async () => {
    const sub = await subscribeToPush()
    if (sub) {
      setSubscribed(true)
      setPermission('granted')
      sendLocalNotification('Notifications activees', {
        body: 'Vous recevrez des alertes pour vos reservations et messages.',
      })
    }
    localStorage.setItem('ikasso_push_asked', 'true')
    setShowPopup(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('ikasso_push_asked', 'true')
    setShowPopup(false)
  }

  return (
    <>
      {/* Bell icon */}
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => {
          if (permission !== 'granted') {
            setShowPopup(true)
          }
        }}
      >
        {permission === 'granted' ? (
          <Bell className="h-5 w-5 text-gray-500" />
        ) : (
          <BellOff className="h-5 w-5 text-gray-400" />
        )}
        {subscribed && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full" />
        )}
      </button>

      {/* Permission popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-4 pb-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={handleDismiss} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in slide-in-from-bottom duration-300">
            <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Activer les notifications</h3>
                <p className="text-sm text-gray-500">Ne ratez rien !</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Recevez des alertes instantanees pour vos reservations, messages et offres speciales.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-all"
              >
                Activer
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl font-medium text-sm transition-all"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
