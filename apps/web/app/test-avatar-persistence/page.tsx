'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, CheckCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { getAllSavedAvatars, removeUserAvatar, cleanupOldAvatars } from '../lib/avatarPersistence'

export default function TestAvatarPersistencePage() {
  const [savedAvatars, setSavedAvatars] = useState<{[key: string]: any}>({})
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Charger les avatars sauvegardés
    const avatars = getAllSavedAvatars()
    setSavedAvatars(avatars)

    // Charger l'utilisateur actuel
    const user = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    setCurrentUser(user)
  }

  const testPersistence = () => {
    const hasCurrentUser = !!currentUser?.email
    const hasAvatar = !!currentUser?.avatar
    const hasSavedAvatar = currentUser?.email ? !!savedAvatars[currentUser.email] : false

    setTestResults({
      userLoaded: hasCurrentUser,
      avatarPresent: hasAvatar,
      avatarPersisted: hasSavedAvatar
    })
  }

  const simulateLogout = () => {
    // Simuler une déconnexion
    const user = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (user.avatar && user.email) {
      // Sauvegarder l'avatar avant déconnexion (comme dans le vrai code)
      const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
      savedAvatars[user.email] = {
        avatar: user.avatar,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('ikasso_saved_avatars', JSON.stringify(savedAvatars))
    }
    
    // Supprimer l'utilisateur
    localStorage.removeItem('ikasso_user')
    setCurrentUser(null)
    loadData()
  }

  const simulateLogin = () => {
    // Simuler une reconnexion avec un utilisateur test
    const testUser: any = {
      email: 'test@ikasso.ml',
      firstName: 'Test',
      lastName: 'User',
      userType: 'client',
      avatar: null
    }

    // Restaurer l'avatar s'il existe
    const savedAvatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    if (savedAvatars[testUser.email]) {
      testUser.avatar = savedAvatars[testUser.email].avatar
    }

    localStorage.setItem('ikasso_user', JSON.stringify(testUser))
    setCurrentUser(testUser)
    loadData()
  }

  const deleteAvatar = (email: string) => {
    removeUserAvatar(email)
    loadData()
  }

  const cleanupAvatars = () => {
    cleanupOldAvatars()
    loadData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <a href="/dashboard" className="flex items-center text-gray-600 hover:text-primary-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au dashboard
            </a>
            <h1 className="ml-6 text-xl font-semibold text-gray-900">Test Persistance Avatar</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Résultats des tests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tests de persistance</h2>
            <button
              onClick={testPersistence}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Tester</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {testResults.userLoaded ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm">Utilisateur chargé</span>
            </div>
            <div className="flex items-center space-x-2">
              {testResults.avatarPresent ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm">Avatar présent</span>
            </div>
            <div className="flex items-center space-x-2">
              {testResults.avatarPersisted ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm">Avatar persisté</span>
            </div>
          </div>
        </div>

        {/* Utilisateur actuel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Utilisateur actuel</h2>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="text-sm text-gray-600">{currentUser.email}</p>
                <p className="text-xs text-gray-500">
                  Avatar: {currentUser.avatar ? 'Présent' : 'Absent'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Aucun utilisateur connecté</p>
          )}
        </div>

        {/* Actions de test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Actions de test</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={simulateLogout}
              disabled={!currentUser}
              className="btn-secondary disabled:opacity-50"
            >
              Simuler déconnexion
            </button>
            <button
              onClick={simulateLogin}
              disabled={!!currentUser}
              className="btn-primary disabled:opacity-50"
            >
              Simuler reconnexion
            </button>
            <button
              onClick={loadData}
              className="btn-secondary"
            >
              Actualiser données
            </button>
            <button
              onClick={cleanupAvatars}
              className="btn-secondary"
            >
              Nettoyer avatars anciens
            </button>
          </div>
        </div>

        {/* Avatars sauvegardés */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Avatars sauvegardés ({Object.keys(savedAvatars).length})
          </h2>
          {Object.keys(savedAvatars).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(savedAvatars).map(([email, data]: [string, any]) => (
                <div key={email} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {data.avatar ? (
                        <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{email}</p>
                      <p className="text-xs text-gray-500">
                        Sauvegardé: {new Date(data.lastUpdated || '').toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAvatar(email)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun avatar sauvegardé</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions de test</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Allez sur le dashboard et ajoutez une photo de profil</li>
            <li>Revenez ici et cliquez sur "Tester" pour vérifier la persistance</li>
            <li>Cliquez sur "Simuler déconnexion" pour tester la sauvegarde</li>
            <li>Cliquez sur "Simuler reconnexion" pour tester la restauration</li>
            <li>Vérifiez que l'avatar est toujours présent après reconnexion</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
