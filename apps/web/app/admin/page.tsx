'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Users, Settings, BarChart3, LogOut } from 'lucide-react'
import Logo from '../components/Logo'

interface AdminUser {
  id: string
  name: string
  email: string
  password?: string
  role: 'super_admin' | 'admin' | 'moderator' | 'support'
  permissions: any
  isActivated?: boolean
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    // Vérifier si un admin est déjà connecté
    const loggedAdmin = localStorage.getItem('ikasso_logged_admin')
    if (loggedAdmin) {
      const admin = JSON.parse(loggedAdmin)
      setCurrentAdmin(admin)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    // Récupérer tous les admins
    const admins = JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
    
    // Trouver l'admin par email
    const admin = admins.find((a: AdminUser) => a.email === email)

    if (!admin) {
      setLoginError('Email ou mot de passe incorrect')
      return
    }

    if (!admin.isActivated) {
      setLoginError('Votre compte n\'est pas encore activé. Veuillez créer votre mot de passe via le lien reçu par email.')
      return
    }

    if (admin.password !== password) {
      setLoginError('Email ou mot de passe incorrect')
      return
    }

    // Connexion réussie
    localStorage.setItem('ikasso_logged_admin', JSON.stringify(admin))
    setCurrentAdmin(admin)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('ikasso_logged_admin')
    setCurrentAdmin(null)
    setIsAuthenticated(false)
    setEmail('')
    setPassword('')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email administrateur
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ikasso.ml"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
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
                    placeholder="Entrez votre mot de passe"
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{loginError}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Se connecter
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <div>
                <span className="text-lg font-semibold text-gray-900">Administration</span>
                <p className="text-xs text-gray-500">{currentAdmin?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentAdmin?.name}</p>
                <p className="text-xs text-gray-500">{currentAdmin?.role === 'super_admin' ? 'Super Admin' : currentAdmin?.role === 'admin' ? 'Administrateur' : currentAdmin?.role === 'moderator' ? 'Modérateur' : 'Support'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
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
          {/* Gestion des utilisateurs */}
          <Link href="/admin/users" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
                <p className="text-sm text-gray-600">Rechercher et gérer tous les comptes</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Disponible
              </span>
            </div>
          </Link>

          {/* Gestion des administrateurs */}
          <Link href="/admin/admins" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Administrateurs</h3>
                <p className="text-sm text-gray-600">Gérer les comptes admin et permissions</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Disponible
              </span>
            </div>
          </Link>

          {/* Statistiques */}
          <Link href="/admin/stats" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
                <p className="text-sm text-gray-600">Analyser les performances de la plateforme</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔜 Bientôt
              </span>
            </div>
          </Link>

          {/* Gestion des propriétés */}
          <Link href="/admin/properties" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Gestion des propriétés</h3>
                <p className="text-sm text-gray-600">Modérer les annonces et propriétés</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔜 Bientôt
              </span>
            </div>
          </Link>

          {/* Validation des hôtes */}
          <Link href="/admin/hosts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Validation des hôtes</h3>
                <p className="text-sm text-gray-600">Examiner et approuver les demandes</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔜 Bientôt
              </span>
            </div>
          </Link>

          {/* Support client */}
          <Link href="/admin/support" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:scale-105">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Support client</h3>
                <p className="text-sm text-gray-600">Messages et tickets de support</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔜 Bientôt
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-900">Accès administrateur</h3>
              <p className="text-sm text-blue-800 mt-1">
                Vous êtes connecté en tant qu'administrateur. Toutes vos actions sont enregistrées pour des raisons de sécurité.
              </p>
              <p className="text-xs text-blue-700 mt-2">
                <strong>URL d'accès :</strong> ikasso-pwxa.vercel.app/admin
              </p>
              {currentAdmin?.role === 'super_admin' && (
                <div className="mt-3">
                  <Link 
                    href="/admin/test-email" 
                    className="inline-flex items-center text-xs text-blue-700 hover:text-blue-900 font-medium"
                  >
                    📧 Tester l'envoi d'emails →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
