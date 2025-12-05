'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email')

    if (!token || !emailParam) {
      alert('❌ Lien invalide ou expiré')
      router.push('/auth/forgot-password')
      return
    }

    // Vérifier le token
    const savedData = localStorage.getItem(`reset_token_${emailParam}`)
    if (!savedData) {
      alert('❌ Lien invalide ou expiré')
      router.push('/auth/forgot-password')
      return
    }

    const { token: savedToken, expiresAt } = JSON.parse(savedData)
    
    if (savedToken !== token) {
      alert('❌ Lien invalide')
      router.push('/auth/forgot-password')
      return
    }

    if (new Date(expiresAt) < new Date()) {
      alert('❌ Lien expiré. Veuillez demander un nouveau lien.')
      localStorage.removeItem(`reset_token_${emailParam}`)
      router.push('/auth/forgot-password')
      return
    }

    setEmail(emailParam)
    setIsValidToken(true)
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      alert('❌ Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (password !== confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)

    // Simuler la mise à jour du mot de passe
    setTimeout(() => {
      // Supprimer le token utilisé
      localStorage.removeItem(`reset_token_${email}`)

      // Mettre à jour le mot de passe (en production, ceci serait dans une base de données)
      const users = JSON.parse(localStorage.getItem('ikasso_all_users') || '[]')
      const userIndex = users.findIndex((u: any) => u.email === email)
      
      if (userIndex !== -1) {
        users[userIndex].password = password // En production, hasher le mot de passe !
        localStorage.setItem('ikasso_all_users', JSON.stringify(users))
      }

      setIsLoading(false)
      alert('✅ Mot de passe réinitialisé avec succès !\n\nVous pouvez maintenant vous connecter avec votre nouveau mot de passe.')
      router.push('/auth/login')
    }, 1500)
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification du lien...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <Link href="/" className="flex justify-center mb-6">
            <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Ikasso
            </span>
          </Link>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            🔐 Nouveau mot de passe
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Entrez votre nouveau mot de passe pour <strong>{email}</strong>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Minimum 8 caractères"
                minLength={8}
              />
              <p className="mt-1 text-sm text-gray-500">
                Au moins 8 caractères
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Confirmez votre mot de passe"
                minLength={8}
              />
            </div>
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">
                ⚠️ Les mots de passe ne correspondent pas
              </p>
            </div>
          )}

          {password && password.length > 0 && password.length < 8 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-600">
                ⚠️ Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || password !== confirmPassword || password.length < 8}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réinitialisation...
                </>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}



