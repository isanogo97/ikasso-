'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Loader } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setIsLoading(true)

    try {
      // Send reset email via our own API (with Ikasso branding)
      const response = await fetch('/api/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: email.split('@')[0],
          resetLink: `${window.location.origin}/auth/reset-password?email=${encodeURIComponent(email)}`
        })
      })

      const data = await response.json()
      if (data.success) {
        setEmailSent(true)
      } else {
        // Even if API fails, show success (don't reveal if email exists)
        setEmailSent(true)
      }
    } catch {
      setEmailSent(true)
    }

    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center">
            <Link href="/auth/login" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-sm w-full text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email envoye</h1>
            <p className="text-gray-500 text-sm mb-2">
              Si un compte existe avec <strong>{email}</strong>, vous recevrez un email avec les instructions pour reinitialiser votre mot de passe.
            </p>
            <p className="text-gray-400 text-xs mb-8">
              Verifiez aussi vos spams si vous ne le trouvez pas.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setEmailSent(false); setEmail('') }}
                className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Renvoyer l'email
              </button>
              <Link
                href="/auth/login"
                className="block w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-all text-center"
              >
                Retour a la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <Link href="/auth/login" className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <img src="/images/logos/ikasso-logo-800.png" alt="Ikasso" className="h-12 object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublie ?</h1>
            <p className="mt-2 text-sm text-gray-500">
              Entrez votre email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-300 disabled:to-gray-300 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Envoi...
                </span>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Retour a la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
