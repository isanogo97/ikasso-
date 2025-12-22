'use client'

import React, { useState, useEffect } from 'react'
import { User, RefreshCw, LogOut, LogIn, Camera, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import PhotoCapture from '../components/PhotoCapture'
import { saveUserAvatar, getUserAvatar, restoreUserAvatar, forceRestoreUserAvatar } from '../lib/avatarPersistence'
import { debugAvatarState } from '../lib/avatarDebug'

export default function TestAvatarFinalPage() {
  const [user, setUser] = useState<any>(null)
  const [savedAvatars, setSavedAvatars] = useState<any>({})
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Charger les données au montage
  useEffect(() => {
    loadUserData()
    loadSavedAvatars()
    updateDebugInfo()
  }, [])

  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (userData.email) {
      setUser(userData)
    }
  }

  const loadSavedAvatars = () => {
    const avatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    setSavedAvatars(avatars)
  }

  const updateDebugInfo = () => {
    const info = debugAvatarState()
    setDebugInfo(JSON.stringify(info, null, 2))
  }

  const handleLogin = () => {
    const testUser = {
      email: 'test@ikasso.ml',
      firstName: 'Test',
      lastName: 'Apple',
      userType: 'client',
      phone: '+33600000000',
      verified: true,
      avatar: null
    }

    // Restaurer l'avatar s'il existe
    const restoredUser = restoreUserAvatar(testUser)
    localStorage.setItem('ikasso_user', JSON.stringify(restoredUser))
    setUser(restoredUser)
    updateDebugInfo()
    loadSavedAvatars()
  }

  const handleLogout = () => {
    // Sauvegarder l'avatar avant déconnexion
    if (user?.avatar && user?.email) {
      saveUserAvatar(user.email, user.avatar)
    }
    
    localStorage.removeItem('ikasso_user')
    setUser(null)
    updateDebugInfo()
    loadSavedAvatars()
  }

  const handlePhotoCapture = (photoDataUrl: string) => {
    if (user?.email) {
      // Mettre à jour l'utilisateur
      const updatedUser = { ...user, avatar: photoDataUrl }
      setUser(updatedUser)
      
      // Sauvegarder dans localStorage
      localStorage.setItem('ikasso_user', JSON.stringify(updatedUser))
      
      // Sauvegarder dans la collection d'avatars
      saveUserAvatar(user.email, photoDataUrl)
      
      updateDebugInfo()
      loadSavedAvatars()
    }
  }

  const forceRestore = () => {
    if (user?.email) {
      const updatedUser = forceRestoreUserAvatar(user, setUser)
      updateDebugInfo()
      loadSavedAvatars()
    }
  }

  const clearAllData = () => {
    localStorage.removeItem('ikasso_user')
    localStorage.removeItem('ikasso_saved_avatars')
    setUser(null)
    setSavedAvatars({})
    updateDebugInfo()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Test Avatar Final - test@ikasso.ml</h1>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
              ← Retour au Dashboard
            </Link>
          </div>

          {/* État de connexion */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">État de connexion</h2>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">Non connecté</p>
                <button
                  onClick={handleLogin}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter (test@ikasso.ml)
                </button>
              </div>
            )}
          </div>

          {/* Capture de photo */}
          {user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Capture de photo</h2>
              <PhotoCapture
                onPhotoCapture={handlePhotoCapture}
                onError={(error) => console.error('Erreur photo:', error)}
                maxSizeMB={2}
                className="w-full"
              />
            </div>
          )}

          {/* Actions */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Actions de test</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={forceRestore}
                disabled={!user}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Forcer restauration
              </button>
              <button
                onClick={() => {
                  updateDebugInfo()
                  loadSavedAvatars()
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser debug
              </button>
              <button
                onClick={clearAllData}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Effacer tout
              </button>
            </div>
          </div>

          {/* Avatars sauvegardés */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Avatars sauvegardés</h2>
            {Object.keys(savedAvatars).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(savedAvatars).map(([email, data]: [string, any]) => (
                  <div key={email} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    {data.avatar ? (
                      <Image 
                        src={data.avatar} 
                        alt={`Avatar ${email}`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{email}</p>
                      <p className="text-xs text-gray-600">
                        Sauvegardé: {new Date(data.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucun avatar sauvegardé</p>
            )}
          </div>

          {/* Debug info */}
          <div className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Informations de debug</h2>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
              {debugInfo}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
