'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react'
import Logo from '../../components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      let user = existingUsers.find((u: any) => u.email === email)
      
      if (!user) {
        const currentUser = localStorage.getItem('ikasso_user')
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          if (userData.email === email) {
            user = userData
          }
        }
      }
      
      if (user) {
        if (user.password && user.password !== password) {
          setError('Email ou mot de passe incorrect')
          setIsLoading(false)
          return
        }
        
        localStorage.setItem('ikasso_user', JSON.stringify(user))
        
        if (user.userType === 'hote' || user.userType === 'host') {
          window.location.href = '/dashboard/host'
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        setError('Aucun compte trouvé avec cet email')
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Pas encore de compte ?</span>
              <Link href="/auth/register-new" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-65px)]">
        {/* Partie gauche - Formulaire */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Bon retour !
              </h1>
              <p className="mt-2 text-gray-600">
                Connectez-vous pour accéder à votre compte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-primary-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">ou</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Boutons sociaux */}
            <div className="space-y-3">
              <button 
                type="button"
                onClick={() => alert('La connexion Google sera bientôt disponible')}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c-.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-gray-700">Continuer avec Google</span>
              </button>

              <button 
                type="button"
                onClick={() => alert('La connexion Apple sera bientôt disponible')}
                className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <svg className="h-5 w-5" fill="#000000" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                <span className="font-medium text-gray-700">Continuer avec Apple</span>
              </button>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <a href="#" className="underline">Conditions d'utilisation</a>
              {' '}et notre{' '}
              <a href="#" className="underline">Politique de confidentialité</a>
            </p>
          </div>
        </div>

        {/* Partie droite - Image/Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 to-secondary-500 items-center justify-center p-12">
          <div className="max-w-lg text-white text-center">
            <div className="text-6xl mb-6">🏡</div>
            <h2 className="text-3xl font-bold mb-4">
              Bienvenue sur Ikasso
            </h2>
            <p className="text-lg text-white/90">
              La première plateforme malienne de réservation d'hébergements. 
              Trouvez le logement idéal pour vos voyages au Mali.
            </p>
            <div className="mt-8 flex items-center justify-center gap-8">
              <div>
                <div className="text-3xl font-bold">100%</div>
                <div className="text-sm text-white/70">Sécurisé</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/70">Support</div>
              </div>
              <div className="w-px h-12 bg-white/30"></div>
              <div>
                <div className="text-3xl font-bold">🇲🇱</div>
                <div className="text-sm text-white/70">Mali</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
