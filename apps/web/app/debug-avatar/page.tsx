'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, RefreshCw, Bug, Trash2 } from 'lucide-react'
import { debugAvatarState, forceAvatarSync, clearAllAvatarData } from '../lib/avatarDebug'

export default function DebugAvatarPage() {
  const [user, setUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const loadUser = () => {
    const userData = JSON.parse(localStorage.getItem('ikasso_user') || '{}')
    setUser(userData)
  }

  const runDebug = () => {
    // Capturer les logs console
    const originalLog = console.log
    let logs: string[] = []
    
    console.log = (...args) => {
      logs.push(args.join(' '))
      originalLog(...args)
    }
    
    debugAvatarState()
    
    console.log = originalLog
    setDebugInfo(logs.join('\n'))
  }

  const syncAvatar = () => {
    const synced = forceAvatarSync()
    if (synced) {
      loadUser()
      alert('Avatar synchronisé !')
    } else {
      alert('Aucun avatar à synchroniser')
    }
  }

  const clearData = () => {
    if (confirm('Supprimer toutes les données d\'avatar ?')) {
      clearAllAvatarData()
      loadUser()
      alert('Données supprimées')
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

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
            <h1 className="ml-6 text-xl font-semibold text-gray-900">Debug Avatar</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Utilisateur actuel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Utilisateur actuel</h2>
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-lg">{user.firstName} {user.lastName}</p>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Avatar: <span className={user.avatar ? 'text-green-600' : 'text-red-600'}>
                    {user.avatar ? `Présent (${user.avatar.length} chars)` : 'Absent'}
                  </span>
                </p>
                {user.avatar && (
                  <p className="text-xs text-gray-400 mt-1">
                    Aperçu: {user.avatar.substring(0, 50)}...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Aucun utilisateur connecté</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={loadUser}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recharger utilisateur</span>
            </button>
            
            <button
              onClick={runDebug}
              className="btn-primary flex items-center space-x-2"
            >
              <Bug className="h-4 w-4" />
              <span>Debug complet</span>
            </button>
            
            <button
              onClick={syncAvatar}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Forcer sync avatar</span>
            </button>
            
            <button
              onClick={clearData}
              className="btn-secondary flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear data</span>
            </button>
          </div>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Informations de debug</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions de debug</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Cliquez sur "Debug complet" pour voir l'état des données</li>
            <li>Si l'avatar est absent mais présent dans les données sauvegardées, cliquez "Forcer sync"</li>
            <li>Ouvrez la console du navigateur pour voir les logs détaillés</li>
            <li>Utilisez les fonctions globales: <code>debugAvatar()</code>, <code>forceAvatarSync()</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
