'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, Users, Settings, BarChart3 } from 'lucide-react'
import Logo from '../components/Logo'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mot de passe simple pour la démo (à remplacer par une vraie authentification)
    if (password === 'ikasso2024') {
      setIsAuthenticated(true)
    } else {
      alert('Mot de passe incorrect')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Administration Ikasso
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accès réservé aux administrateurs
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe administrateur
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Se connecter
                </button>
              </div>
            </form>

            <div className="mt-6">
              <Link href="/" className="text-sm text-primary-600 hover:text-primary-500">
                ← Retour au site
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="md" />
              <span className="ml-4 text-lg font-semibold text-gray-900">Administration</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Administrateur connecté</span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="text-gray-600 mt-2">Gérez votre plateforme Ikasso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Validation des hôtes */}
          <Link href="/admin/hosts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Validation des hôtes</h3>
                <p className="text-sm text-gray-600">Examiner et approuver les demandes d'inscription</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                En attente de validation
              </span>
            </div>
          </Link>

          {/* Gestion des propriétés */}
          <div className="bg-white rounded-lg shadow-md p-6 opacity-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-500">Gestion des propriétés</h3>
                <p className="text-sm text-gray-400">Modérer les annonces et propriétés</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                Bientôt disponible
              </span>
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-lg shadow-md p-6 opacity-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-500">Statistiques</h3>
                <p className="text-sm text-gray-400">Analyser les performances de la plateforme</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                Bientôt disponible
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">Accès administrateur</h3>
              <p className="text-sm text-blue-800 mt-1">
                Vous êtes connecté en tant qu'administrateur. Toutes vos actions sont enregistrées pour des raisons de sécurité.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                <strong>URL d'accès :</strong> ikasso-pwxa.vercel.app/admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
