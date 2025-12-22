'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, CheckCircle, AlertCircle, RefreshCw, Camera, LogOut, LogIn } from 'lucide-react'
import Link from 'next/link'
import { saveUserAvatar, getUserAvatar, restoreUserAvatar, forceRestoreCurrentUserAvatar } from '../lib/avatarPersistence'
import { debugAvatarState } from '../lib/avatarDebug'

export default function DebugTestAccountPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [savedAvatars, setSavedAvatars] = useState<{[key: string]: any}>({})
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    loadData()
    runDebug()
  }, [])

  const loadData = () => {
    // Charger l'utilisateur actuel
    const user = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    setCurrentUser(user)

    // Charger les avatars sauvegardés
    const avatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    setSavedAvatars(avatars)
  }

  const runDebug = () => {
    console.log('=== DEBUG TEST ACCOUNT ===')
    debugAvatarState()
    
    const user = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    const avatars = JSON.parse(localStorage.getItem('ikasso_saved_avatars') || '{}')
    
    const info = `
=== ÉTAT ACTUEL ===
Utilisateur connecté: ${user.email || 'Aucun'}
Avatar utilisateur: ${user.avatar ? 'Présent' : 'Absent'}
Avatars sauvegardés: ${Object.keys(avatars).length}

=== DÉTAILS test@ikasso.ml ===
Avatar sauvegardé: ${avatars['test@ikasso.ml'] ? 'OUI' : 'NON'}
${avatars['test@ikasso.ml'] ? `Dernière MAJ: ${avatars['test@ikasso.ml'].lastUpdated}` : ''}

=== TESTS ===
1. Utilisateur connecté: ${user.email ? '✅' : '❌'}
2. Avatar présent: ${user.avatar ? '✅' : '❌'}
3. Avatar persisté: ${avatars[user.email] ? '✅' : '❌'}
4. Compte test@ikasso.ml: ${avatars['test@ikasso.ml'] ? '✅' : '❌'}
    `
    
    setDebugInfo(info)
  }

  const simulateTestLogin = () => {
    console.log('=== SIMULATION CONNEXION test@ikasso.ml ===')
    
    // Simuler la connexion avec le compte test
    const testUser = {
      id: 'test-user-id',
      email: 'test@ikasso.ml',
      name: 'Utilisateur Test',
      userType: 'traveler',
      memberSince: '2024-01-01',
      phone: '+223 70 00 00 00',
      avatar: null // Pas d'avatar au départ
    }

    // Restaurer l'avatar s'il existe
    const restoredUser = restoreUserAvatar(testUser)
    
    // Sauvegarder dans localStorage
    localStorage.setItem('ikasso_user', JSON.stringify(restoredUser))
    
    console.log('Utilisateur après restauration:', restoredUser)
    
    // Recharger les données
    loadData()
    runDebug()
  }

  const simulateLogout = () => {
    console.log('=== SIMULATION DÉCONNEXION ===')
    
    const currentUser = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    
    // Sauvegarder l'avatar avant déconnexion (comme dans le vrai code)
    if (currentUser.avatar && currentUser.email) {
      console.log('Sauvegarde avatar avant déconnexion...')
      saveUserAvatar(currentUser.email, currentUser.avatar)
    }
    
    // Supprimer l'utilisateur
    localStorage.removeItem('ikasso_user')
    localStorage.removeItem('ikasso_cards')
    
    console.log('Déconnexion terminée')
    
    // Recharger les données
    loadData()
    runDebug()
  }

  const addTestAvatar = () => {
    console.log('=== AJOUT AVATAR TEST ===')
    
    // Créer un avatar de test (image data URL simple)
    const testAvatarDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRTg1RDA0Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEVTVDwvdGV4dD4KPHN2Zz4='
    
    const user = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    if (user.email) {
      // Ajouter l'avatar à l'utilisateur actuel
      user.avatar = testAvatarDataUrl
      localStorage.setItem('ikasso_user', JSON.stringify(user))
      
      // Sauvegarder dans la persistance
      saveUserAvatar(user.email, testAvatarDataUrl)
      
      console.log('Avatar de test ajouté')
    } else {
      console.log('Aucun utilisateur connecté')
    }
    
    // Recharger les données
    loadData()
    runDebug()
  }

  const forceRestore = () => {
    console.log('=== RESTAURATION FORCÉE ===')
    
    const success = forceRestoreCurrentUserAvatar()
    console.log('Restauration forcée:', success ? 'SUCCÈS' : 'ÉCHEC')
    
    // Recharger les données
    loadData()
    runDebug()
  }

  const clearAllData = () => {
    if (!confirm('⚠️ Supprimer TOUTES les données de test ?')) return
    
    console.log('=== NETTOYAGE COMPLET ===')
    
    localStorage.removeItem('ikasso_user')
    localStorage.removeItem('ikasso_saved_avatars')
    localStorage.removeItem('ikasso_cards')
    
    console.log('Toutes les données supprimées')
    
    // Recharger les données
    loadData()
    runDebug()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Debug Compte Test</h1>
          <p className="text-gray-600 mt-2">Diagnostic spécifique pour test@ikasso.ml</p>
        </div>

        {/* État actuel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">État Actuel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Utilisateur Connecté</h3>
              {currentUser?.email ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Email: {currentUser.email}</p>
                  <p className="text-sm text-gray-600">Nom: {currentUser.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Avatar:</span>
                    {currentUser.avatar ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={currentUser.avatar} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full"
                        />
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun utilisateur connecté</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Avatars Sauvegardés</h3>
              <p className="text-sm text-gray-600 mb-2">Total: {Object.keys(savedAvatars).length}</p>
              {Object.keys(savedAvatars).map(email => (
                <div key={email} className="text-xs text-gray-500 mb-1">
                  {email} {email === 'test@ikasso.ml' && '⭐'}
                </div>
              ))}
            </div>
          </div>

          {/* Actions de test */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={simulateTestLogin}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <LogIn className="h-4 w-4" />
              Connexion Test
            </button>
            
            <button
              onClick={simulateLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
            
            <button
              onClick={addTestAvatar}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Camera className="h-4 w-4" />
              Ajouter Avatar
            </button>
            
            <button
              onClick={forceRestore}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Restaurer
            </button>
          </div>
        </div>

        {/* Informations de debug */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de Debug</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
            {debugInfo}
          </pre>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={runDebug}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Actualiser Debug
            </button>
            
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Nettoyer Tout
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions de Test</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
            <li>Cliquez sur "Connexion Test" pour simuler une connexion avec test@ikasso.ml</li>
            <li>Cliquez sur "Ajouter Avatar" pour ajouter un avatar de test</li>
            <li>Cliquez sur "Déconnexion" pour simuler une déconnexion (l'avatar doit être sauvegardé)</li>
            <li>Cliquez à nouveau sur "Connexion Test" pour voir si l'avatar est restauré</li>
            <li>Vérifiez les logs dans la console du navigateur (F12)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
