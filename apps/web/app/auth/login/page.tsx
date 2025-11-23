'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import Logo from '../../components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulation de connexion avec récupération des données utilisateur
    setTimeout(() => {
      setIsLoading(false)
      
      // Vérifier si l'utilisateur existe dans localStorage
      const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      let user = existingUsers.find((u: any) => u.email === email)
      
      // Si l'utilisateur n'est pas dans la liste globale, vérifier s'il existe déjà dans ikasso_user
      if (!user) {
        const currentUser = localStorage.getItem('ikasso_user')
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          if (userData.email === email) {
            user = userData
            // Ajouter à la liste globale pour les prochaines fois
            const updatedUsers = [...existingUsers, userData]
            localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
          }
        }
      }
      
      if (user) {
        // Vérifier le mot de passe (si l'utilisateur en a un)
        if (user.password && user.password !== password) {
          alert('❌ Mot de passe incorrect.\n\nVeuillez réessayer ou cliquez sur "Mot de passe oublié ?"')
          setIsLoading(false)
          return
        }
        
        // Vérifier le statut de validation pour les hôtes
        if (user.userType === 'host' && user.status === 'pending') {
          alert('Votre compte hôte est en cours de validation par notre équipe.\n\nVous recevrez un email de confirmation une fois votre compte approuvé.')
          setIsLoading(false)
          return
        }
        
        if (user.userType === 'host' && user.status === 'rejected') {
          alert('Votre demande d\'inscription en tant qu\'hôte a été rejetée.\n\nRaison: ' + (user.rejectionReason || 'Non spécifiée') + '\n\nContactez notre support pour plus d\'informations.')
          setIsLoading(false)
          return
        }
        
        // Restaurer les données de l'utilisateur connecté
        localStorage.setItem('ikasso_user', JSON.stringify(user))
        
        // Redirection vers le dashboard approprié
        if (user.userType === 'hote' || user.userType === 'host') {
          window.location.href = '/dashboard/host'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        // Créer un compte temporaire pour cet email
        const isHost = email.includes('host') || email.includes('hote') || email.includes('fatou')
        const tempUser = {
          firstName: email.split('@')[0].split('.')[0] || 'Utilisateur',
          lastName: email.split('@')[0].split('.')[1] || '',
          email: email,
          phone: '+223 XX XX XX XX',
          address: 'Adresse à compléter',
          postalCode: '',
          city: '',
          country: '',
          dateOfBirth: '',
          userType: isHost ? 'host' : 'traveler',
          memberSince: new Date().toLocaleDateString('fr-FR'),
          avatar: null,
          totalBookings: 0,
          totalSpent: 0
        }
        
        localStorage.setItem('ikasso_user', JSON.stringify(tempUser))
        
        // Ajouter à la liste globale
        const updatedUsers = [...existingUsers, tempUser]
        localStorage.setItem('ikasso_all_users', JSON.stringify(updatedUsers))
        
        if (isHost) {
          window.location.href = '/dashboard/host'
        } else {
          window.location.href = '/dashboard'
        }
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <a href="/">
            <Logo size="lg" />
          </a>
        </div>
        
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Connexion à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <a href="/auth/register-new" className="font-medium text-primary-600 hover:text-primary-500">
            créez un nouveau compte
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field pl-10"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => {
                  alert('🔐 Connexion Google\n\nCette fonctionnalité nécessite la configuration OAuth Google.\n\nPour l\'activer en production :\n1. Créer un projet sur Google Cloud Console\n2. Configurer OAuth 2.0\n3. Ajouter les credentials dans NextAuth\n\nEn attendant, utilisez l\'inscription classique avec email.')
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c-.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  alert('🍎 Connexion Apple\n\nCette fonctionnalité nécessite la configuration Sign in with Apple.\n\nPour l\'activer en production :\n1. Créer un App ID sur Apple Developer\n2. Configurer Sign in with Apple\n3. Ajouter les credentials dans NextAuth\n\nEn attendant, utilisez l\'inscription classique avec email.')
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                <span className="ml-2">Apple</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
