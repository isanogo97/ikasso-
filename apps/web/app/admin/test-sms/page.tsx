'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Phone, CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react'

export default function TestSMSPage() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const sendTestSMS = async () => {
    if (!phone) {
      alert('Veuillez entrer un numéro de téléphone')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const code = Math.floor(1000 + Math.random() * 9000).toString()
      
      const response = await fetch('/api/send-sms-orange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone,
          code,
          message: message || undefined
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ 
        success: false, 
        message: 'Erreur de connexion',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'admin
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Test API SMS Orange Mali
          </h1>
          <p className="text-gray-600 mb-8">
            Testez l'envoi de SMS via l'API Orange Developer
          </p>

          {/* Statut de configuration */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Configuration requise</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Pour que l'API fonctionne en production, vous devez :
                </p>
                <ol className="text-sm text-yellow-700 mt-2 list-decimal list-inside space-y-1">
                  <li>Attendre que Orange valide votre abonnement SMS (statut "En instance")</li>
                  <li>Obtenir le <strong>Client Secret</strong> depuis Orange Developer</li>
                  <li>Configurer la variable <code className="bg-yellow-100 px-1 rounded">ORANGE_CLIENT_SECRET</code> sur Vercel</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+223 XX XX XX XX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format accepté : +223XXXXXXXX, 223XXXXXXXX, ou 0XXXXXXXX
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message personnalisé (optionnel)
              </label>
              <textarea
                placeholder="Laissez vide pour envoyer un code de vérification"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              onClick={sendTestSMS}
              disabled={loading || !phone}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Envoyer le SMS test
                </>
              )}
            </button>
          </div>

          {/* Résultat */}
          {result && (
            <div className={`mt-8 p-6 rounded-xl ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'SMS envoyé !' : 'Erreur d\'envoi'}
                  </h3>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  
                  {result.demo && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Mode démo - Code généré :</p>
                      <p className="text-2xl font-mono font-bold text-gray-900">{result.code}</p>
                    </div>
                  )}

                  {result.error && (
                    <pre className="mt-3 p-3 bg-white rounded-lg text-xs text-red-600 overflow-x-auto">
                      {typeof result.error === 'string' ? result.error : JSON.stringify(result.error, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informations de configuration */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Vos identifiants Orange</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Client ID :</span>
                <code className="bg-gray-200 px-2 py-1 rounded text-xs">GexB8PAJh2wrvh7wlAOVsQv2h8vbAd22</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API :</span>
                <span className="text-gray-900">SMS Mali - Affaires v3.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Statut :</span>
                <span className="text-yellow-600 font-medium">🟡 En instance</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Prochaines étapes</h3>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Attendez la validation de votre abonnement par Orange (1-3 jours)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Cliquez sur "Montrer" pour voir votre <strong>Client Secret</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Ajoutez la variable <code className="bg-gray-100 px-1 rounded">ORANGE_CLIENT_SECRET</code> sur Vercel</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Testez à nouveau l'envoi de SMS</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

