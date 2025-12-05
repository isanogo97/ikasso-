'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Logo from '../../components/Logo'

export default function SetAdminPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordRequirements = [
    { label: 'Au moins 8 caractères', test: (p: string) => p.length >= 8 },
    { label: 'Une lettre majuscule', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Une lettre minuscule', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Un chiffre', test: (p: string) => /[0-9]/.test(p) },
  ]

  const isPasswordValid = passwordRequirements.every(req => req.test(password))
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token invalide ou expiré')
      return
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les critères de sécurité')
      return
    }

    if (!doPasswordsMatch) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)

    try {
      // Récupérer les admins
      const admins = JSON.parse(localStorage.getItem('ikasso_admins') || '[]')
      const admin = admins.find((a: any) => a.inviteToken === token)

      if (!admin) {
        setError('Token invalide ou expiré')
        setIsLoading(false)
        return
      }

      // Mettre à jour le mot de passe
      const updatedAdmins = admins.map((a: any) => 
        a.id === admin.id 
          ? { ...a, password, inviteToken: null, isActivated: true }
          : a
      )

      localStorage.setItem('ikasso_admins', JSON.stringify(updatedAdmins))

      alert('✅ Mot de passe créé avec succès !\n\nVous pouvez maintenant vous connecter au panneau d\'administration.')
      router.push('/admin')
    } catch (error) {
      setError('Une erreur est survenue')
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Token invalide</h2>
          <p className="text-gray-600">Le lien d'invitation est invalide ou a expiré.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">
            Créez votre mot de passe
          </h1>
          <p className="text-gray-600">
            Définissez un mot de passe sécurisé pour votre compte administrateur
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-12"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Critères de sécurité */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Critères de sécurité
              </h3>
              <div className="space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle 
                      className={`h-4 w-4 ${
                        req.test(password) ? 'text-green-600' : 'text-gray-300'
                      }`}
                    />
                    <span className={req.test(password) ? 'text-green-700' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
                {confirmPassword && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle 
                      className={`h-4 w-4 ${
                        doPasswordsMatch ? 'text-green-600' : 'text-gray-300'
                      }`}
                    />
                    <span className={doPasswordsMatch ? 'text-green-700' : 'text-gray-500'}>
                      Les mots de passe correspondent
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Création en cours...' : 'Créer mon mot de passe'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Une fois votre mot de passe créé, vous pourrez vous connecter au panneau d'administration
        </p>
      </div>
    </div>
  )
}



