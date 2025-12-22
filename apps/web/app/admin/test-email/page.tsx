'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Send, CheckCircle, XCircle } from 'lucide-react'
import LogoFinal from '../components/LogoFinal'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    const token = Date.now().toString() + Math.random().toString(36)

    try {
      const response = await fetch('/api/send-admin-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, token })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `✅ Email envoyé avec succès à ${email} !\n\nID du message: ${data.messageId}\n\nVérifiez votre boîte de réception (et les spams).`
        })
      } else {
        setResult({
          success: false,
          message: `❌ Erreur: ${data.message}\n\nVérifiez que RESEND_API_KEY est bien configuré sur Vercel.`
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Erreur réseau: ${error.message}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <LogoFinal size="md" />
              </Link>
              <span className="text-lg font-semibold text-gray-900">Test Email Admin</span>
            </div>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test d'envoi d'email
            </h1>
            <p className="text-gray-600">
              Testez l'envoi d'email d'invitation administrateur
            </p>
          </div>

          <form onSubmit={handleTestEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du destinataire
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du destinataire
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="jean@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer l'email de test
                </>
              )}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Succès !' : 'Erreur'}
                  </h3>
                  <p className={`whitespace-pre-line ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">
              📝 Vérifications à faire :
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ Vérifiez que <code className="bg-blue-100 px-2 py-1 rounded">RESEND_API_KEY</code> est défini sur Vercel</li>
              <li>✅ Vérifiez votre boîte de réception (et les spams)</li>
              <li>✅ Vérifiez que le domaine <code className="bg-blue-100 px-2 py-1 rounded">ikasso.ml</code> est vérifié sur Resend</li>
              <li>✅ Attendez quelques minutes (l'email peut prendre du temps)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}







