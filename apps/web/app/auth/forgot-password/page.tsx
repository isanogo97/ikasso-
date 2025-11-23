'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      alert('❌ Veuillez entrer une adresse email valide')
      return
    }

    setIsLoading(true)

    // Générer un token de réinitialisation
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const resetLink = `${window.location.origin}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Sauvegarder le token (en production, ceci serait dans une base de données)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Expire dans 1 heure
    
    localStorage.setItem(`reset_token_${email}`, JSON.stringify({
      token: resetToken,
      expiresAt: expiresAt.toISOString()
    }))

    try {
      const response = await fetch('/api/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,
          name: email.split('@')[0],
          resetLink: resetLink
        })
      })

      const data = await response.json()

      if (data.success) {
        setEmailSent(true)
        alert(`✅ Email envoyé !\n\nUn email de réinitialisation a été envoyé à ${email}.\n\nVérifiez votre boîte de réception.`)
      } else {
        alert(`❌ Erreur: ${data.message}\n\nLien de réinitialisation (démo):\n${resetLink}`)
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert(`⚠️ Impossible d'envoyer l'email.\n\nLien de réinitialisation (démo):\n${resetLink}`)
      setEmailSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📧 Email envoyé !
            </h2>
            <p className="text-gray-600 mb-6">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
            </p>
            <p className="text-gray-600 mb-8">
              Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                }}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Renvoyer l'email
              </button>
              <Link
                href="/auth/login"
                className="block w-full text-center text-primary-600 hover:text-primary-700 font-medium"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
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
            🔐 Mot de passe oublié ?
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="votre.email@example.com"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
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

